from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
import os
from uuid import uuid4

app = Flask(__name__)
CORS(app)

# Path to the JSON data file
DATA_FILE = 'characters.json'

def load_characters():
    """Load characters from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_characters(characters):
    """Save characters to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(characters, f, indent=2)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/characters', methods=['GET'])
def get_characters():
    """Get all characters"""
    characters = load_characters()
    return jsonify(characters)

@app.route('/api/characters', methods=['POST'])
def create_character():
    """Create a new character"""
    data = request.json
    name = data.get('name', '').strip()
    max_hp = data.get('maxHP', 0)
    
    if not name:
        return jsonify({'error': 'Character name is required'}), 400
    
    try:
        max_hp = int(max_hp)
        if max_hp <= 0:
            return jsonify({'error': 'Max HP must be greater than 0'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Max HP must be a valid number'}), 400
    
    characters = load_characters()
    new_character = {
        'id': str(uuid4()),
        'name': name,
        'maxHP': max_hp,
        'currentHP': max_hp
    }
    characters.append(new_character)
    save_characters(characters)
    
    return jsonify(new_character), 201

@app.route('/api/characters/<character_id>', methods=['PUT'])
def update_character(character_id):
    """Update a character"""
    data = request.json
    characters = load_characters()
    
    character = next((c for c in characters if c['id'] == character_id), None)
    if not character:
        return jsonify({'error': 'Character not found'}), 404
    
    # Update name if provided
    if 'name' in data:
        name = data['name'].strip()
        if name:
            character['name'] = name
    
    # Update maxHP if provided
    if 'maxHP' in data:
        try:
            max_hp = int(data['maxHP'])
            if max_hp > 0:
                character['maxHP'] = max_hp
                # Adjust currentHP if it exceeds new max
                if character['currentHP'] > max_hp:
                    character['currentHP'] = max_hp
        except (ValueError, TypeError):
            pass
    
    # Update currentHP if provided
    if 'currentHP' in data:
        try:
            current_hp = int(data['currentHP'])
            # Clamp HP between 0 and maxHP
            character['currentHP'] = max(0, min(current_hp, character['maxHP']))
        except (ValueError, TypeError):
            pass
    
    # Adjust HP by delta if provided
    if 'hpDelta' in data:
        try:
            delta = int(data['hpDelta'])
            new_hp = character['currentHP'] + delta
            # Clamp HP between 0 and maxHP
            character['currentHP'] = max(0, min(new_hp, character['maxHP']))
        except (ValueError, TypeError):
            pass
    
    save_characters(characters)
    return jsonify(character)

@app.route('/api/characters/<character_id>', methods=['DELETE'])
def delete_character(character_id):
    """Delete a character"""
    characters = load_characters()
    character = next((c for c in characters if c['id'] == character_id), None)
    
    if not character:
        return jsonify({'error': 'Character not found'}), 404
    
    characters = [c for c in characters if c['id'] != character_id]
    save_characters(characters)
    
    return jsonify({'message': 'Character deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

