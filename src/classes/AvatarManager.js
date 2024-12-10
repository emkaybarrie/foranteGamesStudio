
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
        
        this.initLevelUpMenu()
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
        this.mode = 0
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
            this.createAndLoadAnimation(avatarId, '2_atk', 15, 18, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            this.createAndLoadAnimation(avatarId, 'air_atk', 10, 24, 0);  // Creates 'slide' animation with 5 frames at 8 FPS
            
            
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
        // Start the regeneration timer
        this.startRegen();
        
        
    }

    // Initialize the menu container and options
    initLevelUpMenu() {
        const style = { font: '24px Arial', fill: '#ffffff' };
        this.menuContainer = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2).setDepth(9).setVisible(false);

        const optionTextA = this.scene.add.text(this.scene.cameras.main.x + 50, -50, 'Press V: Increase Vitality', style);
        const optionTextS = this.scene.add.text(this.scene.cameras.main.x + 50, 0, 'Press F: Increase Focus', style);
        const optionTextD = this.scene.add.text(this.scene.cameras.main.x + 50, 50, 'Press R: Increase Stamina', style);

        this.menuContainer.add([optionTextA, optionTextS, optionTextD]);
    }

        // Show the menu and attach key listeners
        showLevelUpMenu(pointMultiplier) {
            this.menuContainer.setVisible(true); // Show the menu

            // Capture the A, S, and D keys
            this.keyV = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
            this.keyF = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
            this.keyR = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

            // Listen for key presses to select an option
            this.keyV.once('down', () => this.selectLevelUpOption('V', pointMultiplier));
            this.keyF.once('down', () => this.selectLevelUpOption('F', pointMultiplier));
            this.keyR.once('down', () => this.selectLevelUpOption('R', pointMultiplier));
        }

            // Handle option selection, update stats, and hide menu
            selectLevelUpOption(option, pointMultiplier = 1) {
                switch (option) {
                    case 'V':
                        this.vitality += 5 * pointMultiplier;
                        break;
                    case 'F':
                        this.focus += 5 * pointMultiplier;
                        break;
                    case 'R':
                        this.adaptability += 5 * pointMultiplier;
                        break;
                }

                this.refreshStats()
                console.log('Vitality:' + this.vitality)
                console.log('Focus:' + this.focus)
                console.log('Adaptability: ' + this.adaptability)
                // Hide the menu and cleanup listeners
                this.menuContainer.setVisible(false);
                //this.scene.input.keyboard.removeKey(this.keyA);
                //this.scene.input.keyboard.removeKey(this.keyS);
                //this.scene.input.keyboard.removeKey(this.keyD);
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
        this.movementSpeed = Math.min(500 + (150  * ((this.adaptability - 100)/ 100)),750)
        this.repositionSpeed = Math.min(200 + (200  * ((this.adaptability - 100)/ 100)),450)
        this.repositionSpeedAir = Math.min(150 + (200  * ((this.adaptability - 100)/ 100)), 350)
        this.traversalSpeed = Math.min(((this.movementSpeed * 0.015) + (5  * ((this.adaptability - 100)/ 100))), 20) 
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
    createAndLoadAnimation(avatarId, keyName, totalFrames, frameRate = 10, repeat = -1) {
        const customXScaling = 0.05
        const customYScaling = 0.3
        const customXOffset = 135;
        const customYOffset = 87.5;

        // 1. Load all frames for the animation
        for (let i = 1; i <= totalFrames; i++) {
            const frameKey = `${keyName}_${String(i).padStart(2, '0')}`;
            this.scene.load.image(frameKey, `assets/avatars/${avatarId}/animations/${keyName}/${frameKey}.png`);
        }

        // 2. Once images are loaded, create the animation
        this.scene.load.on('complete', () => {
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
            this.sprite.setTexture(frames[0].key); 
            this.sprite.setVisible(true);

            // Set the size and offset based on the first frame dimensions
            const firstFrameKey = frames[0].key;
            //console.log(firstFrameKey)
            const texture = this.scene.textures.get(firstFrameKey);
           // console.log(texture)
            const frameData = texture.get(firstFrameKey);
           // console.log(frameData)

            if (frameData) {
                // Set the initial physics body size and offset based on the first frame
                this.sprite.setSize(frameData.width * customXScaling, frameData.height * customYScaling);
                this.sprite.setOffset(frameData.x + customXOffset, frameData.y + customYOffset); // Adjust if necessary to align correctly

               // console.log(`Sprite Position: ${this.sprite.x}, ${this.sprite.y}`);
               // console.log(`Physics Body Size: ${this.sprite.body.width}, ${this.sprite.body.height}`);
               // console.log(`Physics Body Offset: ${this.sprite.body.offset.x}, ${this.sprite.body.offset.y}`);
            }

            // Mark animations as loaded
            this.animationsLoaded = true;

            
        });

        // Start loading immediately
        this.scene.load.start();
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
            
            //console.log(`${stat} increased to: ${this[stat]}`);
        } else {
            console.warn(`Stat ${stat} does not exist on the Avatar instance.`);
        }
    }

    // Mode 0 Controls

        moveLeft() {
            if (this.animationsLoaded && this.currentStamina > 0){
                this.currentStamina -= 0.5
                if (this.isOnGround){
                    this.sprite.flipX = false

                        this.sprite.setVelocityX(-this.repositionSpeed); // Stop horizontal movement 

                   
                    this.sprite.anims.play('run', true); // Play the 'run' animation when moving
                } else {
                    //this.sprite.flipX = true
                    this.sprite.setVelocityX(-this.repositionSpeedAir); // Stop horizontal movement 
                    
                }
            }
        }

        moveRight() {
            if (this.animationsLoaded && this.currentStamina > 0){
                this.currentStamina -= 0.25
            
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
                this.currentStamina -= 0.25
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
                this.currentStamina -= 0.25
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
            if (this.animationsLoaded && this.currentStamina > 0){

                this.currentStamina -= 0.75
                if (this.isOnGround){
                    this.sprite.flipX = false
                    if(this.traversalSpeedModifier > 25){
                        this.traversalSpeedModifier -= 1
                    }
                    if(this.scene.region ==3){ // Stub
                        this.sprite.anims.play('2_atk', true); // Play the 'run' animation when moving
                    } else {
                        this.sprite.anims.play('1_atk', true); // Play the 'run' animation when moving
                    } 
                    
                } else {
                    this.sprite.anims.play('air_atk', true); // Play the 'run' animation when moving
                }
            }
        }

        action2(){
            

            if (this.animationsLoaded && this.currentStamina > 35 ){
                
     
                
                if (!this.isDoingAction){
                    
                    this.isDoingAction = true

                    const previousStamina = this.currentStamina;
                this.currentStamina -= 35
                // Emit event when health changes
                this.emit('staminaChanged', previousStamina, this.currentStamina);

                 // Create the tween
                    this.scene.tweens.add({
                        targets: this.sprite,
                        x: this.sprite.x + 25,
                        duration: 150,
                        ease: 'Power1', // Easing for smooth movement
                        onStart: () => {
                            console.log("Dash started!");
                            this.canBeHurt = false
                            this.sprite.setTint(0x90ee90); // Visual feedback
                            this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
                            this.sprite.once('animationcomplete', () => {
                                 this.isDoingAction = false
                                 this.sprite.clearTint();
                                 this.canBeHurt = true
          
                            });
                            if(!this.isOnGround){
                                this.sprite.body.setVelocityY(this.sprite.body.velocity.y - 350)
                            }
                        },
                        onUpdate: (tween, target) => {
                           // if (tween.progress >= 0.5 && onHalfway) {
                                //onHalfway(); // Call the halfway function once
                                //onHalfway = null; // Ensure it only runs once
                           // }
                        },
                        onComplete: () => {
                            console.log("Dash complete!");
                            
                            
                        }
                    });

                    // if (this.isOnGround){
                    //     this.sprite.flipX = false
                    //     this.sprite.setVelocityX(3000); // Stop horizontal movement 
                    //     this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
                        
                    // } else {
                    //     this.sprite.setVelocityX(3000); // Stop horizontal movement 
                    //     this.sprite.anims.play('roll', true); // Play the 'run' animation when moving
                    // }

                    // this.sprite.once('animationcomplete', () => {
                    //     this.isDoingAction = false
                    // });
                }
            }
        }

        special1(){
            if (this.animationsLoaded && this.currentMana > 0){
                this.currentMana -= 1

                

                if (this.isOnGround){

                    this.sprite.anims.play('run', true); // Play the 'run' animation when moving

                    if(this.traversalSpeedModifier < 200 ){
                        this.traversalSpeedModifier += 3
                    }
                } else {
                    if(this.traversalSpeedModifier < 200 ){
                        this.traversalSpeedModifier += 1.5
                    }
                }
            }
        }

        special2(){
            if (this.animationsLoaded && this.currentMana > 0){
                    
                this.currentMana -= 1
                this.currentHealth += 0.5

                if (this.isOnGround){
                    this.sprite.anims.play('slide', true); // Play the 'run' animation when moving
                    if(this.traversalSpeedModifier > 50 ){
                        this.traversalSpeedModifier -= 1.5
                    }
                } else {
                    if(this.traversalSpeedModifier > 75 ){
                        this.traversalSpeedModifier -= 0.5
                    }
                }
    
        
                
            }
        }

        resetC(){
            this.traversalSpeedModifier = 100 
            this.sprite.body.allowGravity = true
        }

        stop() {

       
            if(!this.isDoingAction){
                
                if (this.animationsLoaded){
                    if (this.isOnGround){
                        this.sprite.flipX = false
                        if(!this.isDoingAction && !this.isDoingMovement && !this.isTakingHit){
                            this.sprite.angle = 0
                            this.sprite.anims.play('run', true); // Play the 'run' animation when moving 
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
        if (this.animationsLoaded){
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
        
        this.sprite.anims.play(`${sequence}_atk`, true); // Play the 'run' animation when moving

        if (this.nextActionSequence < 4){
            this.nextActionSequence += 1
        }
        

        this.sprite.once('animationcomplete', () => {
            this.isDoingAction = false
        });

                

        // Listen for animation updates to pause on a specific frame
        // this.sprite.on('animationupdate', (animation, frame) => {
        //     if (frame.index === 3 && this.isCharging) {
        //         this.sprite.anims.pause(); // Pause on the target frame
        //         // Flash effect setup
        //         this.startFlashing()
        //     }
        // });

        
    }

    // startFlashing() {
    //     // Clear any existing flash timer before starting a new one
    // if (this.flashTimer) {
    //     this.flashTimer.remove();
    //     this.sprite.visible = true; // Ensure visibility is reset
    // }

    // // Set up the flash effect to toggle visibility
    // this.flashTimer = this.scene.time.addEvent({
    //     delay: this.flashInterval,
    //     callback: () => {
    //         this.sprite.visible = !this.sprite.visible; // Toggle visibility for flash effect
    //     },
    //     loop: true
    // });
    // }

    // altAction1Release(){
    //     // Stop flashing
    //     if (this.flashTimer) {
    //         this.flashTimer.remove();
    //         this.sprite.visible = true; // Ensure visibility is reset
    //     }

    //     this.isCharging = false;
    //     // Resume the animation from the paused frame
    //     this.sprite.anims.resume();
    //     this.sprite.once('animationcomplete', () => {
    //         // Reset charge when animation completes
    //         this.charge = 0;
    //         // Return to idle after charge animation completes
    //         this.sprite.anims.play('idle');
    //         //this.isDoingAction = false
    //     });
    // }

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

    takeHit(damage = 50){

        if(this.sprite.y > this.scene.scale.height){
            this.canBeHurt = true
        }

        if (this.canBeHurt){
        if (!this.isTakingHit && this.currentHealth > 0){
            this.isTakingHit = true
            this.canRegen = false

            const previousHealth = this.currentHealth;
            this.currentHealth -= damage
            if(this.traversalSpeedModifier > 20){
                this.traversalSpeedModifier -= 25
            }
            

            // Emit event when health changes
            this.emit('healthChanged', previousHealth, this.currentHealth);

            this.sprite.anims.play('take_hit', true); // Play the 'run' animation when moving

           // this.scene.decreaseScore(Math.floor(Math.random() * this.scene.level) + 1) 
            this.scene.decreaseScore(Phaser.Math.Between(5,10)) 
            this.scene.cameras.main.flash(250, 255, 100, 0)

            setTimeout(() => {
                this.isTakingHit = false;
                this.canRegen = true
                console.log("Switch is now off");
            }, 250);

        } else if (this.currentHealth <= 0) {
            this.canAct = false
            
            this.sprite.anims.play('death', true)   
            this.traversalSpeed = 0
            this.stageManager.addedSpeed = 0

            this.sprite.once('animationcomplete', () => {
                this.scene.restartLevel()

                
                this.sprite.x = this.scene.scale.width * 0.2
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
            });
        }
    }
        
    }

    switchMode(){

        const progressionPercent = this.scene.level / 12

        if (this.mode == 0){
            this.mode = 1;
            // Set the camera zoom level
           this.scene.cameras.main.zoomTo(Math.max(3 - (1.5 * progressionPercent),1.5), 500); // You can adjust the zoom value as needed
            //this.scene.cameras.main.zoomTo(1, 1000); // Debug Camera

            // Set the camera to follow the avatar
            this.scene.cameras.main.startFollow(this.sprite);
        } else {
            this.mode = 0;
            // Gradually zoom in on the avatar at the start of the scene
            this.scene.cameras.main.zoomTo(Math.max(2 - (1 * progressionPercent),1), 1000); // Zoom to level 1 over 2 seconds

            // Set the camera to follow the avatar
            this.scene.cameras.main.startFollow(this.scene.shakyCamTarget);

            // Manually update camera's Y position to follow the avatar on the Y-axis only
            //this.scene.cameras.main.scrollY = this.sprite.y - this.scene.cameras.main.height / 2;
        }
        
        console.log('Avatar mode set to:', this.mode); // Optional logging for debugging
    }

    update(time, delta) {

        // State 
        this.refreshStats()

        
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

            //if (this.traversalSpeedModifier > 25){
                this.scene.score +=  0.05 * (this.traversalSpeedModifier / 100) 
            //}

            if(this.canAct && !this.isTakingHit){
                if (this.isOnGround){
                    if(this.traversalSpeedModifier > 150 ){
                        this.traversalSpeedModifier -= 0.75
                    } else
                    if(this.traversalSpeedModifier > 125 ){
                        this.traversalSpeedModifier -= 0.5
                    } else 
                    if(this.traversalSpeedModifier > 100 ){
                        this.traversalSpeedModifier -= 0.25
                    } else 
                    if (this.traversalSpeedModifier < 100 ) {
                        this.traversalSpeedModifier += 0.25
                    } else
                    if(this.traversalSpeedModifier < 75 ){
                        this.traversalSpeedModifier += 0.5
                    } else  
                    if (this.traversalSpeedModifier < 25 ) {
                        this.traversalSpeedModifier += 1
                    }
                } else {
                    if(this.traversalSpeedModifier > 150 ){
                        this.traversalSpeedModifier -= 0.25
                    } else
                    if(this.traversalSpeedModifier > 125 ){
                        this.traversalSpeedModifier -= 0.1
                    } else 
                    if(this.traversalSpeedModifier > 100 ){
                        this.traversalSpeedModifier -= 0.05
                    } 
                }
                
                
               
                if(!this.isDoingAction){
                if (controls.left && this.sprite.x > this.scene.scale.height * 0.1) {
                    this.moveLeft();
                } else
                if (controls.right && this.sprite.x < this.scene.scale.height * 0.5) {
                    this.moveRight();
                } else if (!this.isDoingAction && !controls.action1 && !controls.action2 && !controls.special1 && !controls.special2 && !controls.down) {
                    this.stop();  
                }
                
    
        
                if (controls.jump || controls.up) {
                    this.jump();
                } else 
                if (controls.down){
                    this.moveDown()
                } 
            }
    
    
                if (controls.special2 && !this.isDoingAction){
                    this.special2();
                } else
                if (controls.special1 && !this.isDoingAction){
                    this.special1();
                } else
                if (controls.action2 && !this.isDoingAction){
                    this.action2();
                } else
                if (controls.action1 && !this.isDoingAction){
                    this.action1()
                }
            } else {
                
            }

            
            
        } else {


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

