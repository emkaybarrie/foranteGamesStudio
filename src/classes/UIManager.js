export default class UIManager {
    constructor(scene, stageManager) {
        this.scene = scene;
        this.stageManager = stageManager;
        this.avatar = this.stageManager.avatarManager;

        const devicePixelRatio = window.devicePixelRatio; // Get the DPI scale factor

        // Example: Create the progress bar
        const progressBarX = this.scene.scale.width * 0.65; // Positioned on the right side
        const progressBarY = this.scene.scale.height * 0.125; // Near the top
        const progressBarWidth = this.scene.scale.width * 0.3; // 30% of screen width
        const progressBarHeight = 30;

        this.progressBar = this.createProgressBar(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 0, 100);

        // Initial update
        this.updateProgressBar(this.progressBar, 0, 100);

        // Scale factors relative to screen size
        const baseScreenIncrementX = this.scaleForDPI(this.scene.scale.width * 0.01) ;
        const baseScreenIncrementY = this.scaleForDPI(this.scene.scale.height * 0.01);

        // Avatar icon size and vitals icon size
        const avatarIconDesiredSize = this.scaleForDPI(300); // Desired size of avatar icon in pixels
        const vitalsIconScaleFactor = 0.275; // Proportional size of vitals icons relative to avatar icon
        const vitalsSpacingFactor = 0.15; // Spacing between vitals icons relative to avatar icon size

        // Calculate avatar icon size and vitals icon size dynamically
        const avatarIconSize = Math.min(this.scene.scale.width, this.scene.scale.height) * (avatarIconDesiredSize / Math.max(this.scene.scale.width, this.scene.scale.height));
        const vitalsSpacingFromAvatarIcon = baseScreenIncrementX * 1;
        const vitalsIconSize = avatarIconSize * vitalsIconScaleFactor ;
        const vitalsIconsSpacing = avatarIconSize * vitalsSpacingFactor ;

        // Avatar Icon
        this.avatarIcon = this.scene.add.image(baseScreenIncrementX * 5, baseScreenIncrementY * 5, 'avatarIcon')
            .setOrigin(0)
            .setDisplaySize(avatarIconSize, avatarIconSize)
            .setDepth(9);

        // Vitals Icons Positioning
        const avatarIconRightX = this.avatarIcon.x + this.avatarIcon.displayWidth + vitalsSpacingFromAvatarIcon;
        const avatarIconCenterY = this.avatarIcon.y + this.avatarIcon.displayHeight / 2;

        // First vitals icon (health)
        this.avatarHealthIcon = this.scene.add.image(
            avatarIconRightX,
            avatarIconCenterY - vitalsIconSize - vitalsIconsSpacing / 2,
            'healthIcon'
        )
            .setOrigin(0.5)
            .setDisplaySize(vitalsIconSize, vitalsIconSize)
            .setDepth(9);

        // Second vitals icon (mana)
        this.avatarManaIcon = this.scene.add.image(
            avatarIconRightX,
            avatarIconCenterY,
            'manaIcon'
        )
            .setOrigin(0.5)
            .setDisplaySize(vitalsIconSize, vitalsIconSize)
            .setDepth(9);

        // Third vitals icon (stamina)
        this.avatarStaminaIcon = this.scene.add.image(
            avatarIconRightX,
            avatarIconCenterY + vitalsIconSize + vitalsIconsSpacing / 2,
            'staminaIcon'
        )
            .setOrigin(0.5)
            .setDisplaySize(vitalsIconSize, vitalsIconSize)
            .setDepth(9);

        // Create the vital bars and position them relative to the icon
        this.bars = {
            health: this.createBar(avatarIconRightX, avatarIconCenterY - vitalsIconSize - vitalsIconsSpacing / 2, 0xff0000, 0.4), // 20% width initially
            mana: this.createBar(avatarIconRightX, avatarIconCenterY, 0x0000ff, 0.4), // 20% width initially
            stamina: this.createBar(avatarIconRightX, avatarIconCenterY + vitalsIconSize + vitalsIconsSpacing / 2, 0x00ff00, 0.4), // 20% width initially
        };

        // Property mappings for health, mana, and stamina
        this.propertyMappings = {
            health: 'currentHealth',
            mana: 'currentMana', 
            stamina: 'currentStamina', 
        };

        // Listen for stat changes
        Object.keys(this.propertyMappings).forEach(type => {
            this.avatar.on(`${this.propertyMappings[type]}Changed`, (previousValue, isDelayed) => {
                //console.log(`Stat change: ${type}, Previous Value: ${previousValue}, Is Delayed: ${isDelayed}`);
                this.updateBar(type, previousValue, isDelayed);
            });
        });
    }

    scaleForDPI(baseValue) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        return baseValue * devicePixelRatio;
    }

    // Create a bar for health, mana, or stamina
    createBar(x, y, color, initialWidthFactor = 0.4) {
        const initialWidth = this.scaleForDPI(this.scene.scale.width * 0.3 * initialWidthFactor); // 30% of screen width
        const bg = this.scene.add.rectangle(x, y, initialWidth, 20, 0x555555).setOrigin(0, 0.5).setDepth(8);
        const bar = this.scene.add.rectangle(x, y, 0, 20, color).setOrigin(0, 0.5).setDepth(8);
        const overlay = this.scene.add.rectangle(x, y, 0, 20, 0xff8800).setOrigin(0, 0.5).setAlpha(0).setDepth(8);

        // Add text anchored to the right edge of the bg
        const text = this.scene.add.text(x + bg.width - 5, y, '0/0', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'right',
        })
            .setOrigin(1, 0.5) // Align to right edge, vertically centered
            .setDepth(9);

        return { bg, bar, overlay, text };
    }


    // Update the bar dynamically with damage or instant changes


    updateBar(type, previousValue, isDelayed = false) {
        const statKey = this.propertyMappings[type]; 
        const maxStatKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}`; 
        const maxStat = this.avatar[maxStatKey];
    
        if (maxStat <= 0) return;
    
        const currentStat = this.avatar[statKey];
    
        // Calculate the new width based on the current value
        const newWidth = Math.max((currentStat / maxStat) * this.bars[type].bg.width, 0);
    
        // Handle delayed damage changes
        if (isDelayed) {
            //console.log('Overlay Triggered');
    
            // Calculate the width of the overlay based on the new damage
            const damageWidth = Math.max(((previousValue - currentStat) / maxStat) * this.bars[type].bg.width, 0);
    
            // Immediately apply the previous overlay effect to the bar
            const currentBarWidth = this.bars[type].bar.width;
            const targetBarWidth = currentBarWidth - damageWidth;
    
            // Stop ongoing overlay tweens
            this.scene.tweens.killTweensOf(this.bars[type].overlay);
            this.scene.tweens.killTweensOf(this.bars[type].bar);
    
            // Instantly apply the previous overlay effect to the bar
            this.bars[type].bar.width = targetBarWidth;
    
            // Start a new overlay for the current damage
            this.bars[type].overlay.width = damageWidth;
            this.bars[type].overlay.x = this.bars[type].bar.x + targetBarWidth;
            this.bars[type].overlay.setAlpha(1);
    
            // Tween the overlay to fade out and shrink
            this.scene.tweens.add({
                targets: this.bars[type].overlay,
                alpha: 0,
                duration: 500,
                delay: 300,
                onComplete: () => {
                    // After the overlay fades, update the bar to the final width
                    this.scene.tweens.add({
                        targets: this.bars[type].bar,
                        width: newWidth,
                        duration: 500,
                        ease: 'Linear',
                    });
                }
            });
        } else {
            // For instant changes, update the bar directly without affecting the overlay
            this.scene.tweens.add({
                targets: this.bars[type].bar,
                width: newWidth,
                duration: 500,
                ease: 'Linear',
            });
    
            // Ensure the overlay resets (in case of concurrent regen/damage)
            this.bars[type].overlay.setAlpha(0); // Hide overlay immediately if not delayed
        }

        // Update the text to reflect the current and max values
        this.bars[type].text.setText(`${Math.round(currentStat)}/${maxStat}`);

        // Reposition the text to remain anchored to the right edge of the bg
        this.bars[type].text.setX(this.bars[type].bg.x + this.bars[type].bg.width - 5);
    }

    createProgressBar(x, y, width, height, stageProgress, stageLength) {
        // Create the background
        const bg = this.scene.add.rectangle(x, y, width, height, 0x555555).setOrigin(0, 0.5).setDepth(8);
        const bar = this.scene.add.rectangle(x, y, 0, height, 0xc14192).setOrigin(0, 0.5).setDepth(8);
    
        // Add markers at 25%, 50%, 75%, and 100%
        const markers = [];
        const markerPositions = [0, 0.25, 0.5, 0.75, 1];
        markerPositions.forEach((fraction) => {
            const markerX = x + (width * fraction) ; // Center-based positioning
            const circle = this.scene.add.circle(markerX, y, height / 2, 0xffffff).setDepth(10); // White fill
            const border = this.scene.add.circle(markerX, y, height / 2, 0x000000)
                .setStrokeStyle(2, 0x000000) // Black border
                .setDepth(9); // Border above the fill
            markers.push({ circle, border });
        });

        markers.forEach((marker, index) => {
            var icon = null
            if(index > 0){
                icon = this.scene.add.image(marker.circle.x, marker.circle.y, 'landmark_encounter').setScale(0.5).setDepth(11);
            } else {
                icon = this.scene.add.text(marker.circle.x, marker.circle.y, 1, {
                    fontSize: '18px',
                    color: '#000000',
                    align: 'center',
                    fontStyle: 'bold'
                })
                    .setOrigin(0.5) // Align to right edge, vertically centered
                    .setDepth(11);
            }
            
            marker.icon = icon; // Store reference for updates if needed
        });
    
        // Return the progress bar and markers
        return { bg, bar, markers };
    }

    updateProgressBar(progressBar, stageProgress, stageLength) {
        const progressFraction = Math.min(stageProgress / stageLength, 1);
        const newWidth = progressFraction * progressBar.bg.width;
    
        // Update the progress bar width
        this.scene.tweens.add({
            targets: progressBar.bar,
            width: newWidth,
            duration: 500,
            ease: 'Linear',
        });
    }
    
    
    

    update() {
        // If you want any synchronization to occur, you can handle it here

        this.progressBar.markers[0].icon.setText(this.scene.stageManager.stage)
    }
}
