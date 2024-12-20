    // Blessing library with effect functions for each blessing
    const blessingsLibrary = [
        // Skills
      {
          name: 'Crescent Barrage',
          iconName: 'crescentBarrage', 
          skillSlot: 1,
          type: 'skill', 
          category: 'offense', 
          rarity: 'common', 
          description: 'Fire an arc of arrows to pepper an area', 
          effect: (avatar) => {avatar.equippedSkill_1 = avatar.skills.crescentBarrage;} 
      },
      {
          name: 'Power Shot', 
          iconName: 'powerShot', 
          skillSlot: 1,
          type: 'skill', 
          category: 'offense', 
          rarity: 'common', 
          description: 'Wind up and fire a powerful shot that pierces enemies', 
          effect: (avatar) => {avatar.equippedSkill_1 = avatar.skills.powerShot;} 
      },
      {
        name: 'Hunting Hawk',
        iconName: 'huntingHawk',  
        skillSlot: 1,
        type: 'skill', 
        category: 'offense', 
        rarity: 'uncommon', 
        description: 'Launch into the air and fire a precision shot downwards with guaranteed crit', 
        effect: (avatar) => {avatar.equippedSkill_1 = avatar.skills.huntingHawk;} 
      },
      {
        name: "Hunter's Step",
        iconName: 'huntersStep',  
        skillSlot: 2,
        type: 'skill', 
        category: 'defensive', 
        rarity: 'common', 
        description: 'Become harder to hit and move with increased agility for short duration', 
        effect: (avatar) => {avatar.equippedSkill_2 = avatar.skills.huntersStep;} 
      },
      // Actions

      // Passives
      {
          name: 'Quick Feet', 
          type: 'passive', 
          category: 'utility', 
          rarity: 'uncommon', 
          description: 'Increase movement speed', 
          effect: (player) => { player.speed += 2; } // Increase player speed
      },
      {
          name: 'Double Jump', 
          type: 'passive', 
          category: 'utility', 
          rarity: 'rare', 
          description: 'Allows the player to double jump', 
          effect: (player) => { player.canDoubleJump = true; } // Enable double jump
      }
    ];

import { config } from "../config.js";
export default // Phaser scene to handle UI creation and interaction


class BlessingsScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'BlessingsScreen' });
        this.selectedBlessings = []; // Track selected blessings
    }

    init(data) {
        console.log(data);
        this.stageManager = data.mainScene
        this.avatar = data.avatar; // Store the avatar instance
    }

    preload() {
        // this.load.image('icon_crescentBarrage', 'assets/images/icon_crescentBarrage.png');
        // this.load.image('icon_powerShot', 'assets/images/icon_powerShot.png');
        // this.load.image('icon_huntingHawk', 'assets/images/icon_huntingHawk.png');
        // this.load.image('icon_huntersStep', 'assets/images/icon_huntersStep.png');
        // Load other icons here...
    }

    create() {
        // Set up the background overlay for the blessings selection scene
        this.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.25).setOrigin(0);

        // Set up the UI for blessing selection
        const numOptions = 3; // Can be configured
        const type = 'skill'; // Can be 'action', 'skill', 'passive', or 'random'
        const category = 'random'; // Can be 'offensive', 'defensive', 'utility', or 'random'
        const maxRarity = 'rare'; // Defines the highest possible rarity

        // Get blessings to display
        const blessings = this.getBlessings(type, category, maxRarity, numOptions);

        // Calculate vertical spacing to ensure blessings don't overlap
        const totalHeight = blessings.length * 200; // Adjust the height per blessing here
        const startY = (config.height - totalHeight) * 0.35; // Center the blessings vertically

        blessings.forEach((blessing, index) => {
            const box = this.add.container(config.width * 0.25, startY + (index * 200)); // Adjust the X and Y position for each blessing

            // Box background (for visual styling)
            //const selectionBox = this.add.image(0, 0, 'box_bg').setOrigin(0).setScale(0.5);
            const selectionBox = this.add.rectangle(0, 0, config.width * 0.45, config.height * 0.165, 0x000000, 0.5).setOrigin(0);
                                // Create the tween
                                this.tweens.add({
                                    targets: selectionBox, // Object containing the property
                                    alpha: 0.75, // Target value
                                    yoyo: true, // Tween duration in milliseconds
                                    repeat: -1,
                                    ease: 'Linear', // Tween easing
                                    onStart: () => {

                                    },
                                    onUpdate: (tween, target) => {

                                    },
                                    onComplete: () => {

                                    }
                                });

            // Blessing icon (placed to the left)
            //const icon = this.add.image(10, 10, `icon_${blessing.name.toLowerCase()}`).setOrigin(0).setScale(0.5);
            const icon = this.add.image(10, 10, `icon_${blessing.iconName}`).setOrigin(0).setScale(0.5).setDisplaySize(150,150);

            const textAnchorPoint = icon.x + icon.displayWidth
            const gap = 10
            // Blessing name (placed to the right of the icon)
            const nameText = this.add.text(textAnchorPoint + gap, 10, blessing.name, { fontSize: '28px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0);

            // Blessing description (below the name, to the right)
            const descriptionText = this.add.text(textAnchorPoint + gap, 50, blessing.description, { fontSize: '26px', fill: '#fff', wordWrap: { width: 600 } }).setOrigin(0);

            // Blessing type (below description, to the right)
            const typeText = this.add.text(textAnchorPoint + gap, 120, `Type: ${blessing.type}`, { fontSize: '26px', fill: '#fff' }).setOrigin(0);

            // Blessing rarity (below type, to the right)
            const rarityText = this.add.text(textAnchorPoint + gap, 150, `Rarity: ${blessing.rarity}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0);

            // Select button (far right)
            const selectButton = this.add.text(textAnchorPoint + gap + 600, 100, 'Select', { fontSize: '24px', fill: '#0f0' }).setOrigin(0);
            selectButton.setInteractive();
            selectButton.on('pointerdown', () => {
                if (!this.selectedBlessings.includes(blessing.name)) {
                    this.selectedBlessings.push(blessing.name);
                    this.avatar.applyBlessing(blessing); // Apply the blessing effect to the player
                    console.log(`Selected Blessing: ${blessing.name}`);
                    if(blessing.skillSlot == 1){
                        this.stageManager.uiManager.skillIcon1.setTexture(`icon_${blessing.iconName}`).setDisplaySize(100, 100).setVisible(true); // Change the texture to a new one
                    } else {
                        this.stageManager.uiManager.skillIcon2.setTexture(`icon_${blessing.iconName}`).setDisplaySize(100, 100).setVisible(true); // Change the texture to a new one
                    }
                    
                    this.avatar.showStats(); // Display the updated player stats for debugging

                    // Conditional update of variable in the main scene
                    if (!this.stageManager.stageStart) {
                        this.stageManager.stageStart = true; // Update the variable in the main scene
                    }
                    this.scene.stop(); // Close the pause menu
                    this.scene.resume('Badlands'); // Resume the game scene
                }
            });

            box.add(selectionBox)
            box.add(selectButton); // Add the select button to the box
            box.add(icon); // Add the icon to the box
            box.add(nameText); // Add the name text to the box
            box.add(descriptionText); // Add the description text to the box
            box.add(typeText); // Add the type text to the box
            box.add(rarityText); // Add the rarity text to the box
        });
    }

    update() {
        // Update logic if needed (e.g., handle blessing effect)
    }

    // Blessing selection function based on type, category, and rarity

    getBlessings(type, category, maxRarity, numOptions) {
        const rarityLevels = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const maxRarityIndex = rarityLevels.indexOf(maxRarity);
    
        // Step 1: Filter blessings based on the specified criteria
        const filteredBlessings = blessingsLibrary.filter(blessing => {
            const matchesRarity = rarityLevels.indexOf(blessing.rarity) <= maxRarityIndex;
            const matchesType = type === 'random' || blessing.type === type;
            const matchesCategory = category === 'random' || blessing.category === category;
            const isNotSelected = !this.avatar.hasBlessing(blessing.name); // Check if the blessing is already active
            return matchesRarity && matchesType && matchesCategory && isNotSelected;
        });
    
        // Step 2: Select blessings from the filtered list
        const selectedBlessings = [];
        while (selectedBlessings.length < numOptions && filteredBlessings.length > 0) {
            const randomBlessing = Phaser.Utils.Array.GetRandom(filteredBlessings);
            selectedBlessings.push(randomBlessing);
    
            // Remove the blessing from the filtered list to avoid duplicates
            const index = filteredBlessings.indexOf(randomBlessing);
            if (index !== -1) {
                filteredBlessings.splice(index, 1);
            }
        }
    
        // Step 3: Fill remaining slots with blessings from the full library (excluding selected and active blessings)
        const unselectedBlessings = blessingsLibrary.filter(blessing => 
            !selectedBlessings.includes(blessing) && !this.avatar.hasBlessing(blessing.name)
        );
    
        // Shuffle the unselected blessings to ensure randomness
        Phaser.Utils.Array.Shuffle(unselectedBlessings);
    
        while (selectedBlessings.length < numOptions && unselectedBlessings.length > 0) {
            selectedBlessings.push(unselectedBlessings.pop());
        }
    
        // Step 4: Return the final list of blessings
        return selectedBlessings;
    }
    
    
}



