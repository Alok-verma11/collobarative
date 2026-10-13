# Full Stack Machine Test: Question 3 — Real-Time Collaborative Kanban Board

A production-grade, full-stack collaborative Kanban board built with the **MERN** stack (MongoDB, Express, React, Node.js) and **Socket.io** for real-time multi-user synchronization.

---

## 🌟 Features Implemented

### 1. Backend Models (MongoDB / Mongoose)
- **Board Model** (`server/models/Board.js`):
  - `title`: Project title
  - `createdBy`: Creator profile (id, name, email, avatar)
  - `members`: Collaborator list with avatars, roles, and status
  - `columns`: Configurable status columns (To Do, In Progress, In Review, Done)
- **Task Model** (`server/models/Task.js`):
  - `title`, `description`
  - `priority`: `Low`, `Medium`, `High`, `Urgent`
  - `dueDate`: Date picker with overdue status detection
  - `assignedTo`: Reference to board member
  - `status`: Column status (`Todo`, `In Progress`, `Review`, `Done`)
  - `position`: Sequential numeric ordering per column
  - `comments`: Array of threaded comments with timestamps and authors
  - `attachments`: File attachments with preview links and metadata
- **Activity Model** (`server/models/Activity.js` - Bonus):
  - Audit log tracking who created, moved, edited, commented, or deleted tasks

---

### 2. RESTful APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/boards` | Create a new Kanban board |
| `GET` | `/api/boards` | List all boards |
| `GET` | `/api/boards/:id` | Get board data with all tasks & activities |
| `POST` | `/api/boards/:id/members` | Invite new members to board |
| `POST` | `/api/boards/:id/tasks` | Create task on board |
| `PUT` | `/api/tasks/:id/move` | Move task (status & position with reorder resolution) |
| `PUT` | `/api/tasks/:id` | Update task details |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `POST` | `/api/tasks/:id/comments` | Add comment (Bonus) |
| `POST` | `/api/tasks/:id/attachments` | Add attachment (Bonus) |
| `GET` | `/api/boards/:id/analytics` | Get board metrics & workload (Bonus) |
| `GET` | `/api/boards/:id/activities` | Get board activity timeline (Bonus) |

---

### 3. Real-Time Capabilities (Socket.io)
- **Live Task Movement**: Real-time broadcasts when any client drags and drops cards across columns or within columns.
- **Remote Dragging Indicator**: When user A drags a card, user B sees a pink glow with a badge: *"Alex is moving..."*.
- **Live Presence & Online Badges**: Real-time room tracking showing active avatars with green online pulses.
- **Typing Indicators**: Displays *"User is typing..."* when editing tasks or typing comments.
- **Instant Updates**: New tasks, card updates, member invitations, and deletions instantly broadcast to all connected clients.
- **Disconnect & Reconnect Handling**: Automatic socket reconnect with state re-synchronization to prevent data divergence.

---

### 4. Frontend Features (React + Vite + Modern CSS)
- **Drag & Drop Task Movement**: HTML5 drag-and-drop with dynamic drop line indicators and column highlights.
- **Editable Task Modal**: Comprehensive modal for editing title, description, status, priority, due date, assignee, file attachments, and comments.
- **Rich Filtering System**:
  - Live search input
  - Priority pills (`All`, `Urgent`, `High`, `Medium`, `Low`)
  - Member / Assignee filter
  - Date filter (`Overdue`, `Due Today`, `Due This Week`)
- **Persona Switcher**: Convenient dropdown in the header to switch between team personas (*Alex*, *Sarah*, *Vikram*, *Priya*) to test multi-user collaboration across browser tabs.
- **Dark/Light Mode**: Sleek glassmorphic dark theme by default, toggleable with the theme button.

---

### 5. Bonus Features
- **Activity Timeline**: Slide-out drawer displaying an audit trail of board movements and events.
- **Analytics & Health Dashboard**: Metrics cards, sprint completion progress bar, column distribution, priority distribution, and team workload summary.
- **File Attachments**: Upload/link attachments with previews and metadata.
- **Comment Threads**: Real-time comments with avatars and timestamps.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies
```bash
# Install both server and client dependencies
npm run install:all
```

### 2. Run the Application
In one terminal, start the backend server:
```bash
npm run dev:server
```
*(Backend runs on `http://localhost:5000`)*

In a second terminal, start the frontend client:
```bash
npm run dev:client
```
*(Frontend runs on `http://localhost:5173`)*

Open your browser at:
👉 **`http://localhost:5173`**
