import preload from '../preload.js';
import StageManager from '../classes/StageManager.js';
import InputManager from '../classes/InputManager.js';


export default class Badlands extends Phaser.Scene {
    constructor() {
        super('Badlands');
        this.stage = null;
        this.avatar = null;
        this.level = 1
        this.score = 0
        // Load high score from localStorage
        this.highScore = this.loadHighScore();

        
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

    decreaseScore(amount){

        this.score = Math.round(Math.max(this.score - amount, 0))
    }

    restartLevel(){
        // Save Score
        // Save the score and level only if the current score is higher than the saved one
        if (this.score > this.highScore.score) {
            this.saveHighScore(this.score, this.level);
            this.highScore = { score: this.score, level: this.level }; // Update high score in the scene
        }

        this.level = 1
        this.score = 0

        // Update the texts
        this.levelText.setText(`Level: ${this.level}`);
        this.scoreText.setText(`Score: ${this.score}`);

        // Update the texts
        this.recordText_Score.setText(`High Score: ${Math.round(this.highScore.score)}`);
        this.recordText_Level.setText(`Furthest Level: ${this.highScore.level}`);
    }

    init(data) {
        this.region = data.region;
    }

    preload(){
        // Load assets if needed
        preload(this);
    }

    create() {

        // Stub Controls
        // Set up a timed event to increase level every 30 seconds
        this.time.addEvent({
            delay: 10000, // 10 seconds in milliseconds
            callback: this.incrementLevel,
            callbackScope: this,
            loop: true // Repeat this event every 30 seconds
        });

        var textAnchorPointX = 0.05
        var textAnchorPointY = 0.05
        this.titleText = this.add.text(this.scale.width * textAnchorPointX, this.scale.height * textAnchorPointY, `Welcome to the Badlands - Region ${this.region}`, { fontSize: '32px', fill: '#fff' }).setDepth(9);

        // Initialize the score display
        this.scoreText = this.add.text(this.scale.width * textAnchorPointX, this.titleText.y + (this.scale.height * textAnchorPointY), `Score: ${this.score}`, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0)

        // Display the level text in the top-right corner
        this.levelText = this.add.text(this.scale.width * textAnchorPointX, this.scoreText.y + (this.scale.height * textAnchorPointY), `Level: ${this.level}`, {
            fontSize: '24px',
            fill: '#fff',
            align: 'left'
        }).setDepth(9).setScrollFactor(0); // Align text to the top-right corner


        // Avatar Stats Text
        this.avatarHealthText = this.add.text(this.scale.width * textAnchorPointX, this.levelText.y + (this.scale.height * textAnchorPointY), `Health: `, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0)

        this.avatarManaText = this.add.text(this.scale.width * textAnchorPointX, this.avatarHealthText.y + (this.scale.height * textAnchorPointY), `Mana: `, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0)

        this.avatarStaminaText = this.add.text(this.scale.width * textAnchorPointX, this.avatarManaText.y + (this.scale.height * textAnchorPointY), `Stamina: `, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0)

        // High Score And Level
        this.recordText_Score = this.add.text(this.scale.width * (1 - textAnchorPointX), this.scoreText.y , `High Score: ${Math.round(this.highScore.score)}`, {
            fontSize: '48px',
            fill: '#fff'
        }).setDepth(9).setScrollFactor(0).setOrigin(1,0)

        this.recordText_Level = this.add.text(this.scale.width * (1 - textAnchorPointX), this.levelText.y , `Furthest Level: ${this.highScore.level}`, {
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
        
        // Stage Manager
        this.stageManager = new StageManager (this, this.inputManager, stageConfig)
  
        
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

        console.log(this.stageManager.avatarManager.adaptability)
        
        //this.avatar.showLevelUpMenu()
         } else {
            this.stageManager.addedSpeed += 0.5
           // this.avatar.showLevelUpMenu()
        }

        
    }

    update(time, delta) {

        this.stageManager.update(time, delta)

        this.scoreText.setText(`Score: ${Math.round(this.score)}`);
        this.avatarHealthText.setText(`Health:         ${Math.round(this.stageManager.avatarManager.currentHealth)}`)
        this.avatarManaText.setText(`Mana:           ${Math.round(this.stageManager.avatarManager.currentMana)}`)
        this.avatarStaminaText.setText(`Stamina:        ${Math.round(this.stageManager.avatarManager.currentStamina)}`)



        

    




        

        
    }
}
