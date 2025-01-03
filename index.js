import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import {getAnalytics} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js"
import {getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js"
import { getFirestore,
    collection,
    addDoc,
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

const commentInputEl = document.getElementById("comment-input")
const commentPostBtnEl = document.getElementById("comment-post-btn")
const folderEls = document.getElementsByClassName("folder")
const loadDocsButton = document.getElementById("load-items")
let selectedFolderElId = undefined
let classCode = 1234
let isClassDiscussion = false
signUpBtnEl.addEventListener("click", authCreateUserWithEmailAndPassword)
signInBtnEl.addEventListener("click", authSignInWithEmailAndPassword)
signInWithGoogleButton.addEventListener("click", authGoogle)

commentPostBtnEl.addEventListener("click", uploadCommentButtonClicked)
for (let folderEl of folderEls){
    folderEl.addEventListener("click", getFolderElId)
}

/* AUTH FUNCTIONS */
onAuthStateChanged(auth, (user)=>{
    if(user){
        loggedInViewEl.style.display = "flex"
        loggedOutViewEl.style.display = "none"
        const uid = user.uid
        const displayName = user.displayName
        welcomeMessageEl.textContent = `Hello, ${displayName}`
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
// Finds the folder id
function getFolderElId(event){
    selectedFolderElId = event.currentTarget.id
    console.log(selectedFolderElId)

}

function uploadCommentButtonClicked(){
    const user = auth.currentUser
    const teacher = "example"
    const folderElId = selectedFolderElId
    if (folderElId){
    uploadAssignment(user, folderElId, teacher, classCode, commentInputEl.value, isClassDiscussion)
    } else{
        console.log("please select folder")
    }
}
//upload to firestore db
async function uploadAssignment(user, folder, teacher, classCode, commentInputElValue, isClassDiscussion){
    try{
        const docRef = await addDoc(collection(db, "assignments"),{
            body:commentInputElValue,
            folder:folder,
            uid: user.uid,
            recipient: teacher, //know who to send
            class: classCode,
            isClassDiscussion:isClassDiscussion
        })
        console.log(`Document written with ID: ${docRef.id}`)
        fetchDocumentsInRealTime(user)
        
    }
    catch(err){
        console.log(err)
    }
}
function fetchDocumentsInRealTime(user){
    const docRef = collection(db, "assignments")
    if (!isClassDiscussion){
    const q = query(docRef, where("uid","==", user.uid), where("folder","==",selectedFolderElId), where("class","==",classCode)  )
    onSnapshot(q, (querySnapshot)=>{
        querySnapshot.forEach((doc)=>{
            console.log(doc.data().body)
        })
    })
}else{
    const q = query(docRef, where("isClassDiscussion", "==", true) , where("folder","==",selectedFolderElId), where("class","==",classCode)  )
    onSnapshot(q, (querySnapshot)=>{
        querySnapshot.forEach((doc)=>{
            console.log(doc)
        })
    })
}

}