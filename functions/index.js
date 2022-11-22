import functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

import { getAllItems, getSelectedItems, addNewItem } from './src/inventory.js'

app.get('/', (req, res) => {
  res.send('Hello, World!')
})
app.get('/inventory', getAllItems)
app.get('/inventory/:select', getSelectedItems)
app.post('/inventory/new', addNewItem)

export const api = functions.https.onRequest(app)
// app.listen(5002, () => console.log('listening on http://localhost:5002'))
