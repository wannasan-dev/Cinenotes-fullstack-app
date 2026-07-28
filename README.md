# CineNotes 🎬

A modern, full-stack media tracking and management platform built to help users curate watchlists, log personal analytical notes, and track series or movies in real-time. 

> **Project Status:** Active MVP Development 🚀

### 🛠️ Architecture & Tech Stack
* **Backend:** Java, Spring Boot, Spring Data JPA, Spring Security
* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Database:** MySQL

### 🎯 Key Features Under Development
* **Modular Backend Architecture:** Refactored legacy code into a highly scalable, entity-based relational database structure to ensure minimized API latency.
* **User Authentication:** Secure user profiles with custom role layouts for managing personal tracking histories.
* **Media Watchlists:** Dynamic personal logs where users can save, rate, and append detailed analytical notes to tracked titles.

### 💾 Local Deployment Setup

#### Backend Setup (Spring Boot)
1. Ensure you have Java 17+ and Maven installed.
2. Configure your MySQL database settings in `src/main/resources/application.properties`.
3. Run the application:
```bash
mvn spring-boot:run
```

#### Frontend Setup (Next.js)
1. Navigate to the frontend directory.
2. Install dependencies and start the local development server:
```bash
npm install
npm run dev
```
