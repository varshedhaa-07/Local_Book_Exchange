# Local Book Exchange Platform

Full-stack MERN application for exchanging physical books with nearby readers instead of buying new ones.

## Tech Stack

- Frontend: React, React Router, Axios, Tailwind CSS, Vite
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT login and signup

## Folder Structure

```text
book-exchange-frontend/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
    .env.example
  public/
  src/
    api/
    components/
    context/
    hooks/
    layouts/
    pages/
    utils/
    App.jsx
    index.css
    main.jsx
  .env.example
  tailwind.config.js
  postcss.config.js
```

## Features

- JWT-based signup and login
- Book listings with add, browse, filter, update, and delete
- Profile page with your books
- Trade request workflow with two-way approval
- Match suggestions for reciprocal book interest
- Polling chat after accepted trades
- Environment-based API configuration
- Loading states and reusable UI components

## Environment Files

Create these files before running:

Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Backend `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/local-book-exchange
JWT_SECRET=replace_this_with_a_secure_secret
CLIENT_URL=http://localhost:5173
```

MongoDB can run locally at `localhost:27017`.

## Run the Project

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally.

3. Copy `.env.example` to `.env` and `backend/.env.example` to `backend/.env`.

4. Run frontend and backend together:

```bash
npm run dev
```

5. Open `http://localhost:5173`.

## API Endpoints

Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Books

- `POST /api/books`
- `GET /api/books`
- `GET /api/books/:id`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`

Trade Requests

- `POST /api/trade/request`
- `PUT /api/trade/respond`
- `GET /api/trade/user`

Matches

- `GET /api/matches`

Chat

- `POST /api/chat/send`
- `GET /api/chat/:userId`
