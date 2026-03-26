import pandas as pd
import yfinance as yf
import os
from datetime import datetime, timedelta

DATA_FILE = "tech_stocks_data.csv"
DEFAULT_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"]

def load_data(force_refresh=False):
    if not force_refresh and os.path.exists(DATA_FILE):
        try:
            # The CSV saved by Streamlit has a MultiIndex header
            df = pd.read_csv(DATA_FILE, header=[0, 1], index_col=0, parse_dates=True)
            return df
        except Exception as e:
            print(f"Error reading CSV: {e}")
            pass

    end_date = datetime.now()
    start_date = end_date - timedelta(days=365*3)
    
    df = yf.download(DEFAULT_TICKERS, start=start_date, end=end_date, progress=False)
    df.to_csv(DATA_FILE)
    return df

def get_stock_data(df_raw, ticker):
    df_ticker = pd.DataFrame()
    for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
        if col in df_raw.columns.levels[0]:
            if ticker in df_raw[col].columns:
                df_ticker[col] = df_raw[col][ticker]
    df_ticker.index = pd.to_datetime(df_ticker.index)
    return df_ticker.dropna()

def compute_technicals(df):
    df = df.copy()
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    df['SMA_200'] = df['Close'].rolling(window=200).mean()
    df['STD_20'] = df['Close'].rolling(window=20).std()
    df['Upper_Band'] = df['SMA_20'] + (df['STD_20'] * 2)
    df['Lower_Band'] = df['SMA_20'] - (df['STD_20'] * 2)
    return df
