from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.services.stock_service import stock_service

router = APIRouter()

@router.get("/{symbol}")
async def get_historical_data(
    symbol: str,
    period: str = Query("1mo", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)$")
) -> List[Dict[str, Any]]:
    """
    Get historical data for a specific symbol
    
    Parameters:
    - symbol: Stock symbol (e.g., AAPL)
    - period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol query parameter is required.")
    data = await stock_service.get_historical_data(symbol.upper(), period)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Historical data not found for symbol {symbol}"
        )
    return data 