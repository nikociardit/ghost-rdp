import os
from flask import Flask, jsonify, request, abort, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
import subprocess
import uuid
import datetime

app = Flask(__name__)
CORS(app)

# ---- Configuration ----
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'ghost_rdp.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Load secrets from environment or default
RDP_GATEWAY = os.getenv('RDP_GATEWAY', 'rdp.gateway.example.com')
WG_API_URL = os.getenv('WG_API_URL', None)
SECRET_KEY = os.getenv('SECRET_KEY', 'supersecret')

db = SQLAlchemy(app)

# ---- Models ----

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    enabled = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat()
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default="pending", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AlertRule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    condition = db.Column(db.String(200), nullable=False)  # e.g. "task_count > 10"
    action = db.Column(db.String(200), nullable=False)     # e.g. "email:admin@example.com"
    enabled = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'condition': self.condition,
            'action': self.action,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat()
        }

class SupportTicket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="open", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WireGuardServer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    endpoint = db.Column(db.String(200), nullable=False)   # e.g., "vpn.example.com:51820"
    public_key = db.Column(db.String(200), nullable=False)
    private_key = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(100), nullable=False)    # e.g., "10.0.0.1/24"
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'endpoint': self.endpoint,
            'public_key': self.public_key,
            'address': self.address,
            'created_at': self.created_at.isoformat()
        }

class WireGuardPeer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(db.Integer, db.ForeignKey('wire_guard_server.id'), nullable=False)
    public_key = db.Column(db.String(200), nullable=False)
    allowed_ips = db.Column(db.String(200), nullable=False)
    preshared_key = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    server = db.relationship('WireGuardServer', backref=db.backref('peers', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'server_id': self.server_id,
            'public_key': self.public_key,
            'allowed_ips': self.allowed_ips,
            'preshared_key': self.preshared_key,
            'created_at': self.created_at.isoformat()
        }

class WindowsUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    enabled = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat()
        }

class LogEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'level': self.level,
            'message': self.message,
            'timestamp': self.timestamp.isoformat()
        }

# ---- Database initialization ----

@app.before_first_request
def create_tables():
    db.create_all()

# ---- Helper to log messages ----

def add_log(level, message):
    le = LogEntry(level=level, message=message)
    db.session.add(le)
    db.session.commit()

# ---- Routes ----

@app.route('/')
def index():
    return jsonify({'message': 'ghost-rdp backend running'})

# ---- Health Check ----
@app.route('/api/status')
def status():
    return jsonify({'status': 'OK', 'message': 'Backend is running.'})

# ---- User APIs ----
@app.route('/api/users', methods=['GET'])
def get_users():
    all_users = User.query.all()
    return jsonify({'users': [u.to_dict() for u in all_users]})

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    if not data or 'username' not in data:
        abort(400, description='Missing username')
    user = User(username=data['username'], enabled=data.get('enabled', True))
    db.session.add(user)
    try:
        db.session.commit()
        add_log('INFO', f'User created: {user.username}')
    except IntegrityError:
        db.session.rollback()
        abort(400, description='Username already exists')
    return jsonify(user.to_dict()), 201

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if 'username' in data:
        user.username = data['username']
    if 'enabled' in data:
        user.enabled = data['enabled']
    try:
        db.session.commit()
        add_log('INFO', f'User updated: {user.username}')
    except IntegrityError:
        db.session.rollback()
        abort(400, description='Username already exists')
    return jsonify(user.to_dict())

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    add_log('WARNING', f'User deleted: ID {user_id}')
    return jsonify({'message': 'User deleted'})

# ---- Task APIs ----
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    all_tasks = Task.query.all()
    return jsonify({'tasks': [t.to_dict() for t in all_tasks]})

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    if not data or 'description' not in data:
        abort(400, description='Missing description')
    task = Task(description=data['description'], status=data.get('status', 'pending'))
    db.session.add(task)
    db.session.commit()
    add_log('INFO', f'Task created: {task.description}')
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        task.status = data['status']
    db.session.commit()
    add_log('INFO', f'Task updated: ID {task_id} status {task.status}')
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    add_log('WARNING', f'Task deleted: ID {task_id}')
    return jsonify({'message': 'Task deleted'})

# ---- Alert APIs ----
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    all_alerts = AlertRule.query.all()
    return jsonify({'alerts': [a.to_dict() for a in all_alerts]})

