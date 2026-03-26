# Tech Stocks Analytics Backend

## Description
A FastAPI-based analytics server for historical tech stock data, technical indicators, and quantitative risk modeling. It extracts and provides data for front-end visualizations using `yfinance` and `pandas`.

## Endpoints

### `GET /api/tickers`
- **Description:** Returns the list of default tech stock tickers.
- **Response:** `List[str]`

### `POST /api/technicals`
- **Description:** Returns price action, technical metrics, and historical data for a primary asset.
- **Request Body:** `TechnicalsRequest`
  - `ticker`: str
  - `days`: int (default: 180)
- **Response:** `TechnicalsResponse`

### `POST /api/comparative`
- **Description:** Returns comparative analysis data for a list of selected tickers.
- **Request Body:** `ComparativeRequest`
  - `tickers`: List[str]
- **Response:** `ComparativeResponse` (Cumulative returns, Correlation matrix, Risk-return tradeoff)

### `POST /api/risk`
- **Description:** Returns statistical risk analysis for a primary asset.
- **Request Body:** `RiskRequest`
  - `ticker`: str
- **Response:** `RiskResponse` (Histogram, Normal fit, VaR, Monte Carlo simulations)

### `POST /api/refresh`
- **Description:** Triggers a fresh download of market data from Yahoo Finance.
- **Response:** `{"message": "Data refreshed successfully"}`

## Installation & Running
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
4. `pip install -r requirements.txt`
5. `python -m main` or `uvicorn main:app --reload`
