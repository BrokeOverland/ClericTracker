// API base URL
const API_BASE = '/api/characters';

// State
let characters = [];
let selectedCharacterId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('addCharacterForm');
    form.addEventListener('submit', handleAddCharacter);
}

// Load all characters from the API
async function loadCharacters() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to load characters');
        characters = await response.json();
        renderCharacters();
    } catch (error) {
        console.error('Error loading characters:', error);
        alert('Failed to load characters. Please refresh the page.');
    }
}

// Handle adding a new character
async function handleAddCharacter(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const maxHP = parseInt(formData.get('maxHP'));
    
    if (!name || !maxHP || maxHP <= 0) {
        alert('Please enter a valid name and maximum HP greater than 0.');
        return;
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, maxHP })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create character');
        }
        
        const newCharacter = await response.json();
        characters.push(newCharacter);
        renderCharacters();
        e.target.reset();
    } catch (error) {
        console.error('Error adding character:', error);
        alert(error.message || 'Failed to add character. Please try again.');
    }
}

// Handle HP modification with delta value
async function modifyHP(characterId, delta) {
    try {
        const response = await fetch(`${API_BASE}/${characterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hpDelta: delta })
        });
        
        if (!response.ok) throw new Error('Failed to update HP');
        
        const updatedCharacter = await response.json();
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) {
            characters[index] = updatedCharacter;
            renderCharacters();
        }
    } catch (error) {
        console.error('Error modifying HP:', error);
        alert('Failed to modify hitpoints. Please try again.');
    }
}

// Handle HP modification from input field (add)
async function addHP(characterId) {
    const inputElement = document.getElementById(`hpDeltaInput-${characterId}`);
    if (!inputElement) return;
    
    const value = parseInt(inputElement.value);
    if (isNaN(value) || value <= 0) {
        alert('Please enter a positive number.');
        inputElement.value = '';
        return;
    }
    
    await modifyHP(characterId, value);
    inputElement.value = '';
}

// Handle HP modification from input field (subtract)
async function subtractHP(characterId) {
    const inputElement = document.getElementById(`hpDeltaInput-${characterId}`);
    if (!inputElement) return;
    
    const value = parseInt(inputElement.value);
    if (isNaN(value) || value <= 0) {
        alert('Please enter a positive number.');
        inputElement.value = '';
        return;
    }
    
    await modifyHP(characterId, -value);
    inputElement.value = '';
}

// Handle custom HP input
async function setCustomHP(characterId, inputElement) {
    const value = parseInt(inputElement.value);
    if (isNaN(value)) {
        inputElement.value = '';
        return;
    }
    
    try {
        const character = characters.find(c => c.id === characterId);
        if (!character) return;
        
        const response = await fetch(`${API_BASE}/${characterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentHP: value })
        });
        
        if (!response.ok) throw new Error('Failed to update HP');
        
        const updatedCharacter = await response.json();
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) {
            characters[index] = updatedCharacter;
            renderCharacters();
        }
    } catch (error) {
        console.error('Error setting HP:', error);
        alert('Failed to set hitpoints. Please try again.');
    }
}

// Handle character deletion
async function deleteCharacter(characterId) {
    if (!confirm('Are you sure you want to delete this character?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${characterId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete character');
        
        characters = characters.filter(c => c.id !== characterId);
        if (selectedCharacterId === characterId) {
            selectedCharacterId = null;
        }
        renderCharacters();
    } catch (error) {
        console.error('Error deleting character:', error);
        alert('Failed to delete character. Please try again.');
    }
}

// Handle character selection
function selectCharacter(characterId) {
    selectedCharacterId = selectedCharacterId === characterId ? null : characterId;
    renderCharacters();
}

// Handle editing character
async function editCharacter(characterId) {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    const newName = prompt('Enter new character name:', character.name);
    if (newName === null || newName.trim() === '') return;
    
    const newMaxHP = prompt('Enter new maximum HP:', character.maxHP);
    if (newMaxHP === null) return;
    
    const maxHP = parseInt(newMaxHP);
    if (isNaN(maxHP) || maxHP <= 0) {
        alert('Maximum HP must be a number greater than 0.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${characterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName.trim(), maxHP })
        });
        
        if (!response.ok) throw new Error('Failed to update character');
        
        const updatedCharacter = await response.json();
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) {
            characters[index] = updatedCharacter;
            renderCharacters();
        }
    } catch (error) {
        console.error('Error editing character:', error);
        alert('Failed to edit character. Please try again.');
    }
}

// Get HP bar class based on HP percentage
function getHPBarClass(currentHP, maxHP) {
    const percentage = (currentHP / maxHP) * 100;
    if (percentage > 50) return 'healthy';
    if (percentage > 25) return 'wounded';
    return 'critical';
}

// Render all characters
function renderCharacters() {
    const container = document.getElementById('charactersList');
    
    if (characters.length === 0) {
        container.innerHTML = '<p class="empty-message">No characters added yet. Add a character to get started!</p>';
        return;
    }
    
    container.innerHTML = characters.map(character => {
        const hpPercentage = (character.currentHP / character.maxHP) * 100;
        const hpBarClass = getHPBarClass(character.currentHP, character.maxHP);
        const isSelected = selectedCharacterId === character.id;
        
        return `
            <div class="character-card ${isSelected ? 'selected' : ''}" onclick="selectCharacter('${character.id}')">
                <div class="character-header">
                    <div class="character-name">${escapeHtml(character.name)}</div>
                    <div class="character-actions">
                        <button class="btn-small btn-edit" onclick="event.stopPropagation(); editCharacter('${character.id}')">Edit</button>
                        <button class="btn-small btn-danger" onclick="event.stopPropagation(); deleteCharacter('${character.id}')">Delete</button>
                    </div>
                </div>
                
                <div class="hp-display">
                    <div class="hp-text">
                        <span>HP: ${character.currentHP} / ${character.maxHP}</span>
                        <span>${Math.round(hpPercentage)}%</span>
                    </div>
                    <div class="hp-bar-container">
                        <div class="hp-bar ${hpBarClass}" style="width: ${Math.max(0, Math.min(100, hpPercentage))}%">
                            ${character.currentHP > 0 ? `${character.currentHP}/${character.maxHP}` : '0'}
                        </div>
                    </div>
                </div>
                
                ${isSelected ? `
                    <div class="hp-controls" onclick="event.stopPropagation()">
                        <div class="hp-input-group">
                            <input type="number" 
                                   id="hpDeltaInput-${character.id}" 
                                   placeholder="Enter amount" 
                                   min="1"
                                   onclick="event.stopPropagation()"
                                   onkeypress="if(event.key==='Enter') addHP('${character.id}')">
                            <button class="btn-hp btn-heal" onclick="event.stopPropagation(); addHP('${character.id}')">+</button>
                            <button class="btn-hp btn-damage" onclick="event.stopPropagation(); subtractHP('${character.id}')">-</button>
                        </div>
                        <div class="hp-input-group" style="margin-top: 10px;">
                            <input type="number" 
                                   id="hpInput-${character.id}" 
                                   placeholder="Set exact HP" 
                                   min="0" 
                                   max="${character.maxHP}"
                                   onclick="event.stopPropagation()"
                                   onkeypress="if(event.key==='Enter') setCustomHP('${character.id}', this)">
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.selectCharacter = selectCharacter;
window.modifyHP = modifyHP;
window.addHP = addHP;
window.subtractHP = subtractHP;
window.setCustomHP = setCustomHP;
window.deleteCharacter = deleteCharacter;
window.editCharacter = editCharacter;

