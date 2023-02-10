import SDK, { SlashURL } from "@synonymdev/slashtags-sdk"
import { Server } from "@synonymdev/slashtags-auth"
import fs from "fs"
import b4a from "b4a"

class SlashTagService {
  constructor(savedPrimaryKey) {
    this.sdk = new SDK({ storage: "./storage", primaryKey: b4a.from(savedPrimaryKey, "hex") })
    this.slashTag = this.sdk.slashtag(process.env.SLASHTAG)
  }

  validateToken(token, user) {
    //check my db.txt file to see if the client id the user passed in is awaiting authentication
    var dbText = fs.readFileSync("db.txt").toString()
    var db = JSON.parse(dbText)
    return token in db
  }

  isValidJson(content) {
    if (!content) return
    try {
      JSON.parse(content)
      //   var json = JSON.parse(content)
    } catch (e) {
      return
    }
    return true
  }

  async getDriveStore() {
    return this.slashTag.drivestore.get()
  }

  async isReady() {
    const driveStore = await this.getDriveStore()
    await driveStore.ready()
  }

  async getDrive(remote) {
    return this.sdk.drive(remote)
  }

  async getPublicProfile() {
    const driveStore = await this.getDriveStore()
    return driveStore.get("/profile.txt")
  }

  async updatePublicDrive(text) {
    const driveStore = await this.getDriveStore()
    return driveStore.put("/profile.txt", b4a.from(JSON.stringify(text)))
  }

  async createServer() {
    const server = new Server(this.slashTag, {
      //the variable called token contains the user's clientid
      //the variable called remote contains the user's slashtag (without the prefix) encoded in some funky way that I don't yet understand
      onauthz: async (token, remote) => {
        // if (!isValidUser(remote)) return { status: "error", message: "sign up first!" }

        const url = SlashURL.format(remote)

        // Check that token is valid, and remote isn't blocked
        const valid = validateToken(token, url)

        if (valid) {
          //if everything checks out, log the user's slashtag to indicate that they are logged in
          var drive = this.getDrive(remote)

          var profile = await drive.get("/profile.txt")

          if (this.isValidJson(profile)) {
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
      onmagiclink: () => {
        return {
          url: "http://fixthemoney.world",
          validUntil: Number(new Date()) + 15 * 60 * 60,
        }
      },
    })

    // Listen on server's Slashtag key through DHT connections
    await this.slashTag.listen()

    await this.sdk.createKeyPair
    await this.sdk.swarm.join(
      Buffer.from("3b9f8ccd062ca9fc0b7dd407b4cd287ca6e2d8b32f046d7958fa7bea4d78fd75", "hex"),
    )

    return server
  }
}

export default SlashTagService
