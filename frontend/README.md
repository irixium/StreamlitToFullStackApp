# Tech Stocks Analytics Frontend

## Description
A modern React application built with TypeScript, Vite, and Tailwind CSS. It provides an interactive dashboard for visualizing tech stock technicals, comparative performance, and quantitative risk metrics using Vega-Lite.

## Key Features
- **Interactive Technical Charts:** Candlestick charts with SMA and Bollinger Band overlays.
- **Comparative Analysis:** Normalized cumulative returns, correlation heatmaps, and risk-return scatter plots.
- **Quant Analytics:** Return distribution with normal fitting, Value at Risk (VaR) calculation, and Monte Carlo price simulations.
- **Responsive Design:** A polished dark-themed dashboard with purple accents.

## Tech Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Visualizations:** Vega-Lite (via `react-vega`)
- **Icons:** Lucide React
- **API Client:** Axios

## Project Structure
- `src/api/`: Typed API client for backend communication.
- `src/components/`: Reusable UI components (Sidebar, MetricCard, ChartContainer).
- `src/types/`: TypeScript interfaces mirroring backend schemas.
- `src/App.tsx`: Main application logic and visualization specifications.

## Installation & Running
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the browser at `http://localhost:5173`
