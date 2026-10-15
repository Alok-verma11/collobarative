import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  user: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const AttachmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, default: 0 },
  type: { type: String, default: 'application/octet-stream' },
  url: { type: String, required: true },
  uploadedBy: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    index: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  assignedTo: {
    id: { type: String, default: null },
    name: { type: String, default: 'Unassigned' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    color: { type: String, default: '#64748b' }
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Review', 'Done'],
    default: 'Todo',
    index: true
  },
  position: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  comments: [CommentSchema],
  attachments: [AttachmentSchema]
}, {
  timestamps: true
});

// Index to quickly sort by status and position within a board
TaskSchema.index({ boardId: 1, status: 1, position: 1 });

const Task = mongoose.model('Task', TaskSchema);
export default Task;
