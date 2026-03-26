import streamlit as st
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
import plotly.express as px
import numpy as np
from datetime import datetime, timedelta
import os
import scipy.stats as stats

st.set_page_config(
    page_title="Advanced Tech Stocks Analytics Dashboard",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .metric-container {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background-color: #1E1E1E;
        border-radius: 10px;
        margin-bottom: 20px;
    }
    .metric-box {
        text-align: center;
        flex: 1;
        padding: 5px;
    }
    .stApp {
        background-color: #0E1117;
    }
</style>
""", unsafe_allow_html=True)

# Define constants
DATA_FILE = "tech_stocks_data.csv"
DEFAULT_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"]

@st.cache_data
def load_data(force_refresh=False):
    if not force_refresh and os.path.exists(DATA_FILE):
        try:
            df = pd.read_csv(DATA_FILE, header=[0, 1], index_col=0, parse_dates=True)
            return df
        except Exception as e:
            st.error(f"Error reading CSV: {e}")
            pass # Fall through to fetch data

    # Fetch data
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365*3) # 3 years
    
    # yfinance bulk download returns MultiIndex DataFrame
    df = yf.download(DEFAULT_TICKERS, start=start_date, end=end_date, progress=False)
    
    # Save to CSV
    df.to_csv(DATA_FILE)
    return df

st.sidebar.title("📈 Dashboard Settings")
st.sidebar.markdown("Configure parameters for the analytics engine.")

if st.sidebar.button("🔄 Force Refresh Market Data"):
    with st.spinner("Fetching latest data from Yahoo Finance..."):
        df_raw = load_data(force_refresh=True)
        # Clear cache to ensure it reloads
        st.cache_data.clear()
        df_raw = load_data()
    st.sidebar.success("Data Refreshed & Saved to CSV!")
else:
    with st.spinner("Loading Data..."):
        df_raw = load_data()

def get_stock_data(ticker):
    # Extracts Open, High, Low, Close, Volume for a single ticker
    df_ticker = pd.DataFrame()
    for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
        if col in df_raw.columns.levels[0]:
            if ticker in df_raw[col].columns:
                df_ticker[col] = df_raw[col][ticker]
    df_ticker.index = pd.to_datetime(df_ticker.index)
    return df_ticker.dropna()

st.sidebar.subheader("Global Filters")
selected_tickers = st.sidebar.multiselect("Select Assets", DEFAULT_TICKERS, default=DEFAULT_TICKERS)
if not selected_tickers:
    st.warning("Please select at least one ticker from the sidebar.")
    st.stop()

# Let user pick a specific primary asset for deep dive
primary_asset = st.sidebar.selectbox("Primary Asset for Deep Dive", selected_tickers)

# Tab structure
tab1, tab2, tab3 = st.tabs(["📊 Price Action & Technicals", "🔗 Comparative Performance", "📉 Risk & Quant Analytics"])

# Data Preparation for Primary Asset
primary_df = get_stock_data(primary_asset)
primary_df['SMA_20'] = primary_df['Close'].rolling(window=20).mean()
primary_df['SMA_50'] = primary_df['Close'].rolling(window=50).mean()
primary_df['SMA_200'] = primary_df['Close'].rolling(window=200).mean()
primary_df['STD_20'] = primary_df['Close'].rolling(window=20).std()
primary_df['Upper_Band'] = primary_df['SMA_20'] + (primary_df['STD_20'] * 2)
primary_df['Lower_Band'] = primary_df['SMA_20'] - (primary_df['STD_20'] * 2)

with tab1:
    st.header(f"Technicals Deep Dive: {primary_asset}")
    
    # Key Metrics
    col1, col2, col3, col4 = st.columns(4)
    if len(primary_df) > 1:
        last_close = primary_df['Close'].iloc[-1]
        prev_close = primary_df['Close'].iloc[-2]
        day_change = ((last_close - prev_close) / prev_close) * 100
        vol_latest = primary_df['Volume'].iloc[-1]
        
        col1.metric("Current Price", f"${last_close:.2f}", f"{day_change:.2f}%")
        col2.metric("52-Week High", f"${primary_df['High'].tail(252).max():.2f}")
        col3.metric("Daily Volume", f"{vol_latest:,.0f}")
        col4.metric("20-Day SMA", f"${primary_df['SMA_20'].iloc[-1]:.2f}")
    
    st.markdown("---")
    
    # Technical Indicators toggles
    t_col1, t_col2 = st.columns([1, 4])
    with t_col1:
        st.write("### Chart Overlays")
        show_sma20 = st.checkbox("Show SMA 20", value=True)
        show_sma50 = st.checkbox("Show SMA 50", value=False)
        show_sma200 = st.checkbox("Show SMA 200", value=False)
        show_bbnds = st.checkbox("Show Bollinger Bands", value=False)
        chart_days = st.slider("Days to show", min_value=30, max_value=750, value=180)
    
    with t_col2:
        # Plotly Candlestick
        plot_df = primary_df.tail(chart_days)
        fig = go.Figure()
        fig.add_trace(go.Candlestick(x=plot_df.index,
                        open=plot_df['Open'],
                        high=plot_df['High'],
                        low=plot_df['Low'],
                        close=plot_df['Close'],
                        name='Price'))
        
        if show_sma20:
            fig.add_trace(go.Scatter(x=plot_df.index, y=plot_df['SMA_20'], line=dict(color='orange', width=1.5), name='SMA 20'))
        if show_sma50:
            fig.add_trace(go.Scatter(x=plot_df.index, y=plot_df['SMA_50'], line=dict(color='cyan', width=1.5), name='SMA 50'))
        if show_sma200:
            fig.add_trace(go.Scatter(x=plot_df.index, y=plot_df['SMA_200'], line=dict(color='red', width=1.5), name='SMA 200'))
        if show_bbnds:
            fig.add_trace(go.Scatter(x=plot_df.index, y=plot_df['Upper_Band'], line=dict(color='gray', width=1, dash='dash'), name='Upper Band'))
            fig.add_trace(go.Scatter(x=plot_df.index, y=plot_df['Lower_Band'], line=dict(color='gray', width=1, dash='dash'), name='Lower Band', fill='tonexty', fillcolor='rgba(128,128,128,0.1)'))
            
        fig.update_layout(title="", xaxis_rangeslider_visible=False, height=500, margin=dict(l=0, r=0, t=0, b=0), template="plotly_dark")
        st.plotly_chart(fig, use_container_width=True)

with tab2:
    st.header("Comparative Performance Matrix")
    st.markdown("Analyze how the chosen assets perform relative to each other over time.")
    
    # Calculate daily returns for selected tickers
    close_df = pd.DataFrame()
    for t in selected_tickers:
        stock_d = get_stock_data(t)
        if not stock_d.empty:
            close_df[t] = stock_d['Close']
        
    returns_df = close_df.pct_change().dropna()
    cumulative_returns = (1 + returns_df).cumprod() * 100
    
    c_col1, c_col2 = st.columns([2, 1])
    
    with c_col1:
        st.subheader("Normalized Cumulative Returns (Base 100)")
        fig_cum = px.line(cumulative_returns, x=cumulative_returns.index, y=cumulative_returns.columns)
        fig_cum.update_layout(height=400, template="plotly_dark", yaxis_title="Portfolio Value ($)", xaxis_title="", legend_title="Ticker")
        st.plotly_chart(fig_cum, use_container_width=True)
        
    with c_col2:
        st.subheader("Asset Correlation Matrix")
        corr = returns_df.corr()
        fig_corr = px.imshow(corr, text_auto=True, aspect="auto", color_continuous_scale="RdBu_r")
        fig_corr.update_layout(height=400, template="plotly_dark")
        st.plotly_chart(fig_corr, use_container_width=True)
        
    st.markdown("### Risk-Return Tradeoff (Annualized)")
    # Annualized return and volatility
    ann_ret = returns_df.mean() * 252
    ann_vol = returns_df.std() * np.sqrt(252)
    risk_return_df = pd.DataFrame({'Annualized Return': ann_ret, 'Annualized Volatility': ann_vol}).reset_index().rename(columns={'index': 'Asset'})
    
    fig_scatter = px.scatter(
        risk_return_df, 
        x='Annualized Volatility', 
        y='Annualized Return', 
        text='Asset', 
        size=[1]*len(risk_return_df), 
        color='Asset'
    )
    fig_scatter.update_traces(textposition='top center')
    fig_scatter.update_layout(height=400, template="plotly_dark", showlegend=False)
    st.plotly_chart(fig_scatter, use_container_width=True)

with tab3:
    st.header("Risk and Quantitative Analytics")
    st.markdown("Advanced statistical modeling and Monte Carlo simulations to assess future risk.")
    
    q_col1, q_col2 = st.columns(2)
    
    if primary_asset in returns_df.columns:
        primary_returns = returns_df[primary_asset]
        
        with q_col1:
            st.subheader(f"Return Distribution: {primary_asset}")
            fig_hist = go.Figure()
            fig_hist.add_trace(go.Histogram(x=primary_returns, nbinsx=60, name='Daily Returns', histnorm='probability density', marker_color='indigo'))
            
            # Fit normal distribution
            mu, std = stats.norm.fit(primary_returns)
            xmin, xmax = primary_returns.min(), primary_returns.max()
            x = np.linspace(xmin, xmax, 100)
            p = stats.norm.pdf(x, mu, std)
            fig_hist.add_trace(go.Scatter(x=x, y=p, mode='lines', name='Normal Fit', line=dict(color='white', width=2)))
            
            fig_hist.update_layout(height=400, template="plotly_dark", showlegend=True, barmode='overlay')
            fig_hist.update_traces(opacity=0.75)
            st.plotly_chart(fig_hist, use_container_width=True)
            
            # VaR metrics
            var_95 = np.percentile(primary_returns, 5)
            var_99 = np.percentile(primary_returns, 1)
            st.write("#### Value at Risk (VaR)")
            st.info(f"**95% Confidence VaR:** {var_95:.2%} (In 95% of days, loss will not exceed this)")
            st.info(f"**99% Confidence VaR:** {var_99:.2%} (In 99% of days, loss will not exceed this)")
            
        with q_col2:
            st.subheader("Monte Carlo Price Simulation (30 Days)")
            # Simple Geometric Brownian Motion
            simulations = 100
            days = 30
            last_price = primary_df['Close'].iloc[-1]
            
            simulation_df = pd.DataFrame()
            # Vectorized Monte Carlo is faster, but simple loop is fine for n=100
            np.random.seed(42) # For reproducibility within a session could be good, but let's make it random
            daily_returns = np.random.normal(mu, std, (days, simulations))
            # Price path: P_t = P_0 * exp((mu - 0.5*sigma^2) + sigma*Z) is precise GBM, here we do simple discrete path
            # P_t = P_{t-1} * (1 + ret)
            price_paths = np.zeros_like(daily_returns)
            price_paths[0] = last_price * (1 + daily_returns[0])
            for t in range(1, days):
                price_paths[t] = price_paths[t-1] * (1 + daily_returns[t])
                
            fig_mc = go.Figure()
            for i in range(simulations):
                fig_mc.add_trace(go.Scatter(y=price_paths[:, i], mode='lines', line=dict(width=1), showlegend=False, opacity=0.3))
                
            fig_mc.update_layout(height=400, template="plotly_dark", yaxis_title="Simulated Price ($)", xaxis_title="Days from Today")
            st.plotly_chart(fig_mc, use_container_width=True)
            
            # Percentiles at day 30
            final_prices = price_paths[-1, :]
            st.write("#### Simulated Price Targets (Day 30)")
            p_10 = np.percentile(final_prices, 10)
            p_50 = np.percentile(final_prices, 50)
            p_90 = np.percentile(final_prices, 90)
            
            s_col1, s_col2, s_col3 = st.columns(3)
            s_col1.metric("10th Percentile (-)", f"${p_10:.2f}")
            s_col2.metric("Median Target", f"${p_50:.2f}")
            s_col3.metric("90th Percentile (+)", f"${p_90:.2f}")
    else:
        st.warning("Data not available to run quant analytics for this asset.")
