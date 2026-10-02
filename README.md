# 🛴 EcoScoot - Full-Stack Scooter Rental System

> **Sustainable Urban Mobility** - Full-stack scooter rental web application with React (Frontend), Java Spring Boot (Backend), and Supabase (PostgreSQL Database).

---

## 📁 Repository Structure

- **[`ecoscootmain`](./ecoscootmain)**: React + Vite + Tailwind CSS Frontend (Deployed on Netlify).
- **[`ecoscoot`](./ecoscoot)**: Java 17 + Spring Boot 3.2 Backend (Deployed on Render/Railway via Docker).

---

## ⚙️ Environment Variables

### Backend Environment Variables (Render / Cloud Host)

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Database User | `postgres.wuefnsfzyneciyaucwrq` |
| `SPRING_DATASOURCE_PASSWORD` | Database Password | `ecoscoot@123` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Hibernate Schema Strategy | `update` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `ecoscoot_secret_key_should_be_very_long_and_secure_in_production` |
| `PORT` | Web server port | `8080` |

### Frontend Environment Variables (Netlify)

| Variable | Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | URL of deployed Spring Boot backend (e.g., `https://ecoscoot-backend.onrender.com`) |
| `VITE_SUPABASE_URL` | Supabase Project URL (`https://wuefnsfzyneciyaucwrq.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase Publishable / Anon Key |

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Render / Docker)

1. Push this repository to GitHub.
2. Log into [Render.com](https://render.com) and create a **Web Service**.
3. Connect your GitHub repository (`bhxw6i/EcoScoot-Ride`).
4. Set **Environment** to `Docker` (it will automatically pick up the root [`Dockerfile`](./Dockerfile)).
5. Configure the Environment Variables listed in the table above.
6. Click **Deploy Web Service**.

### 2. Frontend Deployment (Netlify)

1. Connect `bhxw6i/EcoScoot-Ride` to Netlify.
2. Set **Base directory** to `ecoscootmain`.
3. Set **Build command** to `npm run build` (or `bun run build`).
4. Set **Publish directory** to `ecoscootmain/dist`.
5. Set `VITE_API_BASE_URL` in Netlify Site Settings to point to your deployed Render backend URL.

---

## ✅ Post-Deployment Checklist

1. **Verify Database Connection**: Ensure Spring Boot logs show successful database initialization without `PSQLException`.
2. **Configure CORS**: Ensure your Spring Boot backend's `CorsConfiguration` allows requests from your Netlify domain.
3. **Test API Endpoints**: Test endpoints like `/api/auth/signin` or `/api/scooters` using your deployed backend URL.
