import functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

import {verifyToken} from './src/inventory.js'

app.get('/', (req, res) => {
  res.send('Hello, World!')
})
app.get('/token', verifyToken)

export const api = functions.https.onRequest(app)
