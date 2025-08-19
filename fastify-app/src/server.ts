import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import {
  printBanner,
  printErrorMessage,
  printServerInfo,
  printShutdownMessage,
  printStartupMessage,
} from "./shared/utils/console.utils.js";

const startServer = async () => {
  try {
    printBanner();
    printStartupMessage();

    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    printServerInfo(env.HOST, env.PORT, env.NODE_ENV);
  } catch (error) {
    printErrorMessage(error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", () => {
  printShutdownMessage();
  process.exit(0);
});

process.on("SIGTERM", () => {
  printShutdownMessage();
  process.exit(0);
});

startServer();
