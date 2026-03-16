# TunisiCart 🛒

A multi-seller e-commerce REST API built with Spring Boot. Buyers can browse and purchase products, sellers manage their listings, and admins oversee the platform.

## Tech Stack

- **Java 22** + **Spring Boot 3.3.2**
- **Spring Security 6** with JWT authentication
- **Spring Data JPA** + **MySQL 8**
- **Stripe** for payment processing
- **Spring Mail** + **Thymeleaf** for email notifications
- **SpringDoc OpenAPI** (Swagger UI)
- **Docker Compose** for local infrastructure

## Features

- JWT-based authentication with email verification
- Role-based access control: `USER`, `SELLER`, `ADMIN`
- Product listings with categories, images, and reviews
- Shopping cart and purchase orders
- Stripe payment integration
- Seller dashboard (manage listings)
- Admin dashboard
- Activity history tracking

## Getting Started

### Prerequisites

- Java 22+
- Maven 3.8+
- Docker & Docker Compose

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/TunisiCart.git
   cd TunisiCart
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and fill in your values
   ```

3. **Start infrastructure (MySQL + MailDev)**
   ```bash
   docker compose up -d
   ```

4. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

5. **Open Swagger UI**
   ```
   http://localhost:8088/api/v1/swagger-ui.html
   ```

6. **Open MailDev (email testing)**
   ```
   http://localhost:1080
   ```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Description |
|---|---|
| `DB_URL` | JDBC URL for MySQL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRATION` | JWT token TTL in ms (default: 86400000 = 24h) |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL in ms (default: 604800000 = 7d) |
| `STRIPE_SECRET_KEY` | Stripe secret key from dashboard.stripe.com |
| `MAIL_HOST` | SMTP host |
| `FRONTEND_ACTIVATION_URL` | URL for email activation link |

## API Overview

| Base Path | Description | Auth |
|---|---|---|
| `POST /api/v1/auth/register` | Register new account | Public |
| `POST /api/v1/auth/authenticate` | Login | Public |
| `GET /api/v1/public/items` | Browse all products | Public |
| `GET /api/v1/public/items/search` | Search products | Public |
| `GET /api/v1/seller/items` | Manage seller listings | SELLER |
| `GET /api/v1/user/**` | User account actions | USER |
| `GET /api/v1/admin/**` | Admin operations | ADMIN |
| `POST /api/v1/payment/create-payment-intent` | Create Stripe payment | Auth |

Full docs available at `/api/v1/swagger-ui.html` when the app is running.

## Project Structure

```
src/main/java/com/AeiselDev/TunisiCart/
├── controllers/      REST controllers
├── services/         Business logic
├── repositories/     JPA repositories
├── entities/         JPA entities
├── security/         JWT + Spring Security config
├── common/           DTOs (request/response)
├── enums/            Enums (RoleType, DeliveryStatus…)
└── Configs/          Spring configuration beans
```

## License

MIT
