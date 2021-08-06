export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      if (
        convoCopy.otherUser.id !== message.senderId &&
        message.viewed &&
        (!convoCopy.latestView || convoCopy.latestView < message.id)
      )
        convoCopy.latestView = message.id;

      return convoCopy;
    } else {
      return convo;
    }
  });
};

// sets initial read receipt values on loaded conversations
export const loadedConversations = (state, id, conversations) => {
  return conversations.map((convo) => {
    const convoCopy = { ...convo };

    for (let i = convo.messages.length - 1; i >= 0; i--) {
      if (convo.messages[i].senderId === id && convo.messages[i].viewed) {
        convoCopy.latestView = convo.messages[i].id;
        break;
      }
    }
    return convoCopy;
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const newConvo = { ...convo };
      newConvo.id = message.conversationId;
      newConvo.messages.push(message);
      newConvo.latestMessageText = message.text;
      newConvo.latestView = null;
      // newConvo.unreadCount = 1;
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const setMessageViewed = (state, conversationId, messageId) => {
  return state.map((convo) => {
    if (convo.id === conversationId) {
      const newConvo = { ...convo };
      for (let i = 0; i < newConvo.messages.length; i++) {
        if (newConvo.messages[i].id === messageId) {
          newConvo.messages[i].viewed = true;
          if (
            newConvo.otherUser.id !== newConvo.messages[i].senderId &&
            (!newConvo.latestView || newConvo.latestView < messageId)
          )
            newConvo.latestView = messageId;
          break;
        }
      }
      return newConvo;
    } else {
      return convo;
    }
  });
};
