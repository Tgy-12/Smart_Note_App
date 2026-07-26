const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const logger = require("./config/logger");

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
   logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on("unhandledRejection", (err) => {
   logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};
startServer();
//find . -path ./node_modules -prune -o -name "*.js" -print uses to output all the file strutcutre of a project
