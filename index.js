import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import {getAnalytics} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js"
import {getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    updateProfile

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
    onSnapshot,
    getDocs,
    or,
    and,
    addDoc
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

const classFolderInputBtnEl = document.getElementById("class-folder-admin-button")
const classFolderInputEl = document.getElementById("class-folder-admin-input")
const classesDivEl = document.getElementById("classes")
const classBtnEls = document.getElementsByClassName("class-el")

let classCode = ""
let currentFolder = ""
let currentAssignment = ""

const foldersDivEl = document.getElementById("folders")
const folderBtnEls = document.getElementsByClassName("folder-el")

const classAssignmentInputBtnEl = document.getElementById("class-assignment-admin-button")
const classAssignmentInputEl = document.getElementById("class-assignment-admin-input")

const assignmentsDiv = document.getElementById("assignments")
const assignmentContentDiv = document.getElementById("assignment-content-container")

const displayNameAuthInputEl = document.getElementById("auth-display-name-input-el")
const displayNameAuthBtnEl = document.getElementById("auth-display-name-btn-el")

const pfpAuthInputEl = document.getElementById("auth-pfp-input-el")
const pfpAuthBtnEl = document.getElementById("auth-pfp-btn-el")

const settingsBtnEl  = document.getElementById("settings-btn")
const settingsPfpEl = document.getElementById("settings-pfp-el")
const settingsDiv = document.getElementById("settings-container")

signUpBtnEl.addEventListener("click", authCreateUserWithEmailAndPassword)
signInBtnEl.addEventListener("click", authSignInWithEmailAndPassword)
signInWithGoogleButton.addEventListener("click", authGoogle)

classCodeButtonEl.addEventListener("click", createOrJoinClass)
classFolderInputBtnEl.addEventListener("click", function(){
    const classFolderInputElValue = classFolderInputEl.value
    console.log(classFolderInputElValue)
    addFolder(classFolderInputElValue)
} )

classAssignmentInputBtnEl.addEventListener("click", function(){
    const classAssignmentInputElValue = classAssignmentInputEl.value
    if (classAssignmentInputElValue){
    addAssignment(classAssignmentInputElValue)
    }
    else{
        console.error("empty assignment creation input")
    }
})

settingsBtnEl.addEventListener("click", function(){
    showElement(settingsDiv)
    loadUserData()
})

displayNameAuthBtnEl.addEventListener("click", updateUserDisplayName)

pfpAuthBtnEl.addEventListener("click", updateUserPfp)
/* AUTH FUNCTIONS */
onAuthStateChanged(auth, (user)=>{
    if(user){
        console.log("logged in")
        console.log(user.getToken())
        hideElement(loggedOutViewEl)
        showElement(loggedInViewEl)
        const displayName = user.displayName
        welcomeMessageEl.textContent = `Hello, ${displayName}`
        hideElement(classFolderInputBtnEl)
        hideElement(classFolderInputEl)
        hideElement(classAssignmentInputBtnEl)
        hideElement(classAssignmentInputEl)
        hideElement(settingsDiv)
        fetchClasses(user)
    }
    else{
        hideElement(loggedInViewEl)
        showElement(loggedOutViewEl)
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

function loadUserData(){
    const user = auth.currentUser
    console.log("test")
    if (user.displayName){
        displayNameAuthInputEl.textContent = user.displayName
        
    }
    else{
        displayNameAuthInputEl.textContent = ""
    }
    if (user.photoURL){
        settingsPfpEl.src = user.photoURL
        
    }
    else{
        settingsPfpEl.src = "./assets/default-pfp.png"
    }
  
}
function updateUserDisplayName(){
    if(displayNameAuthInputEl.value){
    updateProfile(auth.currentUser, {
        displayName: displayNameAuthInputEl.value
    }).then(()=>{
        console.log("updated user display name")
    })
    .catch((err)=>{
        console.error(err)
    })
}
else{
    console.error("please enter your name")
}
}

function updateUserPfp(){
    if(pfpAuthInputEl.value){
    updateProfile(auth.currentUser, {
        photoURL: pfpAuthInputEl.value
    }).then(()=>{
        console.log("updated user pfp")
    })
    .catch((err)=>{
        console.error(err)
    })
}
else{
    console.error("please enter your name")
}
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
    const classButtonEl = document.createElement("button")
    classButtonEl.classList.add("class-el")
    const className = docData.code
    const classNameEl = document.createElement("h3")
    classNameEl.textContent = className
    classButtonEl.appendChild(classNameEl)
    classButtonEl.setAttribute("id", className)
    classesDivEl.appendChild(classButtonEl)
    detectClassClick()
 }

 function clearElement(element){
    element.textContent = ""

 }
 
 async function setCurrentClass(event){
    classCode = event.currentTarget.id 
    const classBtnEl = document.getElementById(classCode)
    console.log(`current class: ${classCode}`)
    const teacherStatus = await isTeacher()
    fetchFolders()
    if (teacherStatus){
        showElement(classFolderInputBtnEl)
        showElement(classFolderInputEl)
        showElement(classAssignmentInputBtnEl)
        showElement(classAssignmentInputEl)
    }
    else{
        console.log("user is not teacher")
        hideElement(classFolderInputBtnEl)
        hideElement(classFolderInputEl)
        hideElement(classAssignmentInputBtnEl)
        hideElement(classAssignmentInputEl)
    }
 }

 function detectClassClick(){
    for(let classBtnEl of classBtnEls){
        classBtnEl.addEventListener("click", setCurrentClass)
    }
 }

 async function isTeacher(){
    const classRef = doc(db,"classes", classCode)
    const classSnap = await getDoc(classRef)
    if(classSnap.exists()  && classSnap.data().teacher === auth.currentUser.uid){
        return true
    }
    else{
        return false
    }
 }

function addFolder(folderName){
    const classRef = doc(db, "classes", classCode)
    updateDoc(classRef, {
        folders: arrayUnion(folderName)
    })
    }



 async function fetchFolders(){
    const classRef = doc(db, "classes", classCode)
    const classSnap = await getDoc(classRef)
    const classData = classSnap.data()
    const classFolders = classData.folders
    renderFolders(classFolders)
 }
 function renderFolders(foldersArray){
    clearElement(foldersDivEl)
    foldersArray.forEach( folderName =>{
        const folderButtonEl = document.createElement("button")
        const folderNameEl = document.createElement("p")
        folderButtonEl.classList.add("folder-el")
        folderNameEl.textContent = folderName
        folderButtonEl.appendChild(folderNameEl)
        foldersDivEl.appendChild(folderButtonEl)
    })
    setCurrentFolder()
 }

function setCurrentFolder(){
    for(let folderBtn of folderBtnEls){
        folderBtn.addEventListener("click", function(){
            currentFolder = folderBtn.textContent
            fetchAssignments()
        })
    }
}

async function teacherUid(){
    try{
    const classRef = doc(db,"classes", classCode)
    const classSnap = await getDoc(classRef)
    const uid = classSnap.data().teacher 
    return uid
    }
    catch(err){
        console.error(err)
        throw err
    }
 }


 async function addAssignment(assignmentName){
    const user = auth.currentUser
  const classRef = doc(db, "classes", classCode)
  updateDoc(classRef, {
    assignments: arrayUnion(assignmentName)
  })
  const assignmentRef = collection(db, "assignments")
  const teacherId =  await teacherUid()
  console.log(user.displayName)
    addDoc(assignmentRef, {
        assignment: currentAssignment,
        body: assignmentName,
        class: classCode,
        folder: currentFolder,
        isClassDiscussion: false,
        recipient:teacherId,
        uid: user.uid,
        userDisplayName: user.displayName
    }
    )
}



async function fetchAssignments(){
    const classRef = doc(db, "classes", classCode)
    const classSnap = await getDoc(classRef)
    const classData = classSnap.data()
    const classAssignments = classData.assignments
    renderAssignments(classAssignments)
}

function renderAssignments(assignmentsArray){

    assignmentsArray.forEach((assignmentName) => {
        const assignmentButtonEl = document.createElement("button")
        const assignmentNameEl = document.createElement("p")
        assignmentButtonEl.classList.add("assignment-el")
        assignmentNameEl.textContent = assignmentName
        assignmentButtonEl.appendChild(assignmentNameEl)
        assignmentsDiv.appendChild(assignmentButtonEl)
        setCurrentAssignment(assignmentButtonEl)
    })
}

function setCurrentAssignment(assignmentButton){

        assignmentButton.addEventListener("click", function(){
            currentAssignment = assignmentButton.textContent
            fetchAssignmentContent()
        })
    }


async function fetchAssignmentContent(){
    
    const assignmentRef = collection(db, "assignments")
    const user = auth.currentUser
        const q = query(assignmentRef, and(or(where("recipient","==",user.uid),where("uid","==", user.uid)), where("folder","==", currentFolder), where("class","==", classCode), where("assignment","==", currentAssignment)))
        onSnapshot(q, (querySnapshot) => {
            clearElement(assignmentContentDiv)
            querySnapshot.forEach((message) => {
                renderAssignmentContent(message.data())
            })
            
        })


}
function renderAssignmentContent(messageData){
    const messageDiv = document.createElement("div")
    const messageContentEl = document.createElement("p")
    const messageSentByEl = document.createElement("p")

        messageDiv.classList.add("assignment-content-div")

        messageContentEl.classList.add("assignment-content-p")
        messageContentEl.textContent = messageData.body

        messageSentByEl.textContent = messageData.userDisplayName

        messageDiv.appendChild(messageContentEl)
        messageDiv.appendChild(messageSentByEl)
        assignmentContentDiv.appendChild(messageDiv)
}












 /* CSS FUNCTIONS*/
 function hideElement(element){
    element.style.display = "none"
 }
 function showElement(element){
    element.style.display = "flex"
 }

