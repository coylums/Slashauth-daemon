// const { models } = require("../../../services/db")
import SDK, { SlashURL } from "@synonymdev/slashtags-sdk"
import fs from "fs"

export default async (req, res) => {
  const { client_id: clientId } = req.query
  const { slashTagService } = req

  const existingProfile = await slashTagService.getPublicProfile("profile.txt")

  var name = JSON.parse(Buffer.from(existingProfile).toString())["name"]
  //clear old db entries
  var dbtext = fs.readFileSync("db.txt").toString()
  var db = JSON.parse(dbtext)
  var now = Math.floor(Date.now() / 1000)
  Object.keys(db).forEach(function (entry) {
    if (db[entry]["timestamp"] + 300 < now) delete db[entry]
  })
  var texttowrite = JSON.stringify(db)
  fs.writeFileSync("db.txt", texttowrite, function () {
    return
  })

  if (clientId) {
    var authenticated = false
    //check if they are authenticated (if this happened, it happened when the onauthz function of the slashtags server fired)
    if (clientId in db) {
      //if the user's client id is an object, they authenticated properly and the value of db[ clientId ] will contain their slashtag,
      //so set their auth status to that object; otherwise, they did not authenticate properly, so leave their auth status as false
      if (typeof db[clientId]["authenticated"] == "object") {
        authenticated = JSON.stringify(db[clientId]["authenticated"])
      }
    } else {
      //if the user's clientId was not in my authentication db, put it in there with an authentication status of false
      //because this means they are trying to authenticate
      var obj = {}
      obj["authenticated"] = false
      obj["timestamp"] = Math.floor(Date.now() / 1000)
      db[clientId] = obj
      var texttowrite = JSON.stringify(db)
      fs.writeFileSync("db.txt", texttowrite, function () {
        return
      })
    }
    if (!authenticated) {
      //if the user did not authenticate yet but they are in the db, pass them the slash-auth url so they can authenticate
      var slashAuthUrl = SlashURL.format(slashTagService.slashTag.key, {
        protocol: "slashauth",
        query: { q: clientId },
      })
      // sendResponse(response, slashAuthUrl, 200, {
      //   "Content-Type": "text/plain",
      // })
      res.set("Content-Type", "text/plain")
      res.send(slashAuthUrl)
      //sendResponse( response, "slash-auth:" + slashtag.url.substring( slashtag.url.indexOf( ":" ) + 1 ) + '?q=' + clientId, 200, {'Content-Type': 'text/plain'} );
    } else {
      //if the user did authenticate properly, pass the authenticated user's profile object (including their slashtag) so my php app can use it
      //to find their account or create it. I used to clear the authenticated user from the db here but later I decided against it because if the
      //server gets the user's slashtag and deletes the entry and then somehow crashes before serving the slashtag to the user, it should be able
      //to get the entry again after a reboot
      // sendResponse(response, authenticated, 200, {
      //   "Content-Type": "text/plain",
      // })
      res.set("Content-Type", "text/plain")
      res.send(authenticated)
    }
  } else {
    //if my php app did not pass in a clientId, remind it to
    // sendResponse(response, name + "\n" + "Send a client id: ?clientId=abababababaa", 200, {
    //   "Content-Type": "text/plain",
    // })
    res.set("Content-Type", "text/plain")
    res.send("\n" + "Send a client id: ?clientId=abababababaa")
  }
}

// if (parts.path == "/" || parts.path.startsWith("/?")) {
//if it did, assume their authentication status is false, indicating "not authenticated"
