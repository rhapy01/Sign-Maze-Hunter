// Player Data Management System
// This file contains all player-related functionality including data management,
// character selection, profile management, and player movement

// ================== DEPENDENCY DECLARATIONS ==================
// These variables are expected to be available from other scripts:
// - weaponCategories (from weapon.js)
// - gameState (from main HTML script)
// - characters (from main HTML script) 
// - characterSprites (from main HTML script)
// - createParticles (from main HTML script)
// - updateGameInfo (from main HTML script)
// - showVictory (from main HTML script)
// - showGameOver (from main HTML script)
// - drawMaze (from main HTML script)
// - getWeaponIcon (from weapon selection functions)
// - updateWeaponCurrencyDisplay (from weapon functions)
// - renderWeaponGrid (from weapon functions)

// ================== PLAYER DATA OBJECT ==================
let playerData = {
  mazeTokens: 0,
  selectedCharacter: 'rookie',
  selectedWeapon: 'basic',
  unlockedCharacters: ['rookie'],
  unlockedWeapons: ['basic'],
  playerHealth: 1,
  totalLevelsCompleted: 0,
  bestTimeRecord: null,
  totalEnemiesDefeated: 0,
  totalSessions: 0,
  currentLevel: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0]
};

// ================== DATA PERSISTENCE ==================
// Load player data from localStorage
function loadPlayerData() {
  const saved = localStorage.getItem('mazeAdventureData');
  if (saved) {
    playerData = { ...playerData, ...JSON.parse(saved) };
  }
}

// Save player data to localStorage
function savePlayerData() {
  localStorage.setItem('mazeAdventureData', JSON.stringify(playerData));
}

// ================== CHARACTER MANAGEMENT ==================
function getCurrentCharacter() {
  // Check if characters array is available
  if (typeof characters === 'undefined') {
    console.warn('Characters array not available yet');
    // Return a default character object to prevent errors
    return {
      id: 'rookie',
      name: 'Default Character',
      avatar: '🧑‍🦲',
      ammoBonus: 0,
      speedBonus: 0,
      healthBonus: 0
    };
  }
  return characters.find(c => c.id === playerData.selectedCharacter) || characters[0];
}

function selectCharacter(characterId) {
  playerData.selectedCharacter = characterId;
  savePlayerData();
  renderCharacterGrid();
  updateCurrencyDisplay();
  updateProfileDisplay();
}

function purchaseCharacter(characterId) {
  // Check if characters array is available
  if (typeof characters === 'undefined') {
    console.warn('Characters array not available yet');
    return;
  }
  
  const character = characters.find(c => c.id === characterId);
  if (character && playerData.mazeTokens >= character.price) {
    playerData.mazeTokens -= character.price;
    playerData.unlockedCharacters.push(characterId);
    savePlayerData();
    renderCharacterGrid();
    updateCurrencyDisplay();
    updateProfileDisplay();
  }
}

function renderCharacterGrid() {
  const grid = document.getElementById('characterGrid');
  grid.innerHTML = '';
  
  // Check if characters array is available
  if (typeof characters === 'undefined') {
    console.warn('Characters array not available yet');
    return;
  }
  
  characters.forEach(character => {
    const isUnlocked = playerData.unlockedCharacters.includes(character.id);
    const isSelected = playerData.selectedCharacter === character.id;
    const canAfford = playerData.mazeTokens >= character.price;
    
    const card = document.createElement('div');
    card.className = `character-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
    
    // Create character avatar display
    let avatarHTML = '';
    if (character.sprite && typeof characterSprites !== 'undefined' && 
        characterSprites[character.id] && characterSprites[character.id].idle && 
        characterSprites[character.id].idle.complete) {
      // Use sprite if available
      avatarHTML = `<img src="${character.sprite}" class="character-sprite" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" alt="${character.name}">`;
    } else {
      // Fallback to emoji
      avatarHTML = `<div class="character-avatar">${character.avatar}</div>`;
    }
    
    card.innerHTML = `
      ${avatarHTML}
      <div class="character-name">${character.name}</div>
      <div class="character-rarity rarity-${character.rarity}">${character.rarity.toUpperCase()}</div>
      <div class="character-ability">${character.ability}</div>
      ${!isUnlocked ? `
        <div class="character-price">🧩 ${character.price} MAZE</div>
        <button class="purchase-btn" ${!canAfford ? 'disabled' : ''} onclick="purchaseCharacter('${character.id}')">
          ${canAfford ? 'Purchase' : 'Not enough MAZE'}
        </button>
      ` : isSelected ? `
        <div style="color: #FFD700; font-weight: bold; margin-top: 10px;">✓ SELECTED</div>
      ` : `
        <button class="purchase-btn" onclick="selectCharacter('${character.id}')">Select</button>
      `}
    `;
    
    grid.appendChild(card);
  });
}

