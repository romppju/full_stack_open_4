const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const body = request.body

    if (body.username === undefined || body.password === undefined) {
        return response.status(400)
        .json({error: 'missing username or password'})
    }

    if (body.username.length < 3 || body.password.length < 3) {
        return response.status(400)
        .json({error: 'min length for username and password is 3 characters'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash: passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

usersRouter.get('/', async(request, response) => {
    const users = await User.find({})
        .populate('blogs', {title:1, author:1, url:1, likes:1})
    response.json(users)
})

module.exports = usersRouter