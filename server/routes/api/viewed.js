const router = require("express").Router();
const { Message, Conversation } = require("../../db/models");

router.patch("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const senderId = req.user.id;
    const { messageId, conversationId } = req.body;

    let conversation = await Conversation.findOne({
      where: {
        id: conversationId,
      },
    });

    if (
      conversation?.user1Id !== senderId &&
      conversation?.user2Id !== senderId
    ) {
      return res.status(403).json({
        error: "Sender is not a member of the associated conversation.",
      });
    }
    const recipientId =
      (conversation.user1Id !== senderId && conversation.user1Id) ||
      conversation.user2Id;

    await Message.updateReadReceipt(messageId);

    return res.status(200).json({ senderId, recipientId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
