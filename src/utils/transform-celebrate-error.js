import { isCelebrateError } from "celebrate"
import SlashAuthError from "../utils/error.js"

export default (err, req, res, next) => {
  if (!isCelebrateError(err)) {
    return next(err)
  }

  const rawJoiError = err.details.entries()
  const validation = {}
  // eslint-disable-next-line no-restricted-syntax
  for (const [segment, joiError] of rawJoiError) {
    validation[segment] = {
      source: segment,
      keys: joiError.details.map((detail) => detail.path.join(".")),
      message: joiError.message,
    }
  }

  req.log.debug(`JOI ERROR: ${JSON.stringify(validation)}`)

  const message = Object.values(validation)
    .map((segment) => segment.message)
    .join(", ")

  return next(SlashAuthError.badRequest(message, false, true))
}
