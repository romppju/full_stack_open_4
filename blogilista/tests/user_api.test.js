const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')


describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const pHash = await bcrypt.hash('secret', 10)
        const user = new User({
            username: 'initialUser',
            name: 'initialUser',
            passwordHash: pHash
        })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const response = await api.get('/api/users')
        const usersAtStart = response.body

        const newUser = {
            username: 'username111',
            name: 'user111',
            password: 'password111'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await api.get('/api/users')
        expect(usersAtEnd.body).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.body.map(user => user.username)
        expect(usernames).toContain(newUser.username)
    })

    test('user creation fails if username or password is missing', async () => {
        const response = await api.get('/api/users')
        const usersAtStart = response.body

        const newUser1 = {
            name: "noUsernameName",
            password: "noUsernamePassword"
        }

        const newUser2 = {
            username: "noPasswordUsername", 
            name: "noPasswordName"    
        }

        const resultUsername = await api
            .post('/api/users')
            .send(newUser1)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const resultPassword = await api
            .post('/api/users')
            .send(newUser2)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(resultUsername.body.error).toContain('missing username or password')
        expect(resultPassword.body.error).toContain('missing username or password')

        const usersAtEnd = await api.get('/api/users')
        expect(usersAtEnd.body).toHaveLength(usersAtStart.length)    
    })

    test('user creation fails if username is already taken', async () => {
        const response = await api.get('/api/users')
        const usersAtStart = response.body

        const newUser = {
            username: 'initialUser',
            name: 'newUser',
            password: 'newPassword'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await api.get('/api/users')
        expect(usersAtEnd.body).toHaveLength(usersAtStart.length)
    })
    
    test('user creation fails if username or password is too short', async () => {
        const response = await api.get('/api/users')
        const usersAtStart = response.body

        const newUser1 = {
            username: "ab",
            name: "name",
            password: "password"
        }

        const newUser2 = {
            username: "username", 
            name: "name" ,
            password: "ab"  
        }

        const resultUsername = await api
            .post('/api/users')
            .send(newUser1)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const resultPassword = await api
            .post('/api/users')
            .send(newUser2)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(resultUsername.body.error).toContain('min length for username and password is 3 characters')
        expect(resultPassword.body.error).toContain('min length for username and password is 3 characters')

        const usersAtEnd = await api.get('/api/users')
        expect(usersAtEnd.body).toHaveLength(usersAtStart.length)    
    })   
})

afterAll(async () => {
    await mongoose.connection.close()
})