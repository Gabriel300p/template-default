import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { isDev } from "../config/env.js";
import { colors } from "../shared/utils/console.utils.js";

// Enhanced logging configuration
export default fp(
  async (app: FastifyInstance) => {
    // Custom request logging
    app.addHook("onRequest", async (request) => {
      const timestamp = new Date().toLocaleTimeString("pt-BR");
      const method = request.method.padEnd(6);
      const url = request.url;

      if (isDev) {
        console.log(
          `${colors.gray}[${timestamp}]${colors.reset} ` +
            `${colors.cyan}${method}${colors.reset} ` +
            `${colors.white}${url}${colors.reset}`
        );
      }
    });

    // Custom response logging
    app.addHook("onResponse", async (request, reply) => {
      const timestamp = new Date().toLocaleTimeString("pt-BR");
      const method = request.method.padEnd(6);
      const url = request.url;
      const statusCode = reply.statusCode;
      const responseTime = reply.elapsedTime.toFixed(2);

      let statusColor: string = colors.green;
      if (statusCode >= 400 && statusCode < 500) statusColor = colors.yellow;
      if (statusCode >= 500) statusColor = colors.red;

      if (isDev) {
        console.log(
          `${colors.gray}[${timestamp}]${colors.reset} ` +
            `${colors.cyan}${method}${colors.reset} ` +
            `${colors.white}${url}${colors.reset} ` +
            `${statusColor}${statusCode}${colors.reset} ` +
            `${colors.gray}${responseTime}ms${colors.reset}`
        );
      }
    });

    // Enhanced error logging
    app.addHook("onError", async (request, reply, error) => {
      const timestamp = new Date().toLocaleTimeString("pt-BR");
      const method = request.method.padEnd(6);
      const url = request.url;

      console.log(
        `${colors.gray}[${timestamp}]${colors.reset} ` +
          `${colors.red}ERROR${colors.reset} ` +
          `${colors.cyan}${method}${colors.reset} ` +
          `${colors.white}${url}${colors.reset}`
      );
      console.log(`${colors.red}${error.message}${colors.reset}`);

      if (isDev && error.stack) {
        console.log(`${colors.gray}${error.stack}${colors.reset}`);
      }
    });
  },
  {
    name: "enhanced-logger",
  }
);
