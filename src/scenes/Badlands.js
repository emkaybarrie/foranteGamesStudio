import preload from '../preload.js';
import StageManager from '../classes/StageManager.js';
import InputManager from '../classes/InputManager.js';
import { config } from "../config.js";


export default class Badlands extends Phaser.Scene {
    constructor() {
        super('Badlands');
        this.scriptId = 'AKfycbw1zakrf0zclJNWzBSXjIKTfudd6Q9-YHNq6EvP7JGQ4OrtPIs0SwrgJCsAyoB4Y5eu'
        this.sheetUrl = `https://script.google.com/macros/s/${this.scriptId}/exec`;
        this.stage = null;
        this.avatar = null;
        this.level = 1
        this.score = 0
        this.touchControls = null;

    }

    init(data) {
        console.log(data)
        this.region = data.region;
        this.playerData = data.playerData
    }

    // Method to load the high score from localStorage
    loadHighScore() {
        const savedHighScore = localStorage.getItem('highScore');
        return savedHighScore ? JSON.parse(savedHighScore) : { score: 0, level: 1 };
    }

    // Method to save the high score to localStorage
    saveHighScore(score, level) {
        const highScoreData = { score, level };
        localStorage.setItem('highScore', JSON.stringify(highScoreData));
    }

    async saveScoreToDb(score, stage){
        try {
            const response = await fetch(
              `${this.sheetUrl}?request=updateScore&id=${this.playerData.id}&score=${Math.round(score)}&level=${stage}`,{
                method: "POST",
              }
            );
      
            const result = await response.json();
      
            console.log(result)
      
            if (result.status === "success") {
              // Player score updated
            } else if (result.status === "error") {
              // Player doesn't exist, prompt for account creation
              console.log(result.message)
            } else {
              console.error(result.message);
            }
          } catch (error) {
            console.error("Error logging in:", error);
          }
    }

    decreaseScore(amount){

        this.score = Math.round(Math.max(this.score - amount, 0))
    }

    restartLevel(){
        console.log('Restarting')
        // Save Score
        // Save the score and level only if the current score is higher than the saved one
        if (this.score > this.highScore) {
            this.saveScoreToDb(this.score, this.stageManager.stage);
            console.log('Saving Score to DB')
            this.highScore = this.score
            this.highScoreLevel = this.stageManager.stage

        }

        // Update the texts
        this.recordText_Score.setText(`High Score: ${Math.round(this.highScore)}`);
        this.recordText_Level.setText(`Furthest Level: ${this.highScoreLevel}`);

        this.score = 0
        this.stageManager.stageProgress = 0
        this.stageManager.stage = 1
        this.stageManager.addedSpeed = 0

        // Update the texts
        this.scoreText.setText(`Score: ${this.score}`);

        
    }

    

