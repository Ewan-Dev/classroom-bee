import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import {getAnalytics} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js"
import {getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js"
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyBUkzQncT9mVGtMuL1wrcJQDCXMyzLVqJo",
    authDomain: "spelling-club-portal.firebaseapp.com",
    projectId: "spelling-club-portal",
    storageBucket: "spelling-club-portal.firebasestorage.app",
    messagingSenderId: "99013335312",
    appId: "1:99013335312:web:2edf2b69ba37fab769ed95",
    measurementId: "G-02PJ1652H4"
}
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const loggedOutViewEl = document.getElementById("logged-out-view")
const loggedInViewEl = document.getElementById("logged-in-view")

const signInWithGoogleButton = document.getElementById("google-signin-btn")
const usernameFieldEl = document.getElementById("email")
const passwordFieldEl = document.getElementById("password")
const signUpBtnEl = document.getElementById("sign-up")
const signInBtnEl = document.getElementById("sign-in")
const errorMessageEl = document.getElementById("signup-error")

signUpBtnEl.addEventListener("click", authCreateUserWithEmailAndPassword)
signInBtnEl.addEventListener("click", authSignInWithEmailAndPassword)

/* AUTH FUNCTIONS */
function authCreateUserWithEmailAndPassword(){
    const username = usernameFieldEl.value
    const password = passwordFieldEl.value
    console.log(username)
    createUserWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
        const user = userCredential.user
        console.log(user)
    })
    .catch((err) => {
        const errorCode = err.code
        const errorMessage = err.message
        console.error(errorCode)
        console.error(errorMessage)
        errorMessageEl.textContent = `${errorCode}: ${errorMessage}`
    })
}

function authSignInWithEmailAndPassword(){
    const username = usernameFieldEl.value
    const password = passwordFieldEl.value
    signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
        const user = userCredential.user
        console.log(user)
    })
    .catch((err)=>{
        const errorCode = err.code
        const errorName = err.name
        console.error(errorCode)
        console.error(errorMessage)
        errorMessageEl.textContent = `${errorCode}: ${errorMessage}`
    })
}