import authConnect from './authConnect.js';

export async function verifyGoogleToken(req, res, next){
  const token = req.headers.authorization;
  const auth = authConnect();
  
  const decodedToken = await auth.verifyIdToken(token)
  .catch(err => {
    res.status(401).send(err);
  });
  
  if (!decodedToken) return;
  req.decoded = decodedToken;

  next();
}
