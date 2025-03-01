from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from ...core.database import get_db
from ...services.stock_service import StockService
from ...models.stock import Stock
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_all_stocks(db: Session = Depends(get_db)):
    """Get all stocks"""
    try:
        stocks = StockService.get_all_stocks(db)
        logger.info(f"Retrieved {len(stocks)} stocks from database")
        return [stock.to_dict() for stock in stocks]
    except Exception as e:
        logger.error(f"Error retrieving stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stock/{symbol}")
async def get_stock(symbol: str, db: Session = Depends(get_db)):
    """Get stock by symbol"""
    stock = await StockService.update_stock(db, symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock

@router.get("/gainers")
async def get_top_gainers(limit: int = 5, db: Session = Depends(get_db)):
    """Get top gaining stocks"""
    return StockService.get_top_gainers(db, limit)

@router.get("/losers")
async def get_top_losers(limit: int = 5, db: Session = Depends(get_db)):
    """Get top losing stocks"""
    return StockService.get_top_losers(db, limit)

@router.post("/update/{symbol}")
async def update_stock(symbol: str, db: Session = Depends(get_db)):
    """Update stock data"""
    stock = await StockService.update_stock(db, symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Failed to update stock data")
    return stock

@router.get("/market-movers")
async def get_market_movers(db: Session = Depends(get_db)) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get top gainers and losers from S&P 500
    """
    stock_service = StockService(db)
    try:
        market_movers = await stock_service.get_market_movers()
        
        # Update database with new data
        for category in ["gainers", "losers"]:
            for stock_data in market_movers[category]:
                stock_service.update_stock_db(stock_data)
        
        return market_movers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{symbol}")
async def get_stock_data(symbol: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get detailed data for a specific stock
    """
    stock_service = StockService(db)
    try:
        stock_data = await stock_service.get_stock_data(symbol)
        if stock_data:
            stock_service.update_stock_db(stock_data)
            return stock_data
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks")
async def get_stocks(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Get all stocks from database
    """
    stocks = db.query(Stock).filter(Stock.is_active == True).all()
    return [stock.to_dict() for stock in stocks]

@router.get("/populate-stocks", response_model=Dict[str, Any])
@router.post("/populate-stocks", response_model=Dict[str, Any])
async def populate_stocks(db: Session = Depends(get_db)):
    """Populate the database with stock data"""
    try:
        logger.info("Starting population of stocks...")
        stock_service = StockService(db)
        success_count = await stock_service.populate_stocks(db)
        
        # Verify the population
        stocks = StockService.get_all_stocks(db)
        count = len(stocks)
        
        return {
            "message": f"Stocks populated successfully! Added/updated {success_count} stocks. Total stocks in database: {count}",
            "success_count": success_count,
            "total_count": count,
            "stocks": [stock.to_dict() for stock in stocks]
        }
    except Exception as e:
        logger.error(f"Error in populate_stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 