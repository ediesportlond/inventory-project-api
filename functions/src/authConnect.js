import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { serviceAccount } from "./serviceAccount.js"

export function authConnect() {
  if(!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    })
  }
  return getAuth()
}