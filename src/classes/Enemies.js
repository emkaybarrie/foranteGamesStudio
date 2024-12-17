export default class EnemyManager {
    constructor(scene, stageManager, monsterList = null) {
        this.scene = scene;
        this.stageManager = stageManager;
        this.enemyGroups = this.stageManager.enemyGroups;
        this.projectileGroup = this.stageManager.projectileGroup
        this.monsterList = monsterList; // A hierarchical list of monsters by region, stage, and rarity
        console.log(this.monsterList)
        
    }

    getMonsterData(region, stage, rarity, overrideMonster = null) {
        const monstersForRegion = this.monsterList[region];
        if (!monstersForRegion) throw new Error(`Region ${region} not found in monster list.`);

        const monstersForStage = monstersForRegion[stage];
        if (!monstersForStage) throw new Error(`Stage ${stage} not found in region ${region}.`);

        const monstersForRarity = monstersForStage[rarity];
        if (!monstersForRarity || monstersForRarity.length === 0) {
            throw new Error(`No monsters found for rarity ${rarity} in stage ${stage}, region ${region}.`);
        }

        // If overrideMonster is specified, use it; otherwise, randomly select one
        if (overrideMonster) {
            const monster = monstersForRarity.find(m => m.name === overrideMonster);
            if (!monster) throw new Error(`Monster ${overrideMonster} not found in rarity ${rarity}, stage ${stage}, region ${region}.`);
            return monster;
        }

        // Random selection
        return Phaser.Utils.Array.GetRandom(monstersForRarity);
    }

    addEnemy(x, y, elevation = 'ground', region, stage, rarity, overrideMonster = null) {
        // Get monster data
        const monsterData = this.getMonsterData(region, stage, rarity, overrideMonster);

        // Create the enemy sprite
        const enemy = this.scene.physics.add.sprite(x, y - 50, monsterData.name).setOrigin(0, 1);

        // Add enemy to the appropriate group
        this.enemyGroups[elevation].add(enemy);

        // Configure physics and appearance
        enemy.setDepth(5)
            .setScale(monsterData.scale || 1)
            .setSize(monsterData.dimensions.frameWidth, monsterData.dimensions.frameHeight * 0.8)
            .setTint(monsterData.tint || 0xFFFFFF);

        // Set physics body dimensions
        const { physicsBox } = monsterData;
        if (physicsBox) {
            const { width, height, offsetX = 0, offsetY = 0 } = physicsBox;
            enemy.body.setSize(width, height).setOffset(offsetX, offsetY);
        } else {
            // Default to sprite size
            enemy.body.setSize(enemy.width, enemy.height);
        }

        // Assign animations
        this.assignAnimations(enemy, monsterData);

        // Custom behavior based on type
        enemy.elevation = elevation
        enemy.name = monsterData.name
        enemy.flipReversed = monsterData.flipReversed
        enemy.type = monsterData.type || 'default'
        enemy.attackType = monsterData.attackType || 'melee';
        enemy.attackRange = enemy.attackType === 'melee' 
        ? this.scene.scale.width * 0.1 
        : this.scene.scale.width * 0.5;
        //enemy.projectileImageKey = 'nightborne_arrow'
        enemy.projectileTriggerFrame = 6
        enemy.attackPower = monsterData.attackPower || 25
        enemy.jumpPower = Phaser.Math.Between(500, 1250);

        enemy.currentHealth = Phaser.Math.Between(5 + (this.stageManager.stage * 0.5), 15 + (this.stageManager.stage * 1));
        enemy.canBeHurt = true
        enemy.canHurt = true
        enemy.canAct = true

        // Play the default animation (e.g., idle)
        enemy.play(`${monsterData.name}_idle`);

        enemy.id = Phaser.Utils.String.UUID();

        //console.log(`Enemy Created: ${enemy.id}, Type: ${enemy.type}`);
    }

    assignAnimations(enemy, monsterData) {
        const { name, spriteSheetPath, dimensions, animations } = monsterData;

        // Load the sprite sheet if not already loaded
        if (!this.scene.textures.exists(name)) {
            this.scene.load.spritesheet(name, spriteSheetPath, dimensions);
            this.scene.load.once('complete', () => {
                this.createAnimations(name, animations);
            });
            this.scene.load.start();
        } else {
            this.createAnimations(name, animations);
        }
    }

    createAnimations(spriteKey, animations) {
        animations.forEach(anim => {
            const animKey = `${spriteKey}_${anim.type}`;
            if (!this.scene.anims.exists(animKey)) {
                this.scene.anims.create({
                    key: animKey,
                    frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: anim.start, end: anim.end }),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat,
                });
            }
        });
    }

    enemyCollision(avatar, enemy) {

        if(!enemy.isTakingHit && enemy.canHurt){
            // Check if the enemy is attacking
        const damage = enemy.isAttacking ? enemy.attackPower : 10; // Use attackPower if attacking, else default to 10
        
        avatar.takeHit(damage);
        //console.log(`Avatar collided with Enemy: ${enemy.id}, Damage: ${damage}`);
        }

        
    }

    enemyTakeHit(enemy, hitSource) {
        
        hitSource.destroy()
        enemy.setVelocityX(0)

        if (enemy.canBeHurt){
            if (!enemy.isTakingHit && enemy.currentHealth > 0){
                enemy.isTakingHit = true
                //this.canRegen = false

                //const previousHealth = enemy.currentHealth;
                console.log('Enemy Taking Hit: ' + hitSource.damage)
                enemy.currentHealth -= hitSource.damage            

                // Emit event when health changes
                //this.emit('currentHealthChanged', previousHealth, true);
                enemy.anims.stop()
                enemy.play(`${enemy.name}_takeHit`, true)
                enemy.setVelocityX(0)


                setTimeout(() => {
                    enemy.isTakingHit = false;
                    //this.canRegen = true
                // console.log("Switch is now off");
                }, 750);

            } else if (enemy.currentHealth <= 0) {
                enemy.anims.stop()
                enemy.canAct = false
                enemy.isAttacking = false
                enemy.canBeHurt = false
                enemy.canHurt = false
                
                
                enemy.play(`${enemy.name}_death`, true) 

                enemy.once('animationcomplete', () => {
                    enemy.setVelocityX(0)
                    enemy.destroy()
                    this.scene.score +=  15

                });
            }
        }

        

        // Check if the enemy is attacking
       // const damage = enemy.isAttacking ? enemy.attackPower : 10; // Use attackPower if attacking, else default to 10

        //console.log(`Avatar collided with Enemy: ${enemy.id}, Damage: ${damage}`);
    }

    update() {
        Object.keys(this.enemyGroups).forEach(elevation => {
            const group = this.enemyGroups[elevation];

            group.getChildren().forEach(enemy => {
                enemy.x -= this.stageManager.baseSpeed;

                if (enemy.x < -enemy.displayWidth) {
                    enemy.destroy();
                    //console.log(`Destroying ${enemy.elevation} enemy`);
                } else {
                    // Handle specific behaviors
                    const avatarX = this.stageManager.avatarManager.sprite.x;
                    const avatarY = this.stageManager.avatarManager.sprite.y;
                    const enemyX = enemy.x;
                    const enemyY = enemy.y;

                    const aggroRange = this.scene.scale.width * 0.75; // Aggro range on the x-axis
                    const yAggroRange = this.scene.scale.height * 0.3 // Vertical proximity to trigger aggro
                    const attackRange = enemy.attackRange || this.scene.scale.width * 0.1; // Attack range

                    // Prioritize the "takeHit" animation if the enemy is hit
                    // if (enemy.isTakingHit) {
                    //     enemy.play(`${enemy.name}_takeHit`, true);
                    //     enemy.setVelocityX(0); // Stop movement during takeHit
                    //     return;
                    // }

                    // Check if the player is within aggro range
                    const isInAggroX = Math.abs(enemyX - avatarX) < aggroRange;
                    const isInAggroY = Math.abs(enemyY - avatarY) <= yAggroRange;
                    const isAggressive = isInAggroX && isInAggroY;

                    if (!enemy.isTakingHit && enemy.canAct){

                    // Handle specific behaviors
                    if (isAggressive) {
                        enemy.isAggressive = true;

                        // Flip enemy to face the player
                        if (enemyX > avatarX) {
                            enemy.flipX = enemy.flipReversed ? true : false;
                        } else {
                            enemy.flipX = enemy.flipReversed ? false : true;
                        }

                        // Determine if the enemy is in attack range
                        const isInAttackRange = Math.abs(enemyX - avatarX) <= attackRange;

                        if (isInAttackRange) {
                            // Stop moving and attack
                            if (!enemy.isAttacking && !enemy.isTakingHit) {
                                enemy.isAttacking = true;
                                enemy.setVelocityX(0); // Stop movement

                                // Play the attack animation
                                enemy.play(`${enemy.name}_attack`, true)
                                .once('animationcomplete', () => {
                                    enemy.isAttacking = false; // Allow movement again after attack animation
                                })
                                .on('animationupdate', (anim, frame) => {
                                    // Check if this frame matches the projectile trigger frame
                                    if (frame.index === enemy.projectileTriggerFrame && enemy.attackType === 'ranged' && !enemy.isTakingHit) {
                                        this.fireProjectile(enemy);
                                    }
                                });
                            }
                        } else {
                            // Move toward the player if not in attack range
                            if (!enemy.isAttacking) {
                                const moveSpeed = enemy.type === 'chaser' ? 400 : 150;
                                if (enemyX > avatarX) {
                                    enemy.setVelocityX(-moveSpeed - this.stageManager.addedSpeed);
                                } else {
                                    enemy.setVelocityX(moveSpeed + this.stageManager.addedSpeed);
                                }
                                enemy.play(`${enemy.name}_run`, true);
                            }
                        }
                    } else {
                        // Return to idle if the player is out of aggro range
                        enemy.isAggressive = false;
                        enemy.isAttacking = false;
                        enemy.setVelocityX(0); // Stop movement
                        enemy.play(`${enemy.name}_idle`, true);
                    }
                    }
                }


            });
        });

        // Update projectile positions based on baseSpeed
        this.projectileGroup.getChildren().forEach(projectile => {
            projectile.x -= this.stageManager.baseSpeed ;

            // Destroy if out of bounds to prevent memory leaks
            if (projectile.x < 0 || projectile.x > this.scene.scale.width) {
                projectile.destroy();
                console.log('Projectile destroyed as it went out of bounds');
            }
        });
    }

    fireProjectile(enemy) {
        const projectile = this.scene.physics.add.sprite(
            enemy.x,
            enemy.y - (enemy.displayHeight / 1.5),
            `${enemy.name}_projectile` // The image key for the projectile
        );

        // Add projectile to the group
        this.projectileGroup.add(projectile);

        projectile.setScale(2,3).setDepth(6)
        projectile.body.allowGravity = false;

  
        const speed = 650 ; // Projectile speed
        var modifierArrow = 0
        // Determine direction based on enemy facing
        const leftDir = enemy.flipReversed ? -1 : 1;
        const rightDir = enemy.flipReversed ? 1 : -1;

        const direction = enemy.flipX ? leftDir : rightDir; // Determine the direction based on enemy facing

        if (direction < 0){
            projectile.flipX = true
        } else {
            modifierArrow = 250
        }
    
        projectile.setVelocityX(direction * (speed + modifierArrow));
        projectile.setCollideWorldBounds(true);
        projectile.body.onWorldBounds = true; // Enable worldbounds event

        // Destroy the projectile when it hits the edge of the screen
        this.scene.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === projectile) {
                projectile.destroy();
                console.log('Projectile destroyed on world bounds');
            }
        });

        
    
        // Optional: Add additional behaviors for the projectile here
        console.log(`Fired projectile from ${enemy.name} at frame ${enemy.projectileTriggerFrame}`);
    }
}
