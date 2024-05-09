import express from "express";
import { deleteMessages, getAllMessages, getMessages, sendMessage } from "../controllers/messageController.js";
const router = express.Router();

// Route to send a message
router.post('/', sendMessage);
router.delete('/supprimer/:email', deleteMessages);
// Route to get messages between two users
router.get('/:email', getAllMessages);
router.get('/:sender/:receiver', getMessages);

export default router;
