const { test, after, beforeEach, before, describe, mock } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { MONGODB_URI } = require('../src/config/env')
const api = supertest(app)
const User = require('../src/models/User')
const Post = require('../src/models/Post')
const { testUsers } = require('./helpers')
const { generateToken } = require('../src/controllers/authController')
const jwt = require('jsonwebtoken')

function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token)
    if (!decoded || !decoded.exp) return true
    const nowSec = Date.now() / 1000
    return nowSec >= decoded.exp
  } catch (e) {
    return true
  }
}

let loginResponse
let token

before(async () => {
  await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
  await Post.deleteMany({})
  await User.deleteMany({})
  await User.insertMany(testUsers.map(user => ({ ...user })))
  // Log in the seeded user to get an auth token
  loginResponse = await api
    .post('/api/auth/login')
    .send({
      email: testUsers[0].email,
      password: testUsers[0].password
    })
    .expect(200)

  token = loginResponse.body.token
  
})

describe('POST /api/posts', () => {
  test('creates a new post with valid data', async () => {

    const newPostData = {
      content: 'This is a test post'
    }

    await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)
      .expect(res => {
        assert.strictEqual(res.body.content, newPostData.content)
        assert.ok(res.body.id, 'Post ID should be returned')
      })
  })

  test('returns 400 if content is missing', async () => {
    const newPostData = {
      content: ''
    }

    await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(400)
  })

  test('returns 401 if no token is provided', async () => {
    const newPostData = {
      content: 'This is a test post without token'
    }

    await api
      .post('/api/posts')
      .send(newPostData)
      .expect(401)
  })
  
  test('returns 403 if token is invalid', async () => {
    const newPostData = {
      content: 'This is a test post with invalid token'
    }

    await api
      .post('/api/posts')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.invalid.signature')
      .send(newPostData)
      .expect(403)
  })

  test('return 401 if token doesn not exist', async () => {
    const newPostData = {
      content: 'This is a test post with non-existing token'
    }

    await api
      .post('/api/posts')
      .send(newPostData)
      .expect(401)
  })
  test('token should expire after 1 day', async (t) => {
    t.mock.timers.enable();
    // generateToken creates a token valid for 1 day; just verify it's not expired
    const token = generateToken({ userId: 123 });
    assert.strictEqual(isTokenExpired(token), false);
    const oneDayAndOneSecond = (60 * 60 * 1000 * 24) + 1000;
    t.mock.timers.tick(oneDayAndOneSecond);
    assert.strictEqual(isTokenExpired(token), true);
  })

  test('Test post creation with very long content', async () => {
    const longContent = 'a'.repeat(5001)
    const newPostData = {
      content: longContent
    }

    await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(400)
      .expect(res => {
        assert.ok(res.body.errors.some(e => e.msg === 'Content cannot exceed 5000 characters'), 'Should return max length error')
      })
  })
})


