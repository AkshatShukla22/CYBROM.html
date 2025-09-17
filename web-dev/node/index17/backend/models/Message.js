// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  senderName: {
    type: String,
    required: true
  },
  senderImage: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.senderId, this.receiverId];
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ],
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

// Static method to get user's conversations with last message
messageSchema.statics.getUserConversations = async function(userId) {
  return await this.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $addFields: {
        otherUserId: {
          $cond: {
            if: { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
            then: '$receiverId',
            else: '$senderId'
          }
        }
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$otherUserId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: '$userInfo'
    },
    {
      $project: {
        userId: '$_id',
        name: '$userInfo.name',
        email: '$userInfo.email',
        profileImage: '$userInfo.profileImage',
        userType: '$userInfo.userType',
        specialization: '$userInfo.specialization',
        isOnline: false, // This will be updated in real-time by socket
        lastMessage: {
          content: '$lastMessage.content',
          timestamp: '$lastMessage.createdAt',
          senderId: '$lastMessage.senderId',
          isRead: '$lastMessage.isRead'
        },
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.timestamp': -1 }
    }
  ]);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function(senderId, receiverId) {
  return await this.updateMany(
    {
      senderId: senderId,
      receiverId: receiverId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    isRead: false,
    isDeleted: false
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;