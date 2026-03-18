import Message from '../models/Message.js';
import TradeRequest from '../models/TradeRequest.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    res.status(400);
    throw new Error('Receiver and message are required');
  }

  const canChat = await TradeRequest.findOne({
    status: { $in: ['In Progress', 'Completed'] },
    $or: [
      { requesterId: req.user._id, ownerId: receiverId },
      { requesterId: receiverId, ownerId: req.user._id },
    ],
  });

  if (!canChat) {
    res.status(403);
    throw new Error('Chat opens after a trade request is accepted');
  }

  const createdMessage = await Message.create({
    senderId: req.user._id,
    receiverId,
    message,
  });

  if (receiverId.toString() !== req.user._id.toString()) {
    await createNotification({
      userId: receiverId,
      actorId: req.user._id,
      type: 'CHAT_MESSAGE',
      message: `${req.user.name} sent you a message`,
      link: `/chat/${req.user._id}`,
      metadata: {
        messageId: createdMessage._id,
      },
    });
  }

  await createdMessage.populate([
    { path: 'senderId', select: 'name email location' },
    { path: 'receiverId', select: 'name email location' },
  ]);

  res.status(201).json(createdMessage);
});

export const getConversation = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: req.user._id },
    ],
  })
    .populate('senderId', 'name email location')
    .populate('receiverId', 'name email location')
    .sort({ timestamp: 1 });

  res.json(messages);
});
