import generateRequestID from "./generate-request-id.js"
import logger from "./logger.js"
import requestIDHeaderName from "./request-id-header-name.js"

export default (req, res, next) => {
  // Add request ID
  const requestId = req.get(requestIDHeaderName)

  if (!requestId) {
    const id = generateRequestID()
    req.headers[requestIDHeaderName] = id
    req.id = id
  } else {
    req.id = requestId
  }

  // Measure start time
  const startAt = process.hrtime.bigint()

  // Set up logger
  req.log = logger.makeForRequest(req)

  res.on("finish", () => {
    // Compute response time
    const finishAt = process.hrtime.bigint()
    // eslint-disable-next-line no-undef
    const responseTimeMilliseconds = Number((finishAt - startAt) / BigInt(1000000)) // nano -> milliseconds

    const {
      statusCode,
      locals: { error: errorMessage },
    } = res
    const isError = res.statusCode >= 400

    const authId = req.auth && req.auth.id
    const content = isError ? errorMessage : res.get("content-length")

    // :req[${requestIDHeaderName}] :auth :method :url :status :content - :response-time ms
    const message = `${req.id} ${authId} ${req.method} ${req.originalUrl} ${statusCode} ${
      content || "-"
    } - ${responseTimeMilliseconds} ms`

    // Add response information to log, logger already has request information
    req.log.info(message, {
      http_status_code: statusCode,
      is_error: isError,
      response_time_ms: responseTimeMilliseconds,
      type: "request",
    })
  })

  next()
}
