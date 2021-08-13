export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  const newState = new Map(state);
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    newState.set(sender.id, newConvo);
  } else {
    newState.forEach((v, k) => {
      if (v.id === message.conversationId) {
        const convoCopy = { ...v };
        convoCopy.messages.push(message);
        convoCopy.latestMessageText = message.text;
        if (
          convoCopy.otherUser.id !== message.senderId &&
          message.viewed &&
          (!convoCopy.latestView || convoCopy.latestView < message.id)
        )
          convoCopy.latestView = message.id;
        if (convoCopy.otherUser.id === message.senderId && !message.viewed)
          convoCopy.unreadCount++;
        return newState.set(k, convoCopy);
      }
    });
  }

  return newState;

  // return state.map((convo) => {
  //   if (convo.id === message.conversationId) {
  //     const convoCopy = { ...convo };
  //     convoCopy.messages.push(message);
  //     convoCopy.latestMessageText = message.text;
  //     if (
  //       convoCopy.otherUser.id !== message.senderId &&
  //       message.viewed &&
  //       (!convoCopy.latestView || convoCopy.latestView < message.id)
  //     )
  //       convoCopy.latestView = message.id;
  //     if (convoCopy.otherUser.id === message.senderId && !message.viewed)
  //       convoCopy.unreadCount++;
  //     return convoCopy;
  //   } else {
  //     return convo;
  //   }
  // });
};

// sets initial read receipt values on loaded conversations
export const loadedConversations = (state, id, conversations) => {
  const newState = new Map(state);
  conversations.forEach((convo) => {
    const convoCopy = { ...convo };

    let count = 0;
    convoCopy.messages.forEach((message) => {
      if (!message.viewed && message.senderId === convoCopy.otherUser.id) {
        count++;
      }
    });
    convoCopy.unreadCount = count;

    for (let i = convo.messages.length - 1; i >= 0; i--) {
      if (convo.messages[i].senderId === id && convo.messages[i].viewed) {
        convoCopy.latestView = convo.messages[i].id;
        break;
      }
    }
    newState.set(convoCopy.otherUser.id, convoCopy);
  });
  return newState;
};

export const addOnlineUserToStore = (state, id) => {
  const newState = new Map(state);
  const convoCopy = { ...newState.get(id) };
  convoCopy.otherUser.online = true;
  newState.set(id, convoCopy);

  return newState;
};

export const removeOfflineUserFromStore = (state, id) => {
  const newState = new Map(state);
  const convoCopy = { ...newState.get(id) };
  convoCopy.otherUser.online = false;
  newState.set(id, convoCopy);

  return newState;
};

export const addSearchedUsersToStore = (state, users) => {
  const newState = new Map(state);
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!newState.has(user.id)) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.set(user.id, fakeConvo);
    }
  });

  return newState;
};

export const clearSearchedUsersFromStore = (state) => {
  const newState = new Map(state);
  newState.entries((v, k) => {
    if (!v.id) newState.delete(k);
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  const newState = new Map(state);
  const newConvo = { ...newState.get(recipientId) };
  newConvo.id = message.conversationId;
  newConvo.messages.push(message);
  newConvo.latestMessageText = message.text;
  newConvo.latestView = null;
  newConvo.unreadCount = 0;
  newState.set(recipientId, newConvo);

  return newState;
};

export const setMessageViewed = (state, conversationId, messageId) => {
  const newState = new Map(state);

  newState.forEach((v, k) => {
    if (v.id === conversationId) {
      const newConvo = { ...v };
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

      let count = 0;
      newConvo.messages.forEach((message) => {
        if (!message.viewed && message.senderId === newConvo.otherUser.id) {
          count++;
        }
      });
      newConvo.unreadCount = count;

      return newState.set(k, newConvo);
    }
  });

  return newState;
};
