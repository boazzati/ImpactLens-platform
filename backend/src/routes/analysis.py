from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from src.models.analysis import PartnershipScenario, AnalysisJob, AnalysisResult, db
from src.models.user import User
from src.services.job_service import JobService
from src.services.openai_service import OpenAIService
import logging

analysis_bp = Blueprint('analysis', __name__)
job_service = JobService()
openai_service = OpenAIService()
logger = logging.getLogger(__name__)

# Simple auth for demo - in production, use proper JWT with user registration
@analysis_bp.route('/auth/demo-login', methods=['POST'])
def demo_login():
    """
    Demo login endpoint - creates or gets demo user
    """
    try:
        # Get or create demo user
        demo_user = User.query.filter_by(username='demo_user').first()
        if not demo_user:
            demo_user = User(username='demo_user', email='demo@impactlens.com')
            db.session.add(demo_user)
            db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=demo_user.id)
        
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
    Create new partnership scenario
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
        
        # Create scenario
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
    Start analysis for a scenario
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
        
        # Check if analysis is already in progress
        existing_job = AnalysisJob.query.filter_by(
            scenario_id=scenario_id,
            status='processing'
        ).first()
        
        if existing_job:
            return jsonify({
                "job_id": existing_job.job_id,
                "status": "already_processing",
                "message": "Analysis already in progress"
            }), 200
        
        # Create analysis job
        job_id = job_service.create_analysis_job(scenario_id, user_id)
        
        # Update scenario status
        scenario.status = 'analyzing'
        db.session.commit()
        
        return jsonify({
            "job_id": job_id,
            "status": "pending",
            "message": "Analysis job created successfully"
        }), 202
        
    except Exception as e:
        logger.error(f"Analysis creation failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/jobs/<job_id>', methods=['GET'])
@jwt_required()
def get_job_status(job_id):
    """
    Get analysis job status and results
    """
    try:
        user_id = get_jwt_identity()
        
        # Verify job ownership
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
@jwt_required()
def get_partner_suggestions():
    """
    Get AI-powered partner suggestions
    """
    try:
        data = request.get_json()
        brand_name = data.get('brand_name')
        industry = data.get('industry')
        
        if not brand_name:
            return jsonify({"error": "Brand name is required"}), 400
        
        suggestions = openai_service.get_partnership_suggestions(brand_name, industry)
        return jsonify(suggestions), 200
        
    except Exception as e:
        logger.error(f"Partner suggestions failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """
    Get dashboard statistics for the user
    """
    try:
        user_id = get_jwt_identity()
        
        # Get scenario counts
        total_scenarios = PartnershipScenario.query.filter_by(user_id=user_id).count()
        completed_analyses = PartnershipScenario.query.filter_by(
            user_id=user_id, 
            status='completed'
        ).count()
        
        # Get average metrics from completed analyses
        completed_scenarios = PartnershipScenario.query.filter_by(
            user_id=user_id, 
            status='completed'
        ).all()
        
        avg_roi = 0
        avg_alignment = 0
        avg_overlap = 0
        
        if completed_scenarios:
            total_roi = sum(
                result.roi_projection 
                for scenario in completed_scenarios 
                for result in scenario.analysis_results
                if result.roi_projection
            )
            total_alignment = sum(
                result.brand_alignment_score 
                for scenario in completed_scenarios 
                for result in scenario.analysis_results
                if result.brand_alignment_score
            )
            total_overlap = sum(
                result.audience_overlap_percentage 
                for scenario in completed_scenarios 
                for result in scenario.analysis_results
                if result.audience_overlap_percentage
            )
            
            if completed_analyses > 0:
                avg_roi = total_roi / completed_analyses
                avg_alignment = total_alignment / completed_analyses
                avg_overlap = total_overlap / completed_analyses
        
        return jsonify({
            "total_scenarios": total_scenarios,
            "completed_analyses": completed_analyses,
            "avg_roi_projection": round(avg_roi, 1),
            "avg_brand_alignment": round(avg_alignment, 1),
            "avg_audience_overlap": round(avg_overlap, 1)
        }), 200
        
    except Exception as e:
        logger.error(f"Dashboard stats failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
