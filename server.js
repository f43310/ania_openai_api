const PORT = 8000
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
require('dotenv').config()
const app = express()

app.use(express.json())
app.use(cors())

const API_KEY = process.env.OPENAI_API_KEY

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from ania-chatbot-api',
  })
})

app.post('/', async (req, res) => {
  const prompt = req.body.prompt
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
    }),
  }
  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      options
    )
    const data = await response.json()
    res.status(200).send({
      bot: data.choices[0].message.content,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong')
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
