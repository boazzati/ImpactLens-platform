#!/usr/bin/env python3
"""
Heroku entry point for ImpactLens Platform
This file ensures Heroku can find and run the Flask application correctly.
"""

import os
import sys

# Add the backend/src directory to Python path
backend_src_path = os.path.join(os.path.dirname(__file__), 'backend', 'src')
sys.path.insert(0, backend_src_path)

# Change working directory to backend/src
os.chdir(backend_src_path)

# Import the Flask app from main.py
from main import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
