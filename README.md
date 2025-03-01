# Real-Time Stock Market Web Application

A full-stack web application that displays real-time stock market data, including biggest gainers and losers, built with FastAPI and React.

## Features

- Real-time stock data tracking
- Classification of stocks into Biggest Gainers & Biggest Losers
- Intuitive and responsive UI
- Auto-refresh functionality
- Historical data tracking (optional)
- Data caching for improved performance

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- PostgreSQL
- Redis (for caching)
- yfinance (Yahoo Finance API)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Query
- Recharts

## Project Structure

```
stock-market-app/
├── backend/
│   ├── app/
│   │   ├── api/        # API routes
│   │   ├── core/       # Core configurations
│   │   ├── models/     # Database models
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   ├── tests/          # Backend tests
│   ├── .env.example    # Environment variables template
│   └── requirements.txt # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Page components
    │   ├── services/   # API integration
    │   └── App.tsx     # Main component
    └── package.json    # Node.js dependencies
```

## Prerequisites

1. Python 3.9 or higher
2. Node.js 16 or higher
3. PostgreSQL
4. Redis (optional, for caching)

## Installation

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Run the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Scripts

### Backend
- `uvicorn app.main:app --reload`: Start development server
- `pytest`: Run tests
- `black .`: Format code
- `flake8`: Lint code

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Lint code
- `npm run preview`: Preview production build

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
STOCK_API_KEY=your_api_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment
1. Build Docker image:
```bash
docker build -t stock-market-backend .
```

2. Run container:
```bash
docker run -p 8000:8000 stock-market-backend
```

### Frontend Deployment
1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, etc.)

## Troubleshooting

### Common Issues

1. **Backend API Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in .env
   - Ensure Redis is running (if using caching)

2. **Frontend Development Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Data Not Updating**
   - Check API rate limits
   - Verify WebSocket connection (if implemented)
   - Check browser console for errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 