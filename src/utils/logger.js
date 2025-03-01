import { createLogger, format, transports } from "winston";
import dotenv from "dotenv";

dotenv.config();

const silent = process.env.APP_DEBUG?.toLowerCase().trim() === "false";

const logger = createLogger({
  silent,
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [new transports.File({ filename: "logs/app.log" })],
});

export default logger;