    preload(){
        // Load assets if needed
        preload(this);
        this.load.image('avatarIcon', `assets/avatars/${this.region}/icons/Badlands/default.png`)
        this.load.image('healthIcon', 'assets/images/healthIcon.png')
        this.load.image('manaIcon', 'assets/images/manaIcon.png')
        this.load.image('staminaIcon', 'assets/images/staminaIcon.png')

        // Stub Monsters
        const currentRegion = 'region1'; // Replace with your dynamic logic
        const currentStage = 'stage1';  // Replace with your dynamic logic
        this.monsterList = {
            region1: {
                stage1: {
                    common: [
                        {
                            name: 'nightborne_archer',
                            spriteSheetPath: 'assets/enemies/region1/nightborne_archer.png',
                            dimensions: { frameWidth: 64, frameHeight: 64 },
                            animations: [
                                { type: 'idle', start: 40, end: 43, frameRate: 6, repeat: -1 },
                                { type: 'run', start: 0, end: 7, frameRate: 12, repeat: -1 },
                                { type: 'attack', start: 24, end: 30, frameRate: 8, repeat: 0 },
                                { type: 'takeHit', start: 8, end: 9, frameRate: 6, repeat: 0 },
                                { type: 'death', start: 8, end: 15, frameRate: 8, repeat: 0 }
                            ],
                            flipReversed: true,
                            scale: 1.5,
                            physicsBox: { width: 32, height: 32, offsetX: 16, offsetY: 16 }, // Optional
                            tint: 0xFFFFFF,//0x00FF00,
                            type: 'default',
                            attackType: 'ranged',
                            attackRange: this.scale.width * 0.5,        
                            attackPower: 15,
                            maxAttackCombo: 2,
                            attackRecoveryTime: 3000
                        },
                        {
                            name: 'nightborne_warrior',
                            spriteSheetPath: 'assets/enemies/region1/nightborne_warrior.png',
                            dimensions: { frameWidth: 140, frameHeight: 93 },
                            animations: [
                                { type: 'idle', start: 0, end: 7, frameRate: 6, repeat: -1 },
                                { type: 'run', start: 8, end: 15, frameRate: 12, repeat: -1 },
                                { type: 'attack', start: 16, end: 25, frameRate: 8, repeat: 0 },
                                { type: 'takeHit', start: 26, end: 28, frameRate: 6, repeat: 0 },
                                { type: 'death', start: 29, end: 38, frameRate: 10, repeat: 0 }
                            ],
                            flipReversed: false,
                            scale: 1.25,
                            physicsBox: { width: 20, height: 50, offsetX: 100, offsetY: 35 }, // Optional
                            tint: 0xFFFFFF,//0x00FF00,
                            type: 'default',
                            attackType: 'melee',
                            attackRange: this.scale.width * 0.1,        
                            attackPower: 25,
                            maxAttackCombo: 4,
                            attackRecoveryTime: 2000

                        },
                        // Other common monsters...
                    ],
                    uncommon: [
                        {
                            name: 'nightborne_hound',
                            spriteSheetPath: 'assets/enemies/region1/nightborne_hound.png',
                            dimensions: { frameWidth: 64, frameHeight: 64 },
                            animations: [
                                { type: 'idle', start: 0, end: 5, frameRate: 6, repeat: -1 },
                                { type: 'run', start: 7, end: 11, frameRate: 12, repeat: -1 },
                                { type: 'attack', start: 7, end: 11, frameRate: 8, repeat: 0 },
                                { type: 'takeHit', start: 14, end: 17, frameRate: 6, repeat: 0 },
                                { type: 'death', start: 21, end: 27, frameRate: 8, repeat: 0 }
                            ],
                            flipReversed: false,
                            scale: 1.25,
                            physicsBox: { width: 64, height: 32, offsetX: 0, offsetY: 32 }, // Optional
                            tint: 0xFFFFFF,//0x00FF00,
                            type: 'chaser',
                            attackType: 'melee',
                            attackRange: this.scale.width * 0,   
                            attackPower: 20,
                            maxAttackCombo: 1,
                            attackRecoveryTime: 1000
                        },
                        // Other uncommon monsters...
                    ],
                    rare: [
                        {
                            name: 'nightborne_elite',
                            spriteSheetPath: 'assets/enemies/region1/nightborne_elite.png',
                            dimensions: { frameWidth: 80, frameHeight: 80 },
                            animations: [
                                { type: 'idle', start: 0, end: 8, frameRate: 6, repeat: -1 },
                                { type: 'run', start: 23, end: 28, frameRate: 12, repeat: -1 },
                                { type: 'attack', start: 46, end: 57, frameRate: 8, repeat: 0 },
                                { type: 'takeHit', start: 69, end: 73, frameRate: 10, repeat: 0 },
                                { type: 'death', start: 92, end: 114, frameRate: 12, repeat: 0 }
                            ],
                            flipReversed: true,
                            scale: 3,
                            physicsBox: { width: 20, height: 32, offsetX: 25, offsetY: 32 }, // Optional        
                            tint: 0xFFFFFF,//0x00FF00,
                            type: 'chaser',
                            attackType: 'melee',
                            attackRange: this.scale.width * 0.1, 
                            attackPower: 40,
                            maxAttackCombo: 3,
                            attackRecoveryTime: 3000
                        },
                        // Other rare monsters...
                    ],
                    // Other rarities...
                },
                // Other stages...
            },
            // Other regions...
        };
        
        // Preload only the relevant monster spritesheets
        this.loadMonsterSpritesheets(this.monsterList, currentRegion, currentStage);
  
         
    }

    loadMonsterSpritesheets(monsterList, region, stage) {
        const loadedAssets = new Set(); // Track loaded spritesheets
  
    
        // If region is provided, use it; otherwise, loop over all regions
        const regionsToLoad = region ? [region] : Object.keys(monsterList);
    
        regionsToLoad.forEach(regionKey => {
            const region = monsterList[regionKey];
    
            // If stage is provided, use it; otherwise, loop over all stages for the region
            const stagesToLoad = stage ? [stage] : Object.keys(region);
    
            stagesToLoad.forEach(stageKey => {
                const stageData = region[stageKey];
    
                // Load each monster's spritesheet
                Object.values(stageData).forEach(monsters => {
                    monsters.forEach(monster => {
                        const { name, spriteSheetPath, dimensions } = monster;
    
                        // Only load if not already loaded
                        if (!loadedAssets.has(spriteSheetPath)) {
                            this.load.spritesheet(name, spriteSheetPath, {
                                frameWidth: dimensions.frameWidth,
                                frameHeight: dimensions.frameHeight,
                            });
                            loadedAssets.add(spriteSheetPath);
                        }
                    });
                });
            });
        });
 
    }
    

