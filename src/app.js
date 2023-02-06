import express from "express"
import { handler } from "express-timeout-handler"
import statusController from "./controllers/status.js"

import routes from "./routes/index.js"

// const transformCelebrateError = require("./utils/transform-celebrate-error")
import SlashAuthError from "./lib/error.js"
import handleError from "./lib/handler-error.js"

const requestTimeout = 10000

const app = express()
app.enable("trust proxy")

app.get("/healthz", statusController)

// app.use(addRequestLogging)

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

// app.use(transformCelebrateError)
app.use(handleError)

export default app
