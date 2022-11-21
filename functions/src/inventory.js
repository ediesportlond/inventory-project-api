import { ObjectId } from 'mongodb'
import sanitize from 'mongo-sanitize'
import dbConnect from './dbConnect.js'
import authConnect from './authConnect.js'

export const verifyToken = async (req, res) => {
  const token = req.headers.authorization;
  const auth = authConnect();
  const decodedToken = await auth.verifyIdToken(token)
    .catch(err => {
      res.status(401).send(err);
      return;
    });

    if (!decodedToken) return;

}