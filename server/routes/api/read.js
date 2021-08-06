const router = require("express").Router();
const { Message } = require("../../db/models");

router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { messageId } = req.body;

    const message = await Message.updateReadReceipt(messageId);

    return res.json({ message });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
