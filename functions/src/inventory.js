import { ObjectId } from 'mongodb'
import sanitize from 'mongo-sanitize'
import dbConnect from './dbConnect.js'
import authConnect from './authConnect.js'

const client = dbConnect()
const collection = client.db('homeGoods').collection('inventory')

export const verifyToken = (req, res) => {
  const token = req.headers.authorization;
  const auth = authConnect();
  auth.verifyIdToken(token)
    .then(decodedToken => {
      if (!decodedToken) return { uid: undefined };
      return decodedToken
    })
    .catch(err => {
      res.status(401).send(err);
    });
}

export const getAllItems = () => {
  const { uid } = verifyToken(req, res)

  if (!uid) return;

  const query = { uid: new ObjectId(uid) }

  collection.find(query).toArray()
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => res.status(500).send({ success: false, message: err }))

  client.close()
}

export const getSelectedItems = () => {
  const { uid } = verifyToken(req, res)

  if (!uid) return;

  const { select } = sanitize(req.params)

  const query = { uid: new ObjectId(uid) }

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

  client.close()
}

export const addNewItem = () => {
  const { uid } = verifyToken(req, res)

  if (!uid) return;

  const newItem = sanitize(req.body)

  newItem.uid = uid
  newItem.createdDate = new Date()

  collection.insertOne(newItem)
    .then(result => res.status(201).send({ success: true, message: result }))
    .catch(err => res.status(500).send({ success: false, message: err }))

  client.close()
}