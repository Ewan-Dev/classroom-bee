
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
const provider = new GoogleAuthProvider()
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

const structureTypeSpanEl = document.getElementById("type-header-label")

const classInputLabelEl  = document.getElementById("class-input-label")

const allClassSidebarBtns = document.getElementsByClassName("class-sidebar-btn")

const messagesDiv = document.getElementById("messages")

const classAdminDiv = document.getElementById("class-admin-container")
const classAdminDialog = document.getElementById("class-admin")

const classCodeAdminCloseBtn = document.getElementById("close-class-control-button")

const classAdminBtn = document.getElementById("class-admin-button")
const classInputHeaderIcon = document.getElementById("class-input-header-icon")
const createClassAdminBtns = document.getElementsByClassName("control-button")
const typeSpanStructureIcon =document.getElementById("type-span-structure-icon")
const allUsersBtn = document.getElementById("students")
let currentRecipient = null
classCodeButtonEl.addEventListener("click", createOrJoinClass)
signUpBtnEl.addEventListener("click", authCreateUserWithEmailAndPassword)
signInBtnEl.addEventListener("click", authSignInWithEmailAndPassword)
signInWithGoogleButton.addEventListener("click", authGoogle)
classAdminBtn.addEventListener("click", function(){
    classAdminDialog.showModal()
})

classFolderInputBtnEl.addEventListener("click", function(){
    const classFolderInputElValue = classFolderInputEl.value
    console.log(classFolderInputElValue)
    addFolder(classFolderInputElValue)
} )

classCodeAdminCloseBtn.addEventListener("click", function(){
    classAdminDialog.close()
})

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
pfpAuthBtnEl.addEventListener("click", updateUserPfpUrl)

