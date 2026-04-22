# 🧠 Mind Tracking — Emotional Wellness Journal

A full-stack mental wellness application that analyzes private journal entries using NLP sentiment analysis to track emotional patterns, mood trends, and wellness risk over time.


---

## 💡 What It Does

Users write private journal entries through a React dashboard. Each entry is analyzed in real-time using a HuggingFace transformer model to produce an emotional score. A multi-signal analytics engine then tracks trends, volatility, and rolling averages — combining them into a single wellness risk indicator with human-readable feedback.

---

## ✨ Features

- 📝 Private journal entry system with JWT-authenticated user isolation
- 🤗 Real-time sentiment analysis using HuggingFace Transformers
- 📊 7-day rolling averages, emotional volatility tracking, score distribution
- 🚨 Composite wellness risk classifier with supportive feedback messages
- 🔐 JWT auth with protected routes and Axios interceptors for token injection
- 📈 Mood visualization with Recharts on a React dashboard

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Backend | Django 4.2, Django REST Framework, Celery |
| NLP / AI | HuggingFace Transformers, PyTorch |
| Frontend | React 19, React Router, Recharts, TailwindCSS |
| Auth | JWT (token-based) |
| API | Axios with interceptors |
| Database | SQLite (dev) / PostgreSQL (prod) |

---

## ⚙️ Run Locally

```bash
# Clone the repo
git clone https://github.com/KANISHKAprabha/Mind-Tracking-Application-Using-Journal-Entries.git
cd Mind-Tracking-Application-Using-Journal-Entries

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT token |
| POST | `/api/journal/` | Create journal entry + trigger analysis |
| GET | `/api/journal/` | Fetch all entries for current user |
| GET | `/api/analytics/` | Fetch mood trends, volatility, risk score |

---

## 🏗️ Architecture Decisions

- **Service-layer pattern** — business logic separated from Django views for testability
- **User data isolation** — every query scoped to `request.user`, no cross-user data leakage
- **Async-ready** — Celery integrated for offloading heavy HuggingFace inference from request cycle


---

## 👩‍💻 Author

**Kanishka Prabha M**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/kanishka06/)
[![GitHub](https://img.shields.io/badge/GitHub-black?style=flat&logo=github)](https://github.com/KANISHKAprabha)
