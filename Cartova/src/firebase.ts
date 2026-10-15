import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC2NOIg0XRUEOJoBctCud1wRbmlrHKFDRU',
  authDomain: 'automation-testing-48321.firebaseapp.com',
  projectId: 'automation-testing-48321',
  storageBucket: 'automation-testing-48321.firebasestorage.app',
  messagingSenderId: '41151730211',
  appId: '1:41151730211:web:25e5604ba6e75996929796',
  measurementId: 'G-GEGP89ERTG',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp, 'trytestme-platform')
