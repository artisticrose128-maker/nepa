from flask import Flask, request, jsonify
from auth import token_required, roles_required, generate_token
import os

app = Flask(__name__)

# Dummy model inference function
def run_model_inference(data):
    # This represents a placeholder for actual ML model inference
    return {"status": "success", "result": "Classification result for given data"}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "UP", "service": "ml-model-api"})

@app.route('/predict', methods=['POST'])
@token_required
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    result = run_model_inference(data)
    return jsonify(result)

@app.route('/admin/stats', methods=['GET'])
@token_required
@roles_required('admin')
def get_stats():
    # Only admins can access this endpoint
    return jsonify({
        "total_inferences": 150,
        "active_models": 2,
        "up_time": "24h"
    })

# Helper route to generate tokens (for testing purposes)
@app.route('/login', methods=['POST'])
def login():
    credentials = request.get_json()
    if not credentials:
        return jsonify({"message": "Missing credentials"}), 400
    
    user_id = credentials.get('user_id')
    password = credentials.get('password')
    role = credentials.get('role', 'user')

    # Simple identification check for placeholder purposes
    if user_id and password == "password": # Dummy check
        token = generate_token(user_id, role)
        return jsonify({"token": f"Bearer {token}"})
    else:
        return jsonify({"message": "Could not verify"}), 401

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
