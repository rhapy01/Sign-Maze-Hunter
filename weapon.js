// Constants
const tileSize = 30;

// Weapon Categories
const weaponCategories = {
  basic: {
    name: 'Basic Weapon',
    price: 0,
    projectileCount: 4,
    projectileSpeed: 5,
    projectileLife: 50,
    projectileSize: 3,
    projectileColor: '#ffffff',
    ammoCapacity: 10,
    description: 'Standard 4-directional shooter',
    rarity: 'common'
  },
  legendary: {
    name: 'Legendary Weapon',
    price: 50,
    projectileCount: 8,
    projectileSpeed: 7,
    projectileLife: 75,
    projectileSize: 4,
    projectileColor: '#FFD700',
    ammoCapacity: 15,
    description: '8-directional golden projectiles',
    rarity: 'legendary'
  },
  mage: {
    name: 'Mage Weapon',
    price: 75,
    projectileCount: 6,
    projectileSpeed: 6,
    projectileLife: 100,
    projectileSize: 5,
    projectileColor: '#9932CC',
    ammoCapacity: 12,
    description: 'Magical piercing projectiles',
    rarity: 'epic',
    piercing: true
  },
  sage: {
    name: 'Sage Weapon',
    price: 100,
    projectileCount: 12,
    projectileSpeed: 8,
    projectileLife: 60,
    projectileSize: 3,
    projectileColor: '#00FFFF',
    ammoCapacity: 20,
    description: 'Ultimate multi-directional weapon',
    rarity: 'legendary',
    homing: true
  }
};

// Weapon system and projectile management
class Projectile {
  constructor(x, y, dx, dy, tileSize, weaponConfig) {
    this.x = x * tileSize + tileSize / 2;
    this.y = y * tileSize + tileSize / 2;
    this.vx = dx * weaponConfig.projectileSpeed;
    this.vy = dy * weaponConfig.projectileSpeed;
    this.life = weaponConfig.projectileLife;
    this.maxLife = weaponConfig.projectileLife;
    this.tileSize = tileSize;
    this.size = weaponConfig.projectileSize;
    this.color = weaponConfig.projectileColor;
    this.piercing = weaponConfig.piercing || false;
    this.homing = weaponConfig.homing || false;
    this.enemiesHit = new Set(); // Track hit enemies for piercing
  }
  
