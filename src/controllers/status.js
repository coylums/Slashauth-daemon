import controller from "./controller.js"
// const { query } = require("../services/db")

export default controller(async (req, res) => {
  try {
    // const db = await query("select now()")
    // const ts = db[0]

    // if (!ts) {
    //   throw new Error("Empty DB response")
    // }

    return res.json({ status: "ok" })
  } catch (error) {
    console.error(
      `HEALTH CHECK FAILED: ${JSON.stringify({ message: error.message, stack: error.stack })}`,
    )
    return res
      .status(503)
      .json({ status: "error", error: `Unable to connect to database: ${error.message}` })
  }
})
