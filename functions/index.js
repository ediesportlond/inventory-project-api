import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import {
  getAllItems, getSelectedItems, addNewItem, getOneItem,
  updateItem, getShoppingList
} from './src/inventory.js';

import dbConnect from './src/dbConnect.js'
const client = dbConnect()
const collection = client.db('homeGoods').collection('inventory')

app.get('/', async (req, res) => {
  let d = new Date();
    d = d.toDateString();
    d = d.replace(/^\w{3}\s/, '');

    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04',
      May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10',
      Nov: '11', Dec: '12'
    }

    const month = months[d.match(/^\w{3}/)];
    const nums = d.match(/\d+/g);
    let _day = nums[0];
    let year = nums[1];
    if (_day.length < 2) _day = '0' + _day;

    d = `${year}-${month}-${_day}`

  const expiredPerishables = {
    uid: 'dWCXfDp7F6gryJ1GCpGO2eMv4IF3',
    type: 'perishable',
    restock: true,
    $or: [
      {
        threshold: { $lte: d }
      },
      {
        inventory: { $lte: 1 }
      }
    ]
  };
  // res.send(expiredPerishables)

  const result = await collection.find(expiredPerishables).toArray()
  .catch(err => res.status(500).send({ success: false, message: err }));

  res.send(result)
  // return result;
})

app.get('/inventory', getAllItems);
app.get('/shopping-list', getShoppingList);
app.get('/inventory/:select', getSelectedItems);
app.get('/inventory/single/:oid', getOneItem);
app.post('/inventory/new', addNewItem);
app.post('/inventory/update/:oid', updateItem);

export const api = functions.https.onRequest(app);
// app.listen(5002, () => console.log('listening on http://localhost:5002'))