describe('GET /api/posts', () => {
  test('retrieves all posts', async () => {
    // Create a post to ensure there's at least one
    const newPostData = {
      content: 'This is the first test post for retrieval'
    }
    await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)

    const response = await api
      .get('/api/posts')
      .expect(200)

    assert.ok(Array.isArray(response.body), 'Response should be an array of posts')
    assert.strictEqual(response.body.length, 1, 'Response should contain exactly one post')
    // .some returns true when at least one item in the array matches the condition.
    assert.ok(response.body.some(post => post.content === newPostData.content), 'Response should include the created post')

    const newPost2 = {
      content: 'This is the second test post for retrieval'
    }
    await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost2)
      .expect(201)
    
    const response2 = await api
      .get('/api/posts')
      .expect(200)
    assert.ok(Array.isArray(response2.body), 'Response should be an array of posts')
    assert.strictEqual(response2.body.length, 2, 'Response should contain exactly two posts')
    assert.ok(response2.body.some(post => post.content === newPostData.content), 'Response should include the first created post')
    assert.ok(response2.body.some(post => post.content === newPost2.content), 'Response should include the second created post')
  
    // second user creates a post
    const loginResponse2 = await api
      .post('/api/auth/login')
      .send({
        email: testUsers[1].email,
        password: testUsers[1].password
      })
      .expect(200)

    const token2 = loginResponse2.body.token

    const newPost3 = {
      content: 'This is the third test post for retrieval'
    }
    await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token2}`)
      .send(newPost3)
      .expect(201)

    const response3 = await api
      .get('/api/posts')
      .expect(200)

    assert.ok(Array.isArray(response3.body), 'Response should be an array of posts')
    assert.strictEqual(response3.body.length, 3, 'Response should contain exactly three posts')
    assert.ok(response3.body.some(post => post.content === newPostData.content), 'Response should include the first created post')
    assert.ok(response3.body.some(post => post.content === newPost2.content), 'Response should include the second created post')
    assert.ok(response3.body.some(post => post.content === newPost3.content), 'Response should include the third created post')
  })
  
  test('retrieve specific post by ID', async () => {
    const newPostData = {
      content: 'This is a test post for retrieval by ID'
    }
    const createResponse = await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)

    const postId = createResponse.body.id

    const getResponse = await api
      .get(`/api/posts/${postId}`)
      .expect(200)
    console.log('getResponse.body:', getResponse.body)
    assert.strictEqual(getResponse.body.content, newPostData.content, 'Retrieved post content should match created post')
    assert.strictEqual(getResponse.body.id, postId, 'Retrieved post ID should match created post ID')
  })

  test('returns 404 for non-existing post ID', async () => {
    const nonExistingId = new mongoose.Types.ObjectId()
    await api
      .get(`/api/posts/${nonExistingId}`)
      .expect(404)
  })
})

describe('PUT /api/posts/:id', () => {
  test('updates a post with valid data by the author', async () => {
    const newPostData = {
      content: 'This is a test post for update'
    }
    const createResponse = await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)

    const postId = createResponse.body.id

    const updatedContent = 'This is the updated content of the test post'
    const updateResponse = await api
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: updatedContent })
      .expect(200)

    assert.strictEqual(updateResponse.body.content, updatedContent, 'Updated post content should match the new content')
    assert.strictEqual(updateResponse.body.id, postId, 'Updated post ID should match the original post ID')
  })

  test('returns 403 if user tries to update another user\'s post', async () => {
    // First user creates a post
    const newPostData = {
      content: 'This is a test post for unauthorized update'
    }
    const createResponse = await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)

    const postId = createResponse.body.id

    // Second user logs in
    const loginResponse2 = await api
      .post('/api/auth/login')
      .send({
        email: testUsers[1].email,
        password: testUsers[1].password
      })
      .expect(200)

    const token2 = loginResponse2.body.token

    // Second user tries to update the first user's post
    const updatedContent = 'This is an unauthorized update attempt'
    await api
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: updatedContent })
      .expect(403)
      .expect(res => {
        assert.strictEqual(res.body.error, 'Unauthorized', 'Should return unauthorized error message')
      })
  })
})

describe('DELETE /api/posts/:id', () => {
  test('deletes a post by the author', async () => {
    const newPostData = {
      content: 'This is a test post for deletion'
    }
    const createResponse = await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)

    const postId = createResponse.body.id
    await api
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(res => {
        assert.strictEqual(res.body.message, 'Post deleted successfully', 'Should return success message on deletion')
      })

    // Verify the post is deleted
    await api
      .get(`/api/posts/${postId}`)
      .expect(404)
  })
  
  test('returns 403 if user tries to delete another user\'s post', async () => {
    // First user creates a post
    const newPostData = {
      content: 'This is a test post for unauthorized deletion'
    }
    const createResponse = await api
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPostData)
      .expect(201)

    const postId = createResponse.body.id

    // Second user logs in
    const loginResponse2 = await api
      .post('/api/auth/login')
      .send({
        email: testUsers[1].email,
        password: testUsers[1].password
      })
      .expect(200)

    const token2 = loginResponse2.body.token

    // Second user tries to delete the first user's post
    await api
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403)
      .expect(res => {
        assert.strictEqual(res.body.error, 'Unauthorized', 'Should return unauthorized error message')
      })
  })
})

// TODO: Test GET /api/posts - retrieve all posts with pagination
// TODO: Test GET /api/posts/:id - retrieve a specific post by ID
// TODO: Test PUT /api/posts/:id - update a post (only by author)
// TODO: Test DELETE /api/posts/:id - delete a post (only by author)
// TODO: Test unauthorized user cannot update/delete another user's post
// TODO: Test post creation with special characters and HTML
// TODO: Test post filtering by user/author
// TODO: Test post sorting (by date, popularity)
// TODO: Test concurrent post creation
// TODO: Test database validation errors are properly handled
// TODO: Test expired token refresh mechanism

after(async () => {
  await mongoose.connection.close()
})

