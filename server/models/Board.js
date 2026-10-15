import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'Member' },
  color: { type: String, default: '#3b82f6' }
}, { _id: false });

const ColumnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  color: { type: String, default: '#6366f1' }
}, { _id: false });

const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Project Kanban'
  },
  createdBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  members: [MemberSchema],
  columns: {
    type: [ColumnSchema],
    default: [
      { id: 'Todo', title: 'To Do', color: '#64748b' },
      { id: 'In Progress', title: 'In Progress', color: '#3b82f6' },
      { id: 'Review', title: 'In Review', color: '#eab308' },
      { id: 'Done', title: 'Done', color: '#10b981' }
    ]
  }
}, {
  timestamps: true
});

const Board = mongoose.model('Board', BoardSchema);
export default Board;
