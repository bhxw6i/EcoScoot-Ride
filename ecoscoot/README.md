
# EcoScoot Backend

Java Spring Boot backend for the EcoScoot scooter rental application.

## Technologies

- Java 17
- Spring Boot 3.2.0
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Maven

## Getting Started

### Prerequisites

- JDK 17 or higher
- Maven
- PostgreSQL database

### Database Setup

1. Create a PostgreSQL database named `ecoscoot`
2. The application will use the existing tables from your Supabase export

### Configuration

Update the database connection settings in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ecoscoot
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Building and Running

1. Build the project using Maven:
```
mvn clean install
```

2. Run the application:
```
mvn spring-boot:run
```

Or run it from your IDE by opening the project and running the `EcoScootApplication` class.

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
