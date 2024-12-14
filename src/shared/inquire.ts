import inquirer from "inquirer";

async function inquire() {
  const userInput = await inquirer.prompt([
    { type: "input", name: "message", message: "You:" },
  ]);
  return userInput.message;
}

export { inquire };
