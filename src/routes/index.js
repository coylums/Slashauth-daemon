import { Router } from "express"
import bodyParser from "body-parser"

// const { auth } = require("../config")

import v1Routes from "./v1.js"

const router = Router()

router.use("/v1", bodyParser.json(), v1Routes)

export default router
