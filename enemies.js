// Enhanced Enemy System for Treasure Maze Adventure
// This module provides improved enemy types, scaling, and behaviors

// Enhanced enemy type definitions with better scaling and new types
const ENEMY_TYPES = {
  // Basic enemies (levels 1-15)
  chaser: {
    health: 3,
    speed: 1.2,
    visionRange: 8,
    color: '#e74c3c',
    shape: 'triangle',
    rarity: 'common',
    description: 'Relentless pursuers that never give up the chase',
    damage: 1,
    movePattern: 'persistent',
    specialAbility: 'none'
  },
  
  dodger: {
    health: 2,
    speed: 2.0,
    visionRange: 6,
    color: '#2ecc71',
    shape: 'diamond',
    rarity: 'common',
    description: 'Fast and evasive, changes direction unpredictably',
    damage: 1,
    movePattern: 'evasive',
    specialAbility: 'dodge'
  },
  
  // Intermediate enemies (levels 10-30)
  ninja: {
    health: 4,
    speed: 1.8,
    visionRange: 10,
    color: '#34495e',
    shape: 'star',
    rarity: 'uncommon',
    description: 'Stealthy assassins that can phase through walls',
    damage: 2,
    movePattern: 'stealth',
    specialAbility: 'phaseWalk'
  },
  
  melee: {
    health: 6,
    speed: 0.8,
    visionRange: 4,
    color: '#8e44ad',
    shape: 'square',
    rarity: 'uncommon',
    description: 'Heavy fighters with high health and damage',
    damage: 3,
    movePattern: 'aggressive',
    specialAbility: 'charge'
  },
  
  // Advanced enemies (levels 20-40)
  elite_chaser: {
    health: 5,
    speed: 1.5,
    visionRange: 12,
    color: '#c0392b',
    shape: 'cross',
    rarity: 'rare',
    description: 'Enhanced chasers with extended vision and speed',
    damage: 2,
    movePattern: 'relentless',
    specialAbility: 'tracking'
  },
  
  shadow_dodger: {
    health: 3,
    speed: 2.5,
    visionRange: 8,
    color: '#27ae60',
    shape: 'ghost',
    rarity: 'rare',
    description: 'Master dodgers that can briefly become invisible',
    damage: 2,
    movePattern: 'shadow',
    specialAbility: 'invisibility'
  },
  
  // Elite enemies (levels 30-45)
  master_ninja: {
    health: 7,
    speed: 2.2,
    visionRange: 15,
    color: '#2c3e50',
    shape: 'demon',
    rarity: 'epic',
    description: 'Elite ninjas with teleportation abilities',
    damage: 4,
    movePattern: 'teleport',
    specialAbility: 'teleport'
  },
  
  berserker_melee: {
    health: 10,
    speed: 1.0,
    visionRange: 6,
    color: '#8b0000',
    shape: 'hexagon',
    rarity: 'epic',
    description: 'Enraged fighters that get stronger when damaged',
    damage: 4,
    movePattern: 'berserker',
    specialAbility: 'rage'
  },
  
  // Legendary enemies (levels 40+)
  apex_hunter: {
    health: 12,
    speed: 2.0,
    visionRange: 20,
    color: '#000000',
    shape: 'nightmare',
    rarity: 'legendary',
    description: 'The ultimate predator combining all enemy abilities',
    damage: 5,
    movePattern: 'apex',
    specialAbility: 'omniscient'
  },
  
  void_guardian: {
    health: 15,
    speed: 1.2,
    visionRange: 18,
    color: '#4a148c',
    shape: 'overlord',
    rarity: 'legendary',
    description: 'Ancient guardians that command lesser enemies',
    damage: 6,
    movePattern: 'commanding',
    specialAbility: 'command'
  }
};

// Enemy spawn tables by level ranges
const ENEMY_SPAWN_TABLES = {
  early: ['chaser', 'dodger'], // Levels 1-10
  basic: ['chaser', 'dodger', 'ninja'], // Levels 11-20
  intermediate: ['chaser', 'dodger', 'ninja', 'melee'], // Levels 21-30
  advanced: ['ninja', 'melee', 'elite_chaser', 'shadow_dodger'], // Levels 31-40
  elite: ['elite_chaser', 'shadow_dodger', 'master_ninja', 'berserker_melee'], // Levels 41-45
  legendary: ['master_ninja', 'berserker_melee', 'apex_hunter', 'void_guardian'] // Levels 46-50
};

