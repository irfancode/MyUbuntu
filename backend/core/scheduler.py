import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Callable
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

logger = logging.getLogger(__name__)

class SchedulerManager:
    """Task scheduler manager"""
    
    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self.jobs: Dict[str, dict] = {}
        
    async def start(self):
        """Start the scheduler"""
        jobstores = {
            'default': SQLAlchemyJobStore(url='sqlite:///app/data/scheduler.db')
        }
        
        self.scheduler = AsyncIOScheduler(jobstores=jobstores)
        self.scheduler.start()
        logger.info("Scheduler started")
    
    async def stop(self):
        """Stop the scheduler"""
        if self.scheduler:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")
    
    def is_running(self) -> bool:
        """Check if scheduler is running"""
        return self.scheduler is not None and self.scheduler.running
    
    def add_job(
        self,
        job_id: str,
        func: Callable,
        trigger_type: str = "interval",
        **trigger_args
    ) -> bool:
        """Add a scheduled job"""
        try:
            if trigger_type == "interval":
                trigger = IntervalTrigger(**trigger_args)
            elif trigger_type == "cron":
                trigger = CronTrigger(**trigger_args)
            else:
                raise ValueError(f"Unknown trigger type: {trigger_type}")
            
            job = self.scheduler.add_job(
                func=func,
                trigger=trigger,
                id=job_id,
                replace_existing=True
            )
            
            self.jobs[job_id] = {
                "id": job_id,
                "func": func.__name__,
                "trigger": trigger_type,
                "args": trigger_args,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None
            }
            
            logger.info(f"Added job {job_id}")
            return True
        except Exception as e:
            logger.error(f"Error adding job {job_id}: {e}")
            return False
    
    def remove_job(self, job_id: str) -> bool:
        """Remove a scheduled job"""
        try:
            self.scheduler.remove_job(job_id)
            if job_id in self.jobs:
                del self.jobs[job_id]
            logger.info(f"Removed job {job_id}")
            return True
        except Exception as e:
            logger.error(f"Error removing job {job_id}: {e}")
            return False
    
    def get_jobs(self) -> List[dict]:
        """Get all scheduled jobs"""
        if not self.scheduler:
            return []
        
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "trigger": str(job.trigger),
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None
            })
        return jobs
    
    def pause_job(self, job_id: str) -> bool:
        """Pause a job"""
        try:
            self.scheduler.pause_job(job_id)
            return True
        except Exception as e:
            logger.error(f"Error pausing job {job_id}: {e}")
            return False
    
    def resume_job(self, job_id: str) -> bool:
        """Resume a paused job"""
        try:
            self.scheduler.resume_job(job_id)
            return True
        except Exception as e:
            logger.error(f"Error resuming job {job_id}: {e}")
            return False
    
    def modify_job(self, job_id: str, **changes) -> bool:
        """Modify a job"""
        try:
            self.scheduler.modify_job(job_id, **changes)
            return True
        except Exception as e:
            logger.error(f"Error modifying job {job_id}: {e}")
            return False