import logger from "./src/utils/logger.js"
import app from "./src/app.js"

const port = process.env.PORT || 3000
import { databaseExists } from "./src/services/db.js"

let server

databaseExists("db.txt")
  .then(() => {
    server = app.listen(port, () => logger.info(`Express server listening on port ${port}...`))
    // https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
    // TLDR: Theres evidence to suggest that the ALBs pre-establish a connection
    // to the backend and before sending data to it express is closing the
    // connection causing a race condition resulting in 502 Bad Gateway responses being
    // sent from the ALB when theres no valid reason for it to do so. -rlang 12/13/2021
    server.keepAliveTimeout = 61 * 1000
    server.headersTimeout = 65 * 1000

    server
  })
  .catch((error) => {
    logger.log.error(
      `Startup error", ${JSON.stringify({ message: error.message, stack: error.stack })}`,
    )
    process.exit(1)
  })

const shutdown = (signal) => {
  logger.info(`Received signal ${signal}`)

  if (server) {
    logger.info("Shutting down express server")
    server.close(() => {
      logger.info("Closed express server")
      server = null
    })
  } else {
    logger.info("No running express server")
  }
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
