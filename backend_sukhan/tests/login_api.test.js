// before each test create users
// test login with correct credentials
// test login with incorrect credentials
// test login with missing fields
// test login with non-existent user
// test token generation on successful login

const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { MONGODB_URI } = require('../src/config/env')
const api = supertest(app)
const User = require('../src/models/User')

const testUsers = [{
  username: 'username1',
  email: 'testuser1@example.com',
  password: 'password1',
  passwordConfirm: 'password1'
},
{
  username: 'username2',
  email: 'testuser2@example.com',
  password: 'password2',
  passwordConfirm: 'password2'
}]

beforeEach(async () => {
  await mongoose.connect(MONGODB_URI)
  await User.deleteMany({})
  for (const user of testUsers) {
    await api.post('/api/auth/register').send(user)
  }
})

describe('POST /api/auth/login validation', () => {
  test('logs in with correct credentials', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: testUsers[0].email, password: testUsers[0].password })
      .expect(200)
      .expect(res => {
        assert.ok(res.body.token, 'Token should be returned on successful login')
        console.log('Login response:', res.body)
        assert.strictEqual(res.body.user.username, testUsers[0].username)
        assert.strictEqual(res.body.user.email, testUsers[0].email)
      })
      
  })
  test('rejects incorrect password', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: testUsers[0].email, password: 'wrongpassword' })
      .expect(401)
      .expect(res => {
        assert.strictEqual(res.body.error, 'Invalid email or password')
      })
  })

  test('rejects missing fields', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: '', password: '' })
      .expect(401)
      .expect(res => 
        assert.strictEqual(res.body.error, 'Invalid email or password')
      )
  })

  test('rejects missing email', async () => {
    await api
      .post('/api/auth/login')
      .send({ password: 'password1' })
      .expect(400)
  })

  test('rejects missing password', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: testUsers[0].email })
      .expect(400)
  })

  test('rejects invalid email format', async () => {
    await api
      .post('/api/auth/login')
      .send({ email: 'invalidemail', password: 'password1' })
      .expect(400)
  })

  test('token is valid JWT', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: testUsers[0].email, password: testUsers[0].password })
      .expect(200)
    assert.ok(res.body.token.split('.').length === 3, 'Token should be valid JWT')
  })
})

after(async () => {
  await mongoose.connection.close()
})
