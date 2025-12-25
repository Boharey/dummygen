"""Simple IP-based rate limiting."""

from typing import Dict
from datetime import datetime, timedelta
from fastapi import HTTPException, Request

class RateLimiter:
    """Simple in-memory rate limiter based on IP address."""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
        self.window = timedelta(minutes=1)
        self.max_requests = 10  # requests per minute
    
    def check_rate_limit(self, request: Request) -> None:
        """Check if request exceeds rate limit.
        
        Args:
            request: FastAPI request object
        
        Raises:
            HTTPException: If rate limit exceeded
        """
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        now = datetime.now()
        
        # Initialize if first request from this IP
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Clean old requests outside the window
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < self.window
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_ip]) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Add current request
        self.requests[client_ip].append(now)
    
    def cleanup_old_entries(self) -> None:
        """Clean up old entries to prevent memory leak."""
        now = datetime.now()
        for ip in list(self.requests.keys()):
            self.requests[ip] = [
                req_time for req_time in self.requests[ip]
                if now - req_time < self.window
            ]
            # Remove IP if no recent requests
            if not self.requests[ip]:
                del self.requests[ip]

# Global rate limiter instance
rate_limiter = RateLimiter()