@app.route('/api/alerts', methods=['POST'])
def add_alert():
    data = request.get_json()
    if not data or 'name' not in data or 'condition' not in data or 'action' not in data:
        abort(400, description='Missing parameters')
    alert = AlertRule(
        name=data['name'],
        condition=data['condition'],
        action=data['action'],
        enabled=data.get('enabled', True)
    )
    db.session.add(alert)
    db.session.commit()
    add_log('INFO', f'Alert created: {alert.name}')
    return jsonify(alert.to_dict()), 201

@app.route('/api/alerts/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id):
    alert = AlertRule.query.get_or_404(alert_id)
    data = request.get_json()
    if 'name' in data:
        alert.name = data['name']
    if 'condition' in data:
        alert.condition = data['condition']
    if 'action' in data:
        alert.action = data['action']
    if 'enabled' in data:
        alert.enabled = data['enabled']
    db.session.commit()
    add_log('INFO', f'Alert updated: ID {alert_id}')
    return jsonify(alert.to_dict())

@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    alert = AlertRule.query.get_or_404(alert_id)
    db.session.delete(alert)
    db.session.commit()
    add_log('WARNING', f'Alert deleted: ID {alert_id}')
    return jsonify({'message': 'Alert deleted'})

# ---- Support Ticket APIs ----
@app.route('/api/support', methods=['GET'])
def get_tickets():
    all_tickets = SupportTicket.query.all()
    return jsonify({'tickets': [t.to_dict() for t in all_tickets]})

@app.route('/api/support', methods=['POST'])
def add_ticket():
    data = request.get_json()
    if not data or 'title' not in data or 'description' not in data:
        abort(400, description='Missing parameters')
    ticket = SupportTicket(
        title=data['title'],
        description=data['description'],
        status=data.get('status', 'open')
    )
    db.session.add(ticket)
    db.session.commit()
    add_log('INFO', f'Support ticket created: {ticket.title}')
    return jsonify(ticket.to_dict()), 201

@app.route('/api/support/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    ticket = SupportTicket.query.get_or_404(ticket_id)
    data = request.get_json()
    if 'title' in data:
        ticket.title = data['title']
    if 'description' in data:
        ticket.description = data['description']
    if 'status' in data:
        ticket.status = data['status']
    db.session.commit()
    add_log('INFO', f'Support ticket updated: ID {ticket_id}')
    return jsonify(ticket.to_dict())

@app.route('/api/support/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    ticket = SupportTicket.query.get_or_404(ticket_id)
    db.session.delete(ticket)
    db.session.commit()
    add_log('WARNING', f'Support ticket deleted: ID {ticket_id}')
    return jsonify({'message': 'Ticket deleted'})

# ---- WireGuard Server & Peer APIs ----

@app.route('/api/wg/servers', methods=['GET'])
def get_wg_servers():
    servers = WireGuardServer.query.all()
    return jsonify({'servers': [s.to_dict() for s in servers]})

@app.route('/api/wg/servers', methods=['POST'])
def add_wg_server():
    data = request.get_json()
    required = ['name', 'endpoint', 'public_key', 'private_key', 'address']
    if not data or not all(k in data for k in required):
        abort(400, description='Missing parameters')
    server = WireGuardServer(
        name=data['name'],
        endpoint=data['endpoint'],
        public_key=data['public_key'],
        private_key=data['private_key'],
        address=data['address']
    )
    db.session.add(server)
    db.session.commit()
    add_log('INFO', f'WireGuard server created: {server.name}')
    return jsonify(server.to_dict()), 201

@app.route('/api/wg/servers/<int:server_id>', methods=['DELETE'])
def delete_wg_server(server_id):
    server = WireGuardServer.query.get_or_404(server_id)
    db.session.delete(server)
    db.session.commit()
    add_log('WARNING', f'WireGuard server deleted: ID {server_id}')
    return jsonify({'message': 'Server deleted'})

@app.route('/api/wg/peers', methods=['GET'])
def get_wg_peers():
    peers = WireGuardPeer.query.all()
    return jsonify({'peers': [p.to_dict() for p in peers]})

@app.route('/api/wg/peers', methods=['POST'])
def add_wg_peer():
    data = request.get_json()
    required = ['server_id', 'public_key', 'allowed_ips']
    if not data or not all(k in data for k in required):
        abort(400, description='Missing parameters')
    peer = WireGuardPeer(
        server_id=data['server_id'],
        public_key=data['public_key'],
        allowed_ips=data['allowed_ips'],
        preshared_key=data.get('preshared_key', None)
    )
    db.session.add(peer)
    db.session.commit()
    add_log('INFO', f'WireGuard peer created: ID {peer.id} on server {peer.server_id}')
    return jsonify(peer.to_dict()), 201

@app.route('/api/wg/peers/<int:peer_id>', methods=['DELETE'])
def delete_wg_peer(peer_id):
    peer = WireGuardPeer.query.get_or_404(peer_id)
    db.session.delete(peer)
    db.session.commit()
    add_log('WARNING', f'WireGuard peer deleted: ID {peer_id}')
    return jsonify({'message': 'Peer deleted'})

# ---- Windows User Management APIs ----

@app.route('/api/windows-users', methods=['GET'])
def get_win_users():
    wins = WindowsUser.query.all()
    return jsonify({'windows_users': [w.to_dict() for w in wins]})

@app.route('/api/windows-users', methods=['POST'])
def add_win_user():
    data = request.get_json()
    if not data or 'username' not in data:
        abort(400, description='Missing username')
    win_user = WindowsUser(username=data['username'], enabled=data.get('enabled', True))
    db.session.add(win_user)
    db.session.commit()
    add_log('INFO', f'Windows user added: {win_user.username}')
    return jsonify(win_user.to_dict()), 201

@app.route('/api/windows-users/<int:user_id>', methods=['PUT'])
def update_win_user(user_id):
    win_user = WindowsUser.query.get_or_404(user_id)
    data = request.get_json()
    if 'username' in data:
        win_user.username = data['username']
    if 'enabled' in data:
        win_user.enabled = data['enabled']
    db.session.commit()
    add_log('INFO', f'Windows user updated: ID {user_id}')
    return jsonify(win_user.to_dict())

@app.route('/api/windows-users/<int:user_id>', methods=['DELETE'])
def delete_win_user(user_id):
    win_user = WindowsUser.query.get_or_404(user_id)
    db.session.delete(win_user)
    db.session.commit()
    add_log('WARNING', f'Windows user deleted: ID {user_id}')
    return jsonify({'message': 'Windows user deleted'})

# ---- Logs API ----

@app.route('/api/logs', methods=['GET'])
def get_logs():
    # Return latest 100 logs, descending by timestamp
    logs = LogEntry.query.order_by(LogEntry.timestamp.desc()).limit(100).all()
    return jsonify({'logs': [l.to_dict() for l in logs]})

# ---- RDP File Generation API ----

@app.route('/api/rdp-config/<int:user_id>', methods=['GET'])
def generate_rdp_file(user_id):
    """
    Generate an .rdp config file for the given user.
    In practice, this might embed the username/password or domain info for RDP Gateway.
    For demo, we create a simple .rdp file pointing at RDP_GATEWAY.
    """
    user = User.query.get_or_404(user_id)
    rdp_contents = f"""full address:s:{RDP_GATEWAY}
prompt for credentials:i:1
username:s:{user.username}
"""
    filename = f"{user.username}_{uuid.uuid4().hex}.rdp"
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(rdp_contents)
    add_log('INFO', f'RDP file generated: {filename} for user {user.username}')
    return send_file(filepath, as_attachment=True, attachment_filename=filename)

# ---- Setup Status API ----
@app.route('/api/setup-status', methods=['GET'])
def get_setup_status():
    """
    Return basic status of setup components (e.g., DB exists, WG API reachable).
    """
    db_exists = os.path.exists(DB_PATH)
    wg_reachable = False
    if WG_API_URL:
        try:
            subprocess.check_output(['ping', '-n', '1', WG_API_URL.split('//')[-1].split(':')[0]])
            wg_reachable = True
        except Exception:
            wg_reachable = False
    return jsonify({
        'database': 'OK' if db_exists else 'MISSING',
        'wireguard_api': 'REACHABLE' if wg_reachable else 'UNREACHABLE'
    })

# ---- Health Check Route for Docker / Monitoring ----
@app.route('/healthz')
def healthz():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/dashboard-stats')
def dashboard_stats():
    user_count = User.query.count()
    task_count = Task.query.count()
    open_ticket_count = SupportTicket.query.filter(SupportTicket.status != 'closed').count()
    wg_peer_count = WireGuardPeer.query.count()
    return jsonify({
        'user_count': user_count,
        'task_count': task_count,
        'open_ticket_count': open_ticket_count,
        'wg_peer_count': wg_peer_count
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
