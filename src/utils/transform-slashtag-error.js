import SlashAuthError from "./error.js"

function isActuallyUncaught(err) {
  if (!err) return false
  return (
    err instanceof TypeError ||
    err instanceof SyntaxError ||
    err instanceof ReferenceError ||
    err instanceof EvalError ||
    err instanceof RangeError ||
    err instanceof URIError ||
    err.code === "ERR_ASSERTION"
  )
}

export default (err, req, res, next) => {
  // if (isActuallyUncaught(err)) {
  return next(new SlashAuthError(503, err.message, false, true))
  // }
}
