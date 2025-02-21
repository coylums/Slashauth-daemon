import express from "express"
import { handler } from "express-timeout-handler"
import healthzController from "./controllers/healthz.js"
import addRequestLogging from "./utils/add-request-logging.js"

import routes from "./routes/index.js"

import SlashAuthError from "./utils/error.js"
import handleError from "./utils/handler-error.js"
import transformCelebrateError from "./utils/transform-celebrate-error.js"
import transformSlashtagError from "./utils/transform-slashtag-error.js"

const requestTimeout = 30000

const app = express()
app.enable("trust proxy")

app.get("/healthz", healthzController)

app.use(addRequestLogging)

app.use(
  handler({
    timeout: requestTimeout,
    onTimeout(req, res) {
      handleError(
        new SlashAuthError(503, "The server is busy, please try again later.", true, true),
        req,
        res,
      )
    },
  }),
)

app.use(routes)

app.use((req, res, next) => next(SlashAuthError.notFound()))

app.use(transformCelebrateError)
app.use(transformSlashtagError)
app.use(handleError)

export default app
