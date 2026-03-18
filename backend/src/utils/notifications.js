import Notification from '../models/Notification.js';

export const createNotification = async ({
  userId,
  actorId = null,
  type,
  message,
  link = '/trade-requests',
  metadata = {},
}) => {
  if (!userId || !type || !message) {
    return null;
  }

  return Notification.create({
    userId,
    actorId,
    type,
    message,
    link,
    metadata,
  });
};
