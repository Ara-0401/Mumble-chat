import express from "express"
import {auth} from "../middlewares/auth.middleware.js"
import * as messageController from "../controllers/message.controller.js"
const router=express.Router()


router.post("/:roomId/message",auth,messageController.sendMessage)
router.get("/:roomId/message",auth,messageController.getMessages)

export default router