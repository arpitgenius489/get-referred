# Get Referred Backend

A minimal, professional Spring Boot backend for the "Get Referred" job referral platform.

## 🚀 Features
- Firebase authentication (Google & Email/Password)
- MySQL database (hosted on Railway)
- User profile management (CRUD)
- Referral request management
- Role-based access control
- Consistent API responses (DTOs + ApiResponse)
- Centralized exception handling
- Swagger/OpenAPI documentation

## 🛠️ Tech Stack
- Java 17+
- Spring Boot
- Spring Security
- MySQL
- Firebase Admin SDK
- Springdoc OpenAPI (Swagger)
- JUnit 5, Mockito (for tests)

## ⚡ Quick Start
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd Backend
   ```
2. **Configure environment:**
   - Set up your `application.properties` with MySQL and Firebase credentials.
3. **Build & run:**
   ```bash
   ./mvnw spring-boot:run
   ```
4. **API Docs:**
   - Visit [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) for interactive API documentation.

## 📦 Main API Endpoints
| Endpoint                        | Method | Description                        |
|---------------------------------|--------|------------------------------------|
| `/api/auth/google`              | POST   | Google sign-in/sign-up             |
| `/api/auth/email`               | POST   | Email/password sign-in/sign-up     |
| `/api/users/me`                 | GET    | Get current user's profile         |
| `/api/users/me`                 | DELETE | Delete current user's account      |
| `/api/users/{id}`               | GET    | Get user by ID (self/admin)        |
| `/api/users/{id}`               | PUT    | Update user by ID (self/admin)     |
| `/api/users/employees`          | GET    | List all users (admin only)        |
| `/api/referral-requests`        | POST   | Create referral request            |
| `/api/referral-requests/{id}`   | GET    | Get referral request by ID         |
| `/api/referral-requests/my-requests` | GET | Get my referral requests           |
| `/api/referral-requests/received-requests` | GET | Get received requests         |
| `/api/referral-requests/{id}/status` | PUT | Update referral request status     |
| `/api/referral-requests/{id}/rating` | PUT | Add rating to referral request     |
| `/api/referral-requests/pending` | GET   | Get pending referral requests      |
| `/api/referral-requests/hired`   | GET   | Get hired referral requests        |

## 🔒 Security
- All protected endpoints require a valid Firebase ID token (Bearer token).
- Email verification enforced for sensitive actions.
- Role-based access control for admin/employee/job seeker actions.

## 🧪 Test Strategy
- Unit tests use JUnit 5 and Mockito.
- Service layer is tested in isolation (mocking repositories and Firebase).
- Example test classes: `UserServiceTest`, `AuthServiceTest` (see `/src/test/java/...`).

## 💡 Contributing
- Keep code simple, clean, and minimal.
- Use DTOs and ApiResponse for all API responses.
- Document new endpoints in Swagger.

---

**Impress recruiters with a clean, modern, and professional backend!** 