import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import { verifyGoogleToken } from './src/middleware.js';

import {
  getAllItems, getSelectedItems, addNewItem, getOneItem,
  updateItem, getShoppingList
} from './src/inventory.js';

app.get('/inventory', verifyGoogleToken, getAllItems);
app.get('/shopping-list', verifyGoogleToken, getShoppingList);
app.get('/inventory/:select', verifyGoogleToken, getSelectedItems);
app.get('/inventory/single/:oid', verifyGoogleToken, getOneItem);
app.post('/inventory/new', verifyGoogleToken, addNewItem);
app.post('/inventory/update/:oid', verifyGoogleToken, updateItem);

export const api = functions.https.onRequest(app);
// app.listen(5002, () => console.log('listening on http://localhost:5002'))
