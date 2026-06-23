const Post = require('../models/Post')
const User = require('../models/User')

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body
    const userId = req.user.id

    // Create new post
    const post = new Post({
      content,
      author: userId
    })
    await post.save()
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('comments.author', 'username')
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id
    const post = await Post.findById(postId)
      .populate('author', 'username')
      .populate('comments.author', 'username')
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id
    const { content } = req.body
    const userId = req.user.id // Assuming req.user is set by auth middleware

    const post = await Post.findById(postId).select('+likes')
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    post.content = content
    await post.save()
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    // Use deleteOne on the document (remove() can be unreliable/deprecated)
    await post.deleteOne()
    return res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id
    
    const post = await Post.findById(postId).select('+likes')
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    // Check if the user has already liked the post
    const hasLiked = post.likes.includes(userId)
    if (hasLiked) {
      // If the user has already liked the post, remove their like
      post.likes.pull(userId)
      post.likesCount = Math.max(post.likesCount - 1, 0) // Ensure likesCount doesn't go below 0
    } else {
      // If the user hasn't liked the post yet, add their like
      post.likes.push(userId)
      post.likesCount += 1
    }
    await post.save()
    console.log(`Post ${post}`)
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}





exports.deleteAllPosts = async (req, res) => {
  try {
    console.log('Deleting all posts...')
    await Post.deleteMany({})
    res.json({ message: 'All posts deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