// Sprite loading system
const enemySprites = {
  chaser: new Image(),
  dodger: new Image(),
  ninja: new Image(),
  melee: new Image(),
  elite_chaser: new Image(),
  shadow_dodger: new Image(),
  master_ninja: new Image(),
  berserker_melee: new Image(),
  apex_hunter: new Image(),
  void_guardian: new Image()
};

// Load enemy sprites
function loadEnemySprites() {
  // Ensure ALL enemies have proper sprite assignments - no fallbacks to drawings
  
  // Basic enemies - use base monster sprites
  enemySprites.chaser.src = '1 Pink_Monster/Pink_Monster.png'; // Pink monster for chaser
  enemySprites.dodger.src = '2 Owlet_Monster/Owlet_Monster.png'; // Owlet for dodger
  
  // Intermediate enemies - use sp2 and sp3 base sprites
  enemySprites.ninja.src = 'sp3/Dude_Monster.png'; // Base Dude Monster for ninja
  enemySprites.melee.src = 'sp2/Owlet_Monster.png'; // Base Owlet Monster for melee
  
  // Advanced enemies - use animated sprites for variety
  enemySprites.elite_chaser.src = 'sp2/Owlet_Monster_Run_6.png'; // Running Owlet for elite chaser
  enemySprites.shadow_dodger.src = 'sp3/Dude_Monster_Walk_6.png'; // Walking Dude for shadow dodger
  
  // Elite enemies - use attack animations
  enemySprites.master_ninja.src = 'sp3/Dude_Monster_Attack1_4.png'; // Attacking Dude for master ninja
  enemySprites.berserker_melee.src = 'sp2/Owlet_Monster_Attack1_4.png'; // Attacking Owlet for berserker
  
  // Legendary enemies - use most intimidating sprites
  enemySprites.apex_hunter.src = 'sp3/Dude_Monster_Attack2_6.png'; // Advanced attack Dude for apex hunter
  enemySprites.void_guardian.src = 'sp2/Owlet_Monster_Attack2_6.png'; // Advanced attack Owlet for void guardian
  
  // Force sprite loading and create fallback only if sprite completely fails
  Object.keys(enemySprites).forEach(enemyType => {
    const sprite = enemySprites[enemyType];
    
    sprite.onload = () => {
      console.log(`✅ Sprite loaded successfully for ${enemyType}: ${sprite.src}`);
    };
    
    sprite.onerror = () => {
      console.warn(`❌ Failed to load sprite for ${enemyType}: ${sprite.src}`);
      // Try alternative sprite paths
      tryAlternativeSprite(enemyType);
    };
  });
}

