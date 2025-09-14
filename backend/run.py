import os
from project import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    is_dev = os.getenv("FLASK_ENV") == "development"
    
    if is_dev:
        print(f"🚀 Starting ImpactLens API in development mode on port {port}")
        app.run(host="0.0.0.0", port=port, debug=True)
    else:
        print(f"🚀 Starting ImpactLens API in production mode on port {port}")
        app.run(host="0.0.0.0", port=port, debug=False)
