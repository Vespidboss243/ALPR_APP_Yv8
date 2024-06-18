#flask api
from flask import request, jsonify
from config import config
from api import mongo
import middleware.tokenMiddleware as tokenMiddleware
import bcrypt
conf = config()

def login(): 
    try:
        username = request.json.get('username')
        password = request.json.get('password')
        token = request.headers.get('token')
        if(token):
            return jsonify({'message': 'user already logged in'}), 401
        if checkPassword(username,password):
            token = tokenMiddleware.generate_token(username)
            return jsonify({'token': token}), 200
        else:
            return jsonify({'message': 'login failed'}), 401
    except Exception as e:
        return jsonify({'message': 'error in route login '}), 500
    
def checkPassword(username,password) -> bool:
    try:
        userFound = mongo.db.users.find_one({'username': username})
        print(f"User found ----> {userFound['username']}\n\n")
        if not userFound:
            return False
        
        #password = password.encode('utf-8')
        
        #if bcrypt.checkpw(password, userpassword):
        if (password == userFound['password']):
            return True
        else:
            return False
    except Exception as e:
        print(f"Error checking password ----> {e}\n\n")
        return False
