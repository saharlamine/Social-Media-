import express from "express";
import { DeleteNotif, addComment, getFeedPosts, getNotif, getPostById, getPostByKey, getUserPosts, likePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get('/notifications/:userId', getNotif);  
router.delete('/notifications/delete/:userId', DeleteNotif);  
router.get("/:userId/posts", verifyToken, getUserPosts);
router.get('/search/:key', getPostByKey);
router.get('/:id', getPostById);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.post("/:id/comment", verifyToken, addComment);

export default router;
