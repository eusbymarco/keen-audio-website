const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("New admin password: ", (password) => {
  if (password.length < 12) {
    console.error("Use a password with at least 12 characters.");
    process.exitCode = 1;
  } else {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
  }
  rl.close();
});