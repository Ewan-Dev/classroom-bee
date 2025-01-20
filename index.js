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
    addDoc,
    serverTimestamp
 } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyBYQovi1icrOTFbMnFUg4CaNrcVdR5iAbA",
    authDomain: "classroom-bee.firebaseapp.com",
    projectId: "classroom-bee",
    storageBucket: "classroom-bee.firebasestorage.app",
    messagingSenderId: "995259288468",
    appId: "1:995259288468:web:4d62af03b01830b7f09d81",
    measurementId: "G-DW21YQ9SWH"
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
const navSidebarEl = document.getElementById("nav-sidebar")
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

const classPostInputEl = document.getElementById("class-post-admin-input")
const classPostInputBtnEl = document.getElementById("class-post-admin-button")

const displayNameAuthInputEl = document.getElementById("auth-display-name-input-el")
const displayNameAuthBtnEl = document.getElementById("auth-display-name-btn-el")

const pfpAuthInputEl = document.getElementById("auth-pfp-input-el")
const pfpAuthBtnEl = document.getElementById("auth-pfp-btn-el")

const settingsBtnEl  = document.getElementById("settings-btn")
const settingsPfpEl = document.getElementById("settings-pfp-el")
const settingsDiv = document.getElementById("settings-container")

const structureTypeSpanEl = document.getElementById("type-header")

const classInputLabelEl  = document.getElementById("class-input-label")

const allClassSidebarBtns = document.getElementsByClassName("class-sidebar-btn")

