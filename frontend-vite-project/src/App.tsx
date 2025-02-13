import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import JoinRoom from "./pages/JoinRoom";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        {/* <Route path="/room/:roomId" element={<JoinRoom />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
