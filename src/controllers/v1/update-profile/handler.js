import { getContents, updateContents } from "../../../services/db.js"

export default async (req, res) => {
  const updatedProfile = req.body
  const { slashTagService } = req

  const currentProfile = getContents("profile.txt")
  if (currentProfile == updatedProfile) {
    res.send(302)
  }

  updateContents("profile.txt", updatedProfile)

  await slashTagService.isReady()
  await slashTagService.updatePublicDrive(updatedProfile)

  res.set("Content-Type", "text/plain")
  res.send(updatedProfile)
}
