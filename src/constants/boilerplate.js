module.exports = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  python: `def main():
    try:
        user_input = input("Enter input: ").strip()
        print(f"Output: {user_input}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()`,
  javascript: `async function main() {
    try {
        const userInput = prompt("Enter input:");
        console.log(\`Output: \${userInput}\`);
    } catch (error) {
        console.error( \`Error: \${error.message}\`);
    }
}
// Run the main function
main();`,
};
