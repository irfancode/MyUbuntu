#!/usr/bin/env python3
"""
Ubuntu Master Control - Admin Setup Script
Creates initial admin user if it doesn't exist
"""

import os
import sys
sys.path.insert(0, '/app/backend')

from sqlalchemy.orm import Session
from core.database import SessionLocal, User, engine, Base
from core.security import get_password_hash
from core.config import get_settings

def setup_admin():
    """Create initial admin user"""
    settings = get_settings()
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.username == settings.ADMIN_USER).first()
        
        if not admin:
            # Create admin user
            admin = User(
                username=settings.ADMIN_USER,
                email=f"{settings.ADMIN_USER}@localhost",
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✓ Admin user '{settings.ADMIN_USER}' created successfully")
        else:
            print(f"✓ Admin user '{settings.ADMIN_USER}' already exists")
            
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_admin()