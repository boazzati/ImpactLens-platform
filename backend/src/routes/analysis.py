from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db
from src.models.analysis import PartnershipScenario, AnalysisJob, AnalysisResult
from src.services.job_service import JobService
import logging
import time
import uuid

logger = logging.getLogger(__name__)

analysis_bp = Blueprint('analysis', __name__)
job_service = JobService()

@analysis_bp.route('/auth/demo-login', methods=['GET'])
def demo_login():
    """Demo login endpoint for testing"""
    try:
        # Create or get demo user
        from src.models.user import User
        demo_user = User.query.filter_by(username='demo').first()
        if not demo_user:
            demo_user = User(username='demo', email='demo@impactlens.com')
            db.session.add(demo_user)
            db.session.commit()
        
        # Generate access token
        from flask_jwt_extended import create_access_token
        access_token = create_access_token(identity=demo_user.to_dict())
        
        return jsonify({
            "access_token": access_token,
            "user": demo_user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Demo login failed: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

@analysis_bp.route('/scenarios', methods=['POST'])
@jwt_required()
def create_scenario():
    """
    Create new partnership scenario - ALWAYS GENERATES FRESH RESULTS
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['brand_a', 'brand_b', 'partnership_type']
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing required fields",
                "required": required_fields
            }), 400
        
        # Create scenario with UNIQUE IDENTIFIER to force fresh analysis
        unique_suffix = f"_{int(time.time())}_{str(uuid.uuid4())[:8]}"
        scenario = PartnershipScenario(
            user_id=user_id,
            brand_a=data['brand_a'] + unique_suffix,  # Make it unique
            brand_b=data['brand_b'] + unique_suffix,  # Make it unique
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
@jwt_required()
def get_scenarios():
    """
    Get user's scenarios
    """
    try:
        user_id = get_jwt_identity()
        scenarios = PartnershipScenario.query.filter_by(user_id=user_id).order_by(
            PartnershipScenario.created_at.desc()
        ).all()
        
        return jsonify([scenario.to_dict() for scenario in scenarios]), 200
        
    except Exception as e:
        logger.error(f"Scenarios retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/scenarios/<int:scenario_id>', methods=['GET'])
@jwt_required()
def get_scenario(scenario_id):
    """
    Get specific scenario
    """
    try:
        user_id = get_jwt_identity()
        scenario = PartnershipScenario.query.filter_by(
            id=scenario_id,
            user_id=user_id
        ).first()
        
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        return jsonify(scenario.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Scenario retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/scenarios/<int:scenario_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_scenario(scenario_id):
    """
    Start analysis for a scenario - ALWAYS CREATES NEW ANALYSIS
    """
    try:
        user_id = get_jwt_identity()
        
        # Verify scenario ownership
        scenario = PartnershipScenario.query.filter_by(
            id=scenario_id,
            user_id=user_id
        ).first()
        
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        # ALWAYS CREATE NEW ANALYSIS JOB - NO CACHING
        # Delete any existing jobs for this scenario to force fresh analysis
        existing_jobs = AnalysisJob.query.filter_by(scenario_id=scenario_id).all()
        for job in existing_jobs:
            db.session.delete(job)
        
        # Delete any existing results to force fresh analysis
        existing_results = AnalysisResult.query.filter_by(scenario_id=scenario_id).all()
        for result in existing_results:
            db.session.delete(result)
        
        db.session.commit()
        
        # Create fresh analysis job with unique identifier
        job_id = job_service.create_analysis_job(scenario_id, user_id)
        
        # Update scenario status
        scenario.status = 'analyzing'
        db.session.commit()
        
        return jsonify({
            "job_id": job_id,
            "status": "started",
            "message": "Fresh analysis started"
        }), 200
        
    except Exception as e:
        logger.error(f"Analysis start failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/jobs/<job_id>/status', methods=['GET'])
@jwt_required()
def get_job_status(job_id):
    """
    Get analysis job status
    """
    try:
        user_id = get_jwt_identity()
        
        # Get job status
        status = job_service.get_job_status(job_id)
        
        if status['status'] == 'completed':
            # Get the analysis result
            job = AnalysisJob.query.filter_by(job_id=job_id).first()
            if job:
                result = AnalysisResult.query.filter_by(scenario_id=job.scenario_id).first()
                if result:
                    status['analysis'] = result.to_dict()
        
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"Job status check failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/scenarios/<int:scenario_id>/results', methods=['GET'])
@jwt_required()
def get_analysis_results(scenario_id):
    """
    Get analysis results for a scenario
    """
    try:
        user_id = get_jwt_identity()
        
        # Verify scenario ownership
        scenario = PartnershipScenario.query.filter_by(
            id=scenario_id,
            user_id=user_id
        ).first()
        
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        # Get latest analysis result
        result = AnalysisResult.query.filter_by(scenario_id=scenario_id).order_by(
            AnalysisResult.created_at.desc()
        ).first()
        
        if not result:
            return jsonify({"error": "No analysis results found"}), 404
        
        return jsonify(result.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Results retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ImpactLens Partnership Analysis API",
        "version": "1.0.0"
    }), 200
