# Public Service Request System

## 1. Project Overview

The Public Service Request System is a web application that allows citizens to submit public service requests and track their progress. Administrators can view submitted requests and update their statuses.

## 2. Objectives

- Enable citizens to register and log in.
- Allow citizens to submit service requests.
- Display submitted requests and their current statuses.
- Allow administrators to manage request statuses.
- Provide summary statistics for service requests.

## 3. Key Features

### Citizen Features
- Citizen registration and login.
- Submit requests with a title, category, location, and description.
- View submitted requests and their statuses.
- Track status changes made by administrators.

### Administrator Features
- Access the administrator dashboard.
- View service requests.
- View request statistics.
- Update requests to Pending, In Progress, or Resolved.

## 4. Technologies Used

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Java, Spring Boot
- **Database:** PostgreSQL
- **Build Tool:** Maven
- **API Communication:** REST API

## 5. System Requirements

- Java 21
- Node.js and npm
- PostgreSQL
- Maven
- A modern web browser

## 6. How to Run the Application

### Backend
1. Start PostgreSQL and ensure the project database is available.
2. Configure the database connection in `src/main/resources/application.properties`.
3. Open a terminal in the backend project directory.
4. Run:

```bash
mvn spring-boot:run
```

The backend runs at `http://localhost:8080`.

### Frontend
1. Open a separate terminal in the `frontend` directory.
2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 7. Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend availability |
| POST | `/api/auth/register` | Register a citizen |
| POST | `/api/auth/login` | Log in |
| GET | `/api/requests` | Retrieve service requests |
| POST | `/api/requests` | Submit a service request |
| PATCH | `/api/requests/{id}/status` | Update request status |

## 8. Request Statuses

- **Pending:** The request has been submitted and is awaiting action.
- **In Progress:** Work on the request has started.
- **Resolved:** The request has been resolved.

## 9. Testing Summary

The following end-to-end workflow tests were completed successfully:

1. Citizen login.
2. Service request submission.
3. Administrator login.
4. Administrator status update.
5. Citizen viewing the updated request status.

Additional validation checks can be performed before final submission.

## 10. Conclusion

The Public Service Request System provides a basic platform for citizens to report public service issues and track their progress, while administrators can manage requests through a dedicated dashboard.
