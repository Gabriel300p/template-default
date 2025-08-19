import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { env } from "../config/env.js";

export default fp(async (app) => {
  await app.register(cors, {
    // Allow all origins in development, specific domains in production
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        // Development
        "http://localhost:3000", // Next.js default
        "http://localhost:5173", // Vite default
        "http://localhost:4173", // Vite preview
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        // Add production domains here
        ...(env.FRONTEND_URLS ? env.FRONTEND_URLS.split(",") : []),
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },

    // Allow credentials (important for auth)
    credentials: true,

    // Allowed methods
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],

    // Allowed headers
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Correlation-ID",
    ],

    // Expose headers to frontend
    exposedHeaders: ["X-Correlation-ID", "X-Total-Count"],

    // Preflight cache duration
    maxAge: 86400, // 24 hours
  });
});
