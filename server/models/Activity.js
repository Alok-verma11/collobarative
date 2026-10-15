import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
    index: true
  },
  user: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  action: {
    type: String,
    enum: [
      'TASK_CREATED',
      'TASK_MOVED',
      'TASK_UPDATED',
      'TASK_DELETED',
      'COMMENT_ADDED',
      'ATTACHMENT_ADDED',
      'MEMBER_INVITED',
      'BOARD_CREATED'
    ],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  taskId: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;
