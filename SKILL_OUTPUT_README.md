# Advanced Tech Stocks Analytics Dashboard

## Overview
A production-grade full-stack migration of the original Streamlit stocks analytics app. This version features a FastAPI backend for high-performance computation and a React (TypeScript) frontend for a polished, interactive dashboard experience.

## Key Features
- **Technical Analysis:** Deep dive into price action with SMA and Bollinger Band overlays.
- **Comparative Performance:** Analyze normalized cumulative returns and asset correlations.
- **Quantitative Risk Modeling:** Calculate Value at Risk (VaR) and run 30-day Monte Carlo price simulations.
- **Modern UI:** A clean, dark-themed interface with purple accents, optimized for data density.

## Project Structure
```
project-root/
├── backend/
│   ├── main.py              # FastAPI app and routes
│   ├── logic/               # Technical and risk analytics logic
│   ├── models/              # Pydantic request/response schemas
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed axios fetch calls
│   │   ├── components/      # Reusable React components
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Main dashboard logic and Vega-Lite specs
│   ├── package.json         # Node dependencies
│   └── tailwind.config.cjs  # Styling configuration
└── README.md                # This file
```

## Setup & Running

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- npm 9+

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL displayed in the terminal (usually `http://localhost:5173`).

## Data
The application uses historical stock data stored in `tech_stocks_data.csv`. Use the "Force Refresh" button in the dashboard to fetch the latest 3-year data from Yahoo Finance via the backend.
