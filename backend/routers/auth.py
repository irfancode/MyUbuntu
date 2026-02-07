from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional

from core.database import get_db, User
from core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user
)
from core.config import get_settings

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    is_admin: Optional[bool] = False

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user and return tokens"""
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    settings = get_settings()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        data={"sub": user.username, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token"""
    from core.security import verify_token
    
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    settings = get_settings()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    new_access_token = create_access_token(
        data={"sub": user.username, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (token blacklisting would be implemented here)"""
    return {"message": "Successfully logged out"}

@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}