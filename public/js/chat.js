const socket = io()

const messageForm = document.querySelector("#message-form")
const messageFormInput = messageForm.querySelector("input")
const messageFormButton = messageForm.querySelector("button")

const locationBtn = document.querySelector("#send-location")

const msgs = document.querySelector("#msgs")



const msgTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})


const autoScroll = () => {
    const newMsg = msgs.lastElementChild

    const newMsgStyles = getComputedStyle(newMsg)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = newMsg.offsetHeight + newMsgMargin

    const visibleHeight = msgs.offsetHeight

    const containterHeight = msgs.scrollHeight

    const scrollOffset = msgs.scrollTop + visibleHeight

    if (containterHeight - newMsgHeight <= scrollOffset) {  
        msgs.scrollTop = msgs.scrollHeight
    }



}

socket.on("message", (msg) => {
    const html = Mustache.render(msgTemplate, {
        message: msg.text,
        createdAt: moment(msg.createdAt).format("H:mm"),
        username: msg.username
    })
    msgs.insertAdjacentHTML("beforeend", html)
    autoScroll()
})

socket.on("locationMessage", (msg) => {
    const html = Mustache.render(locationTemplate, {
        url: msg.url,
        createdAt: moment(msg.createdAt).format("H:mm"),
        username: msg.username
    })
    msgs.insertAdjacentHTML("beforeend", html)
    autoScroll()
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})


messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    messageFormButton.disabled = true

    const msg = e.target.elements.message.value
    socket.emit("sendMessage", msg, (error) => {
        messageFormInput.value = ""
        messageFormInput.focus()
        messageFormButton.disabled = false
        if(error){
            return console.log(error)
        }
        console.log("The msg was delivered!")
    })
})


locationBtn.addEventListener("click", (e) => {
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser!")
    }
    locationBtn.disabled = true

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            lat: position.coords.latitude,
            long: position.coords.longitude,
        }, () => {
            console.log("Location shared!")
            locationBtn.disabled = false
        })
    })
})

socket.emit("join", {username, room}, (error) =>{
    if(error){
        alert(error)
        location.href = "/"
    }
})