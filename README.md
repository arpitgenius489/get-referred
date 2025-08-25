# 💼 Get Referred – Job Referral Platform

[![Backend: Java + Spring](https://img.shields.io/badge/Backend-Java%20%2B%20Spring-informational)]()
[![Frontend: React + Tailwind](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-blue)]()
[![Database: MySQL](https://img.shields.io/badge/Database-MySQL-brightgreen)]()

A full-stack job referral platform where users can request referrals from employees, manage their own referrals, and build professional connections — all with secure authentication, profile control, and a clean UI.

This project demonstrates strong backend engineering skills in Java and Spring Boot, structured API development, Firebase integration for secure authentication, and a modern frontend built with React, Tailwind CSS, and Vite.

<br>

## 📌 Live Demo

- 🔗 **Frontend (Live)**: https://getreferred.onrender.com/
- 🔗 **Backend (API base URL)**: https://get-referred-backend.onrender.com

<br>

## 🔍 Table of Contents

- [Features](#features)
- [Implementation Details](#implementation-details)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [About the Developer](#about-the-developer)

<br>

## 🚀 Features

- Secure authentication (Google, Email/Password, email verification)
- Personalized dashboard with sidebar navigation
- Create, view, and filter referral requests
- Employee view for handling incoming requests
- Profile management (update info, delete account)
- Responsive, modern UI

<br>

## 🛠️ Implementation Details

### Frontend
- **React + Vite** for fast, modular development and hot reloading.
- **Tailwind CSS** for consistent, utility-first styling.
- **Firebase JS SDK** handles authentication (Google, Email/Password), email verification, and token management.
- **React Context** manages global auth state and user info.
- **Axios** is used for API requests to the backend, always sending the Firebase ID token for secure endpoints.
- **Routing**: React Router for navigation between landing, auth, dashboard, and profile pages.
- **Dashboard**: Sidebar navigation, profile section, referral requests (create/view/filter), and employee view (accept/reject requests).
- **Profile Management**: Users can update their name, LinkedIn, GitHub, and profile picture. Email is shown but not editable. Account deletion is available with confirmation.

### Backend
- **Spring Boot** REST API with layered architecture (controllers, services, models, DTOs).
- **MySQL** for persistent storage of users and referral requests.
- **Firebase Admin SDK** for verifying ID tokens, managing users, and enforcing email verification.
- **Authentication Flow**:
  - Every protected endpoint requires a valid Firebase ID token (sent as Bearer token).
  - On login/signup, the backend checks if the user exists (by Firebase UID); if not, creates a new user.
  - For email/password, backend checks `email_verified` claim and blocks access if not verified.
- **Referral Logic**:
  - Users can create referral requests to employees (must specify job, company, etc.).
  - Employees can view, accept, or reject incoming requests. If company is not set, they are prompted to add it.
  - Requests are filterable by status (pending, accepted, rejected, successful).
- **Profile & Account**:
  - Users can update their profile (except email).
  - Account deletion removes user from both database and Firebase.
- **Security**:
  - Role-based access (user/admin) enforced on sensitive endpoints.
  - Only self or admin can access/update/delete a user profile.

<br>

## 🧰 Tech Stack

| Layer       | Technology |
|-------------|------------|
| **Frontend**  | React, Tailwind CSS, Vite |
| **Backend**   | Java, Spring Boot, REST APIs |
| **Database**  | MySQL (Hosted on Railway) |
| **Authentication** | Firebase (Google + Email/Password) |
| **Deployment** | Vercel (frontend), Render/Railway (backend) |

<br>

## 📷 Screenshots

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e42311d7-6583-4e05-a33a-7656d995df8e" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7c597deb-5e24-4fa4-9daf-36008826e969" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2c9045e6-64cf-444f-bc61-8595a0e0c68f" />


<br>

## 📁 Project Structure

```
get-referred/
├── backend/         # Spring Boot backend (Java, REST API, MySQL)
│   ├── src/main/java/com/get/referred/referralplatform/
│   │   ├── controller/   # API controllers
│   │   ├── service/      # Business logic
│   │   ├── model/        # Data models (User, ReferralRequest)
│   │   └── ...
│   ├── src/main/resources/ # application.properties, configs
│   └── pom.xml           # Maven config
├── frontend/        # React frontend (Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main pages (Dashboard, Landing, Auth)
│   │   ├── contexts/     # React context (Auth)
│   │   └── ...
│   ├── package.json      # Frontend dependencies
│   └── ...
└── README.md        # Project documentation
```

<br>

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+), npm
- Java 17+, Maven
- MySQL database
- Firebase project (for auth)

### 1. Clone the repository
```sh
git clone https://github.com/yourusername/get-referred.git
cd get-referred
```

### 2. Setup Backend
```sh
cd backend
# Configure application.properties for MySQL and Firebase
./mvnw spring-boot:run
```

### 3. Setup Frontend
```sh
cd frontend
npm install
npm run dev
```

<br>

## 📚 API Overview

| Endpoint                | Method | Auth | Description                       |
|------------------------|--------|------|-----------------------------------|
| /api/auth/google       | POST   | No   | Google sign in/up                 |
| /api/auth/email        | POST   | No   | Email/password sign in/up         |
| /api/users/me          | GET    | Yes  | Get current user profile          |
| /api/users/me          | DELETE | Yes  | Delete own account                |
| /api/users/{id}        | GET    | Yes  | Get user profile (self/admin)     |
| /api/users/{id}        | PUT    | Yes  | Update profile (self/admin)       |
| /api/referral-requests | POST   | Yes  | Create referral request           |
| /api/referral-requests | GET    | Yes  | List referral requests            |

<br>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please open an issue or submit a pull request.

<br>

## 👨‍💻 About the Developer

Built by Arpit Yadav. Connect on [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)

