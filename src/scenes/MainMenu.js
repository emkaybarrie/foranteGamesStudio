import { config } from "../config.js";

export default class MainMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'MainMenu' });
    }
  
    preload() {
      // Preload assets
    }

    create() {
      // Add and darken the background
      const bg = this.add.image(0, 0, 'titleScreen').setOrigin(0).setScale(1).setDisplaySize(config.width, config.height);

      bg.setTint(0x444444); // Slightly darken background
  
      // Display title and instructions
      this.add.text(10, 10, 'The Badlands', { fontSize: '32px', fill: '#fff', fontFamily: 'Arial' });
      this.add.text(300, 200, 'Select an option', { fontSize: '24px', fill: '#fff', fontFamily: 'Arial' });
  
      // Display control tips dynamically
      this.controlsText = this.add.text(550, 10, '', { fontSize: '16px', fill: '#fff', fontFamily: 'Arial' });
      this.updateControlsTips('keyboard'); // Default to keyboard
  
      // Create menu options
      this.options = [
        { imageKey: 'prologue', title: 'Prologue', description: 'Description for option 1' },
        { imageKey: 'story', title: 'Story', description: 'Description for option 2' },
        { imageKey: 'explore_1', title: 'Explore', description: 'Description for option 3' },
      ];
      this.selectedOptionIndex = 0;
  
      this.menuImages = this.options.map((option, index) => {
        const x = 450 + index * 500;
        const img = this.add.image(x, 300, option.imageKey).setInteractive();
        img.setScale(0.15);
        img.on('pointerover', () => this.setHighlight(index));
        img.on('pointerdown', () => this.selectOption(index));
        return img;
      });
  
      // Title and description text
      this.titleText = this.add.text(200, 450, '', { fontSize: '24px', fill: '#fff', fontFamily: 'Arial' });
      this.descriptionText = this.add.text(200, 480, '', { fontSize: '16px', fill: '#ccc', fontFamily: 'Arial' });
  
      this.updateText();
  
      // Add keyboard and gamepad controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.selectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.gamepad.on('connected', (pad) => this.updateControlsTips('gamepad'));
    }
  
    update() {
      // Navigate menu
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.changeSelection(-1);
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.changeSelection(1);
      }
  
      // Select option
      if (Phaser.Input.Keyboard.JustDown(this.selectKey) || this.isGamepadButtonPressed()) {
        this.selectOption(this.selectedOptionIndex);
      }
    }
  
    setHighlight(index) {
      this.selectedOptionIndex = index;
      this.updateText();
      this.updateHighlight();
    }
  
    updateHighlight() {
      this.menuImages.forEach((img, i) => {
        if (i === this.selectedOptionIndex) {
          img.setScale(0.25); // Enlarge selected image
        } else {
          img.setScale(0.15); // Slightly shrink unselected images
        }
      });
    }
  
    updateText() {
      const selected = this.options[this.selectedOptionIndex];
      this.titleText.setText(selected.title);
      this.descriptionText.setText(selected.description);
    }
  
    changeSelection(delta) {
      this.selectedOptionIndex = Phaser.Math.Wrap(this.selectedOptionIndex + delta, 0, this.options.length);
      this.updateText();
      this.updateHighlight();
    }
  
    selectOption(index) {
      const selectedImage = this.menuImages[index];
  
      // Flash effect
      this.tweens.add({
        targets: selectedImage,
        alpha: 0,
        yoyo: true,
        repeat: 1,
        duration: 200,
        onComplete: () => {
          // Proceed to the next scene based on the selected option
          //this.scene.start(`NextScene${index + 1}`);
          if (index + 1 == 2){
            this.scene.start(`Login`);
          } else {
            // Freeplay
            this.playerData = {
              id: 0,
              alias: 'Guest',
              level: 1,
              score: 0,
              spiritLevel: 1,
              power: 0,
              powerToNextLevel: 20,
              spiritPoints: 5,
              vitality: 1,
              focus: 1,
              adaptability: 1
            }

            console.log(this.playerData)
            this.scene.start(`Base`, { dataPacket: this.playerData});
          }
          
        },
      });
    }
  
    updateControlsTips(mode) {
      if (mode === 'keyboard') {
        this.controlsText.setText('Navigate: Arrow Keys | Select: Space');
      } else if (mode === 'gamepad') {
        this.controlsText.setText('Navigate: Left Stick | Select: A');
      }
    }
  
    isGamepadButtonPressed() {
      const gamepads = this.input.gamepad.gamepads;
      return gamepads.some((pad) => pad && pad.buttons[0].pressed); // Check A button
    }
  }