// Try alternative sprite paths if primary sprite fails
function tryAlternativeSprite(enemyType) {
  const alternatives = {
    chaser: ['1 Pink_Monster/Pink_Monster.png', 'sp2/Owlet_Monster.png', 'sp3/Dude_Monster.png'],
    dodger: ['2 Owlet_Monster/Owlet_Monster.png', 'sp2/Owlet_Monster.png', 'sp3/Dude_Monster.png'],
    ninja: ['sp3/Dude_Monster.png', '3 Dude_Monster/Dude_Monster.png', 'sp2/Owlet_Monster.png'],
    melee: ['sp2/Owlet_Monster.png', '2 Owlet_Monster/Owlet_Monster.png', 'sp3/Dude_Monster.png'],
    elite_chaser: ['sp2/Owlet_Monster_Run_6.png', 'sp2/Owlet_Monster.png', '1 Pink_Monster/Pink_Monster.png'],
    shadow_dodger: ['sp3/Dude_Monster_Walk_6.png', 'sp3/Dude_Monster.png', '2 Owlet_Monster/Owlet_Monster.png'],
    master_ninja: ['sp3/Dude_Monster_Attack1_4.png', 'sp3/Dude_Monster.png', 'sp2/Owlet_Monster.png'],
    berserker_melee: ['sp2/Owlet_Monster_Attack1_4.png', 'sp2/Owlet_Monster.png', 'sp3/Dude_Monster.png'],
    apex_hunter: ['sp3/Dude_Monster_Attack2_6.png', 'sp3/Dude_Monster_Attack1_4.png', 'sp3/Dude_Monster.png'],
    void_guardian: ['sp2/Owlet_Monster_Attack2_6.png', 'sp2/Owlet_Monster_Attack1_4.png', 'sp2/Owlet_Monster.png']
  };
  
  const alternativeList = alternatives[enemyType] || ['2 Owlet_Monster/Owlet_Monster.png'];
  let attemptIndex = 0;
  
  function tryNext() {
    if (attemptIndex < alternativeList.length) {
      const altPath = alternativeList[attemptIndex];
      console.log(`🔄 Trying alternative sprite for ${enemyType}: ${altPath}`);
      
      const testSprite = new Image();
      testSprite.onload = () => {
        console.log(`✅ Alternative sprite loaded for ${enemyType}: ${altPath}`);
        enemySprites[enemyType].src = altPath;
      };
      testSprite.onerror = () => {
        attemptIndex++;
        tryNext();
      };
      testSprite.src = altPath;
    } else {
      console.error(`❌ All sprite alternatives failed for ${enemyType}, using basic fallback`);
      // Create a very basic colored square as last resort
      createBasicSprite(enemyType);
    }
  }
  
  tryNext();
}

// Create a basic colored sprite as absolute last resort
function createBasicSprite(enemyType) {
  const canvas = document.createElement('canvas');
  canvas.width = 32; 
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  const enemyData = ENEMY_TYPES[enemyType];
  const color = enemyData ? enemyData.color : '#e74c3c';
  
  // Create a simple colored rectangle with border
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 32, 32);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 32, 32);
  
  // Add a simple face
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, 8, 4, 4); // Left eye
  ctx.fillRect(20, 8, 4, 4); // Right eye
  ctx.fillRect(12, 20, 8, 4); // Mouth
  
  enemySprites[enemyType].src = canvas.toDataURL();
  console.log(`🎨 Created basic sprite for ${enemyType}`);
}

// Initialize sprites when module loads
loadEnemySprites();

// Preload all sprite alternatives to ensure faster fallbacks
export function preloadAllSprites() {
  return new Promise((resolve) => {
    const spritePaths = [
      '1 Pink_Monster/Pink_Monster.png',
      '2 Owlet_Monster/Owlet_Monster.png',
      'sp2/Owlet_Monster.png',
      'sp3/Dude_Monster.png',
      'sp2/Owlet_Monster_Run_6.png',
      'sp3/Dude_Monster_Walk_6.png',
      'sp3/Dude_Monster_Attack1_4.png',
      'sp2/Owlet_Monster_Attack1_4.png',
      'sp3/Dude_Monster_Attack2_6.png',
      'sp2/Owlet_Monster_Attack2_6.png'
    ];
    
    let loadedCount = 0;
    const totalSprites = spritePaths.length;
    
    spritePaths.forEach(path => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        console.log(`✅ Preloaded sprite: ${path} (${loadedCount}/${totalSprites})`);
        if (loadedCount === totalSprites) {
          console.log('🎉 All sprites preloaded successfully!');
          resolve(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.warn(`⚠️ Failed to preload sprite: ${path} (${loadedCount}/${totalSprites})`);
        if (loadedCount === totalSprites) {
          resolve(false);
        }
      };
      img.src = path;
    });
  });
}

// Force reload all enemy sprites
export function reloadEnemySprites() {
  console.log('🔄 Reloading all enemy sprites...');
  Object.keys(enemySprites).forEach(enemyType => {
    const currentSrc = enemySprites[enemyType].src;
    enemySprites[enemyType].src = '';
    setTimeout(() => {
      enemySprites[enemyType].src = currentSrc;
    }, 10);
  });
}

