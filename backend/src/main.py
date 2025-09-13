from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'impactlens-secret-key-2024')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'impactlens-jwt-secret-2024')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///impactlens.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Fix for Heroku Postgres URL
    if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
        app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://', 1)
    
    # Import models FIRST (before initializing db)
    from src.models.user import db, User
    from src.models.analysis import PartnershipScenario, AnalysisJob, AnalysisResult
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    
    # CORS configuration
    CORS(app, origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "*"
    ] )
    
    # Import and register blueprints
    from src.routes.analysis import analysis_bp
    app.register_blueprint(analysis_bp, url_prefix='/api')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            "service": "ImpactLens Partnership Analysis API",
            "status": "healthy",
            "version": "1.0.0"
        })
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            "service": "ImpactLens Partnership Analysis API",
            "status": "running",
            "endpoints": [
                "/api/health",
                "/api/auth/demo-login",
                "/api/scenarios",
                "/api/scenarios/<id>/analyze",
                "/api/jobs/<job_id>"
            ]
        })
    
    # Create tables - models are already imported above
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully")
        except Exception as e:
            print(f"❌ Database creation failed: {e}")
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
