const axios = require("axios");
const dotenv = require("dotenv");
const redis = require("redis");
dotenv.config();
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("ready", () => {
  console.log("Redis client connected successfully in worker.");
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

// Function to map languages to Judge0 API language IDs
function getLanguageId(language) {
  const languageMap = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62,
    c: 50,
  };
  return languageMap[language.toLowerCase()] || 63; // Default to JavaScript
}
async function processSubmission(submission) {
  const { roomId, code, language } = JSON.parse(submission);
  console.log(`Processing submission for room ${roomId}:`, { code, language });

  const judge0Url = "https://judge0-ce.p.rapidapi.com/submissions";
  const judge0Key = process.env.JUDGE0_API_KEY;

  const payload = {
    language_id: getLanguageId(language),
    source_code: code,
  };

  try {
    // Submit code to Judge0
    const submitOptions = {
      method: "POST",
      url: judge0Url,
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": judge0Key,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
      params: {
        base64_encoded: false,
        fields: "*",
        wait: false,
      },
      data: payload,
    };

    const submissionResponse = await axios.request(submitOptions);

    let result = submissionResponse.data;
    // Poll for the result if it's still processing
    console.log("Polling for Judge0 result...");
    result = await pollJudge0Result(result.token, judge0Key);
    // Publish the result back to the appropriate room
    await redisClient.publish(roomId, JSON.stringify(result));
    console.log(`Published result to room: ${roomId}`);
  } catch (error) {
    console.error(`Error processing submission for room ${roomId}:`, error);

    // Publish an error message to the room
    await redisClient.publish(
      roomId,
      JSON.stringify({ error: "Execution failed" })
    );
  }
}

async function pollJudge0Result(token, judge0Key) {
  const pollUrl = `https://judge0-ce.p.rapidapi.com/submissions/${token}`;
  const pollOptions = {
    method: "GET",
    url: pollUrl,
    headers: {
      "x-rapidapi-key": judge0Key,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
    params: {
      base64_encoded: false,
      fields: "*",
    },
  };

  while (true) {
    try {
      const response = await axios.request(pollOptions);
      const resultData = response.data;
      if (resultData.status && resultData.status.id > 2) {
        // If the result is ready, return it
        return resultData;
      }

      // Wait before polling again
      console.log("Result still processing, retrying in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error polling Judge0 API:", error);

      // Wait before retrying on error
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Main worker function to process queue
async function startWorker() {
  try {
    await redisClient.connect();
    console.log("Worker connected to Redis and ready to process submissions.");

    while (true) {
      try {
        const data = await redisClient.brPop("codeQueue", 0); // Blocking pop
        if (data) {
          const submission = data.element; // Extract the submission
          await processSubmission(submission); // Process the submission
        }
      } catch (err) {
        console.error("Error processing submission:", err);
      }
    }
  } catch (err) {
    console.error("Failed to start worker:", err);
  }
}

// Start the worker
startWorker().catch((err) => {
  console.error("Unhandled error in worker:", err);
});
