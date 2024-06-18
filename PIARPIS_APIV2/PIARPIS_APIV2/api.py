#flask api
import requests
from flask import Flask, request, jsonify, Response
from flask_pymongo import PyMongo
import json
from config import config
from functools import wraps
from datetime import datetime as dt
from flask_cors import CORS
from bson import json_util
from datetime import datetime, timedelta, timezone
import controllers.authController as authController
import bcrypt
import middleware.tokenMiddleware as tokenMiddleware
from bson import ObjectId
from flask_socketio import SocketIO, emit

api = Flask(__name__)
socketio = SocketIO(api, cors_allowed_origins="*")
cors = CORS(api)

api.config['CORS_HEADERS'] = 'Content-Type'
api.config['MONGO_URI'] = 'mongodb://localhost:27017/piaprisPrueba'

mongo = PyMongo(api)

conf = config()

session = []

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = tokenMiddleware.decode_token(token)
            if not data:
                return jsonify({'message': 'Token is invalid or expired!'}), 401
            # Obtener el usuario basado en los datos del token
            current_user = mongo.db.users.find_one({'username': data['username']})
        except Exception as e:
            print(f"Error decoding token: {e}")
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user,*args, **kwargs)
    return decorated

@api.route('/login', methods=['POST'])
def login():
    response = authController.login()
    return response
    
