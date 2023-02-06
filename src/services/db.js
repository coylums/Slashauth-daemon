import fs from "fs"

const databaseExists = async (db) => fs.existsSync(db)

const getContents = (db) => fs.readFileSync(db).toString()

const updateContents = (db, updates) => fs.writeFileSync(db, JSON.stringify(updates, null, 2))

export { databaseExists, getContents, updateContents }
