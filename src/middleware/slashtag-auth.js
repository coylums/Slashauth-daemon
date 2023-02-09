import fs from "fs"
import middleware from "../utils/middleware.js"
import SlashTagService from "../services/slashtag.js"

export default middleware(async (req) => {
  /** START SLASHTAGS AUTH SETUP **/

  const slashTagService = new SlashTagService(
    "69b04ea6e3b62245048a8efe8c17c6affb91e07ea1e28c911c2acdfd4d851f5c",
  )

  let saved
  try {
    saved = fs.readFileSync("./storage/primaryKey")
  } catch {}

  if (!saved) fs.writeFileSync("./storage/primaryKey", slashTagService.sdk.primaryKey)

  // Set profile if not already saved
  var local_profile_text = fs.readFileSync("profile.txt").toString()
  var local_profile = JSON.parse(local_profile_text)
  var local_name = local_profile["name"]
  var local_bio = local_profile["bio"]
  var local_image = local_profile["image"]

  if (!local_name || !local_image) {
    var profileToSet = {
      name: "Gordy",
      image:
        "data:image/svg+xml,%3Csvg viewBox='0 0 140 140' id='svg-slashtags' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M59.469 48.981h13.074l-11.29 41.947H48.18l11.29-41.947zm32.352 0l-11.29 41.947H67.456l11.29-41.947h13.075z' fill='%23fff'%3E%3C/path%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M75.578 17.299c29.14 3.079 50.202 29.184 47.123 58.279-3.079 29.14-29.184 50.202-58.279 47.123-29.14-3.079-50.202-29.184-47.123-58.279 3.079-29.14 29.184-50.202 58.279-47.123zm-1.16 11.067C51.526 25.91 30.775 42.69 28.366 65.582c-2.455 22.892 14.324 43.643 37.216 46.052 22.892 2.455 43.643-14.324 46.052-37.216 2.455-22.892-14.324-43.643-37.216-46.052z' fill='red'%3E%3C/path%3E%3C/svg%3E",
      bio: "This service is not yet set up properly, the admin must still create a new name, profile picture, and bio. Go here: [admin url]",
    }
  } else {
    var profileToSet = {
      name: local_name,
      image: local_image,
      bio: local_bio,
    }
  }

  // const driveStore = await slashTagService.getDriveStore()
  await slashTagService.isReady()

  const existingProfile = await slashTagService.getPublicProfile()

  // console.log(Buffer.from(existing_profile).toString())
  if (
    !existingProfile ||
    !slashTagService.isValidJson(Buffer.from(existingProfile).toString()) ||
    !("name" in JSON.parse(Buffer.from(existingProfile).toString())) ||
    !("bio" in JSON.parse(Buffer.from(existingProfile).toString())) ||
    !("image" in JSON.parse(Buffer.from(existingProfile).toString())) ||
    JSON.parse(Buffer.from(existingProfile).toString())["name"] != local_name ||
    JSON.parse(Buffer.from(existingProfile).toString())["bio"] != local_bio ||
    JSON.parse(Buffer.from(existingProfile).toString())["image"] != local_image
  ) {
    await slashTagService.updatePublicDrive(profileToSet)
  }

  req.slashTagService = slashTagService

  /** END OF SLASHTAGS AUTH SETUP **/
})
