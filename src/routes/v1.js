import { Router } from "express"
import slashTagAuth from "../middleware/slashtag-auth.js"
import { getAuthenticatedSlashTag, updateProfile, getStatus } from "../controllers/v1/index.js"

const router = Router()

const logEverything = (req, res, next) => {
  req.log.debug(`--> ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`)
  next()
}
router.use(logEverything)

router.use(slashTagAuth)

router.get("/status", getStatus)
router.get("/slashtag", getAuthenticatedSlashTag)
router.put("/profile", updateProfile)

export default router
