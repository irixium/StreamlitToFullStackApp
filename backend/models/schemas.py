from pydantic import BaseModel
from typing import List, Optional, Dict

class TechnicalsRequest(BaseModel):
    ticker: str
    days: int = 180

class TechnicalsResponse(BaseModel):
    ticker: str
    last_close: float
    prev_close: float
    day_change: float
    vol_latest: float
    high_52w: float
    sma_20: float
    price_data: List[Dict]

class ComparativeRequest(BaseModel):
    tickers: List[str]

class ComparativeResponse(BaseModel):
    cumulative_returns: List[Dict]
    correlation_matrix: List[Dict]
    risk_return_tradeoff: List[Dict]

class RiskRequest(BaseModel):
    ticker: str

class RiskResponse(BaseModel):
    histogram: List[Dict]
    normal_fit: List[Dict]
    var_95: float
    var_99: float
    monte_carlo: List[Dict]
    targets: Dict[str, float]
