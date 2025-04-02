import mongoose from "mongoose"
import { conf } from "../conf/conf.js"

export const dbConnection = async () => {
  try {
    const res = await mongoose.connect(`${conf.mongoDbUrl}/${conf.dbName}`)
    res && console.log(`Database connection successful.`)
  } catch (error) {
    console.log(error)
    throw error
  }
}
