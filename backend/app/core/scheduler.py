import asyncio
from datetime import datetime, timedelta
import logging
from ..services.stock_service import StockService
from ..core.database import SessionLocal
from typing import Optional
import pytz

logger = logging.getLogger(__name__)

class StockDataScheduler:
    def __init__(self):
        self._task: Optional[asyncio.Task] = None
        self._is_running = False
    
    async def _wait_until_market_close(self):
        """Wait until after market close (4:00 PM EST)"""
        est = pytz.timezone('US/Eastern')
        now = datetime.now(est)
        
        # Target time is 4:30 PM EST (30 minutes after market close)
        target_time = now.replace(hour=16, minute=30, second=0, microsecond=0)
        
        # If it's already past 4:30 PM, schedule for next day
        if now >= target_time:
            target_time = target_time + timedelta(days=1)
        
        # Calculate wait time
        wait_seconds = (target_time - now).total_seconds()
        logger.info(f"Waiting {wait_seconds/3600:.2f} hours until next update at {target_time}")
        await asyncio.sleep(wait_seconds)

    async def _update_stock_data(self):
        """Update stock data after market close"""
        while self._is_running:
            try:
                # Wait until after market close
                await self._wait_until_market_close()
                
                # Get database session
                db = SessionLocal()
                try:
                    # Create service instance
                    service = StockService(db)
                    
                    # Update all S&P 500 stocks
                    logger.info("Starting nightly stock data update...")
                    await service.populate_stocks(db)
                    logger.info("Completed nightly stock data update")
                    
                finally:
                    db.close()
                
            except Exception as e:
                logger.error(f"Error in stock update task: {str(e)}")
            
            # Even if there's an error, wait for next update time
            await asyncio.sleep(60)  # Wait a minute before checking time again
    
    def start(self):
        """Start the scheduler"""
        if not self._is_running:
            self._is_running = True
            self._task = asyncio.create_task(self._update_stock_data())
            logger.info("Stock data scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        if self._is_running:
            self._is_running = False
            if self._task:
                self._task.cancel()
            logger.info("Stock data scheduler stopped") 