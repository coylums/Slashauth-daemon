import { createLogger, format, transports } from "winston"
import generateRequestID from "./generate-request-id.js"

const transport = new transports.Console({
  format: format.combine(format.timestamp(), format.json()),
  level: "info",
})

const parseStackTraceLine = (line) => {
  const match =
    /.* at (?<functionName>.*) \((?<fileName>.*):(?<lineNumber>\d+):(?<column>\d+)\)/.exec(line)
  return match.groups
}

const createTraceLogger = (opts) => {
  const wrappedLogger = createLogger(opts)

  // For each level function on the logger:
  // Intercept the function call and add file name and line number from the caller of the function
  Object.keys(wrappedLogger.levels).forEach((level) => {
    const original = wrappedLogger[level]

    wrappedLogger[level] = (...args) => {
      try {
        // Get the caller of the log function
        const trace = parseStackTraceLine(new Error().stack.split("\n")[2])
        const traceInfo = { file_name: trace.fileName, line_number: +trace.lineNumber }

        if (args[1]) {
          Object.assign(args[1], traceInfo)
        } else {
          args.push(traceInfo)
        }
        // eslint-disable-next-line no-empty
      } catch (noOpError) {}

      original.call(wrappedLogger, ...args)
    }
  })

  wrappedLogger.level = opts.transports[0].level

  return wrappedLogger
}

const logger = createTraceLogger({
  transports: [transport],
  exitOnError: false,
})

logger.setLevel = (level) => {
  transport.level = level
}

const routeFromReq = (req) =>
  req.route && req.originalUrl
    ? req.originalUrl.replace(req.path, req.route && req.route.path)
    : req.originalUrl

const infoFromReq = (req) => ({
  auth_id: req.auth && req.auth.id,
  http_method: req.method,
  // Get full route but replace path params with their variables again
  http_route: routeFromReq(req),
  http_path: req.originalUrl,
  request_id: req.id,
  site_id: req.auth && req.auth.site && req.auth.site.id,
  user_id: req.auth && req.auth.user && req.auth.user.id,
})

const reqFormat = (req) =>
  format((info, opts) => {
    const defaults = {
      type: "log",
      is_error: info.level === "error" || info.level === "warn",
    }

    // Allow anything passed in as info or opts to overwrite request values or defaults
    return Object.assign(defaults, infoFromReq(req), info, opts)
  })

logger.makeForRequest = (req) => {
  // If req was falsy, create a new ID for all requests for this same logger
  const cleanReq = req || { id: generateRequestID() }

  const reqLogger = createTraceLogger({
    transports: [
      new transports.Console({
        format: format.combine(format.timestamp(), reqFormat(cleanReq)(), format.json()),
        level: transport.level,
      }),
    ],
    exitOnError: false,
  })

  reqLogger.requestID = cleanReq.id

  return reqLogger
}

export default logger
