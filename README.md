# 🦏 EcoGuard — AI-Powered Wildlife Monitoring System

EcoGuard is an intelligent wildlife monitoring system designed to **detect poachers** and **track animal movements**.  
It uses **XGBoost** for behavioral prediction and **PyTorch** for image classification, integrated into a **Django backend** and **React frontend** dashboard.

---

## 🌍 Project Overview

EcoGuard’s goal is to assist game park rangers in monitoring wildlife and detecting possible poaching activities.  
It continuously analyzes animal movement data and, when a suspicious pattern (potential poacher) is detected, automatically triggers camera traps for image classification.

### 🎯 Key Features
- 🐘 Animal tracking (elephants, rhinos, etc.)
- 🚨 Poacher detection using machine learning (XGBoost + PyTorch)
- 🗺️ Live map dashboard that updates every 60 seconds
- 📸 Camera trap image classification (Poacher / Elephant / Rhino)
- 📊 Admin dashboard built with React
- 🧩 RESTful APIs for model results (`/api/xgb-results/` and `/api/image-results/`)

---

## 🧠 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React (JavaScript, Leaflet.js for maps) |
| **Backend** | Django (Python) |
| **ML Models** | PyTorch (Image Classification), XGBoost (Movement Prediction) |
| **Database** | SQLite (local demo) |
| **Runtime** | Python 3.10+, Node.js 18+ |

---

## ⚙️ Setup Instructions

### 🖥️ Backend (Django + Model Processing)

#### 1. Navigate to backend folder:
```bash
cd backend
