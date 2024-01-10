import dotenv from "dotenv";
import fs from "node:fs";

// Setup environment variables

export const setupEnvironment = () => {
  dotenv.config();
};

// Handle log folder creation at startup

export const initFolder = (path: string) => {
  // Check for the logs folder existence
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};
