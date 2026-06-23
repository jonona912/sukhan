const mongoose = require('mongoose')

async function connectDB(MONGODB_URI) {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }

  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')
}

module.exports = connectDB
