import uuid
import json
import logging
import threading
from datetime import datetime

from flask import current_app

from ..models import db, AnalysisJob, AnalysisResult, PartnershipScenario

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self, app, openai_service):
        self.app = app
        self.openai_service = openai_service

    def create_analysis_job(self, scenario_id, user_id):
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            job_id=job_id,
            scenario_id=scenario_id,
            user_id=user_id,
            status="pending"
        )
        db.session.add(job)
        db.session.commit()

        thread = threading.Thread(target=self._process_analysis_job, args=(job_id, current_app._get_current_object()))
        thread.daemon = True
        thread.start()

        return job_id

    def get_job_status(self, job_id):
        job = AnalysisJob.query.filter_by(job_id=job_id).first()
        if not job:
            return None
        
        result = {"job_id": job.job_id, "status": job.status}
        if job.status == "completed":
            analysis_result = AnalysisResult.query.filter_by(job_id=job_id).first()
            if analysis_result:
                result["analysis"] = analysis_result.to_dict()
        
        return result

    def _process_analysis_job(self, job_id, app):
        with app.app_context():
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if not job:
                return

            job.status = "processing"
            db.session.commit()

            scenario = PartnershipScenario.query.get(job.scenario_id)
            if not scenario:
                job.status = "failed"
                job.error_message = "Scenario not found"
                db.session.commit()
                return

            scenario_data = scenario.to_dict()
            analysis_response = self.openai_service.analyze_partnership(scenario_data)

            if analysis_response["status"] == "error":
                job.status = "failed"
                job.error_message = analysis_response["error"]
                db.session.commit()
                return

            analysis_data = analysis_response["analysis"]
            analysis_result = AnalysisResult(
                scenario_id=scenario.id,
                job_id=job_id,
                brand_alignment_score=analysis_data.get("brand_alignment_score"),
                audience_overlap_percentage=analysis_data.get("audience_overlap_percentage"),
                roi_projection=analysis_data.get("roi_projection"),
                risk_level=analysis_data.get("risk_level"),
                key_risks=json.dumps(analysis_data.get("key_risks")),
                recommendations=json.dumps(analysis_data.get("recommendations")),
                market_insights=json.dumps(analysis_data.get("market_insights")),
                tokens_used=analysis_response.get("tokens_used"),
                analysis_duration=analysis_response.get("analysis_duration")
            )
            db.session.add(analysis_result)

            job.status = "completed"
            job.completed_at = datetime.utcnow()
            db.session.commit()