// Enhanced enemy generation with better scaling
export function generateEnemies(level) {
  const enemies = [];
  
  // Base enemy count of 7, increasing by 2 every 10 levels
  const baseCount = 7;
  const additionalEnemies = Math.floor(level / 10) * 2;
  const enemyCount = Math.min(baseCount + additionalEnemies, 25); // Cap at 25 enemies
  
  // Select appropriate enemy types based on level
  const availableTypes = getAvailableEnemyTypes(level);
  
  for (let i = 0; i < enemyCount; i++) {
    const enemyType = selectEnemyType(availableTypes, level);
    const enemy = createEnemy(enemyType, level, i);
    enemies.push(enemy);
  }
  
  return enemies;
}

// Get available enemy types based on level
function getAvailableEnemyTypes(level) {
  if (level <= 10) return ENEMY_SPAWN_TABLES.early;
  if (level <= 20) return ENEMY_SPAWN_TABLES.basic;
  if (level <= 30) return ENEMY_SPAWN_TABLES.intermediate;
  if (level <= 40) return ENEMY_SPAWN_TABLES.advanced;
  if (level <= 45) return ENEMY_SPAWN_TABLES.elite;
  return ENEMY_SPAWN_TABLES.legendary;
}

// Smart enemy type selection with rarity consideration
function selectEnemyType(availableTypes, level) {
  // Higher levels have chance for rarer enemies from previous tiers
  const allPossibleTypes = [...availableTypes];
  
  // Add chance for rare enemies from previous tiers
  if (level > 20 && Math.random() < 0.25) {
    const rareTypes = Object.keys(ENEMY_TYPES).filter(type => 
      ENEMY_TYPES[type].rarity === 'rare' && !allPossibleTypes.includes(type)
    );
    if (rareTypes.length > 0) {
      allPossibleTypes.push(rareTypes[Math.floor(Math.random() * rareTypes.length)]);
    }
  }
  
  // Add chance for epic enemies at high levels
  if (level > 30 && Math.random() < 0.15) {
    const epicTypes = Object.keys(ENEMY_TYPES).filter(type => 
      ENEMY_TYPES[type].rarity === 'epic' && !allPossibleTypes.includes(type)
    );
    if (epicTypes.length > 0) {
      allPossibleTypes.push(epicTypes[Math.floor(Math.random() * epicTypes.length)]);
    }
  }
  
  // Add chance for legendary enemies at very high levels
  if (level > 40 && Math.random() < 0.08) {
    const legendaryTypes = Object.keys(ENEMY_TYPES).filter(type => 
      ENEMY_TYPES[type].rarity === 'legendary' && !allPossibleTypes.includes(type)
    );
    if (legendaryTypes.length > 0) {
      allPossibleTypes.push(legendaryTypes[Math.floor(Math.random() * legendaryTypes.length)]);
    }
  }
  
  return allPossibleTypes[Math.floor(Math.random() * allPossibleTypes.length)];
}

// Create enemy with enhanced scaling
function createEnemy(enemyType, level, index) {
  const template = ENEMY_TYPES[enemyType];
  
  // Enhanced health scaling - more aggressive for higher levels
  let healthMultiplier = 1;
  if (level <= 10) {
    healthMultiplier = 1 + (level - 1) * 0.2; // 20% per level early game
  } else if (level <= 25) {
    healthMultiplier = 3 + (level - 10) * 0.3; // 30% per level mid game
  } else if (level <= 40) {
    healthMultiplier = 7.5 + (level - 25) * 0.4; // 40% per level late game
  } else {
    healthMultiplier = 13.5 + (level - 40) * 0.5; // 50% per level end game
  }
  
  // Speed scaling (more conservative)
  const speedMultiplier = Math.min(1 + (level / 30), 2.5);
  
  // Vision range scaling
  const visionMultiplier = Math.min(1 + (level / 20), 2);
  
  // Calculate final stats
  const finalHealth = Math.ceil(template.health * healthMultiplier);
  const finalSpeed = Math.min(template.speed * speedMultiplier, 3);
  const finalVision = Math.min(template.visionRange * visionMultiplier, 15);
  
  return {
    x: 0, // Will be set during positioning
    y: 0,
    type: enemyType,
    health: finalHealth,
    maxHealth: finalHealth,
    speed: finalSpeed,
    visionRange: finalVision,
    color: template.color,
    shape: template.shape,
    rarity: template.rarity,
    damage: template.damage,
    movePattern: template.movePattern,
    specialAbility: template.specialAbility,
    
    // Movement state
    direction: { x: 0, y: 1 },
    path: [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }],
    pathIndex: 0,
    flash: 0,
    
    // Special ability state
    abilityTimer: 0,
    abilityActive: false,
    lastPlayerPosition: null,
    aggroLevel: 0,
    
    // Enhanced stats for display
    level: level,
    originalType: enemyType
  };
}

