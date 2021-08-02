const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    if (conversationId) {
      // Improved this query by searching for the primary index (id)
      let conversation = await Conversation.findOne({
        where: {
          id: conversationId,
        },
      });
      // Without this check, a user could send messages to any conversation if they have the conversationId
      if (
        conversation?.user1Id !== senderId &&
        conversation?.user2Id !== senderId
      ) {
        return res
          .status(403)
          .json({ error: "Sender is not a member of conversation." });
      }
      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }

    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
