import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import {getAnalytics} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js"
import {getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,

} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js"
import { getFirestore,
    setDoc,
    collection,
    doc,
    arrayUnion,
    getDoc,
    updateDoc,
    query,
    where,
    onSnapshot
 } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'

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
const provider = new GoogleAuthProvider();

const welcomeMessageEl = document.getElementById("welcome-message")

const classCodeInputEl = document.getElementById("class-input")
const classCodeButtonEl = document.getElementById("class-add-button")

const classesDivEl = document.getElementById("classes")
let classCode = ""

signUpBtnEl.addEventListener("click", authCreateUserWithEmailAndPassword)
signInBtnEl.addEventListener("click", authSignInWithEmailAndPassword)
signInWithGoogleButton.addEventListener("click", authGoogle)

classCodeButtonEl.addEventListener("click", createOrJoinClass)
/* AUTH FUNCTIONS */
onAuthStateChanged(auth, (user)=>{
    if(user){
        console.log("logged in")
        loggedInViewEl.style.display = "flex"
        loggedOutViewEl.style.display = "none"
        const displayName = user.displayName
        welcomeMessageEl.textContent = `Hello, ${displayName}`

        fetchClasses(user)
    }
    else{
        loggedOutViewEl.style.display = "flex"
        loggedInViewEl.style.display = "none"
    }
})
function authCreateUserWithEmailAndPassword(){
    const username = usernameFieldEl.value
    const password = passwordFieldEl.value
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
function authGoogle(){
 signInWithPopup(auth, provider)
 .then((result)=>{
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken
    const user = result.user
    console.log(user)
    console.log(token)
 }).catch((err)=>{
    console.log(err.message)
 })
 
}
/* FIRESTORE */

async function createOrJoinClass(){
    const userId = auth.currentUser.uid
    classCode = classCodeInputEl.value
    const classRef = doc(db, "classes", classCode)
    const classSnap = await getDoc(classRef)
    if(!classSnap.exists() || classSnap.data().teacher == userId){
        try{
            setDoc(classRef, {
                code: classCode,
                teacher: userId,
                members: arrayUnion(userId)
            })
        }
        catch(err){
            console.error(err)
        }
    }
    else{
        try{
            updateDoc(classRef, {
                students: arrayUnion(userId),
                members: arrayUnion(userId)
            })
        }
        catch(err){
            console.error(err)
        }

    }
}

function fetchClasses(user){
    const classRef = collection(db, "classes")
    const q = query(classRef, where("members", "array-contains", user.uid))
    onSnapshot(q, (querySnapshot) => {
        clearElement(classesDivEl)  
        querySnapshot.forEach(doc => {
            renderClasses(doc.data())
        });
    })
}

 function renderClasses(docData){
    const classDivEl = document.createElement("div")
    const className = docData.code
    const classNameEl = document.createElement("h3")
    classNameEl.textContent = className
    classDivEl.appendChild(classNameEl)
    classesDivEl.appendChild(classDivEl)
 }

 function clearElement(element){
    element.textContent = ""
 }