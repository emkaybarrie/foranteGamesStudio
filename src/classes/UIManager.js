export default class UIManager {
    constructor(scene, stageManager) {
        this.scene = scene;
        this.stageManager = stageManager
        //
        this.avatar = this.stageManager.avatarManager
        console.log(this.avatar)
        
        // Bar configurations
        this.barWidth = 200;
        this.barHeight = 20;

        // Property mappings (customize here if needed)
        this.propertyMappings = {
            health: 'currentHealth',
            mana: 'currentMana', // Defaults to `mana`
            stamina: 'currentStamina', // Defaults to `stamina`
        };

        // Create bars
        this.bars = {
            health: this.createBar(this.scene.scale.width * 0.175, this.scene.scale.height * 0.225, 0xff0000),
            mana: this.createBar(this.scene.scale.width * 0.175, this.scene.scale.height * 0.275, 0x0000ff),
            stamina: this.createBar(this.scene.scale.width * 0.175, this.scene.scale.height * 0.325, 0x00ff00),
        };

        // Listen for stat changes using a generalized event listener
        Object.keys(this.propertyMappings).forEach(type => {
            this.avatar.on(`${type}Changed`, (previousValue, currentValue) => {
                this.updateBar(type, previousValue - currentValue);
            });
        });
    }

    createBar(x, y, color) {
        const bg = this.scene.add.rectangle(x, y, this.barWidth, this.barHeight, 0x555555).setOrigin(0, 0.5).setDepth(9);
        const bar = this.scene.add.rectangle(x, y, this.barWidth, this.barHeight, color).setOrigin(0, 0.5).setDepth(9);
        const overlay = this.scene.add.rectangle(x, y, 0, this.barHeight, 0xff8800).setOrigin(0, 0.5).setAlpha(0).setDepth(9);

        //return { bg, bar, overlay, currentWidth: this.barWidth };
        return { bg, bar, overlay};
    }

    // Update the bar dynamically
    updateBar(type, amount) {
        const statKey = this.propertyMappings[type]; // Map the property name
        const maxStatKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}`; // e.g., 'maxHealth'
        const maxStat = this.avatar[maxStatKey];

        // Calculate new bar width
        const newWidth = Math.max((this.avatar[statKey] / maxStat) * this.barWidth, 0);

        // Get the bar components
        const { bar, overlay } = this.bars[type];

        // Display the damage overlay (clamped to a minimum of 0)
        const overlayWidth = Math.max((amount / maxStat) * this.barWidth, 0);
        overlay.width = overlayWidth;
        // Position the overlay at the end of the bar
        overlay.x = bar.x + bar.width - overlayWidth; 
        overlay.setAlpha(1);

        // Fade out the overlay and then shrink the main bar
        this.scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: 500,
            delay: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: bar,
                    width: newWidth,
                    duration: 500,
                    ease: 'Linear',
                    onUpdate: () => {
                        bar.width = newWidth;
                    }
                });
            }
        });
    }

    // Synchronize bar widths with avatar stats
    syncBars() {
        for (let type in this.bars) {
            const statKey = this.propertyMappings[type]; // Map the property name
            const maxStatKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}`; // e.g., `maxHealth`
            
            const currentStat = this.avatar[statKey];
            const maxStat = this.avatar[maxStatKey];

            // Ensure maxStat is greater than zero to avoid division errors
            if (maxStat <= 0) {
                console.warn(`Max value for ${type} is invalid (<= 0). Skipping update.`);
                continue;
            }

            // Calculate the new width
            const newWidth = Math.max((currentStat / maxStat) * this.barWidth, 0);

            // Update the bar's width
            this.bars[type].bar.width = newWidth;
        }

    }

    update() {
        this.syncBars()
    }
}
