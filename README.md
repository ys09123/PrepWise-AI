# 🎯 PrepWise AI

A full-stack web application that helps job seekers practice technical interviews with **AI-powered personalized questions and real-time feedback**.

---

## ✨ Features

### 🔹 Core Functionality

- 🔐 **User Authentication** – Secure sign-up and login using Supabase Auth  
- 📄 **Resume Upload & Parsing** – Upload PDF/DOCX/TXT resumes with AI-powered extraction  
- 🤖 **AI Question Generation** – Gemini AI generates personalized interview questions  
- 💬 **Interactive Interview** – Answer questions with real-time progress tracking  
- 📊 **AI Evaluation** – Feedback on clarity, technical depth, relevance, and confidence  
- 🎯 **Results Dashboard** – Scores, strengths, weaknesses, and suggestions  
- 📈 **Interview History** – Track progress across sessions  

---

### 🔹 Customization

- 🎯 Focus Areas: Technical / Behavioral / Mixed  
- ⚡ Difficulty Levels: Easy / Medium / Hard  
- 🧠 Personalized Questions based on resume  

---

## 🛠️ Tech Stack

### Frontend
- React 18
- TailwindCSS
- Axios

### Backend
- Node.js
- Express.js
- Supabase (Auth + PostgreSQL)
- Gemini AI
- Multer
- pdf-parse, mammoth

---

## 📦 Prerequisites

- Node.js (v18+)
- npm (v9+)
- Git

Accounts required:
- Supabase
- Google AI Studio

---

## 🚀 Installation

### 1. Clone repo
```bash
git clone https://github.com/ys09123/PrepWise-AI.git
cd PrepWise-AI

```

### 2. Backend Setup
```
cd backend
npm install
```

### 3. Frontend Setup
```
cd frontend
npm install
```

### 4. Backend .env
```
PORT=5000

SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

GEMINI_API_KEY=your-api-key
```

### 5. Frontend .env
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## ⭐ Authors
Yash Shaw,
Ankita Ghosh
