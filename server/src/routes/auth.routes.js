import express from "express"
import * as authController from "../controllers/auth.controllers.js"
import { auth } from "../middlewares/auth.middleware.js"

const router=express.Router()

console.log(authController)

router.post("/register",authController.register)
router.post("/login",authController.login)
router.post("/logout",authController.logout)
router.post("/refreshToken",authController.refreshToken)
router.get("/search", authController.searchUsers)
router.put("/update", auth, authController.updateUser)
console.log("auth.routes.js loaded")

// router.post("/login", (req, res) => {
//     console.log("LOGIN ROUTE HIT")
//     res.json({ success: true })
// })




export default router