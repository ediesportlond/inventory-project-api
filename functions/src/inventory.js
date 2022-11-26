import { ObjectId } from 'mongodb'
import sanitize from 'mongo-sanitize'
import dbConnect from './dbConnect.js'
import authConnect from './authConnect.js'

const client = dbConnect()
const collection = client.db('homeGoods').collection('inventory')

export const getAllItems = async (req, res) => {
  const token = req.headers.authorization;
  const auth = authConnect();

  const decodedToken = await auth.verifyIdToken(token)
    .catch(err => {
      res.status(401).send(err);
    });

  if (!decodedToken) return;

  const { uid } = decodedToken

  const query = { uid: uid }

  collection.find(query).toArray()
    .then(result => res.status(200).send({ success: true, message: result }))
    .catch(err => {
      res.status(500).send({ success: false, message: err })
    })

}

export const getSelectedItems = async (req, res) => {
  const token = req.headers.authorization;
  const auth = authConnect();

  const decodedToken = await auth.verifyIdToken(token)
    .catch(err => {
      res.status(401).send(err);
    });

  if (!decodedToken) return;

  const { uid } = decodedToken

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

export const addNewItem = async (req, res) => {
  const token = req.headers.authorization;
  const auth = authConnect();

  const decodedToken = await auth.verifyIdToken(token)
    .catch(err => {
      res.status(401).send(err);
    });

  if (!decodedToken) return;

  const { uid } = decodedToken

  const newItem = sanitize(req.body)

  newItem.uid = uid
  newItem.createdDate = new Date()

  collection.insertOne(newItem)
    .then(()=> getAllItems(req,res))
    .catch(err => res.status(500).send({ success: false, message: err }))
}