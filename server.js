const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ✅ YJS CRDT 
const WebSocket = require("ws")
const { setupWSConnection } = require("y-websocket")

const wss = new WebSocket.Server({ noServer: true })

server.on("upgrade", (request, socket, head) => {
  if (request.url.startsWith("/yjs")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      setupWSConnection(ws, request)
    })
  }
})
const io = new Server(server,{
  cors:{
    origin:"*"
  }
});
const users = []
const sessions = []
app.get("/",(req,res)=>{
res.send("Backend working")
})

io.on("connection", (socket) => {

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId)
  })

  socket.on("code-change", ({ code, sessionId }) => {
    socket.to(sessionId).emit("code-update", code)
  })


socket.on("send-message", ({ message, sessionId }) => {
  socket.to(sessionId).emit("receive-message", message)
})

socket.on("disconnect",()=>{
console.log("User disconnected:")
})

// VIDEO CALL SIGNALING
socket.on("call-user", (data) => {
  socket.broadcast.emit("call-made", {
    signal: data.signal,
    from: socket.id
  })
})

socket.on("answer-call", (data) => {
  socket.broadcast.emit("call-answered", data.signal)
})
})


app.post("/signup", (req, res) => {
  const { email, password, role } = req.body

  const user = { id: Date.now(), email, password, role }
  users.push(user)

  res.json({ message: "User created", user })
})

app.post("/login", (req, res) => {
  const { email, password } = req.body

  const user = users.find(u => u.email === email && u.password === password)

  if (!user) return res.status(401).json({ message: "Invalid" })

  res.json({ message: "Login success", user })
})
app.post("/create-session", (req, res) => {
  const sessionId = Math.random().toString(36).substring(7)

  sessions.push({ sessionId })

  res.json({ sessionId })
})

app.post("/join-session", (req, res) => {
  const { sessionId } = req.body

  const session = sessions.find(s => s.sessionId === sessionId)

  if (!session) return res.status(404).json({ message: "Session not found" })

  res.json({ message: "Joined" })
})
server.listen(5000,()=>{
console.log("Server running on port 5000")
})