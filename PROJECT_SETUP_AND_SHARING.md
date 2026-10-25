# GoalMind AI — Setup & Quickstart Guide

GoalMind AI is a full-stack personal goal achievement web application built with **Spring Boot 3.3.4 (Java 21)** and **React 18 (TypeScript + Vite + Tailwind CSS)**.

---

## 🚀 Quick Start (1-Click Run)

### Prerequisites
1. **Java 21 LTS** (`java --version`)
2. **Node.js 18+** (`node --version` and `npm --version`)
3. **MySQL 8.0** running locally on port `3306`
   - Default user: `root`
   - Default password: `25102C020014@` (or update in `backend/src/main/resources/application.properties`)
   - The database `goalmind_db` will be created automatically on startup.

### To Run on Windows
Simply double-click:
```cmd
start.bat
```
*(Or right-click `start.ps1` and choose "Run with PowerShell")*

The script will automatically:
1. Verify / install frontend dependencies (`npm install` on first run).
2. Launch the Spring Boot backend service on port `8080`.
3. Launch the React Vite development server on port `3000`.
4. Launch the Universal Gateway on port `80` & `5173`.
5. Connect your browser to the web app.

---

## 🌐 Accessing the Application

- **Web Application URL**: [http://localhost:3000](http://localhost:3000) (or [http://localhost](http://localhost))
- **Demo / Account Creation**:
  - The login and account creation features only require **Username** and **Password**.
  - Account creation requires a **unique username** and a **strong password** (8+ characters, uppercase, lowercase, number, and special character).
  - Click "Create Account" on the login screen to register your unique username and strong password.

---

## 📦 Project Structure

```
goalmind-ai/
├── backend/
│   ├── src/                    # Spring Boot 3.3.4 Source Code (Java 21)
│   ├── target/
│   │   └── goalmind-backend-1.0.0.jar  # Pre-compiled executable JAR
│   └── pom.xml                 # Maven Project Definition
├── frontend/
│   ├── src/                    # React 18 + TypeScript + Tailwind CSS UI
│   ├── public/                 # Static assets
│   ├── package.json            # Node dependencies & build scripts
│   ├── vite.config.ts          # Vite build config
│   └── tsconfig.json           # TypeScript configuration
├── gateway.js                  # Gateway proxying port 80 & 5173 to port 3000
├── docker-compose.yml          # Optional container configuration
├── start.bat                   # 1-Click Windows Batch launcher
├── start.ps1                   # Automated background launcher
└── README.md                   # Full architectural documentation
```

---

## 🛠 Manual Startup (Alternative)

If you prefer running services in separate terminal tabs:

### 1. Start Backend
```powershell
cd backend
java -jar target/goalmind-backend-1.0.0.jar
# Or build from source: mvn spring-boot:run
```

### 2. Start Frontend
```powershell
cd frontend
npm install
npm run dev
```

### 3. Start Gateway (Optional, for port 80/5173 forwarding)
```powershell
node gateway.js
```
Open **http://localhost:3000** in your browser.
