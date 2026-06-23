const app = require('./app')
const { PORT, MONGODB_URI } = require('./src/config/env')
const connectDB = require('./src/config/connectDB')
const logger = require('./src/utils/logger')

async function start() {
  try {
    await connectDB(MONGODB_URI)
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`)
    })
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
  if (process.env.NODE_ENV === 'test') {
    console.log(`Running in test mode, server listening on port ${PORT}`)
  }
}

start()
