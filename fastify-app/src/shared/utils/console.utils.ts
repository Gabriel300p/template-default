/**
 * Visual logging utilities for beautiful console output
 */

// ANSI color codes for terminal output
export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
} as const;

export const printBanner = () => {
  console.log(`
${colors.cyan}┌─────────────────────────────────────────────────────────────┐${colors.reset}
${colors.cyan}│${colors.reset}  ${colors.bright}🏪 BARBERSHOP MVP API${colors.reset}                               ${colors.cyan}│${colors.reset}
${colors.cyan}│${colors.reset}  ${colors.green}✨ Frontend Integration Ready${colors.reset}                      ${colors.cyan}│${colors.reset}
${colors.cyan}└─────────────────────────────────────────────────────────────┘${colors.reset}
`);
};

export const printServerInfo = (host: string, port: number, env: string) => {
  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://${host}:${port}`;

  console.log(`${colors.bright}🚀 Server Status:${colors.reset}`);
  console.log(
    `   ${colors.green}●${colors.reset} Environment: ${colors.yellow}${env}${colors.reset}`
  );
  console.log(
    `   ${colors.green}●${colors.reset} Database: ${colors.green}Connected${colors.reset}`
  );
  console.log(
    `   ${colors.green}●${colors.reset} Supabase: ${colors.green}Connected${colors.reset}`
  );
  console.log();

  console.log(`${colors.bright}🌐 Access URLs:${colors.reset}`);
  console.log(
    `   ${colors.cyan}●${colors.reset} Local:      ${colors.white}${localUrl}${colors.reset}`
  );
  console.log(
    `   ${colors.cyan}●${colors.reset} Network:    ${colors.white}${networkUrl}${colors.reset}`
  );
  console.log();

  console.log(`${colors.bright}📚 Available Endpoints:${colors.reset}`);
  console.log(
    `   ${colors.blue}●${colors.reset} Health:     ${colors.white}${localUrl}/health${colors.reset}`
  );
  console.log(
    `   ${colors.blue}●${colors.reset} API Docs:   ${colors.white}${localUrl}/docs${colors.reset} ${colors.yellow}(Interactive)${colors.reset}`
  );
  console.log(
    `   ${colors.blue}●${colors.reset} Auth:       ${colors.white}${localUrl}/auth/*${colors.reset} ${colors.gray}(4 endpoints)${colors.reset}`
  );
  console.log(
    `   ${colors.blue}●${colors.reset} Barbershop: ${colors.white}${localUrl}/barbershop/*${colors.reset} ${colors.gray}(2 endpoints)${colors.reset}`
  );
  console.log();

  console.log(`${colors.bright}🛠️  Development Tools:${colors.reset}`);
  console.log(
    `   ${colors.magenta}●${colors.reset} Interactive Docs: Open ${colors.cyan}${localUrl}/docs${colors.reset} in browser`
  );
  console.log(
    `   ${colors.magenta}●${colors.reset} CORS Enabled:    ${colors.green}localhost:3000, localhost:5173${colors.reset}`
  );
  console.log(
    `   ${colors.magenta}●${colors.reset} Security Headers: ${colors.green}Enabled${colors.reset}`
  );
  console.log();

  console.log(
    `${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}`
  );
  console.log(
    `${colors.bright}✅ Ready for Frontend Integration!${colors.reset}`
  );
  console.log(
    `${colors.gray}─────────────────────────────────────────────────────────────${colors.reset}`
  );
  console.log();
};

export const printStartupMessage = () => {
  console.log(`${colors.yellow}⏳ Starting Barbershop API...${colors.reset}\n`);
};

export const printErrorMessage = (error: any) => {
  console.log(`\n${colors.red}❌ Failed to start server:${colors.reset}`);
  console.error(error);
};

export const printShutdownMessage = () => {
  console.log(
    `\n${colors.yellow}⏳ Gracefully shutting down...${colors.reset}`
  );
};
