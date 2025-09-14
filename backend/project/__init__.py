import os
import logging
from datetime import timedelta

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Import database instance
from .models import db

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s")

def create_app():
    app = Flask(__name__, static_folder="static")

    # --- Configuration ---
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "impactlens_secret_key_2024")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "impactlens_secret_key_2024")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    db_path = os.path.join(os.path.dirname(__file__), "database", "app.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --- Initialize Extensions ---
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "https://*.vercel.app", "https://*.herokuapp.com"], supports_credentials=True)
    jwt = JWTManager(app)
    db.init_app(app)

    # --- JWT Error Handlers ---
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization token required"}), 401

    # --- Import and Initialize Services ---
    try:
        from .services import OpenAIService
        openai_service = OpenAIService()
        # Test the service with a simple call
        test_result = openai_service.analyze_partnership({
            "brand_a": "Test Brand A",
            "brand_b": "Test Brand B", 
            "partnership_type": "Test"
        })
        if test_result["status"] == "error":
            raise Exception(f"OpenAI service test failed: {test_result['error']}")
        logging.info("Using real OpenAI service")
    except Exception as e:
        logging.warning(f"OpenAI service failed, using mock service: {str(e)}")
        from .services.mock_openai_service import MockOpenAIService
        openai_service = MockOpenAIService()
    
    from .services import JobService
    with app.app_context():
        app.config["openai_service"] = openai_service
        app.config["job_service"] = JobService(app, app.config["openai_service"])

    # --- Import and Register Blueprints ---
    from .routes import user_bp, analysis_bp
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")

    # --- Create Database Tables ---
    with app.app_context():
        db.create_all()

    # --- Define Root and Health Check Routes ---
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "healthy", "service": "ImpactLens API", "version": "2.1.0"}

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

    logging.info("Flask application created successfully.")
    return app
