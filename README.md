# 🚀 Resource Booking API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📖 Introduction

Welcome to the **Resource Booking API**! This project is a robust, high-performance backend application built with [NestJS](https://nestjs.com/). It is designed as a practical implementation playground to test **concurrency patterns**, secured by **JWT-based Basic Authentication** and **Role-Based Access Control (RBAC)**.

Whether you're looking to understand how to handle race conditions in booking systems or how to implement secure, scalable APIs, this project serves as a comprehensive example.

## ✨ Key Features

-   **🔒 Secure Authentication**: Robust user authentication using **JWT (JSON Web Tokens)** and **Argon2** hashing.
-   **🛡️ Role-Based Access Control (RBAC)**: Granular permission management with **Admin** and **User** roles.
-   **⚡ Concurrency Testing**: Specialized logic to handle simultaneous booking requests, preventing double-bookings and race conditions.
-   **📦 Resource Management**: Full CRUD capabilities for managing creating, updating, and deleting resources.
-   **📅 Booking System**: Intelligent booking lifecycle management with status tracking (Pending, Confirmed, Cancelled).
-   **📄 API Documentation**: Integrated **Swagger/OpenAPI** for interactive API exploration and testing.

## 🛠️ Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Documentation**: [Swagger](https://swagger.io/)
-   **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

-   Node.js (v18+)
-   pnpm
-   PostgreSQL

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/resource-booking-api.git
    cd resource-booking-api
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and configure your environment variables:
    ```env
    DATABASE_URL="postgres://[username]:[password]@localhost:5432/resource-booking"
    ADMIN_EMAIL="admin@gmail.com"
    ADMIN_PASSWORD="Admin123!"
    JWT_SECRET="your_super_secret_key"
    ```

4.  **Database Migration**
    Run the migrations to set up your database schema:
    ```bash
    pnpm prisma migrate dev
    ```

5.  **Start the Server**
    ```bash
    # development mode
    pnpm run start:dev
    ```

    The API will be available at `http://localhost:3000/api`.

## 📚 API Documentation

Interactive API documentation is available via Swagger UI.

👉 **[Explore API Docs](http://localhost:3000/api/docs)**

## 🧪 Running Tests

Ensure the system allows for safe concurrency by running the test suite.

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is [MIT licensed](LICENSE).
