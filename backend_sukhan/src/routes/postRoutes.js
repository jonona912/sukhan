const express = require('express')
const { createPost, getPosts, getPostById, updatePost, deletePost, deleteAllPosts, likePost } = require('../controllers/postController')
const { authenticateToken } = require('../middlewares/authMiddleware')
const { validatePost } = require('../middlewares/validation')

const router = express.Router()

router.post('/', authenticateToken, validatePost, createPost)
router.get('/', getPosts)
router.get('/:id', getPostById)
router.put('/:id', authenticateToken, validatePost, updatePost)
router.post('/:id/like', authenticateToken, likePost)
if (process.env.NODE_ENV === 'test') {
    router.delete('/all', deleteAllPosts)
}

router.delete('/:id', authenticateToken, deletePost)


module.exports = router
