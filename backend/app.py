from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
# Configure CORS: allow a specific frontend origin via environment variable
# Set FRONTEND_ORIGIN to the exact origin (scheme+host+port) in production.
FRONTEND_ORIGIN = os.environ.get('FRONTEND_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": FRONTEND_ORIGIN}}, supports_credentials=True)

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'team.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Team Member Model
class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    remark = db.Column(db.Text, nullable=True)  # New field for remarks

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'department': self.department,
            'role': self.role,
            'remark': self.remark
        }

# Create tables
with app.app_context():
    db.create_all()

# API Endpoints

# Get all team members
@app.route('/api/members', methods=['GET'])
def get_members():
    members = TeamMember.query.all()
    return jsonify([member.to_dict() for member in members])

# Get single team member
@app.route('/api/members/<int:id>', methods=['GET'])
def get_member(id):
    member = TeamMember.query.get_or_404(id)
    return jsonify(member.to_dict())

# Create new team member
@app.route('/api/members', methods=['POST'])
def create_member():
    data = request.get_json() or {}

    if not all(key in data for key in ['name', 'gender', 'department', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400

    new_member = TeamMember(
        name=data['name'],
        gender=data['gender'],
        department=data['department'],
        role=data['role']
    )

    db.session.add(new_member)
    db.session.commit()

    return jsonify(new_member.to_dict()), 201

# Update team member
@app.route('/api/members/<int:id>', methods=['PUT'])
def update_member(id):
    member = TeamMember.query.get_or_404(id)
    data = request.get_json()

    member.name = data.get('name', member.name)
    member.gender = data.get('gender', member.gender)
    member.department = data.get('department', member.department)
    member.role = data.get('role', member.role)

    db.session.commit()

    return jsonify(member.to_dict())

# Delete team member
@app.route('/api/members/<int:id>', methods=['DELETE'])
def delete_member(id):
    member = TeamMember.query.get_or_404(id)
    db.session.delete(member)
    db.session.commit()

    return jsonify({'message': 'Member deleted successfully'})

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 5001))
    HOST = os.environ.get('HOST', '127.0.0.1')
    print(f"Starting Flask app on {HOST}:{PORT} (CORS allowed: {FRONTEND_ORIGIN})")
    app.run(debug=True, host=HOST, port=PORT)
