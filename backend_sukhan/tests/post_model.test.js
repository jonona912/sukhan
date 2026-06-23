// PSEUDOCODE
// 1. Import node:test, assert, mongoose, and the Post model.
// 2. Connect to MongoDB once before tests and clean the Post collection before each test.
// 3. Create a valid ObjectId to use as a fake author.
// 4. Test required validation:
//    - save without author -> expect validation error "Author is required"
//    - save without content -> expect validation error "Content is required"
// 5. Test content trimming:
//    - save content with surrounding whitespace
//    - verify stored content is trimmed
// 6. Test content length validation:
//    - save content longer than 5000 chars -> expect maxlength validation error
// 7. Test likesCount defaults and validation:
//    - create post without likesCount -> expect 0
//    - save negative likesCount -> expect min validation error
// 8. Test references arrays:
//    - save post with likes and comments ObjectIds
//    - verify they are stored correctly
// 9. Test toJSON transform:
//    - convert saved post to JSON
//    - verify id exists
//    - verify _id and __v are removed
// 10. Test timestamps:
//    - save a post
//    - verify createdAt and updatedAt exist
// 11. Test schema indexes:
//    - verify author index exists
//    - verify createdAt descending index exists
// 12. Close the MongoDB connection after tests.

const { test, before, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Post = require('../src/models/Post')
const { MONGODB_URI } = require('../src/config/env')

describe('Post model', () => {
  before(async () => {
    await mongoose.connect(MONGODB_URI)
  })

  beforeEach(async () => {
    await Post.deleteMany({})
  })

  after(async () => {
    await mongoose.connection.close()
  })

  const validAuthorId = new mongoose.Types.ObjectId()

  test('requires author', async () => {
    const post = new Post({
      content: 'Valid content',
    })

    let error
    try {
      await post.save()
    } catch (err) {
      error = err
    }

    assert.ok(error)
    assert.strictEqual(error.errors.author.message, 'Author is required')
  })

  test('requires content', async () => {
    const post = new Post({
      author: validAuthorId,
    })

    let error
    try {
      await post.save()
    } catch (err) {
      error = err
    }

    assert.ok(error)
    assert.strictEqual(error.errors.content.message, 'Content is required')
  })

  test('trims content before saving', async () => {
    const post = new Post({
      author: validAuthorId,
      content: '   hello world   ',
    })

    const saved = await post.save()
    assert.strictEqual(saved.content, 'hello world')
  })

  test('rejects content longer than 5000 characters', async () => {
    const post = new Post({
      author: validAuthorId,
      content: 'a'.repeat(5001),
    })

    let error
    try {
      await post.save()
    } catch (err) {
      error = err
    }

    assert.ok(error)
    assert.ok(
      error.errors.content.message.includes('cannot exceed 5000 characters') ||
        error.errors.content.message.includes('maximum allowed length')
    )
  })

  test('defaults likesCount to 0', async () => {
    const post = new Post({
      author: validAuthorId,
      content: 'Valid content',
    })

    const saved = await post.save()
    assert.strictEqual(saved.likesCount, 0)
  })

  test('rejects negative likesCount', async () => {
    const post = new Post({
      author: validAuthorId,
      content: 'Valid content',
      likesCount: -1,
    })

    let error
    try {
      await post.save()
    } catch (err) {
      error = err
    }

    assert.ok(error)
    assert.ok(error.errors.likesCount)
  })

  test('stores likes and comments as object id references', async () => {
    const likeUserId = new mongoose.Types.ObjectId()
    const commentId = new mongoose.Types.ObjectId()

    const post = new Post({
      author: validAuthorId,
      content: 'Valid content',
      likes: [likeUserId],
      comments: [commentId],
    })

    const saved = await post.save()

    assert.strictEqual(saved.likes.length, 1)
    assert.strictEqual(saved.comments.length, 1)
    assert.strictEqual(saved.likes[0].toString(), likeUserId.toString())
    assert.strictEqual(saved.comments[0].toString(), commentId.toString())
  })

  test('toJSON adds id and removes _id and __v', async () => {
    const post = new Post({
      author: validAuthorId,
      content: 'Valid content',
    })

    const saved = await post.save()
    const json = saved.toJSON()

    assert.ok(json.id)
    assert.strictEqual(json._id, undefined)
    assert.strictEqual(json.__v, undefined)
    assert.strictEqual(json.id, saved._id.toString())
  })

  test('sets timestamps on save', async () => {
    const post = new Post({
      author: validAuthorId,
      content: 'Valid content',
    })

    const saved = await post.save()
    // ensure timestamps exist and are Date instances
    assert.ok(saved.createdAt)
    assert.ok(saved.updatedAt)

    const createdAt = saved.createdAt
    const updatedAt = saved.updatedAt

    // Update the post and verify updatedAt changed
    await new Promise(resolve => setTimeout(resolve, 100))

    saved.content = 'Updated content'
    const updated = await saved.save()
    console.log('updated save', updated)
    assert.ok(updated.updatedAt > updatedAt)
    assert.strictEqual(updated.createdAt.toString(), createdAt.toString())
  })

  test('defines author and createdAt indexes', () => {
    const indexes = Post.schema.indexes()

    const hasAuthorIndex = indexes.some(([fields]) => fields.author === 1)
    const hasCreatedAtIndex = indexes.some(
      ([fields]) => fields.createdAt === -1
    )

    assert.strictEqual(hasAuthorIndex, true)
    assert.strictEqual(hasCreatedAtIndex, true)
  })
})


