import { Router } from "express";
import {
  login,
  logout,
  callbackLogin,
  getProfile,
  getListActivities,
  getVideoDetails,
  getListComments,
  getCommentReplies,
  insertComment,
  insertReply,
  deleteComment,
  getChannel,
} from "../controllers/AuthController.js";

const authRoutes = Router();

authRoutes.get("/test", (req, res) => {
  res.send("Hello World");
});
authRoutes.post("/logout", logout);
authRoutes.post("/login", login);
authRoutes.get("/callback", callbackLogin);
authRoutes.get("/profile", getProfile);
authRoutes.get("/channel", getChannel);
authRoutes.get("/activities", getListActivities);
authRoutes.get("/activities/:videoId", getVideoDetails);
authRoutes.get("/comments/:videoId", getListComments);
authRoutes.get("/replies/:parentId", getCommentReplies);
authRoutes.post("/comment", insertComment);
authRoutes.post("/reply", insertReply);
authRoutes.delete("/comment/:id", deleteComment);

export default authRoutes;
