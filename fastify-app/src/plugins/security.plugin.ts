import helmet from "@fastify/helmet";
import fp from "fastify-plugin";
import { env, isDev } from "../config/env.js";

export default fp(async (app) => {
  await app.register(helmet, {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Swagger UI
          "https://cdn.jsdelivr.net", // For Swagger UI assets
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Swagger UI
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https:", // Allow HTTPS images
        ],
        connectSrc: [
          "'self'",
          env.SUPABASE_URL, // Allow connections to Supabase
        ],
        // More permissive in development
        ...(isDev && {
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          connectSrc: ["'self'", "*"], // Allow all connections in dev
        }),
      },
    },

    // Disable X-Powered-By header
    hidePoweredBy: true,

    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false,
    },

    // Frame Options
    frameguard: {
      action: "deny",
    },

    // HSTS (only in production)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // Referrer Policy
    referrerPolicy: {
      policy: "same-origin",
    },

    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false, // Disabled for API

    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    // X-Content-Type-Options
    noSniff: true,

    // X-Frame-Options already covered by frameguard
  });
});
