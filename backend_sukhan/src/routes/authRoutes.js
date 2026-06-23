const express = require('express')
const { register, login } = require('../controllers/authController')
const { validateRegister } = require('../middlewares/validation')

const router = express.Router()

router.post('/register', validateRegister, register)
router.post('/login', login)


// implement delete user 
module.exports = router
