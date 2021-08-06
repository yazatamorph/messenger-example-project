const Sequelize = require("sequelize");
const db = require("../db");

const Message = db.define("message", {
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  viewed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Message.updateReadReceipt = async function (messageId) {
  const message = await Message.update(
    { viewed: true },
    {
      where: {
        id: messageId,
      },
    }
  );

  return message;
};

module.exports = Message;
