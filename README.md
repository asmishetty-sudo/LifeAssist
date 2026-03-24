# 🏥 LifeAssist – Caregiving & Booking Platform

## 📌 Overview

**LifeAssist** is a full-stack web application designed to connect families with professional caregivers in a simple, efficient, and secure way.
It enables users to book caregiving services, communicate in real-time, and track activities through analytics all in a clean, responsive interface.

The platform is built with scalability and real-world usability in mind, supporting multiple user roles and real-time interactions.

---

## 👥 User Roles

### 1. Family User (Normal User)

* Search and view caregivers
* Book caregiving services
* Chat with caregivers (only after booking is accepted)
* Track booking status and history

### 2. Caregiver

* Create and manage profile
* Accept or reject booking requests (Can't cancel once accepted -only client can cancel)
* Communicate with clients
* View earnings and analytics

### 3. Admin ⚠️

* Full platform control (users, bookings, reports)
* Add services
* View user complaints
* Verify Caregiver profiles
* **Important:** Admin role cannot be assigned via frontend
  → Must be manually updated in **MongoDB (Atlas/local DB)**

---

## ✨ Key Features

### 🔐 Authentication & Security

* JWT-based authentication
* Tokens stored securely in **cookies**
* Protected routes for different user roles

---

### 💬 Real-Time Messaging

* Built using **Socket.IO**
* Chat available **only when booking is accepted or ongoing**
* Message status indicators:

  * Sent ✓
  * Delivered ✓✓
  * Seen ✓✓ (blue)

---

### 📊 Analytics Dashboard

* Visual insights using charts & graphs
* Track:

  * Earnings/spendings 
  * Booking trends
  * Platform activity
* Uses pie charts and graphs for clarity

---

### 📅 Booking System

* Request → Accept/Reject → Ongoing → Completed
* Status-based workflow
* Seamless interaction between family & caregiver

---

### 📱 Responsive UI

* Fully responsive (mobile + desktop)
* Clean and user-friendly design
* Optimized for real-world usability

---

### ⚙️ Role-Based Access Control

* Separate dashboards for:

  * Family
  * Caregiver
  * Admin
* Secure backend validation for every action

---

## 🗂️ Project Structure

```
backend/
│── config/
│── controllers/
│── middleware/
│── model/
│── route/
│── package.json
│── server.js

frontend/
│── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (users)/
│   │   ├── (forsetup)/caregiver/
│   │   ├── admin/
│   │   ├── caregiver/
│   │   └── family/
│   ├── suspended/
│   ├── layout.js
│   └── page.js
│
│── components/
│── context/
│── lib/
│── public/
│── package.json
```

---

## 🚀 Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB (Atlas / Local)

### Other Tools

* Socket.IO (real-time messaging)
* JWT (authentication)
* Charts/Graphs libraries (analytics)

---

## ⚙️ Setup Instructions

### 🔑 1. Environment Variables

Create `.env` files in both **frontend** and **backend** directories.
Refer to `.env.example` for required variables.

---

### 🖥️ 2. Backend Setup

```bash
cd backend
npm install
```

Run server:

```bash
nodemon server.js
# OR
node server.js
```

---

### 🌐 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Important Notes

* Admin access must be manually assigned in MongoDB:

  ```js
  userType: "admin"
  ```

* Ensure backend is running before frontend

* Cookies must be enabled in browser (for JWT auth)

---

## 🌟 Highlights

✔ Real-time messaging system
✔ Role-based dashboards
✔ Secure authentication with cookies
✔ Data-driven analytics
✔ Clean and responsive UI
✔ Scalable folder structure

---

## 📈 Future Improvements (Optional Ideas)

* Payment integration (Stripe/Razorpay)
* Push notifications
* Video consultation
* Caregiver rating & review system
* AI-based caregiver recommendation
* 
---

### [Demo Youtube Video](https://yourwebsite.com)

---

## 👨‍💻 Author

**Asmi M Shetty**


