import SDK, { SlashURL } from "@synonymdev/slashtags-sdk"
import { Server } from "@synonymdev/slashtags-auth"
import fs from "fs"
import b4a from "b4a"

const slashTagAuthenticate = async () => {
  /** START SLASHTAGS AUTH SETUP **/

  let saved
  try {
    saved = fs.readFileSync("./storage/primaryKey")
  } catch {}

  const sdk = new SDK({ storage: "./storage", primaryKey: saved })

  if (!saved) fs.writeFileSync("./storage/primaryKey", sdk.primaryKey)

  // Get the default slashtag
  const slashtag = sdk.slashtag()

  // Set profile if not already saved
  var local_profile_text = fs.readFileSync("profile.txt").toString()
  var local_profile = JSON.parse(local_profile_text)
  var local_name = local_profile["name"]
  var local_bio = local_profile["bio"]
  var local_image = local_profile["image"]
  if (!local_name || !local_image) {
    var profile_to_set = {
      name: "Gordy",
      image:
        "data:image/svg+xml,%3Csvg viewBox='0 0 140 140' id='svg-slashtags' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M59.469 48.981h13.074l-11.29 41.947H48.18l11.29-41.947zm32.352 0l-11.29 41.947H67.456l11.29-41.947h13.075z' fill='%23fff'%3E%3C/path%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M75.578 17.299c29.14 3.079 50.202 29.184 47.123 58.279-3.079 29.14-29.184 50.202-58.279 47.123-29.14-3.079-50.202-29.184-47.123-58.279 3.079-29.14 29.184-50.202 58.279-47.123zm-1.16 11.067C51.526 25.91 30.775 42.69 28.366 65.582c-2.455 22.892 14.324 43.643 37.216 46.052 22.892 2.455 43.643-14.324 46.052-37.216 2.455-22.892-14.324-43.643-37.216-46.052z' fill='red'%3E%3C/path%3E%3C/svg%3E",
      bio: "This service is not yet set up properly, the admin must still create a new name, profile picture, and bio. Go here: [admin url]",
    }
  } else {
    var profile_to_set = {
      name: local_name,
      image: local_image,
      bio: local_bio,
    }
  }
  var publicDrive = slashtag.drivestore.get()
  await publicDrive.ready()
  var existing_profile = await publicDrive.get("/profile.txt")

  // console.log(Buffer.from(existing_profile).toString())
  if (
    !existing_profile ||
    !isValidJson(Buffer.from(existing_profile).toString()) ||
    !("name" in JSON.parse(Buffer.from(existing_profile).toString())) ||
    !("bio" in JSON.parse(Buffer.from(existing_profile).toString())) ||
    !("image" in JSON.parse(Buffer.from(existing_profile).toString())) ||
    JSON.parse(Buffer.from(existing_profile).toString())["name"] != local_name ||
    JSON.parse(Buffer.from(existing_profile).toString())["bio"] != local_bio ||
    JSON.parse(Buffer.from(existing_profile).toString())["image"] != local_image
  )
    await publicDrive.put("/profile.txt", b4a.from(JSON.stringify(profile_to_set)))

  const server = new Server(slashtag, {
    //the variable called token contains the user's clientid
    //the variable called remote contains the user's slashtag (without the prefix) encoded in some funky way that I don't yet understand
    onauthz: async (token, remote) => {
      if (!isValidUser(remote)) return { status: "error", message: "sign up first!" }

      const url = SlashURL.format(remote)

      // Check that token is valid, and remote isn't blocked
      const valid = validateToken(token, url)
      if (valid) {
        //if everything checks out, log the user's slashtag to indicate that they are logged in
        var drive = sdk.drive(remote)
        var profile = await drive.get("/profile.txt")
        if (isValidJson(profile)) {
          var profile_object = JSON.parse(Buffer.from(profile).toString())
        } else {
          var profile_object = {}
          profile_object["name"] = url.substring(url.indexOf("slash:") + 6, 38)
          profile_object["bio"] = ""
          profile_object["image"] = ""
          profile_object["links"] = []
        }
        profile_object["slashtag"] = url
        var dbtext = fs.readFileSync("db.txt").toString()
        var db = JSON.parse(dbtext)
        var obj = {}
        obj["authenticated"] = profile_object
        obj["timestamp"] = Math.floor(Date.now() / 1000) + 300
        db[token] = obj
        var texttowrite = JSON.stringify(db)
        fs.writeFileSync("db.txt", texttowrite, function () {
          return
        })
        return { status: "ok" }
      }
      return { status: "error", message: "invalid token" }
    },
  })

  // Listen on server's Slashtag key through DHT connections
  await slashtag.listen()
  // ready = true

  /** END OF SLASHTAGS AUTH SETUP **/
}

export default slashTagAuthenticate
