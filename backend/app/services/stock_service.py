import yfinance as yf
import pandas as pd
import pandas_datareader as pdr
from typing import List, Dict, Any, Optional
import asyncio
from ..models.stock import Stock
from sqlalchemy.orm import Session
import logging
from datetime import datetime, timedelta
import requests

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class StockService:
    def __init__(self, db: Session):
        self.db = db
        self.sp500_symbols = self._get_sp500_symbols()

    def _get_sp500_symbols(self) -> List[str]:
        """Get S&P 500 symbols using pandas_datareader"""
        try:
            table = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')
            df = table[0]
            return df['Symbol'].tolist()
        except Exception as e:
            logger.error(f"Error fetching S&P 500 symbols: {e}")
            return []

    @staticmethod
    async def get_stock_data(symbol: str) -> Optional[dict]:
        """Fetch stock data directly from Yahoo Finance API"""
        try:
            logger.info(f"Fetching data for symbol: {symbol}")
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            params = {
                "range": "2d",
                "interval": "1d",
                "includePrePost": False
            }
            headers = {
                "User-Agent": "Mozilla/5.0"
            }
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()

            if not data["chart"]["result"]:
                logger.error(f"No data returned for {symbol}")
                return None

            result = data["chart"]["result"][0]
            quote = result["indicators"]["quote"][0]
            timestamps = result["timestamp"]

            if not timestamps or len(timestamps) < 1:
                logger.error(f"No timestamps found for {symbol}")
                return None

            latest_idx = -1
            latest_close = quote["close"][latest_idx]
            latest_volume = quote["volume"][latest_idx]
            prev_close = quote["close"][latest_idx - 1] if len(quote["close"]) > 1 else quote["open"][latest_idx]
            change_percent = ((latest_close - prev_close) / prev_close) * 100 if prev_close else 0.0
            latest_date = datetime.fromtimestamp(timestamps[latest_idx]).strftime("%Y-%m-%d")

            info = {
                "symbol": symbol,
                "name": symbol,
                "current_price": float(latest_close),
                "change_percent": float(change_percent),
                "volume": int(latest_volume),
                "market_cap": float(latest_close * latest_volume),
                "sector": "",
                "is_active": True,
                "last_updated": latest_date
            }

            logger.info(f"Successfully fetched data for {symbol}")
            return info

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {symbol}: {str(e)}")
            return None
        except (KeyError, IndexError, TypeError) as e:
            logger.error(f"Error parsing data for {symbol}: {str(e)}")
            return None

    @staticmethod
    def get_all_stocks(db: Session) -> List[Stock]:
        """Get all stocks from database"""
        return db.query(Stock).all()

    @staticmethod
    def get_stock_by_symbol(db: Session, symbol: str) -> Optional[Stock]:
        """Get a stock by its symbol"""
        return db.query(Stock).filter(Stock.symbol == symbol).first()

    @staticmethod
    async def update_stock(db: Session, symbol: str) -> Optional[Stock]:
        """Update stock data in database"""
        stock_data = await StockService.get_stock_data(symbol)
        if not stock_data:
            return None

        stock = StockService.get_stock_by_symbol(db, symbol)
        if not stock:
            stock = Stock(**stock_data)
            db.add(stock)
        else:
            for key, value in stock_data.items():
                setattr(stock, key, value)

        try:
            db.commit()
            db.refresh(stock)
            return stock
        except Exception as e:
            logger.error(f"Error saving stock {symbol} to database: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def get_top_gainers(db: Session, limit: int = 5) -> List[Stock]:
        """Get top gaining stocks"""
        return db.query(Stock).order_by(Stock.change_percent.desc()).limit(limit).all()

    @staticmethod
    def get_top_losers(db: Session, limit: int = 5) -> List[Stock]:
        """Get top losing stocks"""
        return db.query(Stock).order_by(Stock.change_percent.asc()).limit(limit).all()

    async def get_market_movers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get market movers (top gainers and losers)"""
        logger.info("Fetching market movers from database...")
        
        # Get top gainers and losers from database
        gainers = self.get_top_gainers(self.db, 10)
        losers = self.get_top_losers(self.db, 10)
        
        # Convert to dictionary format
        result = {
            "gainers": [stock.__dict__ for stock in gainers if stock],
            "losers": [stock.__dict__ for stock in losers if stock]
        }
        
        # Remove SQLAlchemy instance state
        for stocks in result.values():
            for stock in stocks:
                stock.pop('_sa_instance_state', None)
        
        logger.info(f"Found {len(result['gainers'])} gainers and {len(result['losers'])} losers")
        return result

    def update_stock_db(self, stock_data: Dict[str, Any]) -> Stock:
        """Update or create stock in database"""
        try:
            stock = self.db.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
            
            if stock:
                for key, value in stock_data.items():
                    setattr(stock, key, value)
            else:
                stock = Stock(**stock_data)
                self.db.add(stock)
            
            self.db.commit()
            self.db.refresh(stock)
            return stock
        except Exception as e:
            logger.error(f"Error updating stock in database: {str(e)}")
            self.db.rollback()
            return None

    async def populate_stocks(self, db: Session):
        """Populate database with initial stock data"""
        logger.info("Starting to populate stocks...")
        
        # Check if we already have data from today
        today = datetime.now().date()
        latest_stock = db.query(Stock).order_by(Stock.last_updated.desc()).first()
        
        if latest_stock and datetime.strptime(latest_stock.last_updated, "%Y-%m-%d").date() == today:
            logger.info("Stock data already up to date for today")
            return {"message": "Stock data already up to date for today", "updated": False}

        # If we don't have today's data, proceed with update
        symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META"]  # Start with key tech stocks
        success_count = 0
        
        for symbol in symbols:
            try:
                logger.info(f"Processing {symbol}...")
                stock_data = await self.get_stock_data(symbol)
                
                if stock_data:
                    # Update or create stock
                    existing_stock = self.get_stock_by_symbol(db, symbol)
                    if existing_stock:
                        for key, value in stock_data.items():
                            setattr(existing_stock, key, value)
                    else:
                        new_stock = Stock(**stock_data)
                        db.add(new_stock)
                    
                    success_count += 1
                    logger.info(f"Successfully processed {symbol}")
                
                # Add delay between requests to avoid rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error processing {symbol}: {str(e)}")
                continue
        
        try:
            db.commit()
            logger.info(f"Successfully updated {success_count} stocks")
            return {
                "message": f"Successfully updated {success_count} stocks",
                "updated": True,
                "count": success_count
            }
        except Exception as e:
            logger.error(f"Error committing to database: {str(e)}")
            db.rollback()
            return {"message": "Error updating stocks", "error": str(e), "updated": False}