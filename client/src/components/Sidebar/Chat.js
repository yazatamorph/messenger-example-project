import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent, CountUnread } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation } = props;
  const otherUser = conversation.otherUser;
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMsgState, setNewMsgState] = useState(false);

  const handleClick = async (convo) => {
    await props.setActiveChat(convo.otherUser.username);
  };

  useEffect(() => {
    const getUnreadCount = (convo) => {
      let count = 0;
      convo.messages.forEach((message) => {
        if (!message.viewed && message.senderId !== props.user.id) {
          count++;
        }
      });
      count > 0 ? setNewMsgState(true) : setNewMsgState(false);
      setUnreadCount(count);
    };
    getUnreadCount(conversation);
  });

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} newMsgs={newMsgState} />
      {unreadCount > 0 && <CountUnread count={unreadCount} />}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