  update(maze, enemies, createParticles, player) {
    // Homing behavior for Sage weapon
    if (this.homing && enemies.length > 0) {
      const nearestEnemy = this.findNearestEnemy(enemies);
      if (nearestEnemy) {
        const targetX = nearestEnemy.x * this.tileSize + this.tileSize / 2;
        const targetY = nearestEnemy.y * this.tileSize + this.tileSize / 2;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const homingStrength = 0.3;
          this.vx += (dx / distance) * homingStrength;
          this.vy += (dy / distance) * homingStrength;
          
          // Limit speed
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          const maxSpeed = 10;
          if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
          }
        }
      }
    }
    
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    
    const gridX = Math.floor(this.x / this.tileSize);
    const gridY = Math.floor(this.y / this.tileSize);
    
    // Wall collision
    if (gridX >= 0 && gridX < maze[0].length && gridY >= 0 && gridY < maze.length && maze[gridY][gridX] === 1) {
      this.life = 0;
      createParticles(this.x, this.y, this.color, 5);
    }
    
    // Enemy collision
    let defeatedCount = 0;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const enemyId = `${enemy.x}-${enemy.y}-${i}`;
      
      // Skip if already hit this enemy (for piercing projectiles)
      if (this.piercing && this.enemiesHit.has(enemyId)) {
        continue;
      }
      
      const distX = (enemy.x * this.tileSize + this.tileSize / 2) - this.x;
      const distY = (enemy.y * this.tileSize + this.tileSize / 2) - this.y;
      
      if (Math.sqrt(distX * distX + distY * distY) < 20) {
        if (!this.piercing) {
          this.life = 0;
        } else {
          this.enemiesHit.add(enemyId);
        }
        
        enemy.health--;
        enemy.flash = 10;
        createParticles(enemy.x * this.tileSize + this.tileSize/2, enemy.y * this.tileSize + this.tileSize/2, "#e74c3c", 5);
        
        if (enemy.health <= 0) {
          // Store enemy data before removal for rewards
          const enemyX = enemy.x * this.tileSize + this.tileSize/2;
          const enemyY = enemy.y * this.tileSize + this.tileSize/2;
          const enemyData = { ...enemy };
          
          enemies.splice(i, 1);
          createParticles(enemyX, enemyY, "#e74c3c", 10);
          defeatedCount++;
          
          // Call reward system if available (check if function exists in global scope)
          if (typeof window !== 'undefined' && window.rewardEnemyKill) {
            window.rewardEnemyKill(enemyData, enemyX, enemyY);
          }
        }
        
        if (!this.piercing) break;
      }
    }
    
    return defeatedCount;
  }
  
  findNearestEnemy(enemies) {
    let nearest = null;
    let minDistance = Infinity;
    
    enemies.forEach(enemy => {
      const dx = (enemy.x * this.tileSize + this.tileSize / 2) - this.x;
      const dy = (enemy.y * this.tileSize + this.tileSize / 2) - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    });
    
    return nearest;
  }
  
  draw(ctx) {
    // Add glow effect for special weapons
    if (this.color !== '#ffffff') {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
    }
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Add trail effect for legendary and sage weapons
    if (this.color === '#FFD700' || this.color === '#00FFFF') {
      const alpha = this.life / this.maxLife;
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - this.vx * 0.3, this.y - this.vy * 0.3, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

class WeaponSystem {
  constructor() {
    this.projectiles = [];
    this.currentWeapon = 'basic';
    this.ammo = weaponCategories.basic.ammoCapacity;
  }

  setWeapon(weaponType) {
    if (weaponCategories[weaponType]) {
      this.currentWeapon = weaponType;
      this.ammo = weaponCategories[weaponType].ammoCapacity;
    }
  }

  getCurrentWeapon() {
    return weaponCategories[this.currentWeapon];
  }

  shoot(playerX, playerY, createParticles, tileSize) {
    if (this.ammo <= 0) return;
    
    this.ammo--;
    const weaponConfig = weaponCategories[this.currentWeapon];
    
    let directions = [];
    
    // Generate shooting directions based on weapon type
    switch (this.currentWeapon) {
      case 'basic':
        directions = [
          { x: 0, y: -1 }, { x: 0, y: 1 },
          { x: -1, y: 0 }, { x: 1, y: 0 }
        ];
        break;
      case 'legendary':
        directions = [
          { x: 0, y: -1 }, { x: 0, y: 1 },
          { x: -1, y: 0 }, { x: 1, y: 0 },
          { x: -1, y: -1 }, { x: 1, y: -1 },
          { x: -1, y: 1 }, { x: 1, y: 1 }
        ];
        break;
      case 'mage':
        directions = [
          { x: 0, y: -1 }, { x: 0, y: 1 },
          { x: -1, y: 0 }, { x: 1, y: 0 },
          { x: -0.5, y: -1 }, { x: 0.5, y: -1 }
        ];
        break;
      case 'sage':
        // 12 directions in a circle
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI * 2) / 12;
          directions.push({
            x: Math.cos(angle),
            y: Math.sin(angle)
          });
        }
        break;
    }
    
    directions.forEach(dir => {
      this.projectiles.push(new Projectile(playerX, playerY, dir.x, dir.y, tileSize, weaponConfig));
    });
    
    createParticles(playerX * tileSize + tileSize/2, playerY * tileSize + tileSize/2, weaponConfig.projectileColor, 8);
  }

  update(maze, enemies, createParticles, player) {
    let defeatedEnemies = 0;
    this.projectiles = this.projectiles.filter(p => {
      const defeated = p.update(maze, enemies, createParticles, player);
      defeatedEnemies += defeated;
      return p.life > 0;
    });
    return defeatedEnemies;
  }

  draw(ctx) {
    this.projectiles.forEach(p => p.draw(ctx));
  }

  setAmmo(amount) {
    this.ammo = amount;
  }

  getAmmo() {
    return this.ammo;
  }

  getMaxAmmo() {
    return weaponCategories[this.currentWeapon].ammoCapacity;
  }
}

export { WeaponSystem, Projectile, weaponCategories }; 