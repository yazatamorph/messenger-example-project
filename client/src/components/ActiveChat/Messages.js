import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId } = props;
  const [latestView, setLatestView] = useState(null);

  useEffect(() => {
    // iterates backwards to find most recently viewed message & stores its id in state
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === userId && messages[i].viewed)
        return setLatestView(messages[i].id);
    }
  });

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            text={message.text}
            time={time}
            // viewed is true if message.id matches the most recently viewed message's id
            viewed={message.id === latestView}
            otherUser={message.id === latestView ? otherUser : null}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            message={message}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
