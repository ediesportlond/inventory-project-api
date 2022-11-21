import { MongoClient } from "mongodb"
import { uri } from "./serviceAccount.js"

export default function dbConnect(){
    const client = new MongoClient(uri);
    return client.db("mydatabase");
}

