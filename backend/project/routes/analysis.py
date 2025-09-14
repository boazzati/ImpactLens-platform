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
        return jsonify({"error": "Failed to create scenario"}), 500

@analysis_bp.route("/scenarios/<int:scenario_id>/analyze", methods=["POST"])
@jwt_required()
def analyze_scenario(scenario_id):
    try:
        user_id = get_jwt_identity()
        scenario = PartnershipScenario.query.filter_by(id=scenario_id, user_id=user_id).first()
        
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        job_service = current_app.config["job_service"]
        job_id = job_service.start_analysis(scenario.to_dict())
        
        return jsonify({
            "job_id": job_id,
            "status": "started",
            "message": "Analysis job started"
        }), 202
        
    except Exception as e:
        logger.error(f"Analysis start failed: {str(e)}")
        return jsonify({"error": "Failed to start analysis"}), 500

@analysis_bp.route("/jobs/<job_id>", methods=["GET"])
@jwt_required()
def get_job_status(job_id):
    try:
        job_service = current_app.config["job_service"]
        job_status = job_service.get_job_status(job_id)
        
        if not job_status:
            return jsonify({"error": "Job not found"}), 404
        
        return jsonify(job_status), 200
        
    except Exception as e:
        logger.error(f"Job status check failed: {str(e)}")
        return jsonify({"error": "Failed to get job status"}), 500

@analysis_bp.route("/test-openai", methods=["POST"])
def test_openai():
    """Test endpoint to directly call OpenAI service with detailed logging"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Add some default values for testing
        scenario_data = {
            "brand_a": data.get("brand_a", "Test Brand A"),
            "brand_b": data.get("brand_b", "Test Brand B"),
            "partnership_type": data.get("partnership_type", "Test"),
            "target_audience": data.get("target_audience", "Millennials, Gen Z, Hypebeasts"),
            "budget_range": data.get("budget_range", "$1M - $5M")
        }
        
        logger.info(f"🧪 Testing OpenAI with scenario: {scenario_data}")
        
        openai_service = current_app.config["openai_service"]
        result = openai_service.analyze_partnership(scenario_data)
        
        # Log which service was actually used
        service_used = result.get("service_used", "unknown")
        if service_used == "openai":
            logger.info("✅ REAL OpenAI API was used successfully!")
        elif service_used == "mock":
            logger.info("⚠️ Mock service was used (OpenAI not available)")
        elif service_used == "mock_fallback":
            logger.warning(f"⚠️ Fell back to mock service due to error: {result.get('openai_error', 'Unknown error')}")
        
        logger.info(f"📊 Analysis result summary: {result.get('status', 'unknown')} - Service: {service_used}")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Test OpenAI failed: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500

@analysis_bp.route("/scenarios", methods=["GET"])
@jwt_required()
def get_scenarios():
    try:
        user_id = get_jwt_identity()
        scenarios = PartnershipScenario.query.filter_by(user_id=user_id).all()
        
        return jsonify([scenario.to_dict() for scenario in scenarios]), 200
        
    except Exception as e:
        logger.error(f"Get scenarios failed: {str(e)}")
        return jsonify({"error": "Failed to get scenarios"}), 500