// ================== CURRENCY & REWARDS ==================
function awardCoins(amount) {
  const character = getCurrentCharacter();
  const multiplier = character.id === 'legend' ? 2 : 1;
  playerData.coins += amount * multiplier;
  savePlayerData();
  updateCurrencyDisplay();
}

function awardMazeTokens(amount, reason) {
  const character = getCurrentCharacter();
  const multiplier = character.id === 'legend' ? 2 : 1;
  const totalAmount = amount * multiplier;
  
  playerData.mazeTokens += totalAmount;
  savePlayerData();
  updateCurrencyDisplay();
  
  // Show token reward notification
  showTokenNotification(totalAmount, reason);
}

// Simple SIGN token awarding function - mirrors maze token system
function awardSignTokens(amount, reason, levelNumber = null) {
  // Check if SIGN token manager is available
  if (!window.signTokenManager) {
    console.warn('❌ SIGN Token Manager not available');
    return false;
  }
  
  // If level number provided, use collectLevelReward (with anti-farming)
  if (levelNumber) {
    const result = window.signTokenManager.collectLevelReward(levelNumber, {});
    if (result.success) {
      showSignTokenNotification(result.reward, result.message);
      updateSignTokenDisplay();
      return true;
    } else {
      console.log(`⚠️ SIGN collection: ${result.message}`);
      return false;
    }
  } else {
    // Direct token addition (for manual/bonus rewards)
    const result = window.signTokenManager.addTokens(amount, reason);
    if (result.success) {
      showSignTokenNotification(result.reward, result.message);
      updateSignTokenDisplay();
      return true;
    }
    return false;
  }
}

