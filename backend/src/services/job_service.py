import uuid
import json
import threading
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
        
        # Start background processing using threading instead of asyncio
        thread = threading.Thread(target=self._process_analysis_job, args=(job_id,))
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

    def _process_analysis_job(self, job_id: str):
        """
        Background worker to process analysis jobs (now synchronous)
        """
        try:
            logger.info(f"Starting analysis job {job_id}")
            
            # Update job status to running
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if not job:
                logger.error(f"Job {job_id} not found")
                return
                
            job.status = 'running'
            job.started_at = datetime.utcnow()
            job.progress = 10
            db.session.commit()
            
            # Get scenario data
            scenario = PartnershipScenario.query.get(job.scenario_id)
            if not scenario:
                self._mark_job_failed(job_id, "Scenario not found")
                return
                
            # Update progress
            job.progress = 30
            db.session.commit()
            
            # Perform OpenAI analysis
            logger.info(f"Calling OpenAI for job {job_id}")
            analysis_data = self.openai_service.analyze_partnership(
                brand_a=scenario.brand_a,
                brand_b=scenario.brand_b,
                partnership_type=scenario.partnership_type,
                target_audience=scenario.target_audience,
                budget_range=scenario.budget_range
            )
            
            # Update progress
            job.progress = 80
            db.session.commit()
            
            # Save analysis results
            analysis_result = AnalysisResult(
                job_id=job_id,
                scenario_id=job.scenario_id,
                brand_alignment_score=analysis_data.get('brand_alignment_score', 0.0),
                audience_overlap=analysis_data.get('audience_overlap', 0.0),
                roi_projection=analysis_data.get('roi_projection', 0.0),
                risk_level=analysis_data.get('risk_level', 'medium'),
                recommendation=analysis_data.get('recommendation', ''),
                detailed_analysis=json.dumps(analysis_data.get('detailed_analysis', {})),
                market_insights=json.dumps(analysis_data.get('market_insights', {}))
            )
            
            db.session.add(analysis_result)
            
            # Mark job as completed
            job.status = 'completed'
            job.progress = 100
            job.completed_at = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Analysis job {job_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {str(e)}")
            self._mark_job_failed(job_id, str(e))
    
    def _mark_job_failed(self, job_id: str, error_message: str):
        """
        Mark job as failed with error message
        """
        try:
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if job:
                job.status = 'failed'
                job.error_message = error_message
                job.completed_at = datetime.utcnow()
                db.session.commit()
        except Exception as e:
            logger.error(f"Error marking job {job_id} as failed: {str(e)}")
    
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
            logger.error(f"Error cleaning up old jobs: {str(e)}")
            db.session.rollback()
