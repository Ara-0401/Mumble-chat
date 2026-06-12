import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import authRoutes from "./routes/auth.routes.js"
import roomRoutes from "./routes/room.route.js"
import messageRoutes from "./routes/message.route.js"
import cors from "cors"

const app=express();


app.use(express.json())
app.use(cors(
    {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials:true
    }
))
app.use(morgan("dev"))
app.use(cookieParser())
// console.log("Mounting auth routes")

app.use("/api/auth",authRoutes)
app.use("/api/room",roomRoutes)
app.use("/api/messages",messageRoutes)

// app.use((req, res) => {
//     console.log("404 hit:", req.method, req.url)
//     res.status(404).json({ message: "route not found" })
// })




export default app