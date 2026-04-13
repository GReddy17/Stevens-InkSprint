import mongoose from 'mongoose'

export async function connectToMongo() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/inksprint'

    const connection = await mongoose.connect(mongoUri)

    console.log(`MongoDB Connected: ${connection.connection.host}`)
  } catch (error) {
    console.error('Database connection error:', error.message)
    process.exit(1)
  }
}