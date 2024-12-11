export default class LootManager {
    constructor(scene, stageManager) {
        this.scene = scene;
        this.stageManager = stageManager
        this.lootGroups = this.stageManager.lootGroups

        this.scene.anims.create({
            key: 'coinAnim',  // The key that will be used to refer to this animation
            frames: this.scene.anims.generateFrameNumbers('coin', { start: 0, end: 11 }),  // Frame range (adjust according to your spritesheet)
            frameRate: 10,  // Animation speed (frames per second)
            repeat: -1  // Repeat the animation indefinitely
        });


    }

    // create(){

    // }


    addLoot(x, y, elevation = 'ground', texture = 'coin', options = {}) {
        const loot = this.scene.physics.add.sprite(x, y, texture).setOrigin(0, 1);

        // Play the coin animation immediately after creating the loot sprite
        loot.anims.play('coinAnim');  // Start the animation created earlier

        // Add Terrain to Terrain group in Stage Manager
        this.lootGroups[elevation].add(loot);


        // Set physics properties
        loot.body.setImmovable(true);
        loot.body.allowGravity = false;
        loot.elevation = elevation; // Store platform type on the platform object for easy identification

        loot.setDepth(5)
                .setScale(3)
                .setSize(loot.width, loot.height * 0.8)
                .setTint();


        // Initialize custom properties
        loot.id = Phaser.Utils.String.UUID()
        loot.collected = false;
        // loot.passThrough = options.passThrough || false;
        // loot.slowDownEffect = options.slowDownEffect || false;
        // loot.stopEffect = options.stopEffect || false;
   

        //console.log("Loot Created: " + loot.id)

        
    }

    

    lootCollision(avatar, loot){
        //console.log('Avatar collected Loot')

       
        if(!loot.collected){

        // Increase the score
        this.scene.score += 10;
        this.scene.scoreText.setText(`Score: ${this.scene.score}`);
        loot.collected = true

            // Flash effect before bouncing
            this.scene.tweens.add({
                targets: loot,
                alpha: { from: 1, to: 0.5 },
                duration: 150,
                yoyo: true,
                onStart: () => {
                    // Bounce effect
                    this.scene.tweens.add({
                        targets: loot,
                        y: loot.y - 50, // Bounce upwards
                        duration: 250,
                        ease: 'Power2',
                        yoyo: true,
                        onComplete: () => {
                            // Destroy the coin after bounce
                            loot.destroy();
                        }
                    });
                }
            });
       }
    }

    update() {
        Object.keys(this.lootGroups).forEach(elevation => {
            const group = this.lootGroups[elevation];

            group.getChildren().forEach(loot => {
                loot.x -= this.stageManager.baseSpeed;

                // if (terrain.isSequenceEnd && terrain.x < this.scene.scale.width && !terrain.triggeredNewSequence){
                //     console.log(`Generating new ${terrain.elevation} terrain sequence`);
                //     terrain.triggeredNewSequence = true

                //     this.generateTerrainSequence(terrain.x + terrain.displayWidth, elevation)
                // }

                if (loot.x < -loot.displayWidth){
                    loot.destroy();
                    //console.log(`Destroying ${loot.elevation} loot`);
                } else {
                    
                    // Update last platform position only if the platform is still visible
                    // this.lastPlatformPosition[type] = { 
                    //     x: platform.x, 
                    //     y: platform.y, 
                    //     width: platform.displayWidth, 
                    //     height: platform.displayHeight  
                    // };
                }
            });
        });

    }

}



