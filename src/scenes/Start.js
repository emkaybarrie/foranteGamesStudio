import preload from "../preload.js";
import { config } from "../config.js";

export default class Start extends Phaser.Scene {
    constructor() {
        super('Start');
        
    }

    preload() {
        // Load assets if needed
        preload(this);  // Call the preload function with the current scene
    }

    create() {
        const titleScreen = this.add.image(0,0,'titleScreen').setOrigin(0).setInteractive();

        // Scale the image to fit the screen
        scaleImageToFitCanvas(titleScreen);
        
        // Adjust scaling on window resize
        window.addEventListener('resize', () => {
            config.width = window.innerWidth;
            config.height = window.innerHeight;
            game.resize(config.width, config.height);
            scaleImageToFitCanvas(titleScreen);
        });

        // Add Start screen text
        const startText = this.add.text(this.scale.width * 0.65, this.scale.height * 0.4, 'The Badlands', {
            fontSize: '38px',
            fill: '#fff',
        }).setOrigin(0.5);
        
        const instructionText = this.add.text(this.scale.width * 0.65, this.scale.height * 0.5, 'Press Space to start', {
            fontSize: '26px',
            fill: '#fff',
        }).setOrigin(0.5);
        
        this.add.text(this.scale.width * 0.65, this.scale.height * 0.6, 'Current Supported: Keyboard, Gamepad', {
            fontSize: '16px',
            fill: '#fff',
        }).setOrigin(0.5);
        
        // Track input mode (default to keyboard)
        let inputMode = 'keyboard';
        
        // Update instruction text dynamically based on input
        this.input.keyboard.on('keydown', () => {
            inputMode = 'keyboard';
            instructionText.setText('Press Space to start');
        });
        
        this.input.gamepad.on('connected', () => {
            inputMode = 'gamepad';
            instructionText.setText('Press A to start');
        });
        
        // Handle "start" based on input mode
        this.input.keyboard.on('keydown-SPACE', () => {
            if (inputMode === 'keyboard') {
            this.startMenuScene();
            }
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (inputMode === 'keyboard') {
            this.startMenuScene();
            }
        });

        titleScreen.on('pointerdown', () => this.startMenuScene());
        
        this.input.gamepad.on('down', (pad, button) => {
            if (inputMode === 'gamepad' && button.index === 0) { // Button 0 is typically A on most gamepads
            this.startMenuScene();
            }
        });
        
        // Method to start the MenuScene and enter fullscreen
        this.startMenuScene = () => {
            this.scene.start('MainMenu');
            this.scale.startFullscreen();
        };
    }

    
}

function scaleImageToFitCanvas(image) {
    // Set image size to match the game size
    image.setDisplaySize(config.width, config.height);
}
