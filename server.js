const PORT = 8000
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
require('dotenv').config()
const app = express()

app.use(express.json())
app.use(cors())

// const API_KEY = process.env.OPENAI_API_KEY
const API_KEYS = JSON.parse(process.env.OPENAI_API_KEYS)
let currentKeyIndex = 0

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from ania-chatbot-api',
  })
})

async function sendOpenAIRequest(endpoint, data) {
  const apiKey = API_KEYS[currentKeyIndex]
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, options)
  const result = await response.json()
  if (response.status === 403 && result.error === 'Too many requests') {
    // If we have reached the rate limit for this key, switch to the next one
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
    return sendOpenAIRequest(endpoint, data)
  } else {
    return result
  }
}

app.post('/', async (req, res) => {
  // const apiKey = API_KEYS[currentKeyIndex]
  // const prompt = req.body.prompt
  // const options = {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${apiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [{ role: 'user', content: prompt }],
  //     max_tokens: 3000,
  //   }),
  // }
  // try {
  //   const response = await fetch(
  //     'https://api.openai.com/v1/chat/completions',
  //     options
  //   )
  //   const data = await response.json()
  //   res.status(200).send({
  //     bot: data.choices[0].message.content,
  //   })
  // } catch (error) {
  //   console.error(error)
  //   res.status(500).send(error || 'Something went wrong')
  // }

  try {
    const data = await sendOpenAIRequest('chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
    })
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
