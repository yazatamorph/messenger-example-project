import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  setMessageRead,
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.auth.token = await localStorage.getItem("messenger-token");
      socket.connect();
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.auth.token = data.token;
    socket.connect();
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.auth.token = data.token;
    socket.connect();
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = (id) => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    // This is a somewhat costly operation, but it's mitigated by only being performed once
    data.forEach((c, index) => {
      c.messages.reverse();
    });
    dispatch(gotConversations(id, data));
  } catch (error) {
    console.error(error);
  }
};

const sendReadReceipt = (recipientId, conversationId, messageId) => {
  socket.emit("read-receipt", {
    recipientId,
    conversationId,
    messageId,
  });
};

const saveReadReceipt = async (conversationId, messageId) => {
  const { data } = await axios.patch("/api/messages/viewed", {
    conversationId,
    messageId,
  });
  return data;
};

export const updateReadReceipt =
  (conversationId, messageId) => async (dispatch) => {
    try {
      // saves read status to DB
      const data = await saveReadReceipt(conversationId, messageId);
      // emits read receipt when user looks at new message
      sendReadReceipt(data.recipientId, conversationId, messageId);
      // updates when user reads message
      dispatch(setMessageRead(conversationId, messageId));
    } catch (err) {
      console.error(err);
    }
  };

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);
    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};
// TODO: Debounce search
export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
