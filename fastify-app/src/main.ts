import { createApp } from './app.js';
import { config } from './config/index.js';

const start = async (): Promise<void> => {
  try {
    // Create Fastify app
    const app = await createApp();

    // Graceful shutdown handlers
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`Received ${signal}, shutting down gracefully`);
        try {
          await app.close();
          console.log('Server closed successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled rejection:', { reason, promise });
      process.exit(1);
    });

    // Start server
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    console.log(`🚀 Server ready at http://${config.HOST}:${config.PORT}`);
    console.log(`📝 Environment: ${config.NODE_ENV}`);
    console.log(`📊 Process ID: ${process.pid}`);
    console.log(`🏠 Base URL: http://${config.HOST}:${config.PORT}`);
    console.log(`🩺 Health Check: http://${config.HOST}:${config.PORT}/health`);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
start();