const messagesDiv = document.getElementById("messages")
    
    

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
classPostInputBtnEl.addEventListener("click", function(){
    const classPostInputElValue = classPostInputEl.value
    addPost(classPostInputElValue)
    
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
        hideElement(loggedOutViewEl)
        showElementFlex(loggedInViewEl)
        const displayName = user.displayName
        welcomeMessageEl.textContent = `Hello, ${displayName}`
        hideElement(classFolderInputBtnEl)
        hideElement(classFolderInputEl)
        hideElement(classAssignmentInputBtnEl)
        hideElement(classAssignmentInputEl)
        hideElement(classPostInputBtnEl)
        hideElement(classPostInputEl)
        hideElement(settingsDiv)
        addUserToDb(user);
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
async function addUserToDb(user){
    const userRef = doc(db, "users", user.uid)
        await setDoc(userRef, {
            displayName: user.displayName,
            uid: user.uid
        },{merge:true})
    
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
    const usersRef = doc(db, "users", userId)
    const classSnap = await getDoc(classRef)
    const userSnap = await getDoc(usersRef)
    const existingClasses = userSnap.exists() ? (userSnap.data().classes || []) : []
    console.log(existingClasses)
    if(!classSnap.exists()){
        try{
            setDoc(usersRef, {
                displayName: auth.currentUser.displayName,
                uid: userId,
                classes: [...existingClasses, classCode]
                
            },{merge:true})
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
            
            setDoc(usersRef, {
                displayName: auth.currentUser.displayName,
                uid: userId,
                classes: [...existingClasses, classCode]
                
            }, {merge:true})
            setDoc(classRef, {
                students: arrayUnion(userId),
                members: arrayUnion(userId)
                
            },{merge:true})
            
        }
        catch(err){
            console.error(err)
        }

    }
}
function fetchClasses(user){
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("uid", "==", user.uid))
    onSnapshot(q, (querySnapshot) =>{
        clearElement(navSidebarEl)
        if(querySnapshot){
            querySnapshot.forEach((doc)=>{
                console.log(doc.data())
                renderClasses(doc.data())
            })
            itemClickedStyling()
            }
        else{
            console.log("no classes")
        }
        
    })
}
function itemClickedStyling(){
    for (let button of allClassSidebarBtns){
        button.addEventListener("click", () => {
        for(let btn of allClassSidebarBtns){
            btn.classList.remove("selected-item");
        }
        button.classList.add("selected-item")
        })
    }
}
//function fetchClasses(user){
    //const classRef = collection(db, "classes")
    //const q = query(classRef, where("members", "array-contains", user.uid))
    //console.log("hi")
    //onSnapshot(q, (querySnapshot) => {
       // console.log("x")
        //clearElement(classesDivEl)  
        //querySnapshot.forEach(doc => {
            //renderClasses(doc.data())
        //});
    //})
//}

 function renderClasses(docData){
    const userClasses = docData.classes
    structureTypeSpanEl.textContent = " 📚 classes"
    classInputLabelEl.textContent = "🎓 join/create class"
    clearElement(navSidebarEl)
    
    userClasses.forEach((className)=>{

    const classButtonEl = document.createElement("button")
    classButtonEl.classList.add("class-el")
    classButtonEl.classList.add("class-sidebar-btn")
    const classNameEl = document.createElement("p")
    classNameEl.textContent = className
    classButtonEl.appendChild(classNameEl)
    classButtonEl.setAttribute("id", className)
    navSidebarEl.appendChild(classButtonEl)
    detectClassClick()
})
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
        hideElement(classCodeInputEl)
        hideElement(classCodeButtonEl)
        showElement(classFolderInputBtnEl)
        showElement(classFolderInputEl)
    }
    else{
        console.log("user is not teacher")
        hideElement(classCodeInputEl)
        hideElement(classCodeButtonEl)
        hideElement(classFolderInputBtnEl)
        hideElement(classFolderInputEl)
        hideElement(classAssignmentInputBtnEl)
        hideElement(classAssignmentInputEl)
        hideElement(classPostInputBtnEl)
        hideElement(classPostInputEl)
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

async function addFolder(folderName){
    const classRef = doc(db, "classes", classCode)
    const folderRef = collection(db, "folders")
    const userId = auth.currentUser.uid
    updateDoc(classRef, {
        folders: arrayUnion(folderName)
    })
    addDoc(folderRef, {
        class: classCode,
        folderName: folderName,
        teacher: userId,
        members: arrayUnion(userId)

    })

    loadUserData()
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
    structureTypeSpanEl.textContent = "📂 folders"
    classInputLabelEl.textContent = "🎓 create a folder"
    clearElement(navSidebarEl)
    hideElement(classCodeInputEl)
    hideElement(classCodeButtonEl)
    
    
    foldersArray.forEach( folderName =>{
        const folderButtonEl = document.createElement("button")
        const folderNameEl = document.createElement("p")
        folderButtonEl.classList.add("folder-el")
        folderNameEl.textContent = folderName
        folderButtonEl.classList.add("class-sidebar-btn")
        folderButtonEl.appendChild(folderNameEl)
        navSidebarEl.appendChild(folderButtonEl)
    })
    setCurrentFolder()
    itemClickedStyling()
 }

function setCurrentFolder(){
    for(let folderBtn of folderBtnEls){
        folderBtn.addEventListener("click", function(){
            currentFolder = folderBtn.textContent
            showAssignmentControls()
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
  const folderRef = collection(db, "folders")
  console.log(345678)
  const q = query(folderRef, where("class", "==", classCode), where("folderName", "==", currentFolder))
  console.log(q)
  onSnapshot(q, (querySnapshot)=>{
    querySnapshot.forEach((folderDoc)=>{
        console.log(folderDoc.id)
        const folderDocRef = doc(db, "folders", folderDoc.id)
        updateDoc(folderDocRef, {
        assignments: arrayUnion(assignmentName)
         })
    })
    itemClickedStyling()
  })
}

async function addPost(content){
    const user = auth.currentUser
    const assignmentRef = collection(db, "posts")
    const teacherId =  await teacherUid()
    console.log(user.displayName)
    if(teacherId){
      addDoc(assignmentRef, {
          assignment: currentAssignment,
          body: content,
          class: classCode,
          folder: currentFolder,
          isClassDiscussion: false,
          teacher: true,
          uid: user.uid,
          userDisplayName: user.displayName,
          createdAt: serverTimestamp()
      }
      )
    }
    else{
        addDoc(assignmentRef, {
            assignment: currentAssignment,
            body: content,
            class: classCode,
            folder: currentFolder,
            isClassDiscussion: false,
            teacher: false,
            uid: user.uid,
            userDisplayName: user.displayName,
            createdAt: serverTimestamp()
        }
        ) 
    }
}


async function fetchAssignments(){
    const foldersRef = collection(db, "folders")
    const q = query(foldersRef, where("class", "==", classCode),where("folderName", "==", currentFolder) )
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((assignment) =>{
            console.log(assignment)
            const folderData = assignment.data()
            const folderAssignments = folderData.assignments
            console.log(folderAssignments)
            renderPosts(folderAssignments)
        })
        itemClickedStyling()
    })
    
}

function renderPosts(assignmentsArray){
        structureTypeSpanEl.textContent = "📄 assignments"
    classInputLabelEl.textContent = "🎓 create assignment"
    clearElement(navSidebarEl)
    hideElement(classFolderInputEl)
    hideElement(classFolderInputBtnEl)
    showElement(classAssignmentInputBtnEl)
    showElement(classAssignmentInputEl)
    
    assignmentsArray.forEach((assignmentName) => {
        const assignmentButtonEl = document.createElement("button")
        const assignmentNameEl = document.createElement("p")
        assignmentButtonEl.classList.add("assignment-el")
        assignmentNameEl.textContent = assignmentName
        assignmentButtonEl.classList.add("class-sidebar-btn")
        assignmentButtonEl.appendChild(assignmentNameEl)
        navSidebarEl.appendChild(assignmentButtonEl)
        setCurrentAssignment(assignmentButtonEl)
    })
}

function setCurrentAssignment(assignmentButton){
    
        assignmentButton.addEventListener("click", function(){
            clearElement(messagesDiv)
            currentAssignment = assignmentButton.textContent
            fetchAssignmentContent()
            showPostControls()
        })
    }


async function fetchAssignmentContent(){

    hideElement(classAssignmentInputEl)
    hideElement(classAssignmentInputBtnEl)

    const assignmentRef = collection(db, "posts")
    const user = auth.currentUser
        const q = query(assignmentRef, and(or(where("teacher","==",true),where("uid","==", user.uid)), where("folder","==", currentFolder), where("class","==", classCode), where("assignment","==", currentAssignment)))
        clearElement(messagesDiv)
        onSnapshot(q, (querySnapshot) => {
            clearElement(messagesDiv)
            console.log("1")
            querySnapshot.forEach((message) => {
                console.log(message.data())
                renderAssignmentContent(message.data())
            })
            
        })


}
function renderAssignmentContent(messageData){
    const messageDiv = document.createElement("div")
    const messageContentEl = document.createElement("p")
    const messageSentByEl = document.createElement("p")
    const messageCreatedAt = document.createElement("p")
    const messageInfoDiv = document.createElement("div")
    const userInfoDiv = document.createElement("div")
    const messageBox = document.createElement("div")
    const formattedDate = dateFormatting(messageData.createdAt)
    
        messageDiv.classList.add("assignment-content-div")

        messageContentEl.classList.add("assignment-content-p")
        messageContentEl.textContent = messageData.body

        messageSentByEl.textContent = messageData.userDisplayName
        messageCreatedAt.textContent = formattedDate

        messageInfoDiv.classList.add("message-info")

        messageSentByEl.classList.add("message-info")
        messageCreatedAt.classList.add("message-info")

        messageBox.classList.add("message-bubble")

        messageInfoDiv.appendChild(messageCreatedAt)
        userInfoDiv.appendChild(messageSentByEl)

        messageBox.appendChild(messageContentEl)
        messageBox.appendChild(messageInfoDiv)
        
        messageDiv.appendChild(messageBox)

        messageDiv.appendChild(userInfoDiv)

        messagesDiv.appendChild(messageDiv)
        
}

async function showAssignmentControls(){
    const teacherStatus = await isTeacher()
    if(isTeacher){
    hideElement(classCodeInputEl)
    hideElement(classCodeButtonEl)
    hideElement(classFolderInputEl)
    hideElement(classFolderButtonEl)
    showElement(classAssignmentInputBtnEl)
    showElement(classAssignmentInputEl)
    }
    else{
        hideElement(classCodeInputEl)
        hideElement(classCodeButtonEl)
        hideElement(classFolderInputBtnEl)
        hideElement(classFolderInputEl)
        hideElement(classAssignmentInputBtnEl)
        hideElement(classAssignmentInputEl)
        hideElement(classPostInputBtnEl)
        hideElement(classPostInputEl)
    }
}
async function showPostControls(){
    const teacherStatus = await isTeacher()
    if(isTeacher){
    hideElement(classAssignmentInputBtnEl)
    hideElement(classAssignmentInputEl) 
    showElement(classPostInputBtnEl)
    showElement(classPostInputEl)
    }
    else{
        hideElement(classCodeInputEl)
        hideElement(classCodeButtonEl)
        hideElement(classFolderInputBtnEl)
        hideElement(classFolderInputEl)
        hideElement(classAssignmentInputBtnEl)
        hideElement(classAssignmentInputEl)
        hideElement(classPostInputBtnEl)
        hideElement(classPostInputEl)
    }
}

function dateFormatting(firebaseDate){
    if(!firebaseConfig){
        return "Date processing"
    }
    const todaysDate = new Date()

    const date = firebaseDate.toDate()
    const day = date.getDate()
    const year = date.getFullYear()
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct",,"Nov","Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()

    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    if(todaysDate.getFullYear() != year){
        return `${day} ${month} ${year}`
    }
    else{
        return `${day} ${month} ${hours}:${minutes}`
    }

}









 /* CSS FUNCTIONS*/
 function hideElement(element){
    element.style.display = "none"
 }
 function showElement(element){
    element.style.display = "block"
 }
 function showElementFlex(element){
    element.style.display = "flex"
 }