// Enhanced enemy positioning with better distribution
export function positionEnemies(maze, enemies) {
  const validPositions = [];
  const width = maze[0].length;
  const height = maze.length;
  
  // Find all valid open positions, categorized by distance from start
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (maze[y][x] === 0 && !(x === 1 && y === 1)) {
        const distanceFromStart = Math.abs(x - 1) + Math.abs(y - 1);
        const distanceFromEnd = Math.abs(x - (width - 2)) + Math.abs(y - (height - 2));
        
        validPositions.push({ 
          x, 
          y, 
          distanceFromStart, 
          distanceFromEnd,
          isNearStart: distanceFromStart < 5,
          isNearEnd: distanceFromEnd < 5,
          isMidway: distanceFromStart >= 5 && distanceFromEnd >= 5
        });
      }
    }
  }
  
  // Sort enemies by rarity for better positioning
  const sortedEnemies = [...enemies].sort((a, b) => {
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
  });
  
  // Position enemies with strategic placement
  sortedEnemies.forEach((enemy, index) => {
    let availablePositions = validPositions.filter(pos => 
      !enemies.some(e => e.x === pos.x && e.y === pos.y)
    );
    
    if (availablePositions.length === 0) return;
    
    let selectedPosition;
    
    // Strategic positioning based on enemy type and rarity
    switch (enemy.rarity) {
      case 'legendary':
        // Place near the end for maximum challenge
        selectedPosition = availablePositions
          .filter(pos => pos.isNearEnd)
          .sort((a, b) => a.distanceFromEnd - b.distanceFromEnd)[0] ||
          availablePositions[Math.floor(Math.random() * availablePositions.length)];
        break;
        
      case 'epic':
        // Place in midway or near end
        selectedPosition = availablePositions
          .filter(pos => pos.isMidway || pos.isNearEnd)
          .sort((a, b) => b.distanceFromStart - a.distanceFromStart)[0] ||
          availablePositions[Math.floor(Math.random() * availablePositions.length)];
        break;
        
      case 'rare':
        // Distribute throughout the maze
        selectedPosition = availablePositions
          .filter(pos => !pos.isNearStart)[0] ||
          availablePositions[Math.floor(Math.random() * availablePositions.length)];
        break;
        
      default:
        // Common and uncommon enemies can be anywhere
        selectedPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    }
    
    if (selectedPosition) {
      enemy.x = selectedPosition.x;
      enemy.y = selectedPosition.y;
      
      // Remove used position
      const posIndex = validPositions.findIndex(pos => 
        pos.x === selectedPosition.x && pos.y === selectedPosition.y
      );
      if (posIndex !== -1) {
        validPositions.splice(posIndex, 1);
      }
    }
  });
}

