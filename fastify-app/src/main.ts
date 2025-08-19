/**
 * Alternative entry point for the Barbershop API
 * This file provides a cleaner, more structured startup process
 * You can use this instead of server.ts if you prefer
 */

import { buildApp } from "./app.js";
import { env, isDev } from "./config/env.js";

class BarbershopAPI {
  private app: any;
  private isShuttingDown = false;

  async start(): Promise<void> {
    try {
      console.log("🚀 Initializing Barbershop API...");

      // Build the Fastify app with all plugins
      this.app = await buildApp();

      // Start listening
      await this.app.listen({
        port: env.PORT,
        host: env.HOST,
      });

      console.log(`✅ Barbershop API started successfully!`);
      console.log(`🌐 Local: http://localhost:${env.PORT}`);
      console.log(`📚 Docs: http://localhost:${env.PORT}/docs`);

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      console.error("❌ Failed to start Barbershop API:", error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;
    console.log("⏳ Shutting down Barbershop API...");

    try {
      if (this.app) {
        await this.app.close();
      }
      console.log("✅ Barbershop API shut down gracefully");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    // Handle process termination
    process.on("SIGINT", () => this.stop());
    process.on("SIGTERM", () => this.stop());

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("💥 Uncaught Exception:", error);
      this.stop();
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
      this.stop();
    });
  }
}

// Start the API if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const api = new BarbershopAPI();
  api.start();
}

export { BarbershopAPI };
