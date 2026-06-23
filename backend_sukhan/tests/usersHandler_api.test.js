const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
// supertest handles server testing by simulating HTTP requests to the app without needing to run the server
const supertest = require('supertest')
const app = require('../app')
const { MONGODB_URI } = require('../src/config/env')
const api = supertest(app)
const User = require('../src/models/User')


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

beforeEach(async () => {
  await mongoose.connect(MONGODB_URI)
  await User.deleteMany({})
  await User.insertMany(testUsers.map(user => ({ ...user })))
})

describe('users ', () => {
  test('gets all users', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect(res => {
        assert.strictEqual(res.body.length, 2)
        assert.strictEqual(res.body[0].username, 'testuser')
        assert.strictEqual(res.body[1].username, 'testuser2')
      })
  })

  test('deletes a user', async () => {
    const usersAtStart = await User.find()
    const userToDelete = usersAtStart[0]

    await api
      .delete(`/api/users/${userToDelete._id}`)
      .expect(200)
      .expect(res => {
        assert.strictEqual(res.body.message, 'User deleted successfully')
      })

    const usersAtEnd = await User.find()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length - 1)
    assert.strictEqual(usersAtEnd.some(u => u._id.toString() === userToDelete._id.toString()), false)
  })
  test('deletes all users', async () => {
    await api
      .delete('/api/users/all')
      .expect(200)
      .expect(res => {
        assert.strictEqual(res.body.message, 'All users deleted successfully')
      })
  
    const usersAtEnd = await User.find()
    assert.strictEqual(usersAtEnd.length, 0)
  })
})



// Close the Mongoose connection after all tests are done to prevent hanging. 
// Hanging occurs because Jest waits for all asynchronous operations to complete 
// before exiting, and an open database connection can keep the process alive indefinitely.
after(async () => {
  await mongoose.connection.close()
})
