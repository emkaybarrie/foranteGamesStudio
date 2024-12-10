import { config } from "../config.js";

export default class MainMenu extends Phaser.Scene {
    constructor() {
      super({ key: 'MainMenu' });

      this.overlay
      this.menuText
    }
  
    preload() {
      // Preload assets
    }

    create() {
      // Add keyboard and gamepad controls
      this.input.gamepad.on('connected', (pad) => this.updateControlsTips('gamepad'));

      // Add and darken the background
      this.bg = this.add.image(0, 0, 'titleScreen2c').setOrigin(0).setScale(1).setDisplaySize(config.width, config.height);

      const titleText = this.add.image(this.scale.width * 0.5, this.scale.height * 0.35,'titleScreenText4').setOrigin(0.5).setScale(0.75)

      // Menu items (these can be dynamically added or retrieved)
      const menuItems = ['Start Game', 'Wiki', 'MyFi', 'Options', 'Credits', 'Exit'];
      this.menuText = [];

      // Create menu text objects
      for (let i = 0; i < menuItems.length; i++) {
          let item = this.add.text(titleText.x, titleText.y + this.scale.height * 0.1 + (i * 50), menuItems[i], {
              fontFamily: 'Arial',  // You can replace this with your font
              fontSize: '32px',
              fontStyle: 'bold',
              color: '#ffffff',
              align: 'center'
          }).setOrigin(0.5);
          
          item.setInteractive();
          

          // Add mouse hover effect (highlighting the text when the mouse hovers)
          item.on('pointerover', () => {
              item.setStyle({ color: '#ffcc00' });  // Highlight color

              this.tweens.add({
                targets: item,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                ease: 'Cubic.easeInOut'
              });

          });

          item.on('pointerout', () => {
              if (!item.isSelected) {
                  item.setStyle({ color: '#ffffff' });  // Reset color when mouse leaves

                  this.tweens.add({
                    targets: item,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Cubic.easeInOut'
                  });
              }
          });

          // Handle mouse click event to select menu option
          item.on('pointerdown', () => {
              console.log(`${item.text} selected!`);
              // Add the logic for what happens when the item is selected
              this.executeMenuAction(i);
          });

          this.menuText.push(item);
      }

      // Keyboard navigation: Use the up and down arrow keys to navigate
      let selectedIndex = 0;
      this.menuText[selectedIndex].setStyle({ color: '#ffcc00' });  // Highlight the first item initially

      this.input.keyboard.on('keydown-UP', () => {
          // Move the selection up
          this.menuText[selectedIndex].setStyle({ color: '#ffffff' });
          selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
          this.menuText[selectedIndex].setStyle({ color: '#ffcc00' });
      });

      this.input.keyboard.on('keydown-DOWN', () => {
          // Move the selection down
          this.menuText[selectedIndex].setStyle({ color: '#ffffff' });
          selectedIndex = (selectedIndex + 1) % menuItems.length;
          this.menuText[selectedIndex].setStyle({ color: '#ffcc00' });
      });

      // Handle enter/space to select an option
      this.input.keyboard.on('keydown-ENTER', () => {
          console.log(`${menuItems[selectedIndex]} selected!`);
          // Add the logic for the selected item (e.g., start game, show options, etc.)
          this.executeMenuAction(selectedIndex);
      });
  
      // Old Code to plunder
      //
      // Display control tips dynamically
      this.controlsText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.05, '', { fontSize: '16px', fill: '#fff', fontFamily: 'Arial' });
      this.updateControlsTips('keyboard'); // Default to keyboard
  
      
    }

    // Function to run actions based on the selected menu item
    executeMenuAction(index) {
      switch (index) {
          case 0:  // Start Game
              console.log('Starting game...');
              // Add logic for starting the game here (e.g., transition to gameplay scene)
              this.showOverlay(index)
              break;
          case 1:  // Options
              console.log('Opening options...');
              // Add logic for showing options menu here (e.g., transition to options scene)
              break;
          case 5:  // Exit
              console.log('Exiting game...');
              // Add logic for quitting the game or going back to main menu
              this.game.destroy(true);  // Destroy the game to exit
              // To exit the game and navigate somewhere else:
              //window.location.href = 'https://your-homepage.com';  // Or close the window if in a specific environment
              break;
          default:
              console.log('Unknown menu option');
              break;
      }
    }
  
    // Function to show the overlay
    showOverlay(index) {
      // Disable interactivity for the menu items
      this.hideMainMenu()
      
      // Create a semi-transparent black rectangle as overlay
      this.overlay = this.add.graphics();
      this.overlay.fillStyle(0x000000, 0.5);  // RGB color black with 50% opacity
      this.overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);  // Cover the whole screen
  
      // Optionally, you can add some text on the overlay
      this.overlayText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.15, 'Select Mode', {
          fontFamily: 'Arial',
          fontSize: '32px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
      }).setOrigin(0.5);
      
      // You can add more UI components here as needed (e.g., buttons, sliders for options)

      // Add a "Close" button to remove the overlay
      this.closeButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.85, 'Cancel', {
          fontFamily: 'Arial',
          fontSize: '32px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
      }).setOrigin(0.5).setInteractive();

      // Add mouse hover effect (highlighting the text when the mouse hovers)
      this.closeButton.on('pointerover', () => {
        this.closeButton.setStyle({ color: '#ffcc00' });  // Highlight color

        this.tweens.add({
          targets: this.closeButton,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          ease: 'Cubic.easeInOut'
        });

      });

      this.closeButton.on('pointerout', () => {
          if (!this.closeButton.isSelected) {
            this.closeButton.setStyle({ color: '#ffffff' });  // Reset color when mouse leaves

              this.tweens.add({
                targets: this.closeButton,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Cubic.easeInOut'
              });
          }
      });

      this.closeButton.on('pointerdown', () => {
          this.removeOverlay();  // Close the overlay and re-enable interactivity
      });

      // Run Specific Overlay Code
      switch (index) {
        case 0:  // Start Game
            console.log('Initialise Mode Select Menu...');
            // Add logic for starting the game here (e.g., transition to gameplay scene)
            this.openModeSelectMenu()
            break;
        case 1:  // Options
            console.log('Opening options...');
            // Add logic for showing options menu here (e.g., transition to options scene)
            break;
        case 5:  // Exit
            console.log('Exiting game...');
            // Add logic for quitting the game or going back to main menu
            this.game.destroy(true);  // Destroy the game to exit
            // To exit the game and navigate somewhere else:
            //window.location.href = 'https://your-homepage.com';  // Or close the window if in a specific environment
            break;
        default:
            console.log('Unknown menu option');
            break;
    }
    }

    // Function to remove the overlay (use this when closing the options or going back)
    removeOverlay() {
      if (this.overlay) {
        // Clear Open Menus
        this.closeModeSelectMenu()

        // Clear Overlay
        this.overlay.clear();  // Clear the graphics
        this.overlayText.destroy()
        this.closeButton.destroy()
      }

      // Re-enable interactivity for the main menu items
      this.showMainMenu();
    }

    // Function to disable interactivity for the main menu items
    hideMainMenu() {
      this.menuText.forEach(item => {
          item.setVisible(false);  // Disable interactivity for each menu item
      });
    }

    // Function to enable interactivity for the main menu items
    showMainMenu() {
      this.menuText.forEach(item => {
          item.setVisible(true);  // Re-enable interactivity for each menu item
      });
    }

    
    openModeSelectMenu(){
      //this.bg.setTint(0x444444); // Slightly darken background

            // Create menu options
            this.options = [
              { imageKey: 'prologue', title: 'Prologue', description: 'Description for option 1' },
              { imageKey: 'story', title: 'Story', description: 'Description for option 2' },
              { imageKey: 'explore_1', title: 'Explore', description: 'Description for option 3' },
            ];
            this.selectedOptionIndex = 0;
        
            this.menuImages = this.options.map((option, index) => {
              const x = 450 + index * 500;
              const img = this.add.image(x, this.scale.height * 0.45, option.imageKey).setOrigin(0.5).setInteractive();
              img.setScale(0.15);
              img.on('pointerover', () => this.setHighlight(index));
              img.on('pointerdown', () => this.selectOption(index));
              return img;
            });
        
            // Title and description text
            this.titleText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.7, '', { fontSize: '24px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5);
            this.descriptionText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.75, '', { fontSize: '16px', fill: '#ccc', fontFamily: 'Arial' }).setOrigin(0.5);
        
            this.updateText();
    }

    // Function to destroy all created items
    closeModeSelectMenu() {
      // Destroy the menu images
      if (this.menuImages) {
          this.menuImages.forEach(img => img.destroy());
      }

      // Destroy the title and description text
      if (this.titleText) {
          this.titleText.destroy();
      }

      if (this.descriptionText) {
          this.descriptionText.destroy();
      }

      // Destroy the prompt text
      if (this.promptText) {
          this.promptText.destroy();
      }
    }


    ////
  
    setHighlight(index) {
      this.selectedOptionIndex = index;
      this.updateText();
      this.updateHighlight();
    }
  
    updateHighlight() {
      this.menuImages.forEach((img, i) => {
        if (i === this.selectedOptionIndex) {
          img.setScale(0.175); // Enlarge selected image
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
