import { createLogger, format, transports } from "winston";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const logDir = "logs";

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const silent = process.env.APP_DEBUG?.toLowerCase().trim() === "false";

const logger = createLogger({
  silent,
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) =>
        `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [new transports.File({ filename: path.join(logDir, "app.log") })],
});

export default logger;
