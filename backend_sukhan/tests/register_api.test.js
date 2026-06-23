const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { MONGODB_URI } = require('../src/config/env')
const api = supertest(app)
const User = require('../src/models/User')

beforeEach(async () => {
  await mongoose.connect(MONGODB_URI)
  await User.deleteMany({})
})

const testUsers = [{
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'password',
  passwordConfirm: 'password'
},
{
  username: 'testuser2',
  email: 'testuser2@example.com',
  password: 'password',
  passwordConfirm: 'password'
}]

describe('POST /api/auth/register validation', () => {
  test('rejects missing username', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], username: '' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Username is required')
      })
  })

  test('rejects short username', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], username: 'ab' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Username must be 3-30 characters')
      })
  })

  test('rejects missing email', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], email: '' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Email is required')
      })
  })

  test('rejects invalid email', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], email: 'not-an-email' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Please provide a valid email')
      })
  })

  test('rejects missing password', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], password: '' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Password is required')
      })
  })

  test('rejects short password', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], password: '12345', passwordConfirm: '12345' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Password must be at least 6 characters')
      })
  })

  test('rejects missing password confirmation', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], passwordConfirm: '' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Password confirmation is required')
      })
  })

  test('rejects mismatched passwords', async () => {
    await api
      .post('/api/auth/register')
      .send({ ...testUsers[0], passwordConfirm: 'different-password' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.errors[0].msg, 'Passwords do not match')
      })
  })
})

describe('POST /api/auth/register', () => {
  test('notes are returned as json', async () => {
    await api
      .post('/api/auth/register')
      .send(testUsers[0])
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('register fails with existing email', async () => {
    await api
      .post('/api/auth/register')
      .send(testUsers[0])
      .expect(201)

    await api
      .post('/api/auth/register')
      .send(testUsers[0])
      .expect(409)
      .expect('Content-Type', /application\/json/)
      .expect(res => {
        assert.strictEqual(res.body.error, 'Email or username already in use')
      })

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, 1)
    await api
      .post('/api/auth/register')
      .send(testUsers[1])
      .expect(201)
      .expect(res => {
        assert.strictEqual(res.body.user.username, testUsers[1].username)
        assert.strictEqual(res.body.user.email, testUsers[1].email)
        assert.strictEqual(res.body.message, 'User registered successfully')
      })

    const usersAtEnd2 = await User.find({})
    assert.strictEqual(usersAtEnd2.length, 2)
  })

  test('password is not returned in response', async () => {
    await api
      .post('/api/auth/register')
      .send(testUsers[0])
      .expect(201)
      .expect(res => {
        assert.strictEqual(res.body.user.password, undefined)
      })
  })
})



after(async () => {
  await mongoose.connection.close()
})

