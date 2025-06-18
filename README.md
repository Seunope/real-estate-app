# ⚙️ React & Node.js Skill Test

## 📌 Task Overview

This test is designed to evaluate your coding ability through the experience of building the project from scratch and a basic RESTful feature using **React** and **Node.js**, with attention to code quality and best practices.

---

## ✅ Requirements

### 1. Successful authentication
- Set up the project independently and Ensure successful authentication.
- Implement and verify the **sign-in feature** using the credentials provided below:
  - **Email**: `admin@gmail.com`  
  - **Password**: `admin123`

### 2. "Meeting" Feature (CRUD via RESTful API)
- After successful sign-in, implement the **Meeting** functionality on both the **server** and **client** sides.
- Use a standard **RESTful API** approach.
- Focus on:
  - Code structure and maintainability
  - Clean and consistent code style
  - Optimization where applicable
- You may reference the structure or logic of other existing features within the project.


### Solution
- Server .env
NODE_ENV=development

DB =db_name
DB_URL=mongodb://127.0.0.1:27017

JWT_SECRET=jwt_secret
JWT_EXPIRATION=3d

- Client
REACT_APP_BASE_URL=http://localhost:5001/