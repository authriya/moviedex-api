require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const MOVIES = require('./movies-data-small.json')

const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())


app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }

    next()
})

app.get('/movie', function handleGetMovies(req, res) {
    let response = MOVIES
    if (req.query.genre) {
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase()))
        if (response.length === 0) {
            return res.status(404).json({ error: 'This genre is not in our movie set'})
        }
    }
    if(req.query.country) {
        response = response.filter(movie =>
            movie.country.toLowerCase().includes(req.query.country.toLowerCase()))
        if (response.length === 0) {
            return res.status(404).json({ error: 'This country is not in our movie set'})
        }
    }
    if(req.query.avg_vote) {
        response = response.filter(movie =>
            Number(movie.avg_vote) >=  Number(req.query.avg_vote))
        if (response.length === 0) {
            return res.status(404).json({ error: `We don\'t have any movies with ratings equal to or greater than ${Number(req.query.avg_vote)}. Either change the other queries or the rating`})
        }
    }

    res.json(response)
})

const PORT = 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})