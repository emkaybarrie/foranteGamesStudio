
export default class AvatarManager extends Phaser.Events.EventEmitter {
    constructor(scene, stageManager,avatarId, x, y, input) {

        super()
        this.scene = scene;
        this.input = input; // Accept Input instance
        this.stageManager = stageManager
        this.sprite = this.scene.physics.add.sprite(x, y, null); // Load your avatar image in preload
        this.sprite.setVisible(false)

        


        this.sprite.setOrigin(0.5, 1); // Set origin to center horizontally and bottom vertically
        this.sprite.setDepth(6)
        this.sprite.setScale(1,1)

        // Physics properties
        this.sprite.setBounce(0.1); // Bounce effect
        this.sprite.setCollideWorldBounds(false); 
        this.sprite.setMaxVelocity(500,2000)
        this.sprite.setDragX(2000); // Lower drag in air

        // Config
        this.flashInterval = 100; // Flash interval in milliseconds
        this.flashTimer = null;

        this.action1PowerPercent = 0.1
        this.action1Cost = 10
        this.action2Cost = 30
        this.special1PowerPercent = 0.65
        this.special1Cost = 65
        this.special2PowerPercent = 0.35
        this.special2Cost = 35

        // Stub Blessings
        this.selectedBlessings = [];

        // Stub Skills
        this.skills = {
            crescentBarrage: this.skill_CrescentBarrage,
            huntingHawk: this.skill_HuntingHawk,
            powerShot: this.skill_PowerShot,
            huntersStep: this.skill_HuntersStep
        };

        this.equippedSkill_1 = null
        this.equippedSkill_2 = null

        // Stats

        // Core stats are vitality, focus, stamina - correspond to emergency savings target, personal savings target, disposable spending target (avg. daily)
        // Spending more than target average has negative affects and vice versa
        
        // Vitality represents emergency savings target spending and affects avatars following properties:
        // - Health
        // - Energy Regen

        // Focus represents personal savings spending and affects avatars following properties:
        // - Cast Speed
        // - Cast Damage

        // Stamina represents monthly dispopsable spending and affects avatars following properties:
        // - Movement Speed / Agility
        // - Attack Speed
        // - Attack Damage
        

        // Core
        // Vitals
        this.vitality = 100 + this.scene.playerData.vitality
        this.focus = 100 + this.scene.playerData.focus
        this.adaptability = 100 + this.scene.playerData.adaptability

        console.log(this.vitality)
        console.log(this.focus)
        console.log(this.adaptability)


        this.healthRegenAllocation = 10 / 100
        this.manaRegenAllocation = 30 / 100
        this.staminaRegenAllocation = 30 / 100

        this.traversalSpeedModifier = 100
        this.refreshStats()
        
        
        this.hangTimeCounter = 0

        

            // Combat
            this.charge = 0;
            this.nextActionSequence = 2
            this.attackSpeed = 100 * 2

        
        // Status
        this.canAct = true
        this.canBeHurt = true
        this.mode = 1
        this.isCharging = false

        
        // Regeneration control
        this.canRegen = true; // Enable or disable regeneration

        // Coyote time properties
        this.isOnGround = false;
        this.coyoteTime = 250; // 0.1 second in milliseconds
        this.coyoteTimeCounter = 0;
        this.hasJumped = false; // Prevent double jump

        // Set a flag to track when animations are loaded
        this.animationsLoaded = false;

        this.isPlayingCustomAnimation = false;
        this.checkpointFrame = 5; // Define the checkpoint frame

        // Example usage to load and create animations
        if (avatarId == 1){
            this.createAndLoadAnimation(avatarId, 'death', 19, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'take_hit', 6, 8, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'idle', 12, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, 'run', 10, 12);  // Creates 'run' animation with 9 frames at 12 FPS
            this.createAndLoadAnimation(avatarId, 'jump', 22, 16, 0);  // Creates 'jump' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, 'roll', 8, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'slide', 10, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, '1_atk', 10, 20, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, '2_atk', 15, 26, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, '3_atk', 12, 12, 0);  // Creates 'attack 3' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'air_atk', 10, 26, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            
            
        } else if (avatarId == 2){
            this.createAndLoadAnimation(avatarId, 'run', 8, 12);  // Creates 'run' animation with 9 frames at 12 FPS
            this.createAndLoadAnimation(avatarId, 'jump', 6, 6, 0);  // Creates 'jump' animation with 5 frames at 8 FPS
        } else if (avatarId == 3){
            this.createAndLoadAnimation(avatarId, 'death', 13, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'take_hit', 6, 8, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'idle', 8, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, 'run', 8, 12);  // Creates 'run' animation with 9 frames at 12 FPS
            this.createAndLoadAnimation(avatarId, 'jump', 20, 16, 0);  // Creates 'jump' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, 'roll', 8, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, '1_atk', 9, 12 * 2, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, '2_atk', 12, 12 * 1.5, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, '3_atk', 10, 12 * 1.25, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'air_atk', 8, 10, 0);  // Creates 'slide' animation with 5 frames at 8 FPS

            this.createAndLoadAnimation(avatarId, 'sp_atk', 18, 12, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
        } else if (avatarId == 4){
            this.createAndLoadAnimation(avatarId, 'run', 8, 12);  // Creates 'run' animation with 9 frames at 12 FPS
            this.createAndLoadAnimation(avatarId, 'jump', 6, 6, 0);  // Creates 'jump' animation with 5 frames at 8 FPS
        }

        this.currentHealth = this.maxHealth
        this.currentMana = 25 //this.maxMana
        this.currentStamina = 25 //this.maxStamina

        // this.emit('currentHealthChanged', this.currentHealth, false);
        // this.emit('currentManaChanged', this.currentMana, false);
        // this.emit('currentStaminaChanged', this.currentStamina, false);



        
        // Start the regeneration timer
        this.startRegen();
        
        
    }

    // Apply a blessing effect (modify stats/abilities)
    applyBlessing(blessing) {
        console.log(`Applying blessing: ${blessing.name}`);
        blessing.effect(this); // Call the effect function specific to the blessing
        this.selectedBlessings.push(blessing.name); // Track selected blessings
    }

    hasBlessing(blessingName) {
        return this.selectedBlessings.includes(blessingName);
    }

    // Function to display current player stats (for debugging/visualization)
    showStats() {
        console.log(`Health: ${this.maxHealth}, Speed: ${this.speed}, Jump: ${this.jumpHeight}`);
        console.log(`Double Jump: ${this.canDoubleJump ? 'Enabled' : 'Disabled'}`);
        console.log(`Damage: ${this.damage}, Defense: ${this.defense}`);
    }


    // 
    refreshStats(){
        // Vitals
        this.energyRegen = (100 + (100  * ((this.vitality - 100)/ 100)) ) / 40
        this.healthRegen = this.energyRegen * this.healthRegenAllocation
        this.manaRegen = this.energyRegen * this.manaRegenAllocation
        this.staminaRegen = this.energyRegen * this.staminaRegenAllocation
        
        this.maxHealth = 300 + (100  * ((this.vitality - 100)/ 100)) 
        this.maxMana = 100 + (100  * ((this.focus - 100)/ 100)) 
        this.maxStamina = 100 + (100  * ((this.adaptability - 100)/ 100)) 
        

        // Combat
        this.attackSpeed = 100 + (150 * ((this.adaptability - 100) / 100))

        // Movement
        this.movementCost = 0.175
        this.movementSpeed = Math.min(450 + (150  * ((this.adaptability - 100)/ 100)),750)
        this.xRepositionLowerBound = this.scene.scale.width * 0.275
        this.xRepositionUpperBound = this.scene.scale.width * 0.325
        this.repositionSpeed = Math.min(200 + (200  * ((this.adaptability - 100)/ 100)),450)
        this.repositionSpeedAir = Math.min(150 + (200  * ((this.adaptability - 100)/ 100)), 350)
        this.traversalSpeed = Math.min(((this.movementSpeed * 0.01) + (5  * ((this.adaptability - 100)/ 100))), 20)
        this.jumpSpeed = Math.min(500 + (100 * ((this.adaptability - 100) / 100)),750)
        this.hangTimeSpeed =  Math.min(25 + (20 * ((this.adaptability - 100)/ 100)),50)
        this.hangTime = Math.min(150 + (150 * ((this.adaptability - 100) / 100)), 2000)
    }

    resetVitals(){
        this.currentHealth = this.maxHealth
        this.currentMana = this.maxMana
        this.currentStamina = this.maxStamina
    }

    // Method to load images and create animation
    // createAndLoadAnimation(avatarId, keyName, totalFrames, frameRate = 10, repeat = -1) {
    //     const customXScaling = 0.05
    //     const customYScaling = 0.3
    //     const customXOffset = 135;
    //     const customYOffset = 87.5;

    //     // 1. Load all frames for the animation
    //     for (let i = 1; i <= totalFrames; i++) {
    //         const frameKey = `${keyName}_${String(i).padStart(2, '0')}`;
    //         this.scene.load.image(frameKey, `assets/avatars/${avatarId}/animations/${keyName}/${frameKey}.png`);
    //     }

    //     // 2. Once images are loaded, create the animation
    //     this.scene.load.on('complete', () => {
    //         // Build frame array for animation creation
    //         const frames = Array.from({ length: totalFrames }, (_, i) => ({
    //             key: `${keyName}_${String(i + 1).padStart(2, '0')}`,
    //             frame: null // Set frame to null if not using a spritesheet
    //         }));

    //         // Generate the animation
    //         this.scene.anims.create({
    //             key: keyName,               // Animation key (e.g., 'run')
    //             frames: frames,             // Frames created from loaded images
    //             frameRate: frameRate,       // Set the frame rate of the animation
    //             repeat: repeat              // -1 for looping, 0 for once
    //         });

    //         // Set sprite texture and make it visible once loaded
    //         // Check if the texture key exists before setting it
    //         if (frames && frames[0] && frames[0].key) {
    //             this.sprite.setTexture(frames[0].key);
    //             this.sprite.setVisible(true);
    //         } else {
    //             console.warn('Failed to set texture: frames or key is missing');
    //         }

    //         // Set the size and offset based on the first frame dimensions
    //         const firstFrameKey = frames[0].key;
    //         //console.log(firstFrameKey)
    //         const texture = this.scene.textures.get(firstFrameKey);
    //        // console.log(texture)
    //         const frameData = texture.get(firstFrameKey);
    //        // console.log(frameData)

    //         if (frameData) {
    //             // Set the initial physics body size and offset based on the first frame
    //             this.sprite.setSize(frameData.width * customXScaling, frameData.height * customYScaling);
    //             this.sprite.setOffset(frameData.x + customXOffset, frameData.y + customYOffset); // Adjust if necessary to align correctly

    //            // console.log(`Sprite Position: ${this.sprite.x}, ${this.sprite.y}`);
    //            // console.log(`Physics Body Size: ${this.sprite.body.width}, ${this.sprite.body.height}`);
    //            // console.log(`Physics Body Offset: ${this.sprite.body.offset.x}, ${this.sprite.body.offset.y}`);
    //         }

    //         // Mark animations as loaded
    //         this.animationsLoaded = true;

            
    //     });

    //     // Start loading immediately
    //     this.scene.load.start();
    // }

    createAndLoadAnimation(avatarId, keyName, totalFrames, frameRate = 10, repeat = -1) {
        const customXScaling = 0.05;
        const customYScaling = 0.3;
        const customXOffset = 135;
        const customYOffset = 87.5;
    
        // 1. Check if all frames are already loaded
        let allFramesLoaded = true;
        for (let i = 1; i <= totalFrames; i++) {
            const frameKey = `${keyName}_${String(i).padStart(2, '0')}`;
            if (!this.scene.textures.exists(frameKey)) {
                allFramesLoaded = false;
                break;
            }
        }
    
        if (allFramesLoaded) {
            console.log(`Animation '${keyName}' already loaded. Reusing existing assets.`);
            this.createAnimation(keyName, totalFrames, frameRate, repeat, customXScaling, customYScaling, customXOffset, customYOffset);
            return;
        }
    
        // 2. If frames are not loaded, start loading them
        for (let i = 1; i <= totalFrames; i++) {
            const frameKey = `${keyName}_${String(i).padStart(2, '0')}`;
            if (!this.scene.textures.exists(frameKey)) {
                this.scene.load.image(frameKey, `assets/avatars/${avatarId}/animations/${keyName}/${frameKey}.png`);
            }
        }
    
        // 3. Once images are loaded, create the animation
        this.scene.load.on('complete', () => {
            this.createAnimation(keyName, totalFrames, frameRate, repeat, customXScaling, customYScaling, customXOffset, customYOffset);
        });
    
        // Start loading immediately
        this.scene.load.start();
    }
    
    createAnimation(keyName, totalFrames, frameRate, repeat, customXScaling, customYScaling, customXOffset, customYOffset) {
        // Build frame array for animation creation
        const frames = Array.from({ length: totalFrames }, (_, i) => ({
            key: `${keyName}_${String(i + 1).padStart(2, '0')}`,
            frame: null // Set frame to null if not using a spritesheet
        }));
    
        // Generate the animation
        this.scene.anims.create({
            key: keyName,               // Animation key (e.g., 'run')
            frames: frames,             // Frames created from loaded images
            frameRate: frameRate,       // Set the frame rate of the animation
            repeat: repeat              // -1 for looping, 0 for once
        });
    
        // Set sprite texture and make it visible once loaded
        if (frames && frames[0] && frames[0].key) {
            this.sprite.setTexture(frames[0].key);
            this.sprite.setVisible(true);
        } else {
            console.warn('Failed to set texture: frames or key is missing');
        }
    
        // Set the size and offset based on the first frame dimensions
        const firstFrameKey = frames[0].key;
        const texture = this.scene.textures.get(firstFrameKey);
        const frameData = texture.get(firstFrameKey);
    
        if (frameData) {
            // Set the initial physics body size and offset based on the first frame
            this.sprite.setSize(frameData.width * customXScaling, frameData.height * customYScaling);
            this.sprite.setOffset(frameData.x + customXOffset, frameData.y + customYOffset);
        }
    
        // Mark animations as loaded
        this.animationsLoaded = true;
    }
    

    // Method to start the regeneration timer
    startRegen() {
        // Use Phaser's timer event to increase health every second
        this.scene.time.addEvent({
            delay: 100,                 // 1000 ms = 1 second
            callback: () => this.regenVitals(),
            loop: true                   // Repeat the timer indefinitely
        });
    }

    // Method to toggle regeneration
    toggleRegen(enable) {
        this.canRegen = enable;
        console.log(`Regeneration is now ${enable ? 'enabled' : 'disabled'}.`);
    }

    regenVitals(){
        if (this.canRegen) {
            this.regenStat('currentHealth', this.healthRegen, this.maxHealth);
            this.regenStat('currentMana', this.manaRegen, this.maxMana);
            this.regenStat('currentStamina', this.staminaRegen, this.maxStamina);
        
        }
    }


    // Regenerates a specified stat, with optional max limit
    regenStat(stat, amount, maxLimit = null) {

        // Only regenerate if canRegen is true
        if (!this.canRegen) return;

        if (this[stat] !== undefined) {
            // Increment the specified stat
            this[stat] += amount;
            
            // If a max limit is defined, cap the stat at that limit
            if (maxLimit !== null && this[stat] > maxLimit) {
                this[stat] = maxLimit;
            }

            this.emit(`${stat}Changed`, this[stat]);

            
            //console.log(`${stat} increased to: ${this[stat]}`);
        } else {
            console.warn(`Stat ${stat} does not exist on the Avatar instance.`);
        }
    }

    // Mode 0 Controls

        moveLeft() {
            if (this.animationsLoaded && this.currentStamina > 0){
                this.currentStamina -= this.movementCost
                if (this.isOnGround){
                    this.sprite.flipX = false

                        this.sprite.setVelocityX(-this.repositionSpeed); // Stop horizontal movement 

                   
                    this.sprite.anims.play('run', true); // Play the 'run' animation when moving
                } else {
                    this.sprite.flipX = false
                    this.sprite.setVelocityX(-this.repositionSpeedAir); // Stop horizontal movement 
                    
                }
            }
        }

        moveRight() {
            if (this.animationsLoaded && this.currentStamina > 0){
                this.currentStamina -= this.movementCost
            
                if (this.isOnGround){
                    this.sprite.flipX = false
        
                    this.sprite.setVelocityX(this.repositionSpeed); // Stop horizontal movement 
              
                    this.sprite.anims.play('run', true); // Play the 'run' animation when moving
                } else {
                    this.sprite.flipX = false
                    this.sprite.setVelocityX(this.repositionSpeedAir); // Stop horizontal movement 
                }
            }
        }

        moveDown(){
            if (this.animationsLoaded && this.currentStamina > 0){
                this.currentStamina -= this.movementCost
                if (this.isOnGround){
                    this.sprite.flipX = false
                    this.sprite.anims.play('slide', true); // Play the 'run' animation when moving
                } else {
                    this.sprite.setVelocityY(this.sprite.body.velocity.y + (this.hangTimeSpeed)); // Stop horizontal movement 
                }
            }
        }

        jump() {


            if (this.animationsLoaded && this.currentStamina > 0){
                this.currentStamina -= this.movementCost
                this.isDoingMovement = true
                if ((this.isOnGround || this.coyoteTimeCounter > 0) && !this.hasJumped){
                    this.sprite.setVelocityY(-this.jumpSpeed);
                    this.coyoteTimeCounter = 0; // Reset coyote time after jump
                    this.hasJumped = true; // Set flag to prevent double jump
                    this.sprite.anims.play('jump', true); // Play the 'run' animation when moving
                } else if ((this.hangTimeCounter) > 0 && this.hasJumped){
                        this.sprite.setVelocityY(-this.jumpSpeed-this.hangTimeSpeed)
                }
            }

        }

        action1(){
            if (this.animationsLoaded && this.currentStamina > this.action1Cost){

                if (!this.isDoingAction){
                    
                    this.isDoingAction = true

                    const previousStamina = this.currentStamina;
                    this.currentStamina -= this.action1Cost
                    this.canRegen = false
                    // Emit event when health changes
                    this.emit('currentStaminaChanged', previousStamina, true);


                    if (this.isOnGround){
                        this.sprite.flipX = false
                        if(this.traversalSpeedModifier > 10){
                            this.traversalSpeedModifier *= 0.75
                        }
                    }

                    // Animation Framerate Adjustments
                    // Adjust the animation's framerate dynamically
                    const anim = this.sprite.anims.animationManager.get('2_atk'); // Get the animation
                    anim.frameRate = 20; // Set desired framerate (frames per second)


                        // Play the attack animation
                        this.sprite.anims.play('2_atk', true)
                            .on('animationstart', (anim) => {
                                if (anim.key === '2_atk') {
        
                                }
                            })
                            .on('animationupdate', (anim, frame) => {
                                // Check if the animation is in the attack state and if the projectile is at frame 8
                                if (anim.key === '2_atk' && frame.index === 8) {


                                    this.fireProjectile({ 
                                        damage: this.action1PowerPercent * this.adaptability,
                                        power: 1000, 
                                        angle: 0, 
                                        gravity: false, 
                                        adjustRotation: false, 
                                        maxPierce: 0,
                                        onHit: (enemy, projectile) => {
                                            const isCrit = Math.random() < 0.05; // Example crit logic
                        
                                            // Apply damage and crit logic
                                            projectile.damage = isCrit ? projectile.damage * 2 : projectile.damage;
                                            projectile.damageType = isCrit ? 'critical' : 'normal';
                        
                                        }
                                    });
                                }
                            })
                        
                    this.sprite.once('animationcomplete', () => {
                        this.isDoingAction = false
                        this.sprite.clearTint();
                        this.canBeHurt = true
                        this.canRegen = true
 
                   });
                }
            }
        }

        action2(){
            

            if (this.animationsLoaded && this.currentStamina > this.action2Cost ){
                
     
                
                if (!this.isDoingAction){
                    
                    this.isDoingAction = true

                    const previousStamina = this.currentStamina;
                    this.currentStamina -= this.action2Cost
                    this.canRegen = false
                    // Emit event when health changes
                    this.emit('currentStaminaChanged', previousStamina, true);

                 // Create the tween
                    // this.scene.tweens.add({
                    //     targets: this.sprite,
                    //     x: this.sprite.x + 25,
                    //     duration: 150,
                    //     ease: 'Power1', // Easing for smooth movement
                    //     onStart: () => {
                    //         //console.log("Dash started!");
                    //         this.canBeHurt = false
                    //         this.sprite.setTint(0x00ff00); // Visual feedback
                    //         this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
                    //         this.sprite.once('animationcomplete', () => {
                    //              this.isDoingAction = false
                    //              this.sprite.clearTint();
                    //              this.canBeHurt = true
                    //              this.canRegen = true
          
                    //         });
                    //         if(!this.isOnGround){
                    //             this.sprite.body.setVelocityY(this.sprite.body.velocity.y - 250)
                    //         } else {
                    //             if(this.traversalSpeedModifier > 10){
                    //                 this.traversalSpeedModifier *= 0.85
                    //             }
                    //         }

                    //     },
                    //     onUpdate: (tween, target) => {
                    //        // if (tween.progress >= 0.5 && onHalfway) {
                    //             //onHalfway(); // Call the halfway function once
                    //             //onHalfway = null; // Ensure it only runs once
                    //        // }
                    //     },
                    //     onComplete: () => {
                    //         //console.log("Dash complete!");
                            
                            
                    //     }
                    // });

                    // Momentum Boost
                    // Get the current value of traversalSpeedModifier
                    const currentValue = this.traversalSpeedModifier;

                    // Define the amount you want to add
                    const additionalValue = currentValue < 250 ? 50 : 5;

                    // Calculate the target value
                    const targetValue = currentValue + additionalValue;

                    // Create the tween
                    this.scene.tweens.add({
                        targets: this.stageManager.avatarManager, // Object containing the property
                        traversalSpeedModifier: targetValue, // Target value
                        duration: 25, // Tween duration in milliseconds
                        ease: 'Linear', // Tween easing
                        onStart: () => {
                            //console.log("Dash started!");
                            this.canBeHurt = false
                            this.sprite.setTint(0x00ff00); // Visual feedback
                            this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
                            this.sprite.once('animationcomplete', () => {
                                 this.isDoingAction = false
                                 this.sprite.clearTint();
                                 this.canBeHurt = true
                                 this.canRegen = true
          
                            });
                            if(!this.isOnGround){
                                this.sprite.body.setVelocityY(this.sprite.body.velocity.y - 250)
                            } 
                        },
                        onUpdate: (tween, target) => {
                            console.log(`Current traversalSpeedModifier: ${target.traversalSpeedModifier}`);
                        },
                        onComplete: () => {
                            console.log('TraversalSpeedModifier increased!');
                        }
                    });

                }
            }
        }

        special1() {
            if (this.equippedSkill_1 && this.animationsLoaded && this.currentMana > this.special1Cost) {

        
                if (!this.isDoingSpecial){
                    
                    this.isDoingSpecial = true

                    const previousVitalsValue = this.currentMana;
                    this.currentMana -= this.special1Cost
                    this.canRegen = false
                    // Emit event when health changes
                    this.emit('currentManaChanged', previousVitalsValue, true);

                    // Equipped Skill Logic
                    this.equippedSkill_1()


                    // Skill Completion
                    this.sprite.once('animationcomplete', () => {
                        this.isDoingSpecial = false
                        //.log(this.isDoingSpecial)
                        this.sprite.clearTint();
                        this.canBeHurt = true
                        this.canRegen = true
 
                   });
                }
            }
        }
        

        special2(){
            if (this.equippedSkill_2 && this.animationsLoaded && this.currentMana > this.special2Cost){
                    
                if (!this.isDoingSpecial && !this.special2Active){
                    
                    this.isDoingSpecial = true

                    const previousVitalsValue = this.currentMana;
                    this.currentMana -= this.special2Cost
                    this.canRegen = false
                    // Emit event when health changes
                    this.emit('currentManaChanged', previousVitalsValue, true);

                    // Equipped Skill Logic
                    this.equippedSkill_2()

                        
                    // Skill Completion
                    this.sprite.once('animationcomplete', () => {
                        this.isDoingSpecial = false
                        this.sprite.clearTint();
                        this.canBeHurt = true
                        this.canRegen = true
 
                   });
                }
        
                
            }
        }

        // Skill Library

            // Offensive
            skill_CrescentBarrage(){
                if (this.isOnGround){
                    this.sprite.flipX = false
                    if(this.traversalSpeedModifier > 10){
                        this.traversalSpeedModifier *= 0.5
                    }

                }

                // Play the attack animation
                this.sprite.anims.play('3_atk', true)
                    .on('animationstart', (anim) => {
                        if (anim.key === '3_atk') {

                        }
                    })
                    .on('animationupdate', (anim, frame) => {
                        // Check if the animation is in the attack state and if the projectile is at frame 8
                        if (anim.key === '3_atk' && frame.index === 7) {


                            // Fire the projectile
                            this.fireProjectile({ 
                                damage: this.special1PowerPercent * this.focus,
                                power: 450, 
                                angle: -35, 
                                gravity: true, 
                                adjustRotation: true, 
                                maxPierce: 0,
                                onHit: (enemy, projectile) => {
                                    const isCrit = Math.random() < 0.025; // Example crit logic
                
                                    // Apply damage and crit logic
                                    projectile.actualDamage = isCrit ? projectile.damage * 2 : projectile.damage;
                                    projectile.damageType = isCrit ? 'critical' : 'normal';

                                }
                            });

                            // Fire the projectile
                            this.fireProjectile({ 
                                damage: this.special1PowerPercent * this.focus,
                                power: 650, 
                                angle: -45, 
                                gravity: true, 
                                adjustRotation: true, 
                                maxPierce: 0,
                                onHit: (enemy, projectile) => {
                                    const isCrit = Math.random() < 0.05; // Example crit logic
                
                                    // Apply damage and crit logic
                                    projectile.actualDamage = isCrit ? projectile.damage * 2 : projectile.damage;
                                    projectile.damageType = isCrit ? 'critical' : 'normal';

                                }
                            });

                            // Fire the projectile
                            this.fireProjectile({ 
                                damage: this.special1PowerPercent * this.focus,
                                power: 850, 
                                angle: -55, 
                                gravity: true, 
                                adjustRotation: true, 
                                maxPierce: 0,
                                onHit: (enemy, projectile) => {
                                    const isCrit = Math.random() < 0.025; // Example crit logic
                
                                    // Apply damage and crit logic
                                    projectile.actualDamage = isCrit ? projectile.damage * 2 : projectile.damage;
                                    projectile.damageType = isCrit ? 'critical' : 'normal';

                                }
                            });

                            // Remove the animationupdate listener
                             this.sprite.off('animationupdate');
                        }
                    })
            }

            skill_PowerShot(){

                // On Ground vs In Air
                if (this.isOnGround){
                    this.sprite.flipX = false
                    if(this.traversalSpeedModifier > 10){
                        this.traversalSpeedModifier *= 0.25
                    }

                }

                // Animation Framerate Adjustments
                // Adjust the animation's framerate dynamically
                const anim = this.sprite.anims.animationManager.get('2_atk'); // Get the animation
                anim.frameRate = 10; // Set desired framerate (frames per second)

                // Play the animation
                this.sprite.anims.play('2_atk', true)
                    .on('animationstart', (anim) => {
                        if (anim.key === '2_atk') {

                        }
                    })
                    .on('animationupdate', (anim, frame) => {
                        // Check if the animation is in the attack state and if the projectile is at frame 8
                        if (anim.key === '2_atk' && frame.index === 8) {

                            // Fire the projectile
                            this.fireProjectile({ 
                                damage: this.special1PowerPercent * this.focus,
                                power: 1250, 
                                angle: 0, 
                                gravity: false, 
                                adjustRotation: false, 
                                maxPierce: 1,
                                onHit: (enemy, projectile) => {
                                    const isCrit = Math.random() < 0.15; // Example crit logic
                
                                    // Apply damage and crit logic
                                    projectile.actualDamage = isCrit ? projectile.damage * 2 : projectile.damage;
                                    projectile.damageType = isCrit ? 'critical' : 'normal';

                                    projectile.hitAnim = 'hitAnim_powerShot'

                                }
                            });

                            // Remove the animationupdate listener
                            this.sprite.off('animationupdate');
                        }
                    })
            }

            skill_HuntingHawk(){
                if (this.isOnGround){
                    this.sprite.flipX = false
                    if(this.traversalSpeedModifier > 10){
                        this.traversalSpeedModifier *= 0.5
                    }

                    this.sprite.setVelocityY(-750)
                    this.sprite.setVelocityX(-250)
                } else {
                    this.sprite.setVelocityY(-600)
                    this.sprite.setVelocityX(-150)
                }
                    
                setTimeout(() => {
                    // Play the attack animation
                    this.sprite.anims.play('air_atk', true)
                    .on('animationstart', (anim) => {
                        if (anim.key === 'air_atk') {
                            //this.sprite.setVelocityY(0)
                            //this.sprite.setVelocityX(0)
                        }
                    })
                    .on('animationupdate', (anim, frame) => {
                        // Check if the animation is in the attack state and if the projectile is at frame 8
                        if (anim.key === 'air_atk' && frame.index === 5) {
                            this.sprite.setVelocityY(-650)
                            this.sprite.setVelocityX(-350)


                            // Fire the projectile
                            this.fireProjectile({ 
                                damage: this.special2PowerPercent * this.focus,
                                power: 500, 
                                angle: 45, 
                                gravity: false, 
                                adjustRotation: true, 
                                maxPierce: 0,
                                onHit: (enemy, projectile) => {
                                    const isCrit = true//Math.random() < 0.90; // Example crit logic
                
                                    // Apply damage and crit logic
                                    projectile.actualDamage = isCrit ? projectile.damage * 2 : projectile.damage;
                                    projectile.damageType = isCrit ? 'critical' : 'normal';

                                    projectile.hitAnim = 'hitAnim_huntingHawk'


                                }
                            });

                            // Remove the animationupdate listener
                            this.sprite.off('animationupdate');

                        }
                    })
                }, 350);
            }

            // Defensive
            skill_HuntersStep(){

                this.isDoingSpecial = false
                this.canRegen = true

                if(!this.special2Active){
                    this.special2Active = true


                // Create the tween
                this.scene.tweens.add({
                    targets: this.sprite, // Object containing the property
                    alpha: {from: 1, to: 0.35},
                    ease: 'Linear', // Tween easing
                    duration: 1000, // Tween duration in milliseconds
                    yoyo: true,
                    hold: 3000, // Hold for 500ms at the yoyo point before reversing
                    onStart: () => {
                        // Clear any existing tint and log reposition speed changes
                        this.sprite.clearTint();
                        //this.sprite.setTint(0x000000)
                        this.movementSpeed *= 1.35
                        this.repositionSpeed *= 1.35
                        this.repositionSpeedAir *= 1.35

                        this.xRepositionLowerBound *= 0.75
                        this.xRepositionUpperBound *= 1.25

                        this.movementCost *= 0.25

                        
                    },
                    onUpdate: () => {
                        if (this.sprite.alpha < 0.5){
                            this.sprite.setTint(0x000000)
                        } else if (this.sprite.alpha > 0.75) {
                            this.sprite.clearTint()
                        }
                    },
                    onYoyo: () => {
                        

                    },
                    onRepeat: () => {

                    },
                    onComplete: () => {

                        this.refreshStats()
                        
                        this.sprite.setAlpha(1)
                        this.sprite.clearTint()
                        this.special2Active = false
                        this.isDoingSpecial = false
                    }
                });

                }

            }

            // Utility
        

        fireProjectile(options = {}) {
            const { 
                damage = 0,
                power = 1000, 
                angle = 0, 
                gravity = false, 
                adjustRotation = false, 
                onHit = () => {}, // Function to handle hit effects
                maxPierce = 0, // Whether the projectile passes through targets
            } = options;
        
            const projectile = this.scene.physics.add.sprite(
                this.sprite.x,
                this.sprite.y - (this.sprite.displayHeight * 0.25),
                'avatar1_projectile'
            );
        
            // Add projectile to the group
            this.stageManager.friendlyProjectileGroup.add(projectile);
        
            projectile.damage = damage;
            projectile.actualDamage = damage
            projectile.maxPierce = maxPierce; // Store pass-through behavior
            projectile.onHit = onHit; // Store the onHit function for later use
            projectile.hitTargets = new Set(); // Use a Set to track already-hit enemies
        
            projectile.setScale(2, 3).setDepth(6);
            projectile.setSize(35, 10);
            projectile.body.allowGravity = gravity;
        
            // Set velocity
            const speed = power;
            const direction = this.sprite.flipX ? -1 : 1;
            const angleRadians = Phaser.Math.DegToRad(angle);
            projectile.setVelocity(
                Math.cos(angleRadians) * speed * direction,
                Math.sin(angleRadians) * speed
            );
        
            // Adjust rotation dynamically
            if (adjustRotation) {
                projectile.rotation = Phaser.Math.Angle.Between(0, 0, projectile.body.velocity.x, projectile.body.velocity.y);
                projectile.update = () => {
                    if (projectile.body) {
                        projectile.rotation = Phaser.Math.Angle.Between(0, 0, projectile.body.velocity.x, projectile.body.velocity.y);
                    }
                };
                this.scene.events.on('update', projectile.update, this);
            }
        
            return projectile;
        }
        


        resetC(){
            this.traversalSpeedModifier = 100 
            this.sprite.body.allowGravity = true
        }

        stop() {

       
            if(!this.isDoingAction && !this.isDoingSpecial){
                
                if (this.animationsLoaded){
                    if (this.isOnGround){
                        this.sprite.flipX = false
                        if(!this.isDoingAction && !this.isDoingSpecial && !this.isDoingMovement && !this.isTakingHit){
                            this.sprite.angle = 0
                            if(this.traversalSpeedModifier > 1){
                                this.sprite.anims.play('run', true); // Play the 'run' animation when moving 
                            } else {
                                this.sprite.anims.play('idle', true); // Play the 'run' animation when moving 
                            }
                            
                        }
                    }
                }

            }
                
                

            

        }



        
        
        

    // Mode 1 Controls

    altMoveLeft() {
        if (this.animationsLoaded){
            this.isDoingMovement = true
            if (this.isOnGround){
                this.sprite.flipX = true
                    if (!this.isDoingAction){
                        this.sprite.setVelocityX(-this.movementSpeed)
                        this.sprite.anims.play('run', true); // Play the 'run' animation when moving
                    } 
                
            } else {
                this.sprite.flipX = true
                this.sprite.setVelocityX(Math.max(this.sprite.body.velocity.x - 20, -300)); // Reduced speed in air
            }
        }
    }

    altMoveRight() {
        if (this.animationsLoaded){
            this.isDoingMovement = true
            if (this.isOnGround){
                this.sprite.flipX = false
                    if (!this.isDoingAction){
                        this.sprite.setVelocityX(this.movementSpeed)
                        this.sprite.anims.play('run', true); // Play the 'run' animation when moving
                    } 
                
            } else {
                this.sprite.flipX = false
                this.sprite.setVelocityX(Math.min(this.sprite.body.velocity.x + 20, 300)); // Reduced speed in air
                //this.sprite.x += 2.5; // Stop horizontal movement 
                
            }
        }
    }

    altMoveDown(){
        if (this.animationsLoaded){
            if (this.isOnGround){
                this.sprite.flipX = false
                this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
            } else {
                this.sprite.setVelocityY(this.sprite.body.velocity.y + (this.hangTimeSpeed * 0.1)); // Stop horizontal movement 
            }
        }
    }


    altAction1(){
        if (this.animationsLoaded && this.currentStamina > this.action1Cost){
            if (this.nextActionSequence == 4){
                this.nextActionSequence = 1
            }
            
            if (this.isOnGround){
                if(!this.isDoingAction){
                   this.altAction1Sequence(this.nextActionSequence)
                } 
            } else {
                if(!this.isDoingAction){
                    this.altAction1Sequence(this.nextActionSequence)
                     if(this.sprite.body.velocity.y < 500){
                         this.sprite.setVelocityY(this.sprite.body.velocity.y - 250)
                     }
                    
                }
            }
        }
    }

    altAction1Sequence(sequence){
        this.isDoingAction = true;
        
        //this.sprite.anims.play(`${sequence}_atk`, true); // Play the 'run' animation when moving
        // stub
        sequence = 2



        
        if (this.nextActionSequence < 4){
            this.nextActionSequence += 1
        }
        

        const previousStamina = this.currentStamina;
                    this.currentStamina -= this.action1Cost
                    this.canRegen = false
                    // Emit event when health changes
                    this.emit('currentStaminaChanged', previousStamina, true);


                    if (this.isOnGround){

                        // Play the attack animation
                        this.sprite.anims.play(`${sequence}_atk`, true)
                            .on('animationstart', (anim) => {
                                if (anim.key === `${sequence}_atk`) {
        
                                }
                            })
                            .on('animationupdate', (anim, frame) => {
                                // Check if the animation is in the attack state and if the projectile is at frame 8
                                if (anim.key === `${sequence}_atk` && frame.index === 8) {

                                    this.fireProjectile(this.action1PowerPercent * this.adaptability);
                                }
                            })
                        
                    } else {

                        // Play the attack animation
                        this.sprite.anims.play('air_atk', true)
                            .on('animationstart', (anim) => {
                                if (anim.key === 'air_atk') {
        
                                }
                            })
                            .on('animationupdate', (anim, frame) => {
                                // Check if the animation is in the attack state and if the projectile is at frame 8
                                if (anim.key === 'air_atk' && frame.index === 5) {

                                    this.fireProjectile(this.action1PowerPercent * this.adaptability);
                                }
                            })
                     }

                    this.sprite.once('animationcomplete', () => {
                        this.isDoingAction = false
                        this.sprite.clearTint();
                        this.canBeHurt = true
                        this.canRegen = true
 
                   });


        
    }


    altAction2(){
        if (this.animationsLoaded){
            if (this.isOnGround){
                this.sprite.flipX = false
                this.sprite.anims.play('slide', true); // Play the 'run' animation when moving
            } else {

            }
        }
    }

    altSpecial1(){
        if (this.animationsLoaded){
            if (this.isOnGround){
                this.sprite.setVelocityX(0);
                this.isDoingAction = true
                this.sprite.anims.play('sp_atk', true); // Play the 'run' animation when moving
                this.sprite.once('animationcomplete', () => {
                    this.isDoingAction = false
                });
            } else {
                this.sprite.anims.play('sp_atk', true); // Play the 'run' animation when moving
                this.sprite.once('animationcomplete', () => {
                    this.isDoingAction = false
                });
            }
        }
    }

    altSpecial2(){
        if (this.animationsLoaded){
            if (this.isOnGround){
                this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
            } else {
                this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
            }
        }
    }

    altStop() {
        if (this.animationsLoaded){
            if (this.isOnGround){
                
                if(!this.isDoingAction && !this.isDoingMovement){
                    this.sprite.anims.play('idle', true); // Play the 'run' animation when moving 
                }
            } else {

            }  
        }
        

    }

    takeHit(damage = 50, hitSource){

        if(hitSource){
            hitSource.destroy()
        }
        this.sprite.setVelocityX(0)

        if(this.sprite.y > this.scene.scale.height){
            this.canBeHurt = true
        }

        if (this.canBeHurt){
            if (!this.isTakingHit && this.currentHealth > 0){
                this.isTakingHit = true
                this.canRegen = false

                const previousHealth = this.currentHealth;
                this.currentHealth -= damage

                if (this.mode == 0){
                    if(this.traversalSpeedModifier > 35){
                        this.traversalSpeedModifier *= 0.5
                    } else {
                        //this.switchMode()
                    }
                }
                
                

                // Emit event when health changes
                this.emit('currentHealthChanged', previousHealth, true);

                this.sprite.anims.play('take_hit', true); // Play the 'run' animation when moving

                this.scene.decreaseScore(Phaser.Math.Between(5,10)) 
                this.scene.cameras.main.flash(250, 255, 100, 0)

                setTimeout(() => {
                    this.isTakingHit = false;
                    this.canRegen = true
                // console.log("Switch is now off");
                }, 500);

            } else if (this.currentHealth <= 0) {
                this.canAct = false
                
                this.sprite.anims.play('death', true)   
                this.traversalSpeed = 0
                this.stageManager.addedSpeed = 0

                this.sprite.once('animationcomplete', () => {
                    this.scene.restartLevel()

                    
                    this.sprite.x = this.scene.scale.width * 0.3
                    this.sprite.y = 0
                    this.sprite.setVelocity(0)
                    this.stageManager.cameraManager.mainCamera.flash(400, 255, 255, 255)
                    this.vitality = 100 + this.scene.playerData.vitality
                    this.focus = 100 + this.scene.playerData.focus
                    this.adaptability = 100 + this.scene.playerData.adaptability
                    this.resetVitals()

                    this.canAct = true
                    this.traversalSpeed = 5
                    this.traversalSpeedModifier = 100
                    this.sprite.anims.play('jump', true)

                    // Respawn invincibility
                    this.canBeHurt = false
                    this.scene.tweens.add({
                        targets: this.sprite,
                        alpha: { from: 1, to: 0.1 },
                        duration: 100,
                        yoyo: true,
                        repeat: 10,
                        onComplete: () => {
                            this.sprite.setAlpha(1)
                            this.canBeHurt = true
                        }
                    });
                });
            }
        }
        
    }

    switchMode(){

        const progressionPercent = this.scene.level / 12

        if (this.mode == 0){
            this.mode = 1;
            this.scene.cameras.main.flash(500, 48, 25, 52)
            this.stageManager.cameraManager.mainCamera.zoomTo(1.25, 500)


        } else {
            this.mode = 0;
            this.stageManager.cameraManager.mainCamera.zoomTo(1,1000)
        }
        
        console.log('Avatar mode set to:', this.mode); // Optional logging for debugging
    }

    checkForNearbyEnemies() {
        // Assuming `this.sprite` is the player sprite
        const playerX = this.sprite.x;
        const playerY = this.sprite.y;
    
        // Define the maximum detection distance
        const maxDistance = this.scene.sys.game.config.width * 0.5; // Adjust as needed
        let enemiesNearby = false; // Flag to check if any enemies are nearby
    
        // Loop through each enemy group in the stageManager
        Object.keys(this.stageManager.enemyGroups).forEach(groupKey => {
            const group = this.stageManager.enemyGroups[groupKey];
    
            // Check if any enemy in the group is within range
            group.children.each(enemy => {
                if (enemy.active) { // Only check active enemies
                    const distance = Phaser.Math.Distance.Between(playerX, playerY, enemy.x, enemy.y);
    
                    if (distance <= maxDistance) {
                        enemiesNearby = true; // An enemy is nearby
                    }
                }
            });
        });
    
        // Update the mode based on the presence of nearby enemies
        if (!enemiesNearby && !this.stageManager.stageStart) {
            //this.switchMode(); // No enemies nearby, switch to mode 0
        } else {
            // Optional: handle other modes or behavior when enemies are nearby
            //console.log('Enemies are nearby!');
        }
    }
    

    update(time, delta) {

        // State 
        //this.refreshStats()

        
        // Adjust drag and max velocity based on ground status
        this.sprite.setDragX(this.isOnGround ? 2000 : 100); // Lower drag in air

        // Reset movement and action flags
        this.isDoingMovement = false;
        //this.isDoingAction = false;

        // Update input manager to check for controls
        const controls = this.input.update();

        


        if(controls.mode){
            this.switchMode()
        }

        if(this.mode == 0){


            if (this.stageManager.stageStart){
                this.scene.score +=  0.05 * (this.traversalSpeedModifier / 100) 
            }

            if (this.sprite.x < this.scene.scale.width * 0.25) {
                this.sprite.setVelocityX(0)

            } else
            if (this.sprite.x > this.scene.scale.width * 0.35) {
                this.sprite.setVelocityX(0)
            }

            if(this.canAct && !this.isTakingHit){
                if (this.isOnGround){
 
                    if(this.traversalSpeedModifier > 100 ){
                        this.traversalSpeedModifier -= 0.75
                    } else 
                    if (this.traversalSpeedModifier < 100 ) {
                        this.traversalSpeedModifier += 0.75
                    } 

                } 

   
                if(!this.isDoingAction && !this.isDoingSpecial){

                    // Accelration/Deceleration Controls

                    if (this.isOnGround && controls.left && this.traversalSpeedModifier > 50 && this.sprite.x <= this.xRepositionLowerBound){
                        this.traversalSpeedModifier -= 2
                        this.currentStamina -= 0.2
                    } else if (this.isOnGround && controls.right && this.traversalSpeedModifier < 200 && this.sprite.x >= this.xRepositionUpperBound){
                        this.traversalSpeedModifier += 2
                        this.currentStamina -= 0.2
                    }


                    // Movement Controls

                    if (controls.left && this.sprite.x > this.xRepositionLowerBound) {
                        this.moveLeft();
                    } else
                    if (controls.right && this.sprite.x < this.xRepositionUpperBound) {
                        this.moveRight();
                    } else if (!this.isDoingAction  && !this.isDoingSpecial && !controls.action1 && !controls.action2 && !controls.special1 && !controls.special2 && !controls.down) {
                        this.stop();  
                    }

                                                        
                    if (controls.jump || controls.up) {
                        this.jump();
                    } else 
                    if (controls.down){
                        this.moveDown()
                    } 
                }
    
                // Moves Controls
                if (controls.special2 && !this.isDoingAction && !this.isDoingSpecial){
                    this.special2();
                } else
                if (controls.special1 && !this.isDoingAction && !this.isDoingSpecial){
                    this.special1();
                } else
                if (controls.action2 && !this.isDoingAction && !this.isDoingSpecial){
                    this.action2();
                } else
                if (controls.action1 && !this.isDoingAction && !this.isDoingSpecial){
                    this.action1()
                }
            } else {
                
            }

            
            
        } else if(this.mode == 1) {

            this.checkForNearbyEnemies()

            if (controls.left) {
                this.altMoveLeft();
            } else
            if (controls.right) {
                this.altMoveRight();
            } else             
            if(true) {
                    this.altStop(); // Stop horizontal movement if no keys pressed   
            }

            if (controls.jump || controls.up) {
                this.jump();
            } else 
            if (controls.down){
                this.altMoveDown()
            }


 

            if (controls.special2){
                this.altSpecial2();
            } else
            if (controls.special1){
                this.altSpecial1();
            } else
            if (controls.action2){
                this.altAction2();
            } else
            if (controls.action1){
                this.altAction1()
            } else {
                this.nextActionSequence = 1
            }

            
            
            
        }

        // Update isOnGround and coyoteTimeCounter
        if (this.sprite.body.touching.down || this.sprite.body.blocked.down) {
            this.isOnGround = true;
            this.coyoteTimeCounter = this.coyoteTime; // Reset coyote time when on the ground
            this.hangTimeCounter = this.hangTime; // Reset coyote time when on the ground
            this.hasJumped = false; // Reset double jump prevention flag when grounded
        } else {
            this.isOnGround = false;
            this.coyoteTimeCounter -= delta; // Reduce counter if in the air
            this.hangTimeCounter -= delta
        }

        // If the counter goes below 0, reset it to 0
        if (this.coyoteTimeCounter < 0) {
            this.coyoteTimeCounter = 0;
        }

        if (this.hangTimeCounter < 0) {
            this.hangTimeCounter = 0;
        }

        // 

        
    }

}

