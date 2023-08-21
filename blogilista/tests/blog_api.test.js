const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

let token = ''
const initialBlogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    }
]

beforeEach(async () => {   
    await User.deleteMany({})
    await Blog.deleteMany({})

    const initialUser = {
        username: 'initialUser',
        name: 'initialUser',
        password: 'initialUser'
    }

    await api.post('/api/users').send(initialUser)
    
    const loginResponse = await api.post('/api/login').send({
        username: initialUser.username, password: initialUser.password
    })

    token = loginResponse.body.token
    /*
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
    */

    await api
        .post('/api/blogs')
        .send(initialBlogs[0])
        .set('Authorization', `Bearer ${token}`)
    
    await api
        .post('/api/blogs')
        .send(initialBlogs[1])
        .set('Authorization', `Bearer ${token}`)

    //const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    //console.log("ALL BLOGS", response.body)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    expect(response.body).toHaveLength(initialBlogs.length)
})

test('blogs are identified with an id parameter', async () => {
    const response = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
    
    expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    const titles = response.body.map(blog => blog.title)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain('Canonical string reduction')
})

test('if number of likes is not given zero is assigned to likes', async () => {
    const newBlog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    const result = response.body.find(blog => blog.url === newBlog.url)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(result.likes).toBe(0)
})

test('blog without url or title is not added', async () => {
    const noTitleBlog = {
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    }

    const noUrlBlog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        likes: 12,
    }

    await api
        .post('/api/blogs')
        .send(noTitleBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

    await api
        .post('/api/blogs')
        .send(noUrlBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    
    const response = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    expect(response.body).toHaveLength(initialBlogs.length)   
})

test('a blog can be modified', async () => {
    const blogs = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    const blogToUpdate = blogs.body[0]

    const updatedBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: 100
    }

    const resultBlog = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(blogToUpdate.id).toEqual(resultBlog.body.id)
    expect(blogToUpdate.likes).not.toEqual(resultBlog.body.likes)
})

test('a blog can be deleted', async () => {
    const blogs = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    const blogToDelete = blogs.body[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

    const blogsAtEnd = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

    expect(blogsAtEnd.body).toHaveLength(initialBlogs.length - 1)
    const urls = blogsAtEnd.body.map(blog => blog.url)

    expect(urls).not.toContain(blogToDelete.url)
})


afterAll(async () => {
    await mongoose.connection.close()
})