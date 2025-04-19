# InsightCase 🔍

InsightCase is a full-stack **Case Management Web Application** developed for a local business to streamline service delivery and client engagement for individuals with disabilities.  
It integrates Microsoft 365 services to automate workflows, simplify case handling, and boost operational efficiency.

> 🚀 This is a forked version of a collaborative project. I contributed to backend logic enhancements, secure authentication with Microsoft OAuth, UI improvements, and Microsoft Graph API integrations.

---

## 🏆 Recognition

- ✅ **Selected at the 11th CS Demo Day**, University of Windsor
- 🥇 **Won project pitch competition** during _Internship Project – I_ among 30+ teams

---

## 🔑 Key Features

- 🔐 **Authentication & Access Control**  
  Microsoft login with JWT-based role access for Admins, Staff, and Clients.

- ✅ **Task Management**  
  Integrates with Microsoft To-Do for seamless task tracking.

- 📅 **Event Scheduling**  
  Real-time calendar syncing using Microsoft Calendar.

- 📬 **Email Integration**  
  Communication via Microsoft Outlook APIs.

- ⚙️ **Workflow Automation**  
  Efficient role-based workflows to handle multi-step case resolution.

- 🗄️ **Data Centralization**  
  PostgreSQL backend with structured relational models.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React.js**
- **Tailwind CSS**

### Backend

- **NestJS**
- **PostgreSQL**
- **Microsoft Graph API**

---

## 📁 Folder Structure

```
InsightCase/
├── Frontend   # Next.js client app
└── Backend    # NestJS server-side API
```

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- Microsoft Developer Account (for Microsoft Graph API keys)

---

### 🧩 Installation Steps

```bash
# Clone the repository
git clone https://github.com/meetbhavsar99/InsightCase.git
cd InsightCase
```

```bash
# Install frontend dependencies
cd Frontend
npm install

# Install backend dependencies
cd ../Backend
npm install
```

---

### 🔐 Set up environment variables

- Create a `.env` file in **/Frontend** with frontend config (e.g., Graph API client ID)
- Create a `.env` file in **/Backend** with backend config (e.g., DB credentials, MS secrets)

---

### 🚀 Run the Application

```bash
# Start the frontend
cd Frontend
npm run dev
```

```bash
# Start the backend
cd ../Backend
npm run start:dev
```

---

### 🌐 Access Locally

- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend → [http://localhost:3001](http://localhost:3001)

---

## 🙌 Acknowledgment

This project originated as a team collaboration.

I contributed to:

- Microsoft Graph API integration (Calendar, Outlook, To-Do)
- Secure authentication with Microsoft OAuth and JWT
- Backend module and controller improvements in NestJS
- Dashboard layout and responsive UI enhancements
- Code cleanup, refactoring, and folder restructuring

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📫 Contact

**Meet Bhavsar**  
📧 [meetbhavsar99@gmail.com](mailto:meetbhavsar99@gmail.com)  
💼 [LinkedIn](https://www.linkedin.com/in/meet-bhavsar-0059ba1b5/)
