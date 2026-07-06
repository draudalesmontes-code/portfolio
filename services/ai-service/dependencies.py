from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

# auto_error=False means no token returns None (guest) instead of 401
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[int]:
    if token is None:
        return None  # guest — allowed
    raise HTTPException(status_code=401, detail="Invalid or expired token")