function showTokenNotification(amount, reason) {
  const notification = document.createElement('div');
  notification.className = 'token-notification';
  notification.innerHTML = `
    <div class="token-reward">
      +${amount} 🧩 MAZE
      <div class="token-reason">${reason}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showSignTokenNotification(amount, reason) {
  const notification = document.createElement('div');
  notification.className = 'token-notification';
  notification.innerHTML = `
    <div class="token-reward">
      +${amount} 🪙 SIGN
      <div class="token-reason">${reason}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function updateSignTokenDisplay() {
  // Update SIGN token displays if available
  if (window.tokenDisplay) {
    window.tokenDisplay.updateTokenDisplay();
  }
  
  // Update profile wallet info if available
  if (window.updateProfileWalletInfo) {
    window.updateProfileWalletInfo();
  }
}

// ================== UI UPDATES ==================
function updateCurrencyDisplay() {
  // Update game UI
  if (document.getElementById('gameMazeTokens')) {
    document.getElementById('gameMazeTokens').textContent = playerData.mazeTokens;
  }
  
  // Update current weapon display
  if (document.getElementById('currentWeaponName')) {
    // Check if weaponCategories is available (from weapon.js)
    if (typeof weaponCategories !== 'undefined' && weaponCategories[playerData.selectedWeapon]) {
      const currentWeapon = weaponCategories[playerData.selectedWeapon];
      document.getElementById('currentWeaponName').textContent = currentWeapon.name;
    }
  }
  
  // Update character modal
  if (document.getElementById('playerMazeTokens')) {
    document.getElementById('playerMazeTokens').textContent = playerData.mazeTokens;
  }
  
  // Update weapon modal
  if (document.getElementById('weaponMazeTokens')) {
    document.getElementById('weaponMazeTokens').textContent = playerData.mazeTokens;
  }
  
  // Update profile display
  if (document.getElementById('profileMazeTokens')) {
    document.getElementById('profileMazeTokens').textContent = playerData.mazeTokens;
  }
}

function updateProfileDisplay() {
  try {
    const character = getCurrentCharacter();
    
    // Update currency and basic stats
    const profileMazeTokens = document.getElementById('profileMazeTokens');
    if (profileMazeTokens) profileMazeTokens.textContent = playerData.mazeTokens;
    
    const profileCurrentLevel = document.getElementById('profileCurrentLevel');
    if (profileCurrentLevel) {
      // Check if gameState is available
      const currentLevel = (typeof gameState !== 'undefined' && gameState.currentLevel) 
        ? gameState.currentLevel 
        : playerData.currentLevel;
      profileCurrentLevel.textContent = currentLevel;
    }
    
    // Update achievements
    const profileLevels = document.getElementById('profileLevels');
    if (profileLevels) profileLevels.textContent = playerData.totalLevelsCompleted;
    
    const profileBestTime = document.getElementById('profileBestTime');
    if (profileBestTime) profileBestTime.textContent = playerData.bestTimeRecord ? `${playerData.bestTimeRecord}s` : '--';
    
    const profileEnemies = document.getElementById('profileEnemies');
    if (profileEnemies) profileEnemies.textContent = playerData.totalEnemiesDefeated;
    
    const profileSessions = document.getElementById('profileSessions');
    if (profileSessions) profileSessions.textContent = playerData.totalSessions;
    
    // Update character info
    const profileCharacterAvatar = document.getElementById('profileCharacterAvatar');
    if (profileCharacterAvatar) {
      // Check if character has a sprite and characterSprites is available
      if (character.sprite && typeof characterSprites !== 'undefined' && 
          characterSprites[character.id] && characterSprites[character.id].idle && 
          characterSprites[character.id].idle.complete) {
        // Create image element for sprite
        profileCharacterAvatar.innerHTML = `<img src="${character.sprite}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" alt="${character.name}">`;
      } else {
        // Fallback to emoji
        profileCharacterAvatar.textContent = character.avatar;
      }
    }
    
    const profileCharacterName = document.getElementById('profileCharacterName');
    if (profileCharacterName) profileCharacterName.textContent = character.name;
    
    const profileUnlockedCount = document.getElementById('profileUnlockedCount');
    if (profileUnlockedCount) profileUnlockedCount.textContent = playerData.unlockedCharacters.length;
    
    const profileUnlockedWeapons = document.getElementById('profileUnlockedWeapons');
    if (profileUnlockedWeapons) profileUnlockedWeapons.textContent = playerData.unlockedWeapons.length;
    
    // Update weapon info
    if (typeof weaponCategories !== 'undefined' && weaponCategories[playerData.selectedWeapon]) {
      const currentWeapon = weaponCategories[playerData.selectedWeapon];
      const profileWeaponIcon = document.getElementById('profileWeaponIcon');
      if (profileWeaponIcon && typeof getWeaponIcon === 'function') {
        profileWeaponIcon.textContent = getWeaponIcon(playerData.selectedWeapon);
      }
      
      const profileWeaponName = document.getElementById('profileWeaponName');
      if (profileWeaponName) profileWeaponName.textContent = currentWeapon.name;
    }
  } catch (error) {
    console.error('Error updating profile display:', error);
  }
}

// ================== DATA SYNCHRONIZATION ==================
// Comprehensive sync function to ensure all data is in sync
function syncAllPlayerData() {
  // Update localStorage
  savePlayerData();
  
  // Update all UI displays
  updateCurrencyDisplay();
  updateProfileDisplay();
  
  // Update weapon currency display if modal is open
  if (document.getElementById('weaponModal').style.display === 'block') {
    if (typeof updateWeaponCurrencyDisplay === 'function') {
      updateWeaponCurrencyDisplay();
    }
  }
  
  // Update character grid if modal is open
  if (document.getElementById('characterModal').style.display === 'block') {
    renderCharacterGrid();
  }
  
  // Update weapon grid if modal is open  
  if (document.getElementById('weaponModal').style.display === 'block') {
    if (typeof renderWeaponGrid === 'function') {
      renderWeaponGrid();
    }
  }
}

// ================== PLAYER MOVEMENT & GAMEPLAY ==================
function movePlayer(dx, dy) {
  // Check if gameState is available
  if (typeof gameState === 'undefined' || !gameState.gameRunning) return;
  
  const newX = gameState.player.x + dx;
  const newY = gameState.player.y + dy;
  
  if (newY >= 0 && newY < gameState.maze.length && newX >= 0 && newX < gameState.maze[0].length && gameState.maze[newY][newX] !== 1) {
    gameState.player.x = newX;
    gameState.player.y = newY;
    gameState.steps++;
    
    // Update game info in real-time
    if (typeof updateGameInfo === 'function') {
      updateGameInfo();
    }
    
    // Create particles if function is available
    if (typeof createParticles === 'function') {
      createParticles(newX * gameState.tileSize + gameState.tileSize/2, newY * gameState.tileSize + gameState.tileSize/2, "#3498db", 3);
    }
    
    if (gameState.maze[newY][newX] === 2) {
      gameState.gameRunning = false;
      if (typeof showVictory === 'function') {
        showVictory();
      }
    }
  }
  
  // Draw maze if function is available
  if (typeof drawMaze === 'function') {
    drawMaze();
  }
}

// ================== PLAYER INITIALIZATION ==================
function initializePlayerForGame() {
  const character = getCurrentCharacter();
  
  // Check if gameState is available
  if (typeof gameState !== 'undefined') {
    // Initialize player position
    gameState.player = { x: 1, y: 1 };
    
    // Initialize player lives
    gameState.playerLives = 3;
    
    // Set weapon
    if (gameState.weaponSystem && typeof gameState.weaponSystem.setWeapon === 'function') {
      gameState.weaponSystem.setWeapon(playerData.selectedWeapon);
    }
  }
  
  // Set character-specific health
  playerData.playerHealth = 1 + character.healthBonus;
  playerData.maxHealth = 1 + character.healthBonus;
  playerData.damageTaken = false;
}

// ================== PLAYER DAMAGE & LIVES ==================
function handlePlayerDamage() {
  // Check if gameState is available
  if (typeof gameState === 'undefined') return;
  
  gameState.playerLives--;
  playerData.damageTaken = true;
  savePlayerData();
  
  // Create damage particles if function is available
  if (typeof createParticles === 'function') {
    createParticles(
      gameState.player.x * gameState.tileSize + gameState.tileSize/2,
      gameState.player.y * gameState.tileSize + gameState.tileSize/2,
      "#FF0000",
      10
    );
  }
  
  // Reset player position
  gameState.player.x = 1;
  gameState.player.y = 1;
  
  if (gameState.playerLives <= 0) {
    gameState.gameRunning = false;
    if (typeof showGameOver === 'function') {
      showGameOver();
    }
  }
}

// ================== SESSION STATISTICS ==================
function updateSessionStats(endTime, steps, enemiesDefeated, achievements) {
  // Check if gameState is available
  if (typeof gameState === 'undefined') return;
  
  // Track achievements for this level
  const allEnemiesDefeated = gameState.enemies.length === 0 && gameState.enemiesDefeated > 0;
  
  // Update total enemies defeated in real-time (already handled)
  // playerData.totalEnemiesDefeated is updated in real-time during gameplay
  
  // Only increment total levels if this is a new record
  if (gameState.currentLevel > playerData.totalLevelsCompleted) {
    playerData.totalLevelsCompleted = gameState.currentLevel;
  }
  
  // Update current level tracking
  playerData.currentLevel = gameState.currentLevel;
  
  // Update best time record
  if (!playerData.bestTimeRecord || endTime < playerData.bestTimeRecord) {
    playerData.bestTimeRecord = endTime;
  }
  
  // Save data and update all displays
  savePlayerData();
  updateCurrencyDisplay();
  updateProfileDisplay();
}

// ================== PERIODIC SYNC ==================
// Add periodic sync to ensure data consistency during gameplay
function periodicPlayerSync() {
  // Check if gameState is available
  if (typeof gameState === 'undefined' || !gameState.gameRunning) return;
  
  // Update current level tracking
  if (playerData.currentLevel !== gameState.currentLevel) {
    playerData.currentLevel = gameState.currentLevel;
  }
  
  // Save data and update displays
  savePlayerData();
  updateCurrencyDisplay();
  
  // Only update profile if modal is visible to avoid performance issues
  if (document.getElementById('profileModal').style.display === 'block') {
    updateProfileDisplay();
  }
}

// ================== ENEMY INTERACTION ==================
function trackEnemyDefeat() {
  playerData.totalEnemiesDefeated++;
  savePlayerData();
}

// ================== GLOBAL EXPORTS ==================
// Make functions available globally for HTML event handlers
window.selectCharacter = selectCharacter;
window.purchaseCharacter = purchaseCharacter;
window.movePlayer = movePlayer;
window.loadPlayerData = loadPlayerData;
window.savePlayerData = savePlayerData;
window.updateCurrencyDisplay = updateCurrencyDisplay;
window.updateProfileDisplay = updateProfileDisplay;
window.syncAllPlayerData = syncAllPlayerData;
window.getCurrentCharacter = getCurrentCharacter;
window.awardMazeTokens = awardMazeTokens;
window.initializePlayerForGame = initializePlayerForGame;
window.handlePlayerDamage = handlePlayerDamage;
window.updateSessionStats = updateSessionStats;
window.trackEnemyDefeat = trackEnemyDefeat;
window.periodicPlayerSync = periodicPlayerSync;

// ================== AUTO-INITIALIZATION ==================
// Auto-load player data when the script loads
if (typeof window !== 'undefined') {
  // Set up periodic sync every 5 seconds
  setInterval(periodicPlayerSync, 5000);
  
  // Load player data when script loads
  loadPlayerData();
} 