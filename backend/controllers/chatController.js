const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.startOrGetConversation = async (req, res, next) => {
  try {
    const { userId } = req.body; // other user
    let conv = await Conversation.findOne({ participants: { $all: [req.user._id, userId] } })
      .populate('participants', 'name avatar _id');
    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, userId] });
      await conv.populate('participants', 'name avatar _id');
    }
    res.json({ success: true, data: conv });
  } catch (err) { next(err); }
};

exports.getConversations = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar _id')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: convs });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar _id')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, messageType } = req.body;
    const msg = await Message.create({ conversation: conversationId, sender: req.user._id, content, messageType });
    await msg.populate('sender', 'name avatar _id');
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: content, updatedAt: Date.now() });
    res.status(201).json({ success: true, data: msg });
  } catch (err) { next(err); }
};

// used by socket
exports.saveMessage = async (payload) => {
  const { conversationId, senderId, content, messageType } = payload;
  const conv = conversationId ? await Conversation.findById(conversationId) : null;
  let convId = conversationId;
  if (!conv) {
    const created = await Conversation.create({ participants: [senderId, payload.receiverId], lastMessage: content });
    convId = created._id;
  }
  const msg = await Message.create({ conversation: convId, sender: senderId, content, messageType });
  await Conversation.findByIdAndUpdate(convId, { lastMessage: content, updatedAt: Date.now() });
  return msg;
};
