import uuid
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from src.models.user import db
from src.models.analysis import AnalysisJob, AnalysisResult, PartnershipScenario

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self):
        self.jobs = {}
    
    def create_analysis_job(self, scenario_id: int, user_id: int) -> str:
        """Create a new analysis job"""
        job_id = str(uuid.uuid4())
        
        job = AnalysisJob(
            job_id=job_id,
            scenario_id=scenario_id,
            user_id=user_id,
            status='pending',
            progress=0
        )
        
        db.session.add(job)
        db.session.commit()
        
        # Process analysis synchronously
        self._process_analysis_job(job_id)
        
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job status and results"""
        job = AnalysisJob.query.filter_by(job_id=job_id).first()
        if not job:
            return None
        
        result = {
            'job_id': job.job_id,
            'status': job.status,
            'progress': job.progress,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'started_at': job.started_at.isoformat() if job.started_at else None,
            'completed_at': job.completed_at.isoformat() if job.completed_at else None
        }
        
        if job.status == 'completed':
            analysis = AnalysisResult.query.filter_by(job_id=job_id).first()
            if analysis:
                result['analysis'] = analysis.to_dict()
        
        return result
    
    def _process_analysis_job(self, job_id: str):
        """Process analysis job synchronously"""
        try:
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if not job:
                return
            
            job.status = 'processing'
            job.started_at = datetime.utcnow()
            job.progress = 10
            db.session.commit()
            
            scenario = PartnershipScenario.query.get(job.scenario_id)
            if not scenario:
                job.status = 'failed'
                job.error_message = 'Scenario not found'
                db.session.commit()
                return
            
            time.sleep(2)
            job.progress = 50
            db.session.commit()
            
            # Generate unique analysis
            analysis_data = self._generate_analysis(scenario)
            
            time.sleep(3)
            job.progress = 90
            db.session.commit()
            
            # Create analysis result
            analysis_result = AnalysisResult(
                job_id=job_id,
                scenario_id=scenario.id,
                brand_alignment_score=analysis_data['brand_alignment_score'],
                audience_overlap_percentage=analysis_data['audience_overlap_percentage'],
                roi_projection=analysis_data['roi_projection'],
                risk_level=analysis_data['risk_level'],
                recommendations=analysis_data['recommendations'],
                key_risks=analysis_data['key_risks'],
                market_insights=analysis_data['market_insights'],
                analysis_duration=analysis_data['analysis_duration'],
                tokens_used=analysis_data.get('tokens_used', 0)
            )
            
            db.session.add(analysis_result)
            
            job.status = 'completed'
            job.progress = 100
            job.completed_at = datetime.utcnow()
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Analysis job {job_id} failed: {str(e)}")
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if job:
                job.status = 'failed'
                job.error_message = str(e)
                db.session.commit()
    
    def _generate_analysis(self, scenario: PartnershipScenario) -> Dict[str, Any]:
        """Generate unique analysis results based on brand combination"""
        
        # Create deterministic but unique scores based on brand names
        brand_hash = hash(f"{scenario.brand_a.lower()}{scenario.brand_b.lower()}")
        
        base_alignment = 5.0 + (abs(brand_hash) % 50) / 10.0  # 5.0 - 10.0
        base_overlap = 30 + (abs(brand_hash) % 50)  # 30 - 80%
        base_roi = 100 + (abs(brand_hash) % 200)  # 100 - 300%
        
        # Adjust based on partnership type
        type_multipliers = {
            'co-branding': {'alignment': 1.1, 'overlap': 1.2, 'roi': 1.1},
            'sponsorship': {'alignment': 0.9, 'overlap': 0.8, 'roi': 1.3},
            'collaboration': {'alignment': 1.0, 'overlap': 1.0, 'roi': 1.0},
            'event': {'alignment': 0.8, 'overlap': 1.1, 'roi': 0.9},
            'licensing': {'alignment': 1.2, 'overlap': 0.9, 'roi': 1.2}
        }
        
        multiplier = type_multipliers.get(scenario.partnership_type, {'alignment': 1.0, 'overlap': 1.0, 'roi': 1.0})
        
        brand_alignment_score = min(10.0, base_alignment * multiplier['alignment'])
        audience_overlap_percentage = min(85.0, base_overlap * multiplier['overlap'])
        roi_projection = base_roi * multiplier['roi']
        
        # Determine risk level
        if brand_alignment_score >= 8.0 and audience_overlap_percentage >= 60:
            risk_level = 'low'
        elif brand_alignment_score >= 6.0 and audience_overlap_percentage >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Generate recommendations
        recommendations = []
        key_risks = []
        
        if brand_alignment_score < 7.0:
            recommendations.append("Consider refining partnership strategy to improve alignment")
        if audience_overlap_percentage < 50:
            recommendations.append("Explore cross-promotion opportunities to increase audience overlap")
        if roi_projection < 150:
            recommendations.append("Review budget allocation to optimize ROI potential")
        
        if risk_level == 'high':
            key_risks.append("Significant brand misalignment may impact partnership success")
        if audience_overlap_percentage < 30:
            key_risks.append("Low audience overlap may limit cross-promotion effectiveness")
        
        if not recommendations:
            recommendations.append("Partnership shows strong potential - proceed with detailed planning")
        
        if not key_risks:
            key_risks.append("Monitor market response and adjust strategy as needed")
        
        market_insights = {
            "brand_synergy": f"Analysis shows {'strong' if brand_alignment_score >= 8 else 'moderate' if brand_alignment_score >= 6 else 'limited'} synergy between {scenario.brand_a} and {scenario.brand_b}",
            "audience_analysis": f"Target audience overlap of {audience_overlap_percentage:.0f}% indicates {'excellent' if audience_overlap_percentage >= 70 else 'good' if audience_overlap_percentage >= 50 else 'moderate'} cross-promotion potential"
        }
        
        return {
            'brand_alignment_score': round(brand_alignment_score, 1),
            'audience_overlap_percentage': round(audience_overlap_percentage, 1),
            'roi_projection': round(roi_projection, 1),
            'risk_level': risk_level,
            'recommendations': recommendations,
            'key_risks': key_risks,
            'market_insights': market_insights,
            'analysis_duration': 5.0,
            'tokens_used': 0
        }
