# AgriTech Farming Dashboard

An intelligent crop recommendation system featuring a modern, responsive Next.js frontend and a FastAPI backend.

## Project Structure

- `frontend/` - Next.js 14 application with Tailwind CSS and Recharts.
- `backend/` - FastAPI backend for machine learning crop prediction.

## Prerequisites

- Node.js (v18 or higher)
- Python (3.8 or higher)

## Getting Started

### 1. Start the Backend

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The FastAPI server will run at `http://localhost:8000`.

### 2. Start the Frontend

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```
The Next.js dashboard will be available at `http://localhost:3000`.

## Features

- **Crop Recommendation**: Receive AI-based recommendations tailored to soil and weather data (N, P, K, temperature, humidity, pH, rainfall).
- **Modern Dashboard UI**: Clean, responsive, and intuitive interface built with Tailwind CSS.
- **Data Visualization**: Real-time mock sensor data visualization.

