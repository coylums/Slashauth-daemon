import { getContents, updateContents } from "../../../services/db.js"
import b4a from "b4a"

export default async (req, res) => {
  const updatedProfile = req.body
  const { slashtag } = req.slashtags

  const currentProfile = getContents("profile.txt")
  if (currentProfile == updatedProfile) {
    res.send(302)
  }

  updateContents("profile.txt", updatedProfile)

  var publicDrive = slashtag.drivestore.get()
  await publicDrive.ready()
  await publicDrive.put("/profile.txt", b4a.from(JSON.stringify(updatedProfile)))

  res.set("Content-Type", "text/plain")
  res.send(updatedProfile)
}
