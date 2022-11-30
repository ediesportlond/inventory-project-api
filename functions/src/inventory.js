import { ObjectId } from 'mongodb'
import sanitize from 'mongo-sanitize'
import dbConnect from './dbConnect.js'
import authConnect from './authConnect.js'

const client = dbConnect()
const collection = client.db('homeGoods').collection('inventory')

export const getAllItems = (req, res) => {

  const { uid } = req.decoded;

  const query = { uid: uid }

  collection.find(query).toArray()
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => {
      res.status(500).send({ success: false, message: err })
    })

}

export const getSelectedItems = (req, res) => {

  const { uid } = req.decoded;

  const { select } = sanitize(req.params)

  const query = { uid: uid }

  switch (select) {
    case 'instock':
      query.inventory = {
        $gt: 0
      }
      break
    case 'nostock':
      query.inventory = 0
  }

  options = {
    sort: { inventory: 1 }
  }

  collection.find(query, options).toArray()
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => res.status(500).send({ success: false, message: err }))

}

export const getOneItem = (req, res) => {

  const { oid } = sanitize(req.params);

  const query = { _id: new ObjectId(oid) };

  collection.findOne(query)
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => {
      res.status(500).send({ success: false, message: err })
    })

}

export const addNewItem = (req, res) => {

  const { uid } = req.decoded;

  const newItem = sanitize(req.body)

  newItem.uid = uid
  newItem.createdDate = new Date()

  collection.insertOne(newItem)
    .then(() => getAllItems(req, res))
    .catch(err => res.status(500).send({ success: false, message: err }))
}

export const updateItem = (req, res) => {

  const { oid } = sanitize(req.params);

  const query = { _id: new ObjectId(oid) };

  const update = {
    $set: {
      ...sanitize(req.body),
      updateDate: new Date()
    }
  }

  collection.findOneAndUpdate(query, update)
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => res.status(500).send({ success: false, message: err }));
}

const getToday = () => {
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

  return `${year}-${month}-${_day}`
}

const getPerishables = async (uid) => {
  const expiredPerishables = {
    uid: uid,
    type: 'perishable',
    restock: true,
    $or: [
      {
        threshold: { $lte: getToday() }
      },
      {
        inventory: { $lte: 1 }
      }
    ]
  };

  const result = await collection.find(expiredPerishables).toArray()
    .catch(err => res.status(500).send({ success: false, message: err }));

  return result;
}

const getConsumables = async (uid) => {
  const consumablesRunningLow = {
    uid: uid,
    type: 'consumable',
    restock: true,
    $and: [
      { $expr: { $lte: ["$percentRemaining", "$threshold"] } },    //compares percent remaining threshold
      { inventory: { $lte: 1 } }
    ]
  };

  const result = await collection.find(consumablesRunningLow).toArray()
    .catch(err => res.status(500).send({ success: false, message: err }));

  return result
}

const getStockables = async (uid) => {
  const stockablesLow = {
    uid: uid,
    restock: true,
    type: 'stockable',
    $expr: { $lte: ["$inventory", "$threshold"] }
  };

  const result = await collection.find(stockablesLow).toArray()
    .catch(err => res.status(500).send({ success: false, message: err }));

  return result

}

export const getShoppingList = async (req, res) => {

  const { uid } = req.decoded;

  const perishables = await getPerishables(uid);
  const consumables = await getConsumables(uid);
  const stockables = await getStockables(uid);

  const list = [...perishables, ...consumables, ...stockables];

  let cost = 0;
  list.forEach(item => cost += Number(item.price));
  cost = cost.toFixed(2);
  list.unshift({
    cost: cost
  });

  res.status(200).send({ success: true, message: list });
}

export const searchInventory = (req, res) => {
  const { search } = sanitize(req.params);
  const regex = new RegExp(search, 'i');

  const { uid } = req.decoded;

  const searchFor = {
    uid: uid,
    $or: [
      {
        group: { $regex: regex }
      },
      {
        productName: { $regex: regex }
      },
      {
        brand: { $regex: regex }
      }
    ]
  }

  collection.find(searchFor).toArray()
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => res.status(500).send({ success: false, message: err }))
}