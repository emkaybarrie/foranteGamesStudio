export default class Base extends Phaser.Scene {
    constructor() {
        super('Base');

        this.selectedRegion = Phaser.Math.Between(1,4)
    }

    init(data) {
        console.log(data)

        this.playerData = data.dataPacket 
        
    }

    create() {
        // Title at the top-left corner
        this.add.text(400, 50, 'Spirit Information', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        
        const centerX = 400, centerY = 200, radius = 100;

        const power = this.playerData.power; // The current power value
        this.currentPower = 0; // The current power value
        const powerToNextLevel = this.playerData.powerToNextLevel; // The total power required to reach the next level
        const spiritLevel = this.playerData.spiritLevel; // This is the spirit level you want to display in the center of the doughnut

        // Create a doughnut graph
        this.doughnut = this.add.graphics();

        // Set the lineStyle for the doughnut
        this.doughnut.lineStyle(30, 0x800080, 1);  // Purple color, thicker outline

        // First, draw the empty doughnut (base ring)
        this.doughnut.clear();
        this.doughnut.beginPath();
        this.doughnut.arc(centerX, centerY, radius, 0, Phaser.Math.PI2, false); // Outer ring (full circle)
        this.doughnut.strokePath();

        // Draw the "filled" part of the doughnut based on the current power
        //this.fillDoughnut(centerX, centerY, radius, power, powerToNextLevel);


        // Create the text element that shows the spiritLevel at the center
        this.spiritLevelText = this.add.text(centerX, centerY, `${this.playerData.spiritLevel}`, {
            fontSize: '48px',
            fill: '#800080', // Purple color
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000', // Optional: Stroke to make the text pop
            strokeThickness: 4,
        }).setOrigin(0.5, 0.5); // Center the text

        // Add glowing effect to the text (you can modify the effect as needed)
        this.tweens.add({
            targets: this.spiritLevelText,
            alpha: { from: 1, to: 0.5 }, // Pulse effect
            duration: 500,
            yoyo: true,
            repeat: -1, // Repeat indefinitely
        });

 
        // Spirit Points counter
        this.spiritPointsText = this.add.text(275, 425, `Spirit Points: ${this.playerData.spiritPoints}`, { fontSize: '24px', fill: '#fff' });

        // Stats with buttons
        const stats = ['Vitality', 'Focus', 'Adaptability'];
        const statPositions = [500, 550, 600];

        this.statButtons = stats.map((stat, index) => {
            const statText = this.add.text(250, statPositions[index], `${stat}: ${this.playerData[stat.toLowerCase()]}`, { fontSize: '30px', fill: '#fff' });
            
            const button = this.add.text(550, statPositions[index], '+', { fontSize: '30px', fill: '#0f0' })
                .setInteractive()
                .on('pointerdown', () => this.allocateSpiritPoint(stat));

            button.setAlpha(this.playerData.spiritPoints > 0 ? 1 : 0.5); // Button is disabled if no points available
            // Store the stat name inside the button object
            return { statText, button, stat: stat };  // Store the stat name here
        });

        // The Badlands

        // Create a container for the right side menu
        const regionButtons = ['North', 'South', 'East', 'West'];
        const regionPositions = {
            North: { x: 1500, y: 600 },
            South: { x: 1500, y: 900 },
            East: { x: 1700, y: 750 },
            West: { x: 1300, y: 750 },
        };

        // Create region buttons (N, S, E, W)
        this.regionButtonMap = {};
        regionButtons.forEach((region, index) => {
            this.regionButtonMap[region] = this.add.text(regionPositions[region].x, regionPositions[region].y, region, {
                fontSize: '24px',
                fill: '#fff',
                backgroundColor: '#444',
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.selectRegion(region));
        });

        // Center Start Button
        this.startButton = this.add.text(1500, 750, 'Start', { fontSize: '32px', fill: '#fff', backgroundColor: '#007bff', padding: { x: 20, y: 10 } })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.startBadlands());

        // Placeholder image for region
        this.regionImage = this.add.image(1500, 180, 'prologue').setOrigin(0.5).setScale(0.2);

        // Placeholder text below the image
        this.regionText = this.add.text(1500, 450, 'Select a region to start', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

    }

    fillDoughnut(centerX, centerY, radius, power, powerToNextLevel) {
        // Calculate the angle for the filled portion of the doughnut
        const angle = (power / powerToNextLevel) * Phaser.Math.PI2;  // Ratio of power to powerToNextLevel
    
        // Draw the filled portion of the doughnut
        this.doughnut.beginPath();
        this.doughnut.arc(centerX, centerY, radius, Phaser.Math.PI2 - angle, Phaser.Math.PI2, false); // Inner fill
        this.doughnut.lineTo(centerX, centerY);  // Close the path
        this.doughnut.fillStyle(0x800080, 1); // Purple color for the filled portion
        this.doughnut.fillPath();
    }
    
    updateSpiritLevelText(spiritLevel) {
        // Update the spirit level text at the center of the doughnut
        this.spiritLevelText.setText(`${Math.floor(spiritLevel)}`);  // Show the current power as text
    }

    allocateSpiritPoint(stat) {
        console.log(stat)
        if (this.playerData.spiritPoints > 0) {
            this.playerData[stat.toLowerCase()] += 1;  // Allocate 1 point to the stat
            this.playerData.spiritPoints -= 1; // Deduct 1 point
            this.updateSpiritInfo();
        }
    }
    
    updateSpiritInfo() {
        // Update the text and button visibility
        this.spiritPointsText.setText(`Spirit Points: ${this.playerData.spiritPoints}`);
        this.statButtons.forEach((button) => {
            // Update the stat text (using the stat property stored inside button)
            button.statText.setText(`${button.stat}: ${this.playerData[button.stat.toLowerCase()]}`);
            button.button.setAlpha(this.playerData.spiritPoints > 0 ? 1 : 0.5);  // Disable button when no points left
        });
    }

    // When a region is selected
    selectRegion(region) {
        this.selectedRegion = region;
        this.updateRegionDisplay(region);
 
    }

    updateRegionDisplay(region) {
        // Update region image based on selected region
        const imageKey = `region${region}`; // Assume you have images for each region like `regionNorth`, `regionSouth`, etc.
        this.regionImage.setTexture(imageKey);
        this.regionText.setText(`You selected ${region}`);
    }

    startBadlands() {
        console.log(this.selectedRegion)

        switch (this.selectedRegion){
            case 'North':
            this.selectedRegion = 1
            break
            case 'South':
            this.selectedRegion = 2
            break
            case 'East':
            this.selectedRegion = 3
            break
            case 'West':
            this.selectedRegion = 4
            break

        }
        // Assuming region data is passed into 'Badlands' scene
        this.scene.start('Badlands', { region: this.selectedRegion, playerData: this.playerData });
    }

    update() {
        const centerX = 400;
        const centerY = 250;
        const radius = 100;
        
        const targetPower = this.playerData.power
        const powerToNextLevel = this.playerData.powerToNextLevel; // The total power required to reach the next level
        const spiritLevel = this.playerData.spiritLevel; // This is the spirit level
    
        // Redraw the doughnut with the updated power
        this.doughnut.clear();
        this.doughnut.lineStyle(10, 0x800080, 1);  // Outer doughnut
        this.doughnut.beginPath();
        this.doughnut.arc(centerX, centerY, radius, 0, Phaser.Math.PI2, false); // Outer ring
        this.doughnut.strokePath();
    
        // Fill the doughnut based on the updated power
        this.fillDoughnut(centerX, centerY, radius, this.currentPower, powerToNextLevel);
        
        // Update the spirit level text (this text remains constant in the center)
        this.updateSpiritLevelText(spiritLevel);
    
        // Optional: You could animate the filling of the doughnut
        if (this.currentPower < targetPower) {
            this.currentPower += 0.1;  // Gradually increase the power for demo
            if (this.currentPower > targetPower) {
                this.currentPower = targetPower;  // Cap it to the maximum powerToNextLevel
            }
        }
    }
    
}
