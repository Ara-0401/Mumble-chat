import express from "express"
import * as roomController from "../controllers/room.controller.js"
import {auth}  from "../middlewares/auth.middleware.js"
const router=express.Router()

router.post("/createroom",auth,roomController.createRoom)
router.get("/getrooms",auth ,roomController.getRooms)
router.post("/create-dm", auth, roomController.createOrGetDM)
router.post("/invite", auth, roomController.inviteToGroup)


export default router;