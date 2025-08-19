import { buildApp } from "./app.js";
import { env } from "./config/env.js";

(async () => {
  const app = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });
})();
