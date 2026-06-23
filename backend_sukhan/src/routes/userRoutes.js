const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

router.get('/', userController.getAllUsers)
router.delete('/all', userController.deleteAllUsers)
router.delete('/:id', userController.deleteUser)


module.exports = router
