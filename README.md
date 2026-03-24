# 🚀 DeliverEase — Last-Mile Delivery Management Platform

![DeliverEase](https://img.shields.io/badge/DeliverEase-Live-gold?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io)

> A full-stack last-mile delivery management platform solving real problems for local businesses — pharmacies, tiffin services, grocery stores and more.

---

## 🌐 Live Demo

- **Frontend:** [https://deliver-easexfinal.vercel.app](https://deliver-easexfinal.vercel.app)
- **Backend API:** [https://delivereasefinal.onrender.com](https://delivereasefinal.onrender.com)

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Business | medplus@deliverease.com | 123456 |
| Agent | rajan.agent@deliverease.com | 123456 |
| Test Business | business@test.com | 123456 |

---

## 📸 Screenshots

> Dashboard · Order Management · Agent Tracking · Store Directory

---

## ✨ Features

### 🏪 Business Dashboard
- Create and manage delivery orders with priority levels
- Assign delivery agents with real-time availability
- Track all orders with live status updates
- Search and filter orders by status, priority, date
- Export orders to CSV
- SLA tracking — flags orders pending 30+ minutes as urgent
- Analytics dashboard with Chart.js (revenue, order status, agent performance)

### 🛵 Agent Dashboard
- View assigned deliveries with pickup and drop locations
- Update delivery status (Picked Up → In Transit → Delivered)
- SMS notifications sent automatically at each status change

### 🛍️ Public Store Directory
- Marketplace for customers to discover local businesses
- Three store types: Simple order form, Catalogue/menu, Service request
- Customer order placement without login required
- WhatsApp-style order tracking via order number

### 📍 Real-time Tracking
- Live order tracking via Socket.io rooms
- Public tracking page accessible without login
- Real-time progress timeline with animated indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Chart.js, Socket.io-client |
| Backend | Node.js, Express.js, MongoDB (Atlas), Mongoose |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Real-time | Socket.io |
| SMS | Twilio Messaging API |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🏗️ Architecture

```
deliverease/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Dashboard, Agent, Tracking, Store pages
│   │   ├── components/     # Reusable components
│   │   └── services/       # Axios API service
└── server/                 # Node.js backend
    ├── controllers/        # Business logic
    ├── models/             # MongoDB schemas
    ├── routes/             # API routes
    ├── middleware/         # Auth & role middleware
    ├── socket/             # Socket.io handler
    └── utils/              # SMS utility
```

---

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/agents

POST   /api/orders              (business only)
GET    /api/orders              (business only)
GET    /api/orders/:id
PUT    /api/orders/:id/assign   (business only)
GET    /api/orders/track/:orderNumber  (public)
GET    /api/orders/analytics    (business only)

GET    /api/agent/orders
PUT    /api/agent/orders/:id/status

GET    /api/stores              (public)
GET    /api/stores/:slug        (public)
POST   /api/stores/:slug/order  (customer)
PUT    /api/stores/setup        (business only)
POST   /api/stores/catalogue    (business only)
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Twilio account (for SMS)

### Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install --legacy-peer-deps
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### Seed Database
```bash
cd server
node seed.js
```

---

## 🚀 Deployment

### Backend (Render)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Add all environment variables

### Frontend (Vercel)
- Root Directory: `client`
- Install Command: `npm install --legacy-peer-deps`
- Build Command: `npm run build`
- Output Directory: `dist`
- Add `VITE_API_URL` environment variable

---

## 👤 User Roles

| Role | Permissions |
|------|------------|
| **Business** | Create orders, assign agents, view analytics, manage store |
| **Agent** | View assigned deliveries, update status |
| **Customer** | Place orders via store, track order publicly |

---

## 🎯 Key Technical Decisions

- **Socket.io rooms** — each order gets its own room for targeted real-time updates
- **JWT with role claims** — role embedded in token for stateless authorization
- **Twilio never crashes app** — SMS utility wrapped in try/catch, delivery continues if SMS fails
- **MongoDB Atlas** — cloud database with automatic backups

---

## 📊 Interview Story

*"Built DeliverEase — a full-stack last-mile delivery management platform. Three user roles — business owners, delivery agents, customers. Businesses set up a public store, customers place orders, agents update delivery status in real time using Socket.io. SMS notifications via Twilio at each stage. Analytics dashboard with SLA tracking flags orders breaching 30-minute response target — similar to Amazon's fulfillment operations."*

---

## 👨‍💻 Author

**Aryan Kumar**
- 3rd Year CS, Chandigarh University (2023–2027)
- GitHub: [@Arcanex7](https://github.com/Arcanex7)

---

## 📄 License

MIT License — feel free to use for learning and portfolio purposes.
