const isSlashAuthErrorResponse = (err) =>
  err.response &&
  err.response.statusCode &&
  err.response.body &&
  Object.keys(err.response.body).sort().join(",") === "can_retry,contact_support,message"

// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  let message
  let status

  if (err.statusCode) {
    message = err.message || "Internal Error"
    status = err.statusCode
  } else if (isSlashAuthErrorResponse(err)) {
    // Pass SlashAuthError responses straight through
    res.locals.error = err.response.body.message
    return res.status(err.response.statusCode).send(err.response.body)
  } else if (err.name === "UnauthorizedError") {
    // Express JWT Auth error
    message = "Unauthorized"
    status = 401
  } else {
    req.log.error(err.message, { stack: err.stack, type: "stack" })

    message = "Internal Error"
    status = 500
  }

  res.locals.error = message

  let canRetry
  let contactSupport

  if (Object.keys(err).includes("canRetry")) {
    canRetry = err.canRetry
  } else {
    canRetry = true
  }

  if (Object.keys(err).includes("contactSupport")) {
    contactSupport = err.contactSupport
  } else {
    contactSupport = true
  }

  return res.status(status).send({ message, can_retry: canRetry, contact_support: contactSupport })
}
