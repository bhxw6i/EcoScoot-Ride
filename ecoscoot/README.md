# 🛴 EcoScoot Backend

> **Sustainable Urban Mobility** - Java Spring Boot backend for the EcoScoot scooter rental application

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=for-the-badge&logo=spring-boot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?style=for-the-badge&logo=apache-maven)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Building & Running](#building--running)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Project Structure](#project-structure)

---

## ✨ Features

- 🔐 JWT-based authentication and authorization
- 👤 Role-based access control (User, Admin, Staff)
- 🚲 Scooter inventory management
- 📅 Booking and reservation system
- 💳 Payment processing integration
- 📊 Analytics and reporting
- 🔄 Real-time status updates
- 🛡️ Spring Security with OAuth2 support

---

## 🛠️ Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 | Programming Language |
| **Spring Boot** | 3.2.0 | Application Framework |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | ORM & Database Access |
| **PostgreSQL** | 15+ | Primary Database |
| **Maven** | 3.9+ | Build & Dependency Management |
| **JWT** | - | Token-based Authentication |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **JDK 17** or higher ([Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html))
- ✅ **Maven 3.9+** ([Download](https://maven.apache.org/download.cgi))
- ✅ **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- ✅ **Git** ([Download](https://git-scm.com/))

---

## 🚀 Getting Started

### 1. Database Setup

Create and initialize the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE ecoscoot;

# Connect to the new database
\c ecoscoot

# Run schema migrations (if available)
# \i path/to/schema.sql
```

### 2. Clone the Repository

```bash
git clone <repository-url>
cd ecoscoot
```

---

## ⚙️ Configuration

### Database Connection

Update the configuration in `src/main/resources/application.properties`:

```properties
# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/ecoscoot
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
server.servlet.context-path=/api

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
```

### Environment Variables (Optional)

Create a `.env` file for sensitive data:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/ecoscoot
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

---

## 🔨 Building & Running

### Build the Project

```bash
# Clean build
mvn clean install

# Build without running tests
mvn clean install -DskipTests

# Build and run
mvn clean install spring-boot:run
```

### Run the Application

**Option 1: Using Maven**
```bash
mvn spring-boot:run
```

**Option 2: Using JAR**
```bash
java -jar target/ecoscoot-*.jar
```

**Option 3: From IDE**
- Open the project in IntelliJ IDEA or Eclipse
- Run the `EcoScootApplication` class directly

### Access the Application

- 🌐 **Server**: http://localhost:8080
- 📚 **Swagger UI**: http://localhost:8080/swagger-ui.html (if enabled)

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/signin` | Sign in with email and password | ❌ No |
| `POST` | `/api/auth/signup` | Create new user account | ❌ No |
| `POST` | `/api/auth/refresh` | Refresh JWT token | ✅ Yes |
| `POST` | `/api/auth/logout` | Logout user | ✅ Yes |

### User Profiles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------|
| `GET` | `/api/profiles/me` | Get current user profile | ✅ Yes |
| `GET` | `/api/profiles/{id}` | Get user profile by ID | ✅ Yes |
| `GET` | `/api/profiles` | Get all profiles | ✅ Yes (Admin/Staff) |
| `PUT` | `/api/profiles/{id}` | Update user profile | ✅ Yes |
| `DELETE` | `/api/profiles/{id}` | Delete user profile | ✅ Yes (Admin) |

### Scooters

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------|
| `GET` | `/api/scooters` | Get all available scooters | ❌ No |
| `GET` | `/api/scooters/{id}` | Get scooter details | ❌ No |
| `POST` | `/api/scooters` | Create new scooter | ✅ Yes (Admin) |
| `PUT` | `/api/scooters/{id}` | Update scooter | ✅ Yes (Admin) |

### Bookings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------|
| `GET` | `/api/bookings` | Get user bookings | ✅ Yes |
| `POST` | `/api/bookings` | Create new booking | ✅ Yes |
| `GET` | `/api/bookings/{id}` | Get booking details | ✅ Yes |
| `PUT` | `/api/bookings/{id}` | Update booking | ✅ Yes |
| `DELETE` | `/api/bookings/{id}` | Cancel booking | ✅ Yes |

### Example Request

```bash
# Get user profile with JWT token
curl -X GET "http://localhost:8080/api/profiles/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔐 Security

### JWT Authentication

The application uses JWT (JSON Web Token) for stateless authentication:

**Token Structure:**
```
Authorization: Bearer <jwt_token>
```

**Token Claims:**
- `sub` - User ID (Subject)
- `email` - User email
- `role` - User role (USER, ADMIN, STAFF)
- `iat` - Issued at
- `exp` - Expiration time

### Security Features

- ✅ Password encryption with BCrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ SQL injection prevention via JPA
- ✅ HTTPS-ready configuration

### Adding JWT Token to Requests

```bash
# Example: Using curl
curl -X GET "http://localhost:8080/api/profiles/me" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json"
```

---

## 📁 Project Structure

```
ecoscoot/
├── src/
│   ├── main/
│   │   ├── java/com/ecoscoot/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST API controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # Database access
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── security/        # Security & JWT
│   │   │   └── exception/       # Custom exceptions
│   │   └── resources/
│   │       └── application.properties
│   └── test/                    # Unit & integration tests
├── pom.xml                      # Maven configuration
└── README.md                    # This file
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Support

For issues, questions, or suggestions:
- 📌 Create an [Issue](https://github.com/your-repo/issues)
- 💬 Contact the development team

---

<div align="center">

**Made with ❤️ for sustainable urban mobility**

[![Built with Spring Boot](https://img.shields.io/badge/Built%20with-Spring%20Boot-6DB33F?style=flat&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Database PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)

</div>