@api.route('/',methods=['GET'])
def ping():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>PIARPIS API</title>
    </head>
    <body>

        <h1>PIARPIS API</h1>
        <p>the WSGI is working and the api is available. Hopefully...</p>

        <iframe style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&mute=0" title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen></iframe>
    </body>
    </html>
    """
    return html


@api.route('/insert', methods=['POST'])
@login_required
def addToDB(current_user):
    try:
        name = request.json['username']
        plate = request.json['plate']
        house = request.json['house']
        model = request.json['model']
        inicial_time = request.json['in_time']
        final_time = request.json['out_time']
        parking = mongo.db.parkings.insert_one({"username": name, "plate": plate, "house": house,"model":model, "in_time": inicial_time, "out_time": final_time,"inside": False, "status": "active"})
        texto = (f"this user  {current_user['_id']} inserted a parking ----> {parking}")
        print(texto)
        log = {"InsertionLog": texto, "date": dt.now()}
        mongo.db.log.insert_one(log)
        return jsonify({'message': 'added to parking register'}), 200 #TODO: search a less silly message
    except Exception as e:
        print(f"Error adding to parking insert ----> {e}\n\n")
        return jsonify({'message': 'error adding to parking register'}), 500

@api.route('/get', methods=['GET'])
@login_required
def getParkingDB(current_user): # get all the parkings of the user
    try:
        parkings = mongo.db.parkings.find()

        # Convert the cursor to a list and modify the '_id' field
        parkings_list = []
        for parking in parkings:
            parking['id_'] = str(parking['_id'])  # Convert ObjectId to string
            del parking['_id']  # Remove the original _id field
            parkings_list.append(parking)
        
        responseList = json_util.dumps(parkings_list)
        print(f"Getting parkings ----> \n\n")
        return Response(responseList, mimetype='application/json'), 200
    except Exception as e:
        print(f"Error getting parkings ----> {e}\n\n")
        return jsonify({'message': 'error getting parkings'}), 500
    
@api.route('/delete/<id>', methods=['POST'])
@login_required
def deleteFromDB(current_user,id):
    try:
        
        userFound = mongo.db.parkings.find_one({"_id": ObjectId (id)})    
        print(userFound)  
        mongo.db.parkings.update_one({"_id": ObjectId (id)},{"$set": {"status": "inactive"}})
        texto = (f"this user  {current_user['_id']} Deleted a parking ----> {id}")
        print(texto)
        log = {"DeletedLog": texto, "date": dt.now()}
        mongo.db.log.insert_one(log)
        return jsonify({'message': 'deleted from parking register'}), 200 
    except Exception as e:
        print(f"Error deleting from parking register ----> {e}\n\n")
        return jsonify({'message': 'error deleting from parking register'}), 500

@api.route('/update/<id>', methods=['PUT'])
@login_required
def update_parking(current_user,id):
    print(id)
    updates = {
        "username": request.json.get('username'),
        "plate": request.json.get('plate'),
        "house": request.json.get('house'),
        "model":request.json.get('model'),
        "in_time": request.json.get('in_time'),
        "out_time": request.json.get('out_time')
        }

    mongo.db.parkings.update_one({"_id": ObjectId (id)}, {"$set": updates})
    texto = (f"this user  {current_user['_id']} Updated a parking ----> {id}")
    print(texto)
    log = {"UpdateLog": texto, "date": dt.now()}
    mongo.db.log.insert_one(log)
    response = jsonify({'message': 'User ' + id + ' was Updated successfully'})
    return response
    
@api.route('/plate', methods=['POST'])
def plate():
    try:
        plate = request.json.get('plate')
        print(f"Searching for plate ----> {plate}\n\n")
        platefound = mongo.db.parkings.find_one({'plate': plate})
        if platefound:
            response = {'message': 'plate found'}, 200
            socketio.emit('new_data', {'message': 'plate found', 'plate': plate})
            print(f"Plate found ----> {plate}\n\n")
            historico = {"plate": plate, "date": dt.now(), "resident": True}
            mongo.db.historic.insert_one(historico)
            mongo.db.parkings.update_one({'plate': plate}, {'$set': {'inside': True}})       
            return jsonify(response), 200
        else:
            response = {'message': 'plate not found'}, 404
            socketio.emit('new_data', {'message': 'plate not found', 'plate': plate})
            historico = {"plate": plate, "date": dt.now(), "resident": False}
            mongo.db.historic.insert_one(historico)
            print(f"Plate not found ----> {plate}\n\n")
            return jsonify(response), 404
    except Exception as e:
        print(f"Error searching for plate ----> {e}\n\n")
        socketio.emit('new_data', {'message': 'error searching for plate'})
        return jsonify({'message': 'error searching for plate'}), 500

@api.route('/insert_plate', methods=['POST'])
def insert_plate():
    try:
        plate = request.json.get('plate')
        print(f"Inserting plate ----> {plate}\n\n")
        mongo.db.plates.insert_one({'plate': plate})
        return jsonify({'message': ' {plate} plate inserted'}), 200
    except Exception as e:
        print(f"Error inserting plate ----> {e}\n\n")
        return jsonify({'message': 'error inserting plate'}), 500
    

@api.route('/user', methods=['POST'])
def user():
    try:
        username = request.json.get('username')
        password = request.json.get('password')
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        print(hashed_password)
        if(username and password):
            mongo.db.users.insert_one({'username': username,'password':hashed_password})
        return jsonify({'message': 'User  {username}  created'}), 200
    except Exception as e:
        print(f"Error creating user ----> {e}\n\n")
        return jsonify({'message': 'error creating User'}), 500

@api.route('/removeUser', methods=['POST'])
def removeUser():
    try:
        plate = request.json.get('plate')
        print(f"Inserting plate ----> {plate}\n\n")
        mongo.db.plates.insert_one({'plate': plate})
        return jsonify({'message': ' {plate} plate inserted'}), 200
    except Exception as e:
        print(f"Error inserting plate ----> {e}\n\n")
        return jsonify({'message': 'error inserting plate'}), 500     


if __name__ == '__main__':
    socketio.run(api,debug=True, host='0.0.0.0', port=6970)

'''
curl -X POST https://02loveslollipop.pythonanywhere.com/login -H "Content-Type: application/json" -d '{"username": "admin@piarpis.com", "password": "admin"}'

curl -X GET https://02loveslollipop.pythonanywhere.com/logout -H "hash:<replace with the hash from the login response>" #printed in the console when the user logs in

curl -X POST https://02loveslollipop.pythonanywhere.com/insert -H "Content-Type: application/json" -H "hash: <replace with the hash from the login response>" -d '{"Id": "7", "name": "test", "plate": "test", "invoice": "test", "inicial_time": "test", "final_time": "test"}'

curl -X GET https://02loveslollipop.pythonanywhere.com/get -H "hash: <replace with the hash from the login response>"

curl -X POST https://02loveslollipop.pythonanywhere.com/delete -H "Content-Type: application/json" -H "hash: <replace with the hash from the login response>" -d '{"Id": "2"}'

curl -X POST https://02loveslollipop.pythonanywhere.com/update -H "Content-Type: application/json" -H "hash: <replace with the hash from the login response>" -d '{"Id": "4", "new_name": "test", "new_plate": "test", "new_inicial_time": "test", "new_final_time": "test", "new_invoice": "test"}'
'''
