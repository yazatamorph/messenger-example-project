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
  const message = await Message.findOne({
    where: {
      id: messageId,
    },
  });
  // if record exists, update and save
  if (message) {
    message.viewed = true;
    await message.save();
  }

  // return message or null if it doesn't exist
  return message;
};

module.exports = Message;
