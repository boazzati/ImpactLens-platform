import uuid
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from src.models.analysis import AnalysisJob, AnalysisResult, PartnershipScenario, db
from src.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self):
        self.openai_service = OpenAIService()
    
    def create_analysis_job(self, scenario_id: int, user_id: int) -> str:
        """
        Create async analysis job and return job ID
        """
        job_id = str(uuid.uuid4())
        
        # Create job record
        job = AnalysisJob(
            job_id=job_id,
            scenario_id=scenario_id,
            user_id=user_id,
            status='pending',
            progress=0
        )
        
        db.session.add(job)
        db.session.commit()
        
        # Start background processing (run in thread to avoid blocking)
        import threading
        thread = threading.Thread(target=self._run_async_job, args=(job_id,))
        thread.daemon = True
        thread.start()
        
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current job status and results
        """
        job = AnalysisJob.query.filter_by(job_id=job_id).first()
        if not job:
            return None
        
        result = {
            "job_id": job_id,
            "status": job.status,
            "progress": job.progress,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None
        }
        
        if job.error_message:
            result["error"] = job.error_message
        
        # If completed, include analysis results
        if job.status == 'completed':
            analysis_result = AnalysisResult.query.filter_by(job_id=job_id).first()
            if analysis_result:
                result["analysis"] = analysis_result.to_dict()
        
        return result
    
    def _run_async_job(self, job_id: str):
        """
        Helper to run async job in thread
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self._process_analysis_job(job_id))
        finally:
            loop.close()
    
    async def _process_analysis_job(self, job_id: str):
        """
        Background worker to process analysis jobs
        """
        try:
            # Get job and scenario data
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if not job:
                logger.error(f"Job {job_id} not found")
                return
            
            scenario = PartnershipScenario.query.get(job.scenario_id)
            if not scenario:
                logger.error(f"Scenario {job.scenario_id} not found")
                self._update_job_status(job_id, 'failed', error="Scenario not found")
                return
            
            # Update job status
            self._update_job_status(job_id, 'processing', progress=10)
            
            # Prepare scenario data for analysis
            scenario_data = {
                'brand_a': scenario.brand_a,
                'brand_b': scenario.brand_b,
                'partnership_type': scenario.partnership_type,
                'target_audience': scenario.target_audience,
                'budget_range': scenario.budget_range
            }
            
            # Update progress
            self._update_job_status(job_id, 'processing', progress=30)
            
            # Perform OpenAI analysis
            analysis_response = await self.openai_service.analyze_partnership(scenario_data)
            
            if analysis_response["status"] == "error":
                self._update_job_status(job_id, 'failed', error=analysis_response["error"])
                return
            
            # Update progress
            self._update_job_status(job_id, 'processing', progress=80)
            
            # Save analysis results
            analysis_data = analysis_response["analysis"]
            
            analysis_result = AnalysisResult(
                scenario_id=scenario.id,
                job_id=job_id,
                brand_alignment_score=analysis_data["brand_alignment_score"],
                audience_overlap_percentage=analysis_data["audience_overlap_percentage"],
                roi_projection=analysis_data["roi_projection"],
                risk_level=analysis_data["risk_level"],
                key_risks=json.dumps(analysis_data["key_risks"]),
                recommendations=json.dumps(analysis_data["recommendations"]),
                market_insights=json.dumps(analysis_data["market_insights"]),
                tokens_used=analysis_response.get("tokens_used", 0),
                analysis_duration=analysis_response.get("analysis_duration", 0)
            )
            
            db.session.add(analysis_result)
            
            # Update scenario status
            scenario.status = 'completed'
            scenario.updated_at = datetime.utcnow()
            
            # Complete job
            self._update_job_status(job_id, 'completed', progress=100)
            
            db.session.commit()
            
            logger.info(f"Analysis job {job_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Analysis job {job_id} failed: {str(e)}")
            self._update_job_status(job_id, 'failed', error=str(e))
    
    def _update_job_status(self, job_id: str, status: str, progress: int = None, error: str = None):
        """
        Update job status and progress
        """
        try:
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if not job:
                return
            
            job.status = status
            
            if progress is not None:
                job.progress = progress
            
            if error:
                job.error_message = error
            
            if status == 'processing' and not job.started_at:
                job.started_at = datetime.utcnow()
            elif status in ['completed', 'failed']:
                job.completed_at = datetime.utcnow()
            
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Failed to update job status: {str(e)}")
    
    def cleanup_old_jobs(self, days_old: int = 7):
        """
        Clean up old completed/failed jobs
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            old_jobs = AnalysisJob.query.filter(
                AnalysisJob.completed_at < cutoff_date,
                AnalysisJob.status.in_(['completed', 'failed'])
            ).all()
            
            for job in old_jobs:
                # Delete associated analysis results
                AnalysisResult.query.filter_by(job_id=job.job_id).delete()
                db.session.delete(job)
            
            db.session.commit()
            logger.info(f"Cleaned up {len(old_jobs)} old jobs")
            
        except Exception as e:
            logger.error(f"Job cleanup failed: {str(e)}")
            db.session.rollback()
