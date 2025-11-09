"""
NSE 500 stocks list for dynamic fetching
Uses yfinance for end-of-day closing prices (3:30 PM)
"""

# Extended NSE 500 stocks list (popular stocks from various sectors)
POPULAR_NSE_STOCKS = [
    # IT Sector
    {"symbol": "INFY", "name": "Infosys", "sector": "IT"},
    {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT"},
    {"symbol": "WIPRO", "name": "Wipro", "sector": "IT"},
    {"symbol": "HCLTECH", "name": "HCL Technologies", "sector": "IT"},
    {"symbol": "TECHM", "name": "Tech Mahindra", "sector": "IT"},
    
    # Banking
    {"symbol": "HDFCBANK", "name": "HDFC Bank", "sector": "Banking"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank", "sector": "Banking"},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking"},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank", "sector": "Banking"},
    {"symbol": "AXISBANK", "name": "Axis Bank", "sector": "Banking"},
    
    # Energy
    {"symbol": "RELIANCE", "name": "Reliance Industries", "sector": "Energy"},
    {"symbol": "ONGC", "name": "Oil & Natural Gas Corp", "sector": "Energy"},
    {"symbol": "IOC", "name": "Indian Oil Corporation", "sector": "Energy"},
    {"symbol": "BPCL", "name": "Bharat Petroleum", "sector": "Energy"},
    
    # Pharma
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical", "sector": "Pharma"},
    {"symbol": "DRREDDY", "name": "Dr. Reddy's Labs", "sector": "Pharma"},
    {"symbol": "CIPLA", "name": "Cipla", "sector": "Pharma"},
    {"symbol": "LUPIN", "name": "Lupin", "sector": "Pharma"},
    
    # FMCG
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever", "sector": "FMCG"},
    {"symbol": "ITC", "name": "ITC", "sector": "FMCG"},
    {"symbol": "NESTLEIND", "name": "Nestle India", "sector": "FMCG"},
    {"symbol": "BRITANNIA", "name": "Britannia Industries", "sector": "FMCG"},
    
    # Auto
    {"symbol": "MARUTI", "name": "Maruti Suzuki", "sector": "Auto"},
    {"symbol": "TATAMOTORS", "name": "Tata Motors", "sector": "Auto"},
    {"symbol": "M&M", "name": "Mahindra & Mahindra", "sector": "Auto"},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "sector": "Finance"},
    
    # Telecom
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "sector": "Telecom"},
    
    # Others
    {"symbol": "LT", "name": "Larsen & Toubro", "sector": "Infrastructure"},
    {"symbol": "TITAN", "name": "Titan Company", "sector": "Consumer"},
    {"symbol": "ULTRACEMCO", "name": "UltraTech Cement", "sector": "Cement"},
    {"symbol": "ASIANPAINT", "name": "Asian Paints", "sector": "Paints"},
]

def get_popular_stocks():
    """Return list of popular NSE stocks"""
    return POPULAR_NSE_STOCKS

def search_stocks(query: str):
    """Search stocks by symbol or name"""
    query_lower = query.lower()
    return [
        stock for stock in POPULAR_NSE_STOCKS
        if query_lower in stock["symbol"].lower() or query_lower in stock["name"].lower()
    ]

