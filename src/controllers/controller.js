export default (handler) => async (req, res, next) => {
  try {
    await handler(req, res)

    // If the controller completes without a response being sent
    // throw an error so that the express app responds to the request
    // instead of leaving the client hanging
    if (!res.headersSent) {
      throw new Error("Controller returned without sending a response")
    }
  } catch (err) {
    next(err)
  }
}
