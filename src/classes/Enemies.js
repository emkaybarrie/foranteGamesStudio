export default class EnemyManager {
    constructor(scene, stageManager, monsterList = null) {
        this.scene = scene;
        this.stageManager = stageManager;
        this.enemyGroups = this.stageManager.enemyGroups;
        this.monsterList = monsterList; // A hierarchical list of monsters by region, stage, and rarity
        console.log(this.monsterList)
        // this.monsterList = {
        //     region1: {
        //         stage1: {
        //             common: [
        //                 {
        //                     name: 'nightborne_hound',
        //                     spriteSheetPath: 'assets/enemies/region1/nightborne_hound.png',
        //                     dimensions: { frameWidth: 64, frameHeight: 64 },
        //                     animations: [
        //                         { type: 'idle', start: 0, end: 5, frameRate: 6, repeat: -1 },
        //                         { type: 'run', start: 7, end: 11, frameRate: 12, repeat: -1 },
        //                         { type: 'attack', start: 7, end: 11, frameRate: 8, repeat: 0 },
        //                         { type: 'takeHit', start: 14, end: 17, frameRate: 8, repeat: 0 },
        //                         { type: 'death', start: 21, end: 27, frameRate: 6, repeat: 0 }
        //                     ],
        //                     type: 'default',
        //                     scale: 1.25,
        //                     tint: 0xFFFFFF,//0x00FF00,
        //                     physicsBox: { width: 64, height: 32, offsetX: 0, offsetY: 32 }, // Optional
        //                 },
        //                 {
        //                     name: 'nightborne_warrior',
        //                     spriteSheetPath: 'assets/enemies/region1/nightborne_warrior.png',
        //                     dimensions: { frameWidth: 140, frameHeight: 93 },
        //                     animations: [
        //                         { type: 'idle', start: 0, end: 7, frameRate: 6, repeat: -1 },
        //                         { type: 'run', start: 8, end: 15, frameRate: 12, repeat: -1 },
        //                         { type: 'attack', start: 16, end: 25, frameRate: 8, repeat: 0 },
        //                         { type: 'takeHit', start: 26, end: 28, frameRate: 8, repeat: 0 },
        //                        // { type: 'death', start: 21, end: 27, frameRate: 6, repeat: 0 }
        //                     ],
        //                     type: 'default',
        //                     scale: 1.25,
        //                     tint: 0xFFFFFF,//0x00FF00,
        //                     physicsBox: { width: 20, height: 50, offsetX: 100, offsetY: 35 }, // Optional
        //                 },
        //                 {
        //                     name: 'bellatrix',
        //                     spriteSheetPath: 'assets/enemies/region1/bellatrix.png',
        //                     dimensions: { frameWidth: 32, frameHeight: 32 },
        //                     animations: [
        //                         { type: 'idle', start: 0, end: 6, frameRate: 6, repeat: -1 },
        //                        // { type: 'run', start: 7, end: 11, frameRate: 12, repeat: -1 },
        //                        // { type: 'attack', start: 7, end: 11, frameRate: 8, repeat: 0 },
        //                        // { type: 'takeHit', start: 14, end: 17, frameRate: 8, repeat: 0 },
        //                       //  { type: 'death', start: 21, end: 27, frameRate: 6, repeat: 0 }
        //                     ],
        //                     type: 'default',
        //                     scale: 2.5,
        //                     tint: 0xFFFFFF,//0x00FF00,
        //                 },
        //                 // Other common monsters...
        //             ],
        //             // Other rarities...
        //         },
        //         // Other stages...
        //     },
        //     // Other regions...
        // };
        
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
        enemy.name = monsterData.name
        enemy.flipReversed = monsterData.flipReversed
        enemy.type = monsterData.type || 'default';
        enemy.attackPower = monsterData.attackPower || 25
        enemy.jumpPower = Phaser.Math.Between(500, 1250);

        // Play the default animation (e.g., idle)
        enemy.play(`${monsterData.name}_idle`);

        enemy.id = Phaser.Utils.String.UUID();

        console.log(`Enemy Created: ${enemy.id}, Type: ${enemy.type}`);
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
        avatar.takeHit(enemy.attackPower);
        console.log(`Avatar collided with Enemy: ${enemy.id}`);
    }

    update() {
        Object.keys(this.enemyGroups).forEach(elevation => {
            const group = this.enemyGroups[elevation];

            group.getChildren().forEach(enemy => {
                enemy.x -= this.stageManager.baseSpeed;

                if (enemy.x < -enemy.displayWidth) {
                    enemy.destroy();
                    console.log(`Destroying ${enemy.elevation} enemy`);
                } else {
                    // Handle specific behaviors
                    if (enemy.body.touching.down && enemy.type === 'jumper') {
                        enemy.setVelocityY(-enemy.jumpPower);
                    }

                    if (enemy.type === 'chaser') {
                        const avatarX = this.stageManager.avatarManager.sprite.x;
                        if (enemy.x < avatarX - 250) {
                            if(enemy.flipReversed){
                                enemy.flipX = false;
                            } else {
                                enemy.flipX = true;
                            }
                            
                            enemy.setVelocityX(550 + (this.stageManager.addedSpeed * 1.5));
                        } else if (enemy.x > avatarX + 150 && enemy.x < avatarX + 500) {
                            enemy.setVelocityX(-550 - (this.stageManager.addedSpeed * 0.5));
                            if(enemy.flipReversed){
                                enemy.flipX = true;
                            } else {
                                enemy.flipX = false;
                            }
                        }

                        if (enemy.body.velocity.x != 0){
                            enemy.play(`${enemy.name}_run`, true);
                        } else {
                            enemy.play(`${enemy.name}_idle`, true);
                        }

                    
                    }
                }
            });
        });
    }
}
