import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
ALGORITHM = 'HS256'

def generate_token(user_id, role):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id,
        'role': role
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            return jsonify({'message': f'Token error: {str(e)}'}), 401

        return f(*args, **kwargs)
    return decorated

def roles_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'message': 'Authentication required!'}), 401
            
            user_role = request.user.get('role')
            if user_role not in roles:
                return jsonify({'message': 'Insufficient permissions!'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return wrapper
