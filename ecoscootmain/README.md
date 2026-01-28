# 🛴 EcoScoot Frontend

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)

A modern, responsive web application for the EcoScoot electric scooter rental platform. Built with React, TypeScript, and Vite, providing users with an intuitive interface to book scooters, manage rides, and track payments.

> **Sustainable Urban Mobility** | Modern Design | Secure & Fast

## � Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Authentication](#-authentication)
- [Pages & Routes](#-pages--routes)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Backend Setup](#-backend-setup)
- [Contributing](#-contributing)

## �🚀 Features

- ✅ **User Authentication**: Secure sign-up and sign-in with JWT-based authentication
- 🛴 **Scooter Booking**: Browse and book available scooters with real-time availability
- 📍 **Ride Management**: View active rides, ride history, and cancel bookings
- 💳 **Payment System**: View payment history and manage billing information
- 🗺️ **Interactive Maps**: Charging station and scooter location maps
- 📊 **Admin Dashboard**: Comprehensive admin panel for managing users, vehicles, payments, and analytics
- 👨‍💼 **Staff Tools**: Charging management, low battery scooters, and booking oversight
- 🌓 **Dark Mode Support**: Theme toggle for comfortable viewing in any lighting
- 📱 **Responsive Design**: Mobile-first design using Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| ![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white) | UI Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white) | Type Safety |
| ![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white) | Build Tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-06B6D4?logo=tailwindcss&logoColor=white) | Styling |
| **shadcn/ui** | Component Library |
| **Radix UI** | Component Primitives |
| **React Hook Form** | Form Management |
| **Zod** | Schema Validation |
| **TanStack React Query** | Data Fetching |
| **Axios** | HTTP Client |
| **Recharts** | Data Visualization |
| **Leaflet Maps** | Interactive Maps |

### Backend & Database

| Technology | Purpose |
|-----------|---------|
| ![Java](https://img.shields.io/badge/Java-17+-ED8B00?logo=java&logoColor=white) | Backend Language |
| ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-6DB33F?logo=springboot&logoColor=white) | Framework |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white) | Database |
| **Spring Security** | Authentication & Authorization |
| **Spring Data JPA** | Database Abstraction |
| **Maven** | Build Tool |

## 📋 Prerequisites

- ✔️ Node.js (v18 or higher)
- ✔️ Bun (package manager) or npm/yarn
- ✔️ Backend API running (see Backend Setup section)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecoscootmain
```

2. Install dependencies:
```bash
bun install
# or npm install / yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_API_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080/api
```

### Development Server

Start the development server:
```bash
bun run dev
# or npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
bun run build
# or npm run build
```

Preview the production build:
```bash
bun run preview
# or npm run preview
```

### Linting

Check code quality:
```bash
bun run lint
# or npm run lint
```

## 📁 Project Structure

```
ecoscootmain/
├── src/
│   ├── components/              # Reusable React components
│   │   ├── admin/              # Admin dashboard components
│   │   ├── auth/               # Authentication components
│   │   ├── staff/              # Staff management components
│   │   └── ui/                 # UI components (shadcn/ui)
│   ├── pages/                  # Page components
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/           # External service integrations
│   ├── api/                    # API client configurations
│   ├── utils/                  # Utility functions
│   ├── lib/                    # Library utilities
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Application entry point
├── public/                     # Static assets
├── dist/                       # Production build
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies & scripts
```

## 🔐 Authentication

The application uses JWT-based authentication with the backend API. 

- 🔒 User credentials are validated against the Spring Boot backend
- 🎫 JWT tokens are stored securely and included in API requests
- 👥 Role-based access control (User, Admin, Staff) restricts feature access
- 🚪 Protected routes ensure only authenticated users can access sensitive pages

## 🗺️ Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with features, testimonials, and CTA |
| Booking | `/booking` | Scooter booking interface |
| Customer Dashboard | `/dashboard` | User bookings, rides, and profile |
| Rides | `/rides` | Detailed ride history and management |
| Vehicles | `/vehicles` | Available scooters and details |
| Profile | `/profile` | User profile and settings |
| Admin Dashboard | `/admin` | Analytics, user management, vehicle management |
| Staff Dashboard | `/staff` | Booking management, charging oversight |

## 🔄 API Integration

The frontend communicates with a Java Spring Boot backend API running on `http://localhost:8080`. 

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/users/*` | GET/PUT | User management |
| `/api/bookings/*` | GET/POST/DELETE | Booking operations |
| `/api/payments/*` | GET/POST | Payment tracking |
| `/api/vehicles/*` | GET | Vehicle information |
| `/api/stations/*` | GET | Charging station data |

## 🚀 Deployment

### Build Output

The production build is generated in the `dist/` directory and can be deployed to any static hosting service:

- 🔵 **Vercel** - Recommended for React apps
- 🔷 **Netlify** - Easy GitHub integration
- ☁️ **AWS S3 + CloudFront** - Scalable solution
- 🐙 **GitHub Pages** - Free hosting
- 🌐 **Any web server** - Traditional deployment

### Environment Configuration

Ensure the `VITE_API_URL` environment variable is correctly set to point to your backend API in the deployment environment.

```bash
# Example for production
export VITE_API_URL=https://api.ecoscoot.com
export VITE_API_BASE_URL=https://api.ecoscoot.com/api
```

## 📦 Backend Setup

The backend is a **separate Java Spring Boot application**. To run the full application:

1. ✔️ Clone and setup the backend repository (Java/PostgreSQL)
2. ✔️ Configure the database connection in `application.properties`
3. ✔️ Run the backend on port 8080
4. ✔️ Start the frontend development server as described above

For detailed backend setup instructions, refer to the backend repository's README.

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes before submitting PR
- Keep components small and reusable
- Document complex logic

## 📄 License

This project is part of the EcoScoot platform and is licensed under the MIT License.

## 🙋 Support

For issues, questions, or suggestions:

- 📧 Email the development team
- 🐛 Open an issue on GitHub
- 💬 Join our discussion forums

---

<div align="center">

**Made with ❤️ by the EcoScoot Team**

⭐ If you find this project helpful, please give it a star!

</div>

## API Endpoints

### Authentication
- POST `/api/auth/signin` - Sign in with email and password

### Profiles
- GET `/api/profiles/me` - Get current user profile
- GET `/api/profiles/{id}` - Get user profile by ID
- GET `/api/profiles` - Get all profiles (admin/staff only)

## Security

The application uses JWT (JSON Web Token) for authentication. To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```
