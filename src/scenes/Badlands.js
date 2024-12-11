import preload from '../preload.js';
import StageManager from '../classes/StageManager.js';
import InputManager from '../classes/InputManager.js';


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

    async saveScoreToDb(score, level){
        try {
            const response = await fetch(
              `${this.sheetUrl}?request=updateScore&id=${this.playerData.id}&score=${Math.round(score)}&level=${this.level}`,{
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
            this.saveScoreToDb(this.score, this.level);
            console.log('Saving Score to DB')
            this.highScore = this.score
            this.highScoreLevel = this.level

        }

        // Update the texts
        this.recordText_Score.setText(`High Score: ${Math.round(this.highScore)}`);
        this.recordText_Level.setText(`Furthest Level: ${this.highScoreLevel}`);

        this.level = 1
        this.score = 0

        // Update the texts
        this.levelText.setText(`Level: ${this.level}`);
        this.scoreText.setText(`Score: ${this.score}`);

        
    }

    

    preload(){
        // Load assets if needed
        preload(this);

        this.load.image('avatarIcon', `assets/avatars/${this.region}/icons/Badlands/default.png`)
        this.load.image('healthIcon', 'assets/images/healthIcon.png')
        this.load.image('manaIcon', 'assets/images/manaIcon.png')
        this.load.image('staminaIcon', 'assets/images/staminaIcon.png')
         
    }

    create() {

        this.input.mouse.disableContextMenu();

        this.isTouch = this.input.activePointer.touch;
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);


        //
        this.highScore = this.playerData.score
        this.highScoreLevel = this.playerData.level

        // Stubs
            // Set up a timed event to increase level every 30 seconds
            this.time.addEvent({
                delay: 10000, // 10 seconds in milliseconds
                callback: this.incrementLevel,
                callbackScope: this,
                loop: true // Repeat this event every 30 seconds
            });
            // Controls
            // Show controls text on screen
            if (!this.isMobile || !this.isTouch){
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

            // // Title Text
            // this.titleText = this.add.text(baseScreenIncrementX * 50, baseScreenIncrementY * 5,
            //     `${this.playerData.alias} - Welcome to the Badlands - Region ${this.region} - vPOC_0.1`, 
            //     { fontSize: '32px', fill: '#fff' })
            //     .setDepth(9).setOrigin(0.5);

            // // Desired size of the avatar icon in pixels
            // const avatarIconDesiredSize = 300; // Change this value to tweak the avatar icon size
            // const vitalsIconScaleFactor = 0.275; // Proportional size of vitals icons relative to avatar icon
            // const vitalsSpacingFactor = 0.15; // Proportional spacing between vitals icons relative to avatar icon size

            

            // // Calculate avatar icon size and vitals icon size dynamically
            // const avatarIconSize = Math.min(this.scale.width, this.scale.height) * (avatarIconDesiredSize / Math.max(this.scale.width, this.scale.height));
            // const vitalsSpacingFromAvatarIcon = baseScreenIncrementX * 1
            // const vitalsIconSize = avatarIconSize * vitalsIconScaleFactor;
            // const vitalsIconsSpacing = avatarIconSize * vitalsSpacingFactor;

            // // Avatar Icon
            // this.avatarIcon = this.add.image(baseScreenIncrementX * 5, baseScreenIncrementY * 5, 'avatarIcon')
            //     .setOrigin(0)
            //     .setDisplaySize(avatarIconSize, avatarIconSize)
            //     .setDepth(9);

            // // Vitals Icons
            // const avatarIconRightX = this.avatarIcon.x + this.avatarIcon.displayWidth + vitalsSpacingFromAvatarIcon;
            // const avatarIconCenterY = this.avatarIcon.y + this.avatarIcon.displayHeight / 2;

            // // First vitals icon (health)
            // this.avatarHealthIcon = this.add.image(
            //     avatarIconRightX + baseScreenIncrementX, 
            //     avatarIconCenterY - vitalsIconSize - vitalsIconsSpacing / 2, 
            //     'healthIcon'
            // )
            //     .setOrigin(0.5)
            //     .setDisplaySize(vitalsIconSize, vitalsIconSize)
            //     .setDepth(9);

            // // Second vitals icon (mana)
            // this.avatarManaIcon = this.add.image(
            //     avatarIconRightX + baseScreenIncrementX, 
            //     avatarIconCenterY, 
            //     'manaIcon'
            // )
            //     .setOrigin(0.5)
            //     .setDisplaySize(vitalsIconSize, vitalsIconSize)
            //     .setDepth(9);

            // // Third vitals icon (stamina)
            // this.avatarStaminaIcon = this.add.image(
            //     avatarIconRightX + baseScreenIncrementX, 
            //     avatarIconCenterY + vitalsIconSize + vitalsIconsSpacing / 2, 
            //     'staminaIcon'
            // )
            //     .setOrigin(0.5)
            //     .setDisplaySize(vitalsIconSize, vitalsIconSize)
            //     .setDepth(9);



        

        // Initialize the score display
        this.scoreText = this.add.text(baseScreenIncrementX * 95, baseScreenIncrementY * 5, `Score: ${this.score}`, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0)

        // Display the level text in the top-right corner
        this.levelText = this.add.text(baseScreenIncrementX * 95, this.scoreText.y + baseScreenIncrementY * 5, `Level: ${this.level}`, {
            fontSize: '24px',
            fill: '#fff',
            align: 'left'
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0); // Align text to the top-right corner


        // High Score And Level
        this.recordText_Score = this.add.text(baseScreenIncrementX * 95, this.levelText.y + baseScreenIncrementY * 5, `High Score: ${Math.round(this.highScore)}`, {
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

        Main Menu: [F5]

        Survive and beat your high score
        Get stronger the further you get 
        
        All feedback welcome! :D
         - Emkay
        `;

        // Create the text object on the screen
        const textObject = scene.add.text(scene.scale.width * (1 - 0.05), scene.scale.height * 0.25, controlsText, {
            font: '24px Arial',  // Font style
            fill: '#ffffff',     // Text color
            align: 'right'        // Align text to the left
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0);

        // Make the text object scrollable if needed
        textObject.setWordWrapWidth(1000);  // Set word wrap to handle long lines
    }

    incrementLevel() {
        // Increment the level
        this.level += 1;
        // Update the level text
        this.levelText.setText(`Level: ${this.level}`);

        

        //this.avatar.switchMode()

        if(this.level < 12){
        this.stageManager.addedSpeed += 0.25
        this.stageManager.avatarManager.vitality += 5
        this.stageManager.avatarManager.focus += 5
        this.stageManager.avatarManager.adaptability += 5

        
        
        //this.avatar.showLevelUpMenu()
         } else {
            this.stageManager.avatarManager.vitality += 0.5
            this.stageManager.avatarManager.focus += 1
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