// Enhanced enemy drawing with sprites and fallback shapes
export function drawEnemy(enemy, ctx, tileSize) {
  const enemyX = enemy.x * tileSize + tileSize / 2;
  const enemyY = enemy.y * tileSize + tileSize / 2;
  
  // Handle invisibility for shadow dodgers
  if (enemy.invisible && enemy.invisible > 0) {
    enemy.invisible--;
    ctx.globalAlpha = 0.3; // Make enemy semi-transparent when invisible
  }
  
  // Draw shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(enemyX, enemyY + 15, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Enhanced health bar with rarity colors
  const healthBarWidth = 24;
  const healthRatio = enemy.health / enemy.maxHealth;
  
  // Health bar background
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(enemyX - healthBarWidth / 2, enemyY - 25, healthBarWidth, 6);
  
  // Health bar fill with rarity-based colors
  let healthColor = enemy.color;
  if (enemy.rarity === 'legendary') healthColor = '#FFD700';
  else if (enemy.rarity === 'epic') healthColor = '#9b59b6';
  else if (enemy.rarity === 'rare') healthColor = '#3498db';
  
  ctx.fillStyle = healthColor;
  ctx.fillRect(enemyX - healthBarWidth / 2, enemyY - 25, healthBarWidth * healthRatio, 6);
  
  // Health bar border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(enemyX - healthBarWidth / 2, enemyY - 25, healthBarWidth, 6);
  
  // ALWAYS try to draw sprite first - prioritize sprites over shapes
  const sprite = enemySprites[enemy.type];
  let spriteDrawn = false;
  
  if (sprite && sprite.src && sprite.src !== '') {
    try {
      // Check if sprite is loaded and ready
      if (sprite.complete && sprite.naturalWidth > 0) {
        // Draw sprite with enhanced effects
        const spriteSize = tileSize - 4; // Slightly smaller than tile
        const spriteX = enemy.x * tileSize + 2;
        const spriteY = enemy.y * tileSize + 2;
        
        // Save context for effects
        ctx.save();
        
        // Add flash effect
        if (enemy.flash > 0) {
          ctx.filter = 'brightness(200%) contrast(150%)';
        }
        
        // Add rarity glow effect
        if (enemy.rarity !== 'common') {
          ctx.shadowColor = enemy.color;
          ctx.shadowBlur = enemy.rarity === 'legendary' ? 15 : enemy.rarity === 'epic' ? 10 : 5;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        // Draw the sprite
        ctx.drawImage(sprite, spriteX, spriteY, spriteSize, spriteSize);
        spriteDrawn = true;
        
        // Restore context
        ctx.restore();
        
      } else if (sprite.naturalWidth === 0 && !sprite.complete) {
        // Sprite is still loading, show a loading indicator
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemyX, enemyY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Loading text
        ctx.fillStyle = "#ffffff";
        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillText("...", enemyX, enemyY + 2);
        spriteDrawn = true; // Prevent fallback to shapes
      }
    } catch (error) {
      console.warn(`Error drawing sprite for ${enemy.type}:`, error);
    }
  }
  
  // Only create a basic sprite if no sprite was drawn at all
  if (!spriteDrawn) {
    console.log(`No sprite available for ${enemy.type}, creating basic sprite`);
    createBasicSprite(enemy.type);
    
    // Draw the basic sprite immediately after creation
    setTimeout(() => {
      if (enemySprites[enemy.type].complete) {
        const spriteSize = tileSize - 4;
        const spriteX = enemy.x * tileSize + 2;
        const spriteY = enemy.y * tileSize + 2;
        ctx.drawImage(enemySprites[enemy.type], spriteX, spriteY, spriteSize, spriteSize);
      }
    }, 10);
    
    // Show temporary colored circle while sprite is being created
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemyX, enemyY, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw type indicator with rarity symbol
  ctx.font = "bold 10px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  const typeSymbol = getRaritySymbol(enemy.rarity) + getEnemyTypeSymbol(enemy.type);
  ctx.strokeText(typeSymbol, enemyX, enemyY - 30);
  ctx.fillText(typeSymbol, enemyX, enemyY - 30);
  
  // Draw level indicator for high-level enemies
  if (enemy.level > 10) {
    ctx.font = "8px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.strokeText(`L${enemy.level}`, enemyX, enemyY + 20);
    ctx.fillText(`L${enemy.level}`, enemyX, enemyY + 20);
  }
  
  // Reset alpha
  ctx.globalAlpha = 1;
}

// Get rarity symbol
function getRaritySymbol(rarity) {
  switch (rarity) {
    case 'legendary': return '★';
    case 'epic': return '◆';
    case 'rare': return '●';
    case 'uncommon': return '▲';
    default: return '';
  }
}

// Helper function to shade colors (same as original)
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

// Get enemy type symbol
function getEnemyTypeSymbol(type) {
  switch (type) {
    case 'chaser': return 'C';
    case 'dodger': return 'D';
    case 'ninja': return 'N';
    case 'melee': return 'M';
    case 'elite_chaser': return 'EC';
    case 'shadow_dodger': return 'SD';
    case 'master_ninja': return 'MN';
    case 'berserker_melee': return 'BM';
    case 'apex_hunter': return 'AH';
    case 'void_guardian': return 'VG';
    default: return type.charAt(0).toUpperCase();
  }
}

// Export enemy types for external use
export { ENEMY_TYPES, ENEMY_SPAWN_TABLES };

// Function to update enemy sprites with custom images
export function updateEnemySprite(enemyType, imagePath) {
  if (enemySprites[enemyType]) {
    enemySprites[enemyType].src = imagePath;
  }
}

// Function to load all sprites from a directory
export function loadSpritesFromDirectory(basePath) {
  const spriteFiles = {
    chaser: 'chaser.png',
    dodger: 'dodger.png', 
    ninja: 'ninja.png',
    melee: 'melee.png',
    elite_chaser: 'elite_chaser.png',
    shadow_dodger: 'shadow_dodger.png',
    master_ninja: 'master_ninja.png',
    berserker_melee: 'berserker_melee.png',
    apex_hunter: 'apex_hunter.png',
    void_guardian: 'void_guardian.png'
  };
  
  Object.keys(spriteFiles).forEach(enemyType => {
    enemySprites[enemyType].src = `${basePath}/${spriteFiles[enemyType]}`;
  });
}

// Function to load sprites with animation variations
export function loadAnimatedSprites() {
  // This function loads the animated sprite variations from sp2 and sp3
  const animatedSprites = {
    // Basic enemies with idle animations
    chaser: '1 Pink_Monster/Pink_Monster.png',
    dodger: '2 Owlet_Monster/Owlet_Monster.png',
    
    // Intermediate enemies with movement animations
    ninja: 'sp2/Owlet_Monster_Walk_6.png',
    melee: 'sp2/Owlet_Monster_Attack1_4.png',
    
    // Advanced enemies with running animations
    elite_chaser: 'sp3/Dude_Monster_Run_6.png',
    shadow_dodger: 'sp3/Dude_Monster_Walk_6.png',
    
    // Elite enemies with attack animations
    master_ninja: 'sp2/Owlet_Monster_Attack2_6.png',
    berserker_melee: 'sp3/Dude_Monster_Attack2_6.png',
    
    // Legendary enemies with combined animations
    apex_hunter: 'sp3/Dude_Monster_Walk+Attack_6.png',
    void_guardian: 'sp2/Owlet_Monster_Walk+Attack_6.png'
  };
  
  Object.keys(animatedSprites).forEach(enemyType => {
    if (enemySprites[enemyType]) {
      enemySprites[enemyType].src = animatedSprites[enemyType];
    }
  });
}

// Function to set specific sprite variations based on enemy state
export function setEnemySpriteVariation(enemyType, variation) {
  const spriteVariations = {
    owlet_idle: 'sp2/Owlet_Monster_Idle_4.png',
    owlet_walk: 'sp2/Owlet_Monster_Walk_6.png',
    owlet_run: 'sp2/Owlet_Monster_Run_6.png',
    owlet_attack1: 'sp2/Owlet_Monster_Attack1_4.png',
    owlet_attack2: 'sp2/Owlet_Monster_Attack2_6.png',
    owlet_hurt: 'sp2/Owlet_Monster_Hurt_4.png',
    owlet_death: 'sp2/Owlet_Monster_Death_8.png',
    owlet_jump: 'sp2/Owlet_Monster_Jump_8.png',
    owlet_combo: 'sp2/Owlet_Monster_Walk+Attack_6.png',
    
    dude_idle: 'sp3/Dude_Monster_Idle_4.png',
    dude_walk: 'sp3/Dude_Monster_Walk_6.png',
    dude_run: 'sp3/Dude_Monster_Run_6.png',
    dude_attack1: 'sp3/Dude_Monster_Attack1_4.png',
    dude_attack2: 'sp3/Dude_Monster_Attack2_6.png',
    dude_hurt: 'sp3/Dude_Monster_Hurt_4.png',
    dude_death: 'sp3/Dude_Monster_Death_8.png',
    dude_jump: 'sp3/Dude_Monster_Jump_8.png',
    dude_combo: 'sp3/Dude_Monster_Walk+Attack_6.png'
  };
  
  if (enemySprites[enemyType] && spriteVariations[variation]) {
    enemySprites[enemyType].src = spriteVariations[variation];
  }
}

// Export sprite objects for external access
export { enemySprites }; 