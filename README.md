# D&D Cleric Hitpoint Tracker

A web application for tracking character hitpoints in Dungeons & Dragons games. Built with Flask (Python) backend and a modern HTML/CSS/JavaScript frontend.

## Features

- **Character Management**: Add, edit, and delete characters with their maximum hitpoints
- **Hitpoint Tracking**: Track current HP for each character with visual HP bars
- **HP Modification**: Add or remove hitpoints by entering an amount and using the + or - buttons, or set exact HP values
- **Visual Indicators**: Color-coded HP bars (green for healthy, yellow for wounded, red for critical)
- **Character Selection**: Click on a character card to select it and modify its HP
- **Data Persistence**: All character data is saved to a JSON file and persists between sessions

## Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   python app.py
   ```

3. **Access the application**:
   Open your web browser and navigate to `http://localhost:5000`

## Usage

### Adding a Character
1. Enter a character name in the "Character Name" field
2. Enter the maximum hitpoints in the "Maximum Hit Points" field
3. Click "Add Character"

### Modifying Hitpoints
1. Click on a character card to select it (the card will expand to show HP controls)
2. Enter an amount in the "Enter amount" field
3. Click the **+** button to add that amount, or click the **-** button to subtract that amount
4. Alternatively, use the "Set exact HP" field to set the character's HP to a specific value (press Enter)

### Editing a Character
1. Click the "Edit" button on a character card
2. Enter a new name and/or maximum HP when prompted

### Deleting a Character
1. Click the "Delete" button on a character card
2. Confirm the deletion

## File Structure

- `app.py` - Flask backend with REST API
- `templates/index.html` - Main HTML page
- `static/css/style.css` - Styling
- `static/js/app.js` - Frontend JavaScript logic
- `characters.json` - Data storage (created automatically)
- `requirements.txt` - Python dependencies

## API Endpoints

- `GET /api/characters` - Get all characters
- `POST /api/characters` - Create a new character
- `PUT /api/characters/<id>` - Update a character (HP, name, max HP)
- `DELETE /api/characters/<id>` - Delete a character

## Notes

- HP values are automatically clamped between 0 and the maximum HP
- Character data is stored in `characters.json` in the project root
- The application runs in debug mode by default (change in `app.py` for production)

