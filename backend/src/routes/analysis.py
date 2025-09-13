from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from src.models.user import User, db
from src.models.analysis import PartnershipScenario, AnalysisJob, AnalysisResult
from src.services.job_service import JobService
import logging

analysis_bp = Blueprint('analysis', __name__)
job_service = JobService()
logger = logging.getLogger(__name__)

@analysis_bp.route('/auth/demo-login', methods=['POST'])
def demo_login():
    """Demo login endpoint"""
    try:
        demo_user = User.query.filter_by(username='demo_user').first()
        if not demo_user:
            demo_user = User(username='demo_user', email='demo@impactlens.com')
            db.session.add(demo_user)
            db.session.commit()
        
        access_token = create_access_token(identity=demo_user.id)
        
        return jsonify({
            "access_token": access_token,
            "user": demo_user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Demo login failed: {str(e)}")
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

@analysis_bp.route('/scenarios', methods=['POST'])
def create_scenario():
    """Create new partnership scenario"""
    try:
        demo_user = User.query.filter_by(username='demo_user').first()
        if not demo_user:
            demo_user = User(username='demo_user', email='demo@impactlens.com')
            db.session.add(demo_user)
            db.session.commit()
        
        user_id = demo_user.id
        data = request.get_json()
        
        required_fields = ['brand_a', 'brand_b', 'partnership_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        scenario = PartnershipScenario(
            user_id=user_id,
            brand_a=data['brand_a'],
            brand_b=data['brand_b'],
            partnership_type=data['partnership_type'],
            target_audience=data.get('target_audience', ''),
            budget_range=data.get('budget_range', ''),
            status='draft'
        )
        
        db.session.add(scenario)
        db.session.commit()
        
        return jsonify(scenario.to_dict()), 201
        
    except Exception as e:
        logger.error(f"Scenario creation failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/scenarios', methods=['GET'])
def get_scenarios():
    """Get user's scenarios"""
    try:
        demo_user = User.query.filter_by(username='demo_user').first()
        if not demo_user:
            return jsonify({"scenarios": []}), 200
        
        user_id = demo_user.id
        
        scenarios = PartnershipScenario.query.filter_by(user_id=user_id).all()
        return jsonify({
            "scenarios": [scenario.to_dict() for scenario in scenarios]
        }), 200
        
    except Exception as e:
        logger.error(f"Scenario retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/scenarios/<int:scenario_id>/analyze', methods=['POST'])
def analyze_scenario(scenario_id):
    """Start analysis for a scenario"""
    try:
        demo_user = User.query.filter_by(username='demo_user').first()
        if not demo_user:
            return jsonify({"error": "Demo user not found"}), 404
        
        user_id = demo_user.id
        
        scenario = PartnershipScenario.query.filter_by(
            id=scenario_id, 
            user_id=user_id
        ).first()
        
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        existing_job = AnalysisJob.query.filter_by(
            scenario_id=scenario_id,
            status='processing'
        ).first()
        
        if existing_job:
            return jsonify({
                "job_id": existing_job.job_id,
                "message": "Analysis already in progress",
                "status": "processing"
            }), 200
        
        job_id = job_service.create_analysis_job(scenario_id, user_id)
        
        scenario.status = 'analyzing'
        db.session.commit()
        
        return jsonify({
            "job_id": job_id,
            "message": "Analysis job created successfully",
            "status": "pending"
        }), 200
        
    except Exception as e:
        logger.error(f"Analysis creation failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get analysis job status and results"""
    try:
        demo_user = User.query.filter_by(username='demo_user').first()
        if not demo_user:
            return jsonify({"error": "Demo user not found"}), 404
        
        user_id = demo_user.id
        
        job = AnalysisJob.query.filter_by(job_id=job_id, user_id=user_id).first()
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        job_status = job_service.get_job_status(job_id)
        if not job_status:
            return jsonify({"error": "Job not found"}), 404
        
        return jsonify(job_status), 200
        
    except Exception as e:
        logger.error(f"Job status retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/partner-suggestions', methods=['POST'])
def get_partner_suggestions():
    """Get AI-powered partner suggestions for a brand"""
    try:
        data = request.get_json()
        brand_name = data.get('brand_name')
        industry = data.get('industry', '')
        
        if not brand_name:
            return jsonify({"error": "Brand name is required"}), 400
        
        # Mock suggestions for now
        suggestions = {
            "suggestions": [
                {"brand": f"Partner A for {brand_name}", "score": 85, "reason": "Strong brand alignment"},
                {"brand": f"Partner B for {brand_name}", "score": 78, "reason": "Complementary audience"},
                {"brand": f"Partner C for {brand_name}", "score": 72, "reason": "Market synergy"}
            ]
        }
        return jsonify(suggestions), 200
        
    except Exception as e:
        logger.error(f"Partner suggestions failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
