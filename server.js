const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId)
    console.log(`User joined session: ${sessionId}`)
  })

  socket.on("code-change", ({ code, sessionId }) => {
    socket.to(sessionId).emit("code-update", code)
  })

  socket.on("send-message", (data) => {
    socket.to(data.sessionId).emit("receive-message", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀")
})

// CREATE SESSION API
app.post("/create-session", (req, res) => {
  const sessionId = Math.random().toString(36).substring(2, 8)
  res.json({ sessionId })
})

// START SERVER
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})