    create() {
    
         // Pause game when "P" is pressed
        this.input.keyboard.on('keydown-P', () => {
            this.scene.pause(); // Pause this scene
            this.scene.launch('PauseScreen'); // Launch the pause menu scene
            this.scene.bringToTop('PauseScreen');
        });

        

        this.input.mouse.disableContextMenu();

        this.isTouch = this.input.activePointer.touch;
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);


        //
        this.highScore = this.playerData.score
        this.highScoreLevel = this.playerData.level

        // Stubs

            // Controls
            // Show controls text on screen
            if ((!this.isMobile || !this.isTouch) & this.sys.game.device.os.desktop){
                this.createControlsText(this);
            }
            

            const musicList = {
                1:'142',
                2:'BlameBrett',
                3:'Francesca',
                4:'FromEden',
                5:'KingsSeason',
                6:'Spartacus',
                7:'StayCrunchy',
                8:'XylemUp',
            }

            // Play the background music on loop
            this.sound.play('backgroundMusic' + Phaser.Math.Between(1,8), {
                loop: true,  // Set to true to make the music repeat
                volume: 0.5  // Adjust the volume (optional, between 0 and 1)
            });

            // // Scale factors relative to screen size
            const baseScreenIncrementX = this.scale.width * 0.01;
            const baseScreenIncrementY = this.scale.height * 0.01;

        

        // Initialize the score display
        this.scoreText = this.add.text(baseScreenIncrementX * 95, baseScreenIncrementY * 5, `Score: ${this.score}`, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0)

        // High Score And Level
        this.recordText_Score = this.add.text(baseScreenIncrementX * 95, this.scoreText.y + baseScreenIncrementY * 10, `High Score: ${Math.round(this.highScore)}`, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0)

        this.recordText_Level = this.add.text(baseScreenIncrementX * 95, this.recordText_Score.y + baseScreenIncrementY * 5 , `Furthest Level: ${this.highScoreLevel}`, {
            fontSize: '24px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0)

         // Configure stage setup
         var stageConfig = {}

         if(this.region == 2){
            stageConfig = {
                regionId: 2,
                areaId: 1,
                routeId: 1,
                numberOfLayers: 4,
                baseSpeed: 0,
                addedSpeed: 0,
                parallaxSpeeds: [1,0.5,0.35,0.01]
            };
         } else {
            stageConfig = {
                regionId: 1,
                areaId: 1,
                routeId: 1,
                numberOfLayers: 9,
                baseSpeed: 0,
                addedSpeed: 0,
                parallaxSpeeds: [1,0.35,0.9,0.85,0.65,0.35,0.1,0.05,0.01]
            };
         }
         
         // Input Manager
        this.inputManager = new InputManager(this)
        this.inputManager.setupControls()
        this.input.addPointer(10);  // Allow up to 10 pointers
        
        // Stage Manager
        this.stageManager = new StageManager (this, this.inputManager, stageConfig)


  
        
    }

    // Create a text object to display the controls in Phaser 3
    createControlsText(scene) {
        // Text content for controls, each action on its own line
        const controlsText = `
        Move: [ARROWS]
        Jump: [SPACE] or [TAP/CLICK]

        Dodge: [Q] or [RIGHT/DOUBLE CLICK]
        Attack: [E]
        Sprint: [D]
        Slow/Heal: [A] 

        Pause: [P]
        Main Menu: [F5]

        Survive and beat your high score
        Get stronger the further you get 
        
        All feedback welcome! :D
         - Emkay
        `;

        // Create the text object on the screen
        const textObject = scene.add.text(scene.scale.width * (1 - 0.05), scene.scale.height * 0.25, controlsText, {
            font: '16px Arial',  // Font style
            fill: '#ffffff',     // Text color
            align: 'right'        // Align text to the left
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0);

        // Make the text object scrollable if needed
        textObject.setWordWrapWidth(1000);  // Set word wrap to handle long lines
    }

    incrementLevel() {


        if(this.stageManager.stage < 12){
        this.stageManager.addedSpeed += 0.2
        this.stageManager.avatarManager.vitality += 1
        this.stageManager.avatarManager.focus += 2
        this.stageManager.avatarManager.adaptability += 4

        
        
        //this.avatar.showLevelUpMenu()
         } else {
            this.stageManager.avatarManager.vitality += 3
            this.stageManager.avatarManager.focus += 3
            this.stageManager.avatarManager.adaptability += 2
            this.stageManager.addedSpeed += 0.5
           // this.avatar.showLevelUpMenu()
        }

        
    }

    update(time, delta) {

       // console.log(this.stageManager.avatarManager.currentStamina)

        this.stageManager.update(time, delta)

        this.inputManager.update();

        this.scoreText.setText(`Score: ${Math.round(this.score)}`);
        //this.avatarHealthText.setText(`Health:         ${Math.round(this.stageManager.avatarManager.currentHealth)}`)




        

    




        

        
    }

}
