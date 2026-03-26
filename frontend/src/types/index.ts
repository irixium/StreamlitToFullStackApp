export interface TechnicalsRequest {
  ticker: string;
  days: number;
}

export interface TechnicalsResponse {
  ticker: string;
  last_close: number;
  prev_close: number;
  day_change: number;
  vol_latest: number;
  high_52w: number;
  sma_20: number;
  price_data: any[];
}

export interface ComparativeRequest {
  tickers: string[];
}

export interface ComparativeResponse {
  cumulative_returns: any[];
  correlation_matrix: any[];
  risk_return_tradeoff: any[];
}

export interface RiskRequest {
  ticker: string;
}

export interface RiskResponse {
  histogram: any[];
  normal_fit: any[];
  var_95: number;
  var_99: number;
  monte_carlo: any[];
  targets: {
    p10: number;
    p50: number;
    p90: number;
  };
}
