from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from logic.data_manager import load_data, get_stock_data, compute_technicals, DEFAULT_TICKERS
from logic.analytics import get_comparative_data, get_risk_analytics
from models.schemas import TechnicalsRequest, TechnicalsResponse, ComparativeRequest, ComparativeResponse, RiskRequest, RiskResponse

app = FastAPI(title="Tech Stocks Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global raw data storage (for simplicity in this example)
_df_raw = None

def get_raw_data(refresh=False):
    global _df_raw
    if _df_raw is None or refresh:
        _df_raw = load_data(force_refresh=refresh)
    return _df_raw

@app.on_event("startup")
def startup_event():
    get_raw_data()

@app.get("/api/tickers")
def get_tickers():
    return DEFAULT_TICKERS

@app.post("/api/technicals", response_model=TechnicalsResponse)
def technicals(req: TechnicalsRequest):
    df_raw = get_raw_data()
    df_ticker = get_stock_data(df_raw, req.ticker)
    if df_ticker.empty:
        raise HTTPException(status_code=404, detail="Ticker not found")
    
    df_tech = compute_technicals(df_ticker)
    
    # Extract metrics
    last_close = float(df_tech['Close'].iloc[-1])
    prev_close = float(df_tech['Close'].iloc[-2])
    day_change = ((last_close - prev_close) / prev_close) * 100
    vol_latest = float(df_tech['Volume'].iloc[-1])
    high_52w = float(df_tech['High'].tail(252).max())
    sma_20_val = float(df_tech['SMA_20'].iloc[-1])
    
    # Prepare data for candlestick chart
    plot_df = df_tech.tail(req.days).reset_index()
    plot_df['Date'] = plot_df['Date'].dt.strftime('%Y-%m-%d')
    price_data = plot_df.to_dict(orient='records')
    
    return {
        "ticker": req.ticker,
        "last_close": last_close,
        "prev_close": prev_close,
        "day_change": day_change,
        "vol_latest": vol_latest,
        "high_52w": high_52w,
        "sma_20": sma_20_val,
        "price_data": price_data
    }

@app.post("/api/comparative", response_model=ComparativeResponse)
def comparative(req: ComparativeRequest):
    df_raw = get_raw_data()
    data = get_comparative_data(df_raw, req.tickers)
    return data

@app.post("/api/risk", response_model=RiskResponse)
def risk(req: RiskRequest):
    df_raw = get_raw_data()
    data = get_risk_analytics(df_raw, req.ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Asset not found or data insufficient")
    return data

@app.post("/api/refresh")
def refresh_market_data():
    get_raw_data(refresh=True)
    return {"message": "Data refreshed successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
