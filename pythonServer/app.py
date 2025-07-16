from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

from routes.sensors_routes import sensors_bp
from extensions import socketio  # import shared socketio

# Load .env variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret-key'

socketio.init_app(app, cors_allowed_origins="*")

# Logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')

# MongoDB setup
MONGODB_URL = os.getenv("MONGODB_URL")
client = MongoClient(MONGODB_URL)
db = client['micro_db']

@app.before_request
def attach_globals():
    request.db = db

@app.after_request
def log_request(response):
    logging.info(f'{request.method} {request.path} → {response.status_code}')
    return response

app.register_blueprint(sensors_bp, url_prefix="/sensors")

@app.route('/')
def home():
    return "Flask server with real-time support."

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
