import jwt from "jsonwebtoken";
import * as googleAuth from "google-auth-library";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const maxAge = 30 * 60;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.CLIENT_URL;
const scope = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];
const oAuth2Client = new googleAuth.OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
const url = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scope,
  redirect_uri: REDIRECT_URI,
  approval_prompt: "force",
  state: "GOOGLE_LOGIN",
});

const youtube = google.youtube({
  version: "v3",
  auth: oAuth2Client,
});

export const login = (req, res) => {
  return res.status(200).send(url);
};

export const callbackLogin = async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    setAccessCredentials(tokens.access_token);
    res.cookie("accessToken", tokens.access_token, {
      maxAge: maxAge * 1000,
    });
    res.redirect(process.env.ORIGIN);
  } catch {
    res.redirect(process.env.ORIGIN);
  }
};

export const getProfile = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(401).send("Unauthorized");
    setAccessCredentials(token);
    let oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    let { data } = await oauth2.userinfo.get();
    return res.status(200).send(data);
  } catch {
    return res.status(500).send("Internal Server Error");
  }
};

export const logout = (req, res) => {
  res.cookie("accessToken", "", { maxAge: 1 });
  return res.status(200).send("Logged out");
};

export const getListActivities = async (req, res) => {
  try {
    console.log("nextpage", req.query.pageToken);
    const { data } = await youtube.activities.list({
      part: "snippet,contentDetails",
      mine: true,
      maxResults: 3,
      pageToken: req.query.pageToken,
    });
    return res.status(200).send(data);
  } catch {
    return res.status(500).send("Internal Server Error");
  }
};

export const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;
    setAccessCredentials(req.cookies.accessToken);
    const { data } = await youtube.videos.list({
      part: "snippet,statistics",
      id: videoId,
    });
    if (data.items.length === 0) return res.status(404).send("Video not found");
    return res.status(200).send(data.items[0]);
  } catch {
    return res.status(500).send("Internal Server Error");
  }
};

export const getListComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { data } = await youtube.commentThreads.list({
      part: "snippet",
      videoId: videoId,
      maxResults: 10,
      pageToken: req.query.pageToken,
    });
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const getCommentReplies = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { data } = await youtube.comments.list({
      part: "snippet",
      parentId: parentId,
      maxResults: 10,
      pageToken: req.query.pageToken,
    });
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const insertComment = async (req, res) => {
  try {
    const { videoId, text } = req.body;
    console.log(videoId, text);
    const { data } = await youtube.commentThreads.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          videoId: videoId,
          topLevelComment: {
            snippet: {
              textOriginal: text,
            },
          },
        },
      },
    });
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const insertReply = async (req, res) => {
  try {
    const { parentId, text } = req.body;
    const { data } = await youtube.comments.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          parentId: parentId,
          textOriginal: text,
        },
      },
    });
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await youtube.comments.delete({
      id: id,
    });
    console.log("deleted", data);
    return res.status(200).send("Deleted");
  } catch (err) {
    return res.status(500).send(err);
  }
};

const setAccessCredentials = (token) => {
  if (!token) return;
  oAuth2Client.setCredentials({ access_token: token });
};
