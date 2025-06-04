from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/")
def index():
    return "Hello from ghost-rdp backend!"

@app.route("/api/status")
def status():
    return jsonify({"status": "OK", "message": "Backend is running."})

# Add more backend routes as needed

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
