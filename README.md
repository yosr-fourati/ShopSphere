# ShopSphere 🛒

> A production-grade multi-seller e-commerce platform built with **Spring Boot 3**, **Angular 17**, **JWT**, and **Stripe**.

[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.2-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17-red?logo=angular)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://www.mysql.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet?logo=stripe)](https://stripe.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview

**ShopSphere** is a full-stack marketplace where buyers can discover and purchase products, sellers can manage their storefronts, and admins oversee the entire platform.

Designed with clean architecture, strong security, and scalability in mind — built by [Yosr Fourati](https://github.com/yosr-fourati), MS Software Engineering student at **Oakland University** (graduating April 2026).

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Angular 17 Frontend                 │
│           (Standalone Components · Tailwind CSS)      │
└────────────────────────┬─────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼─────────────────────────────┐
│              Spring Boot 3 REST API                   │
│        JWT Auth · Spring Security · Swagger UI        │
└──────┬──────────────────────┬────────────────────────┘
       │                      │
  ┌────▼────┐           ┌─────▼──────┐
  │ MySQL 8 │           │   Stripe   │
  │  (JPA)  │           │  Payments  │
  └─────────┘           └────────────┘
```

---

## Features

| Feature | Details |
|---|---|
| **Authentication** | JWT + refresh tokens, email verification flow |
| **Role-based access** | `USER` · `SELLER` · `ADMIN` with method-level security |
| **Product management** | CRUD listings, categories, image upload |
| **Shopping cart** | Add/update/remove items, persistent per user |
| **Orders** | Place orders, track delivery status |
| **Payments** | Stripe PaymentIntent integration |
| **Reviews** | Star ratings + comments per product |
| **Pagination** | All list endpoints paginated (default 20/page) |
| **Activity tracking** | View and purchase history per user |
| **Admin dashboard** | User/role/item management + system stats |
| **API Docs** | Interactive Swagger UI (OpenAPI 3) |

---

## Tech Stack

**Backend**
- Java 17 · Spring Boot 3.3.2
- Spring Security 6 · JWT (JJWT)
- Spring Data JPA · Hibernate · MySQL 8
- Stripe Java SDK
- SpringDoc OpenAPI (Swagger UI)
- Lombok · Docker Compose

**Frontend**
- Angular 17 (Standalone Components)
- Tailwind CSS · Angular Material
- RxJS · Angular Router · HTTP Client

---

## Getting Started

### Prerequisites
- Java 17+ · Maven
- Node.js 20+ · npm
- Docker & Docker Compose

### Backend Setup

```bash
git clone https://github.com/yosr-fourati/ShopSphere.git
cd ShopSphere
cp .env.example .env        # fill in your values
docker compose up -d        # start MySQL + MailDev
./mvnw spring-boot:run
```

- API: `http://localhost:8088/api/v1`
- Swagger UI: `http://localhost:8088/api/v1/swagger-ui.html`
- MailDev: `http://localhost:1080`

### Frontend Setup

```bash
cd frontend
npm install
ng serve
# App: http://localhost:4200
```

### Environment Variables

| Variable | Description |
|---|---|
| `JWT_SECRET` | Min 32-char secret (`openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY` | From [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | MySQL credentials |
| `MAIL_HOST` / `MAIL_PORT` | SMTP config |
| `FRONTEND_ACTIVATION_URL` | Email activation redirect URL |

---

## API Overview

| Group | Base Path | Auth Required |
|---|---|---|
| Authentication | `/auth/**` | No |
| Browse products | `/public/**` | No |
| User actions | `/user/**` | USER role |
| Seller dashboard | `/seller/**` | SELLER role |
| Admin panel | `/admin/**` | ADMIN role |
| Payments | `/payment/**` | Yes |

Full docs at `/api/v1/swagger-ui.html`

---

## Author

**Yosr Fourati** — MS Software Engineering · Oakland University · April 2026
[GitHub](https://github.com/yosr-fourati) · yosr.fourati@oakland.edu

---

## License

MIT © 2024–2026 Yosr Fourati
