import pandas as pd
import numpy as np
import scipy.stats as stats
from .data_manager import get_stock_data

def get_comparative_data(df_raw, selected_tickers):
    close_df = pd.DataFrame()
    for t in selected_tickers:
        stock_d = get_stock_data(df_raw, t)
        if not stock_d.empty:
            close_df[t] = stock_d['Close']
    
    returns_df = close_df.pct_change().dropna()
    cumulative_returns = (1 + returns_df).cumprod() * 100
    
    # Reset index to make 'Date' a column for JSON serialization
    cumulative_returns_reset = cumulative_returns.reset_index()
    cumulative_returns_reset['Date'] = cumulative_returns_reset['Date'].dt.strftime('%Y-%m-%d')
    
    # Melt for Vega-Lite line chart
    cum_returns_melted = cumulative_returns_reset.melt(id_vars=['Date'], var_name='Ticker', value_name='Value')
    
    # Correlation Matrix
    corr = returns_df.corr()
    corr_records = []
    for i in corr.index:
        for j in corr.columns:
            corr_records.append({"Asset1": i, "Asset2": j, "Correlation": float(corr.loc[i, j])})
            
    # Risk-Return Tradeoff
    ann_ret = returns_df.mean() * 252
    ann_vol = returns_df.std() * np.sqrt(252)
    risk_return = []
    for ticker in selected_tickers:
        if ticker in ann_ret.index:
            risk_return.append({
                "Asset": ticker,
                "Annualized Return": float(ann_ret[ticker]),
                "Annualized Volatility": float(ann_vol[ticker])
            })
            
    return {
        "cumulative_returns": cum_returns_melted.to_dict(orient='records'),
        "correlation_matrix": corr_records,
        "risk_return_tradeoff": risk_return
    }

def get_risk_analytics(df_raw, primary_asset):
    stock_d = get_stock_data(df_raw, primary_asset)
    if stock_d.empty:
        return None
        
    returns = stock_d['Close'].pct_change().dropna()
    
    # Histogram data
    mu, std = stats.norm.fit(returns)
    hist, bin_edges = np.histogram(returns, bins=60, density=True)
    bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2
    
    hist_data = [{"Return": float(bc), "Density": float(h)} for bc, h in zip(bin_centers, hist)]
    
    # Normal fit line
    x = np.linspace(float(returns.min()), float(returns.max()), 100)
    p = stats.norm.pdf(x, mu, std)
    fit_data = [{"Return": float(xi), "Density": float(pi)} for xi, pi in zip(x, p)]
    
    # VaR
    var_95 = float(np.percentile(returns, 5))
    var_99 = float(np.percentile(returns, 1))
    
    # Monte Carlo
    simulations = 100
    days = 30
    last_price = float(stock_d['Close'].iloc[-1])
    
    np.random.seed(42)
    daily_returns_sim = np.random.normal(mu, std, (days, simulations))
    price_paths = np.zeros_like(daily_returns_sim)
    price_paths[0] = last_price * (1 + daily_returns_sim[0])
    for t in range(1, days):
        price_paths[t] = price_paths[t-1] * (1 + daily_returns_sim[t])
        
    mc_data = []
    for day in range(days):
        for sim in range(simulations):
            mc_data.append({"Day": day + 1, "Simulation": sim, "Price": float(price_paths[day, sim])})
            
    final_prices = price_paths[-1, :]
    targets = {
        "p10": float(np.percentile(final_prices, 10)),
        "p50": float(np.percentile(final_prices, 50)),
        "p90": float(np.percentile(final_prices, 90))
    }
    
    return {
        "histogram": hist_data,
        "normal_fit": fit_data,
        "var_95": var_95,
        "var_99": var_99,
        "monte_carlo": mc_data,
        "targets": targets
    }
