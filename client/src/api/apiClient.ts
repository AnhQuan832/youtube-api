import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async () => {
  try {
    const response = await apiClient.post("/login");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post("/logout");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (token: string) => {
  try {
    const response = await apiClient.get(`/profile/${token}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getListActivities = async (params?: any) => {
  try {
    const response = await apiClient.get("/activities", { params });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getActivity = async (videoId: string) => {
  try {
    const response = await apiClient.get(`/activities/${videoId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getListComments = async (videoId: string, params?: any) => {
  try {
    const response = await apiClient.get(`/comments/${videoId}`, { params });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCommentReplies = async (parentId: string, params?: any) => {
  try {
    const response = await apiClient.get(`/replies/${parentId}`, { params });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (videoId: string, text: string) => {
  try {
    const response = await apiClient.post(`/comment`, {
      videoId,
      text,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const addReply = async (parentId: string, text: string) => {
  try {
    const response = await apiClient.post(`/reply`, {
      parentId,
      text,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteComment = async (id: string) => {
  try {
    const response = await apiClient.delete(`/comment/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};