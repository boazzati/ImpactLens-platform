from . import db
from datetime import datetime

class PartnershipScenario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    brand_a = db.Column(db.String(100), nullable=False)
    brand_b = db.Column(db.String(100), nullable=False)
    partnership_type = db.Column(db.String(100), nullable=False)
    target_audience = db.Column(db.String(200))
    budget_range = db.Column(db.String(100))
    status = db.Column(db.String(50), default="draft")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "brand_a": self.brand_a,
            "brand_b": self.brand_b,
            "partnership_type": self.partnership_type,
            "target_audience": self.target_audience,
            "budget_range": self.budget_range,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class AnalysisJob(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(36), unique=True, nullable=False)
    scenario_id = db.Column(db.Integer, db.ForeignKey("partnership_scenario.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    status = db.Column(db.String(50), default="pending")
    progress = db.Column(db.Integer, default=0)
    error_message = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

class AnalysisResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.Integer, db.ForeignKey("partnership_scenario.id"), nullable=False)
    job_id = db.Column(db.String(36), db.ForeignKey("analysis_job.job_id"), nullable=False)
    brand_alignment_score = db.Column(db.Float)
    audience_overlap_percentage = db.Column(db.Float)
    roi_projection = db.Column(db.Float)
    risk_level = db.Column(db.String(50))
    key_risks = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    market_insights = db.Column(db.Text)
    tokens_used = db.Column(db.Integer)
    analysis_duration = db.Column(db.Float)

    def to_dict(self):
        return {
            "id": self.id,
            "scenario_id": self.scenario_id,
            "job_id": self.job_id,
            "brand_alignment_score": self.brand_alignment_score,
            "audience_overlap_percentage": self.audience_overlap_percentage,
            "roi_projection": self.roi_projection,
            "risk_level": self.risk_level,
            "key_risks": self.key_risks,
            "recommendations": self.recommendations,
            "market_insights": self.market_insights,
            "tokens_used": self.tokens_used,
            "analysis_duration": self.analysis_duration
        }

