import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .populate('actorId', 'name email location')
      .sort({ createdAt: -1 })
      .limit(limit),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  res.json({ notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

  res.json({ notification, unreadCount });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

  res.json({ message: 'All notifications marked as read', unreadCount: 0 });
});
