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
} from "../controllers/AuthController.js";

const authRoutes = Router();

authRoutes.post("/logout", logout);
authRoutes.post("/login", login);
authRoutes.get("/callback", callbackLogin);
authRoutes.get("/profile", getProfile);
authRoutes.get("/activities", getListActivities);
authRoutes.get("/activities/:videoId", getVideoDetails);
authRoutes.get("/comments/:videoId", getListComments);
authRoutes.get("/replies/:parentId", getCommentReplies);
authRoutes.post("/comment", insertComment);
authRoutes.post("/reply", insertReply);
authRoutes.delete("/comment/:id", deleteComment);

export default authRoutes;
