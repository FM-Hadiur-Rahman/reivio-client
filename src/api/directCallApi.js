import { api } from "./api";

export const startDirectCall = ({ chatId, callerId, receiverId, callType }) => {
  return api.post("/api/direct-calls/start", {
    chatId,
    callerId,
    receiverId,
    callType,
  });
};

export const getIncomingCall = (userId) => {
  return api.get(`/api/direct-calls/incoming/${userId}`);
};

export const acceptDirectCall = (callId) => {
  return api.patch(`/api/direct-calls/${callId}/accept`);
};

export const rejectDirectCall = (callId) => {
  return api.patch(`/api/direct-calls/${callId}/reject`);
};

export const endDirectCall = (callId) => {
  return api.patch(`/api/direct-calls/${callId}/end`);
};
