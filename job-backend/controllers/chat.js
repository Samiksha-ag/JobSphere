const Message = require("../models/message");

exports.getHistory = (req, res, next) => {
  const me = req.userId;
  const other = req.params.otherUserId;

  Message.find({
    $or: [
      { senderId: me, receiverId: other },
      { senderId: other, receiverId: me },
    ],
  })
    .sort({ createdAt: 1 })
    .lean()
    .then((messages) => {
      res.status(200).json({
        message: "Fetched chat history",
        messages: messages,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
