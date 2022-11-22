import { MongoClient } from "mongodb"
import { uri } from "./serviceAccount.js"

export default function dbConnect(){
    return new MongoClient(uri);
}

