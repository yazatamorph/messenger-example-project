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

    // Moved up in function to allow us to ensure messages aren't
    // sent to conversations in which they aren't a member.
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (conversationId) {
      // Without this check, a user could send messages to any conversation if they have the conversationId
      if (conversationId !== conversation.id)
        throw new Error("NotInConversation");
      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }

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
    if (error.message === "NotInConversation") {
      return res
        .status(403)
        .json({ error: "Sender is not a member of conversation." });
    }

    next(error);
  }
});

module.exports = router;
