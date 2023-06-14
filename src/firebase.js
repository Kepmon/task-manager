import { initializeApp } from "firebase/app"
import {
  getAuth
} from 'firebase/auth'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth()

export { app, auth }