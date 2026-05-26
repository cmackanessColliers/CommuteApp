const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Check if mkcert is installed
try {
  execSync("mkcert -version", { stdio: "ignore" });
} catch (error) {
  console.error("mkcert is not installed. Please install mkcert first:");
  console.log("\nOn Windows with chocolatey:");
  console.log("  choco install mkcert");
  console.log("\nOn macOS with homebrew:");
  console.log("  brew install mkcert");
  process.exit(1);
}

// Generate certificates
console.log("Generating development certificates...");
const scriptDir = __dirname;

try {
  // Install local CA if not already installed
  execSync("mkcert -install", { stdio: "inherit" });

  // Generate certificate for localhost
  execSync("mkcert localhost", {
    stdio: "inherit",
    cwd: scriptDir,
  });

  // Rename files to match what serve.cjs expects
  fs.renameSync(
    path.join(scriptDir, "localhost-key.pem"),
    path.join(scriptDir, "localhost-key.pem")
  );
  fs.renameSync(
    path.join(scriptDir, "localhost.pem"),
    path.join(scriptDir, "localhost.pem")
  );

  console.log("\nCertificates generated successfully!");
} catch (error) {
  console.error("Error generating certificates:", error.message);
  process.exit(1);
}
