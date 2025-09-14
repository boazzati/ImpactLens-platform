from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class PartnershipScenario(db.Model):
    __tablename__ = 'partnership_scenarios'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    brand_a = db.Column(db.String(100), nullable=False)
    brand_b = db.Column(db.String(100), nullable=False)
    partnership_type = db.Column(db.String(50), nullable=False)
    target_audience = db.Column(db.Text)
    budget_range = db.Column(db.String(50))
    status = db.Column(db.String(20), default='draft')  # draft, analyzing, completed, archived
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Analysis results
    analysis_results = db.relationship('AnalysisResult', backref='scenario', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'brand_a': self.brand_a,
            'brand_b': self.brand_b,
            'partnership_type': self.partnership_type,
            'target_audience': self.target_audience,
            'budget_range': self.budget_range,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'analysis_results': [result.to_dict() for result in self.analysis_results]
        }

class AnalysisResult(db.Model):
    __tablename__ = 'analysis_results'
    
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.Integer, db.ForeignKey('partnership_scenarios.id'), nullable=False)
    job_id = db.Column(db.String(100), unique=True, nullable=False)
    
    # Analysis metrics
    brand_alignment_score = db.Column(db.Float)
    audience_overlap_percentage = db.Column(db.Float)
    roi_projection = db.Column(db.Float)
    risk_level = db.Column(db.String(20))  # low, medium, high
    
    # Detailed analysis
    key_risks = db.Column(db.Text)  # JSON string
    recommendations = db.Column(db.Text)  # JSON string
    market_insights = db.Column(db.Text)  # JSON string
    
    # Metadata
    tokens_used = db.Column(db.Integer)
    analysis_duration = db.Column(db.Float)  # seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scenario_id': self.scenario_id,
            'job_id': self.job_id,
            'brand_alignment_score': self.brand_alignment_score,
            'audience_overlap_percentage': self.audience_overlap_percentage,
            'roi_projection': self.roi_projection,
            'risk_level': self.risk_level,
            'key_risks': json.loads(self.key_risks) if self.key_risks else [],
            'recommendations': json.loads(self.recommendations) if self.recommendations else [],
            'market_insights': json.loads(self.market_insights) if self.market_insights else {},
            'tokens_used': self.tokens_used,
            'analysis_duration': self.analysis_duration,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AnalysisJob(db.Model):
    __tablename__ = 'analysis_jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(100), unique=True, nullable=False)
    scenario_id = db.Column(db.Integer, db.ForeignKey('partnership_scenarios.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    progress = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'scenario_id': self.scenario_id,
            'user_id': self.user_id,
            'status': self.status,
            'progress': self.progress,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
