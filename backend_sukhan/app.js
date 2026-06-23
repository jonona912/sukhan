const express = require('express')
const authRoutes = require('./src/routes/authRoutes')
const userRoutes = require('./src/routes/userRoutes')
const postRoutes = require('./src/routes/postRoutes')
const app = express()
const { requestLogger, unknownEndpoint, errorHandler } = require('./src/middlewares/middleware')


app.use(express.json())
app.get('/', (req, res) => res.send('OK:)'))

app.use(requestLogger)

app.use('/api/auth', authRoutes) // includes both register and login routes
app.use('/api/posts', postRoutes) 


if (process.env.NODE_ENV === 'test') {
    app.use('/api/users', userRoutes)
}

app.use(errorHandler )
app.use(unknownEndpoint)

module.exports = app
