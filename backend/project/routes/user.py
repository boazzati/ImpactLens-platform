from flask import Blueprint, jsonify

user_bp = Blueprint("user", __name__)

@user_bp.route("/users/me", methods=["GET"])
def get_current_user():
    # In a real app, you would get the user from the session or token
    return jsonify({"username": "demo_user", "email": "demo@example.com"})

