import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  setMessageRead,
} from "./store/conversations";

const socket = io(window.location.origin, { auth: {} });

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });
  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    store.dispatch(setNewMessage(data.message, data.sender));
  });
  socket.on("read-receipt", (data) => {
    store.dispatch(setMessageRead(data.conversationId, data.messageId));
  });
});

socket.on("connect_error", () => {
  setTimeout(async () => {
    socket.auth.token = await localStorage.getItem("messenger-token");
    socket.connect();
  }, 1000);
});

export default socket;
