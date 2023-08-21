const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const result = blogs.map(blog => blog.likes).reduce((acc, curr) => acc + curr, 0)
       
    return result
}

const favoriteBlog = (blogs) => {
    
    if (blogs.length === 0) {
        return null
    }

    const max = blogs.reduce(function(prev, current) {
        return (prev.likes > current.likes) ? prev : current
    })

    return {
        title: max.title,
        author : max.author,
        likes: max.likes
    }
}

const mostBlogs = (blogs) => {
    const authors = blogs.map(blog => blog.author)

    if(authors.length === 0) {
        return null
    }
    
    let maxEl = authors[0]
    let maxCount = 0

    for (let i = 0; i < authors.length; i++) {
        let count = 0
        
        for (let j = 0; j < authors.length; j++) {
            if (authors[i] === authors[j]) {
                count++
            }
        }
       
        if (count > maxCount) {
            maxCount = count
            maxEl = authors[i]
        }      
    }

    return {
        author: maxEl,
        blogs: maxCount
    }
}

const mostLikes = (blogs) => {
    
    if(blogs.length === 0) {
        return null
    }
    
    let maxAuthor = blogs[0].author
    let maxCount = 0

    for (let i = 0; i < blogs.length; i++) {
        let count = 0
        
        for (let j = 0; j < blogs.length; j++) {
            if (blogs[i].author === blogs[j].author) {
                count = count + blogs[j].likes
            }
        }

        if (count > maxCount) {
            maxCount = count
            maxAuthor = blogs[i].author
        }        
    }

    return {
        author: maxAuthor,
        likes: maxCount
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}