for (let createClassAdminBtn of createClassAdminBtns){
    createClassAdminBtn.addEventListener("click", function(){
        classAdminDialog.close()
    })
}


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
        addUserToDb(user)
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
            uid: user.uid,
            photoURL: user.photoURL
        },{merge:true})
    
}
function loadUserData(){
    const user = auth.currentUser
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



function updateUserPfpUrl(){
    if(pfpAuthInputEl.value){
        console.log(pfpAuthInputEl.value)
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
    console.error("please enter your pfp url")
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
    const existingMembers = classSnap.exists() ? (classSnap.data().members || []) : []
    const existingStudents = classSnap.exists() ? (classSnap.data().students || []) : []
    classAdminDialog.close()
    if(!classSnap.exists()){
        try{
            setDoc(usersRef, {
                displayName: auth.currentUser.displayName,
                uid: userId,
                
            },{merge:true})
            setDoc(classRef, {
                code: classCode,
                teacher: userId,
                members: [...existingMembers, auth.currentUser.uid]
            }, {merge:true})
            
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
                
            }, {merge:true})
            setDoc(classRef, {
                students: [...existingStudents, auth.currentUser.uid],
                members: [...existingMembers, auth.currentUser.uid]
                
            }, {merge:true})
            
        }
        catch(err){
            console.error(err)
        }

    }
}
function fetchClasses(user){
    const classesRef = collection(db, "classes")
    const q = query(classesRef, where("members", "array-contains", user.uid))
    onSnapshot(q, (querySnapshot) =>{
        clearElement(navSidebarEl)
        if(querySnapshot){
            renderClasses(querySnapshot)
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
            btn.classList.remove("selected-item")
        }
        button.classList.add("selected-item")
        })
    }
}


 function renderClasses(querySnapshot){
    const materialIconType = document.createElement("span")
    const materialIconInput = document.createElement("span")

    classInputLabelEl.textContent = "join/create class"
    structureTypeSpanEl.textContent = "classes"    
    clearElement(classInputHeaderIcon)
    clearElement(typeSpanStructureIcon)
    materialIconInput.textContent = "school"
    materialIconType.textContent = "school"
    materialIconInput.classList.add("material-symbols-rounded")
    materialIconType.classList.add("material-symbols-rounded")
    typeSpanStructureIcon.appendChild(materialIconType)
    classInputHeaderIcon.appendChild(materialIconInput)
    clearElement(navSidebarEl)

    querySnapshot.forEach((doc)=>{
        const classDocData = doc.data()
        const className = classDocData.code
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
    element.innerHTML = ""
    console.log("element clared")

 }
 
 async function setCurrentClass(event){

    classCode = event.currentTarget.id 
    console.log(`current class: ${classCode}`)
    const teacherStatus = await isTeacher(classCode)
    classInputLabelEl.textContent = "create a folder"
    structureTypeSpanEl.textContent = "folders"


    const materialIconInput = document.createElement("span")
    clearElement(classInputHeaderIcon)
    materialIconInput.textContent = "folder_open"
    materialIconInput.classList.add("material-symbols-rounded")
    classInputHeaderIcon.appendChild(materialIconInput)

    const materialIconType = document.createElement("span")
    clearElement(typeSpanStructureIcon)
    materialIconType.textContent = "folder_open"
    materialIconType.classList.add("material-symbols-rounded")
    typeSpanStructureIcon.appendChild(materialIconType)


    fetchFolders()
 
    hideElement(classCodeInputEl)
    hideElement(classCodeButtonEl)
    showElement(classFolderInputBtnEl)
    showElement(classFolderInputEl)

    if(teacherStatus){
        showElement(classAdminBtn)
    }
    else{
        hideElement(classAdminBtn)
    }
    }
 

 function detectClassClick(){
    for(let classBtnEl of classBtnEls){
        classBtnEl.addEventListener("click", setCurrentClass)
    }
 }

 async function isTeacher(classCode){
    const classRef = doc(db,"classes", classCode)
    const classSnap = await getDoc(classRef)
    if(classSnap.exists()  && classSnap.data().teacher == auth.currentUser.uid){
        return true
    }
    else{
        return
    }
 }

async function addFolder(folderName){
    const folderRef = collection(db, "folders")
    const userId = auth.currentUser.uid
    addDoc(folderRef, {
        class: classCode,
        folderName: folderName,
        teacher: userId,
        members: arrayUnion(userId)

    })

    loadUserData()
}

 async function fetchFolders(){
    const foldersRef = collection(db, "folders")
    const q = query(foldersRef, where("class", "==", classCode))
    onSnapshot(q, (querySnapshot) => {
        clearElement(navSidebarEl)
        querySnapshot.forEach((doc)=>{
            const docData = doc.data()
            const classFolder = docData.folderName
            renderFolder(classFolder)
        })
        
    })
    
 }
 function renderFolder(folderName){
    const folderButtonEl = document.createElement("button")
    const folderNameEl = document.createElement("p")
    folderButtonEl.classList.add("folder-el")
    folderNameEl.textContent = folderName
    folderButtonEl.classList.add("class-sidebar-btn")
    folderButtonEl.appendChild(folderNameEl)
    navSidebarEl.appendChild(folderButtonEl)

    setCurrentFolder()
    itemClickedStyling()
 }

function setCurrentFolder(){
    for(let folderBtn of folderBtnEls){
        folderBtn.addEventListener("click", function(){
            currentFolder = folderBtn.textContent
 
            fetchAssignments()
            showAssignmentControls()
        })
    }
}


 async function addAssignment(assignmentName){
    const user = auth.currentUser
  const folderRef = collection(db, "folders")
  try{
  const q = query(folderRef, where("class", "==", classCode), where("folderName", "==", currentFolder))
  onSnapshot(q, (querySnapshot)=>{
    querySnapshot.forEach((folderDoc)=>{
        const folderDocRef = doc(db, "folders", folderDoc.id)
        updateDoc(folderDocRef, {
        assignments: arrayUnion(assignmentName)
         })
    })
  })
}
catch (error) {
    console.error("Error adding assignment:", error)
}
}

async function addPost(content, recipientUid){
    const user = auth.currentUser
    const assignmentRef = collection(db, "posts")
    const teacherStatus =  await isTeacher(classCode)
    console.log("ADD POST")
    if(teacherStatus){
      addDoc(assignmentRef, {
          assignment: currentAssignment,
          body: content,
          class: classCode,
          folder: currentFolder,
          isTeacher: true,
          uid: user.uid,
          recipient: recipientUid,
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
            teacher: false,
            uid: user.uid,
            userDisplayName: user.displayName,
            createdAt: serverTimestamp()
        }
        ) 
    }
}


async function fetchAssignments(){
        structureTypeSpanEl.textContent = "assignments"
    classInputLabelEl.textContent = "create assignment"

    const materialIconInput = document.createElement("span")
    clearElement(classInputHeaderIcon)
    materialIconInput.textContent = "assignment"
    materialIconInput.classList.add("material-symbols-rounded")
    classInputHeaderIcon.appendChild(materialIconInput)

    const materialIconType = document.createElement("span")
    clearElement(typeSpanStructureIcon)
    materialIconType.textContent = "assignment"
    materialIconType.classList.add("material-symbols-rounded")
    typeSpanStructureIcon.appendChild(materialIconType)


    const foldersRef = collection(db, "folders")
    const q = query(foldersRef, where("class", "==", classCode),where("folderName", "==", currentFolder) )
    onSnapshot(q, (querySnapshot) => {
        clearElement(navSidebarEl)
        querySnapshot.forEach((assignment) =>{
            const folderData = assignment.data()
            const folderAssignments = folderData.assignments
            renderPosts(folderAssignments)
        })
        itemClickedStyling()
    })
    
}

function renderPosts(assignmentsArray){
    if(assignmentsArray){
    clearElement(navSidebarEl)
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
else{
    return
}
}

function setCurrentAssignment(assignmentButton){
    
        assignmentButton.addEventListener("click", function(){
            currentAssignment = assignmentButton.textContent
            fetchAssignmentContent()
            showPostControls()
        })
    }


async function fetchAssignmentContent(){
    classInputLabelEl.textContent = "create a post"
    const user = auth.currentUser
    const assignmentRef = collection(db, "posts")
    const classRef = doc(db, "classes", classCode)
    const classSnap = await getDoc(classRef)
    const classStudents = classSnap.data().students
    fetchUsers(classStudents)
    const teacherStatus = await isTeacher(classCode)
    const userButtons = document.getElementsByClassName("user-el")
    let unsubscribeMessages = () => {}
    for (let userButton of userButtons ){
        console.log(1)
        userButton.addEventListener("click", function(){
            clearElement(messagesDiv)
            currentRecipient = userButton.id
            console.log(currentRecipient)
            unsubscribeMessages()
            
            if(!teacherStatus){
                const q = query(assignmentRef, where("folder","==", currentFolder), where("class","==", classCode), where("assignment","==", currentAssignment))
                unsubscribeMessages = onSnapshot(q, (querySnapshot) => {  
                    console.log("no teacher load")
                    querySnapshot.forEach((message) => {
                        clearElement(messagesDiv)
                        renderAssignmentContent(message.data())
                })
                        
                })}
                else{
                    const q = query(assignmentRef, and(or(where("recipient","==",user.uid), where("recipient","==",currentRecipient)), where("folder","==", currentFolder), where("class","==", classCode), where("assignment","==", currentAssignment)))
                    unsubscribeMessages = onSnapshot(q, (querySnapshot) => { 
                    console.log("pp")
                    clearElement(messagesDiv)
                    querySnapshot.forEach((message) => {
                        console.log("ss")
                        renderAssignmentContent(message.data())
                    
                })      
                console.log("rr")     
                })
                }
            
             
        })}
        classPostInputBtnEl.addEventListener("click", function(){
            const classPostInputElValue = classPostInputEl.value
            console.log(classPostInputElValue)
            addPost(classPostInputElValue, currentRecipient) 

})

}


function fetchUsers(students){
    const materialIconType = document.createElement("span")
    clearElement(typeSpanStructureIcon)
    clearElement(navSidebarEl)
    materialIconType.textContent = "person"
    structureTypeSpanEl.textContent = "users"
    materialIconType.classList.add("material-symbols-rounded")
    materialIconType.classList.add("button-icon-el")  
    typeSpanStructureIcon.appendChild(materialIconType)

    addAllUsersBtn()
    if(students){
    students.forEach((user)=>{
        console.log(user)
        fetchUser(user)
    })
    }
}
async function renderAssignmentContent(messageData){
    const messageDiv = document.createElement("div")
    const messageContentEl = document.createElement("p")
    const messageSentByEl = document.createElement("p")
    const messageCreatedAt = document.createElement("p")
    const messageInfoDiv = document.createElement("div")
    const userInfoDiv = document.createElement("div")
    const messageBox = document.createElement("div")
    const messageContainer = document.createElement("div")
    const breakEl = document.createElement("p")
    const userPfpEl = document.createElement("img")

    const formattedDate = dateFormatting(messageData.createdAt)

        messageDiv.classList.add("assignment-content-div")

        messageContentEl.classList.add("assignment-content-p")
        messageContentEl.textContent = messageData.body
        const userData = await getUserData(messageData.uid)
        const displayName = userData.displayName1
        const pfpUrl = userData.photoURL1
        messageSentByEl.textContent = displayName
        messageCreatedAt.textContent = formattedDate
        
        
        breakEl.textContent = "•"

        userPfpEl.src = pfpUrl

        messageInfoDiv.classList.add("message-info")
        messageContainer.classList.add("message-container")
        userPfpEl.classList.add("user-pfp-message-info")
        messageSentByEl.classList.add("message-info")
        messageCreatedAt.classList.add("message-info")

        messageBox.classList.add("message-bubble")

        userInfoDiv.classList.add("user-info-post-div")
        
        breakEl.classList.add("message-info")
        messagesDiv.classList.add("messages-div")
        
        userInfoDiv.appendChild(messageSentByEl)
        userInfoDiv.appendChild(breakEl)
        userInfoDiv.appendChild(messageCreatedAt)
        

        
        messageBox.appendChild(messageContentEl)
        messageContainer.appendChild(messageBox)
        messageContainer.appendChild(userInfoDiv)
        messageDiv.appendChild(userPfpEl)
        messageDiv.appendChild(messageContainer)
        messagesDiv.appendChild(messageDiv)
        
}

async function showAssignmentControls(){
    hideElement(classFolderInputEl)
    hideElement(classFolderInputBtnEl)
    showElement(classAssignmentInputBtnEl)
    showElement(classAssignmentInputEl)
}
function showPostControls(){
    showElement(classPostInputBtnEl)
    showElement(classPostInputEl)
    hideElement(classAssignmentInputBtnEl)
    hideElement(classAssignmentInputEl)
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

async function getUserData(uid){
    const docRef = doc(db, "users", uid)
    const userDoc = await getDoc(docRef)
    const displayName = userDoc.data().displayName
    const photoURL = userDoc.data().photoURL
    const userUid = userDoc.data().uid
    console.log(displayName)
    if(photoURL && displayName)
    {
    return {displayName1: displayName,
        photoURL1: photoURL,
        userUid:  userUid
    }
}
    else{
        return
    }
            
}

async function fetchUser(user){
        const userData = await getUserData(user)
        if(userData){
            renderUser(userData)
            console.log(userData.photoURL1)
        }
        

}

function renderUser(userData){
    const userButtonEl = document.createElement("button")
    const userNameEl = document.createElement("p")
    const photoURLEl = document.createElement("img")

    userButtonEl.classList.add("user-el")

    
    userNameEl.textContent = userData.displayName1
    photoURLEl.src = userData.photoURL1

    userButtonEl.classList.add("class-sidebar-btn")
    photoURLEl.classList.add("user-img-btn")

    userButtonEl.id = userData.userUid

    userButtonEl.appendChild(photoURLEl)
    userButtonEl.appendChild(userNameEl)
    navSidebarEl.appendChild(userButtonEl)
    }

function addAllUsersBtn(){
    const allUsersButtonEl = document.createElement("button")
    const buttonText = document.createElement("p")
    const materialIconType = document.createElement("span")
    materialIconType.textContent = "group"
    buttonText.textContent = "all students"
    materialIconType.id = "all-users-button"
    materialIconType.classList.add("material-symbols-rounded")
    allUsersButtonEl.appendChild(materialIconType)
    allUsersButtonEl.appendChild(buttonText)
    allUsersButtonEl.classList.add("user-el")
    navSidebarEl.appendChild(allUsersButtonEl)
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
