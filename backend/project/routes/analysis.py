from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from ..models import db, PartnershipScenario, AnalysisJob, AnalysisResult, User
import logging

analysis_bp = Blueprint("analysis", __name__)
logger = logging.getLogger(__name__)

@analysis_bp.route("/auth/demo-login", methods=["POST"])
def demo_login():
    try:
        demo_user = User.query.filter_by(username="demo_user").first()
        if not demo_user:
            demo_user = User(username="demo_user", email="demo@impactlens.com")
            db.session.add(demo_user)
            db.session.commit()
        
        access_token = create_access_token(identity=demo_user.id)
        
        return jsonify({
            "access_token": access_token,
            "user": demo_user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Demo login failed: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

@analysis_bp.route("/scenarios", methods=["POST"])
@jwt_required()
def create_scenario():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ["brand_a", "brand_b", "partnership_type"]
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing required fields",
                "required": required_fields
            }), 400
        
        scenario = PartnershipScenario(
            user_id=user_id,
            brand_a=data["brand_a"],
            brand_b=data["brand_b"],
            partnership_type=data["partnership_type"],
            target_audience=data.get("target_audience", ""),
            budget_range=data.get("budget_range", ""),
            status="draft"
        )
        
        db.session.add(scenario)
        db.session.commit()
        
        return jsonify(scenario.to_dict()), 201
        
    except Exception as e:
        logger.error(f"Scenario creation failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route("/scenarios/<int:scenario_id>/analyze", methods=["POST"])
@jwt_required()
def analyze_scenario(scenario_id):
    try:
        user_id = get_jwt_identity()
        job_service = current_app.config["job_service"]
        
        scenario = PartnershipScenario.query.filter_by(id=scenario_id, user_id=user_id).first()
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        job_id = job_service.create_analysis_job(scenario_id, user_id)
        
        scenario.status = "analyzing"
        db.session.commit()
        
        return jsonify({
            "job_id": job_id,
            "status": "pending",
            "message": "Analysis job created successfully"
        }), 202
        
    except Exception as e:
        logger.error(f"Analysis creation failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@analysis_bp.route("/jobs/<job_id>", methods=["GET"])
@jwt_required()
def get_job_status(job_id):
    try:
        user_id = get_jwt_identity()
        job_service = current_app.config["job_service"]
        
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

@analysis_bp.route("/test-openai", methods=["POST"])
def test_openai():
    """Test endpoint to directly call OpenAI service"""
    try:
        data = request.get_json() or {}
        openai_service = current_app.config["openai_service"]
        
        # Test scenario data
        scenario_data = {
            "brand_a": data.get("brand_a", "Louis Vuitton"),
            "brand_b": data.get("brand_b", "Supreme"),
            "partnership_type": data.get("partnership_type", "Co-Branding"),
            "target_audience": "Millennials, Gen Z, Hypebeasts",
            "budget_range": "$1M - $5M"
        }
        
        logger.info(f"Testing OpenAI with scenario: {scenario_data}")
        result = openai_service.analyze_partnership(scenario_data)
        logger.info(f"OpenAI result: {result}")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"OpenAI test failed: {str(e)}")
        return jsonify({"error": str(e)}), 500
