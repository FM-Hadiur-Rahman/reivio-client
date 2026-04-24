import { api } from "./api"; // or "../api" depending your structure

// 🔹 Get my chats
export const getMyDirectChats = () => {
  return api.get("/api/direct-chats/my");
};

// 🔹 Get messages
export const getDirectMessages = (chatId) => {
  return api.get(`/api/direct-chats/${chatId}/messages`);
};

// 🔹 Send message
export const sendDirectMessage = (chatId, text) => {
  return api.post(`/api/direct-chats/${chatId}/messages`, {
    text,
  });
};
