
export default class TerrainManager {
    constructor(scene, stageManager) {

        // Initialize stage elements here
        this.scene = scene; // Reference to the Phaser scene
        this.stageManager = stageManager
        this.terrainGroups = this.stageManager.terrainGroups
        this.stageConfig = this.stageManager.stageConfig

        // Chaos Factor Settings
        this.chaosFactorSettings = {
            ground: { chaosLowerBound: 0.975, chaosUpperBound: 1.025},
            low: { chaosLowerBound: 0.95, chaosUpperBound: 1.05 },
            medium: { chaosLowerBound: 0.90, chaosUpperBound: 1.075 },
            high: { chaosLowerBound: 0.85, chaosUpperBound: 1.10 }
        };


        // Elevation Settings
        this.elevationSettings = {
            ground: { baseHeight: this.scene.scale.height * 0.1 },
            low: { baseHeight: this.scene.scale.height * 0.3  },
            medium: { baseHeight: this.scene.scale.height * 0.6 },
            high: { baseHeight: this.scene.scale.height * 0.9 }
        };

        // Distance Settings
        this.distanceSettings = {
            min: { baseWidth: this.scene.scale.width * 0.25 },
            short: { baseWidth: this.scene.scale.width * 0.5 },
            standard: { baseWidth: this.scene.scale.width * 1 },
            far: { baseWidth: this.scene.scale.width * 1.5 },
            max: { baseWidth: this.scene.scale.width * 1.75}
        };

        // Transition Gap Settings
        this.transitionGapSettings = {
            ground: { baseWidth: this.scene.scale.height * 0.15},
            low: { baseWidth: this.scene.scale.height * 0.25  },
            medium: { baseWidth: this.scene.scale.height * 0.4 },
            high: { baseWidth: this.scene.scale.height * 0.55 }
        };


    }

    generateTerrainSequence(lastTerrainEnd, elevation = 'ground', numberOfTerrainSegments = 5){

        var targetStartX = 0
        

        for (let i = 1; i <= numberOfTerrainSegments; i++){

            const chaosLowerBound = this.chaosFactorSettings[elevation].chaosLowerBound
            const chaosUpperBound = this.chaosFactorSettings[elevation].chaosUpperBound

            targetStartX = lastTerrainEnd + (this.transitionGapSettings[elevation].baseWidth * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound));

            const distanceSelections = {
                1: 'short',
                2: 'standard',
                3: 'far',
            }
            const generatedTerrain = this.generateTerrain(targetStartX, elevation, distanceSelections[Phaser.Math.Between(1, 3)])
            generatedTerrain.id = i
            if (i === numberOfTerrainSegments){
                generatedTerrain.isSequenceEnd = true
                this.scene.tweens.add({
                    targets: generatedTerrain,  // The terrain to animate
                    alpha: {from: 1, to: 0.95},
                    //tint: { from: 0xFFFFFF, to: 0xFFFF00 },  // Change color to yellow (glowing effect)
                    //displayHeight: generatedTerrain.displayHeight * 1.01, // Increase height by 1%
                    yoyo: true,                 // Return to the starting position
                    repeat: -1,                 // Repeat infinitely
                    ease: 'Sine.easeInOut',     // Smooth easing for natural motion
                    duration: 500               // Time in milliseconds for one up-and-down cycle
                });
            } else {

            }

            lastTerrainEnd = generatedTerrain.x + generatedTerrain.displayWidth

            
        }
        

    }

    generateTerrain(x, elevation = 'ground', distance = 'standard', textureMatchStage = true, textureOverride = null){

        const chaosLowerBound = this.chaosFactorSettings[elevation].chaosLowerBound
        const chaosUpperBound = this.chaosFactorSettings[elevation].chaosUpperBound

        var texture = null

        if(textureMatchStage){
            texture = `${elevation}_common`
        }
 
        const terrain = this.scene.physics.add.sprite(x, this.scene.scale.height, texture).setOrigin(0, 1);

        // Add Terrain to Terrain group in Stage Manager
        this.terrainGroups[elevation].add(terrain);

        // 
        if(elevation == 'ground'){
            terrain.setDepth(5)
        } else if(elevation == 'low') {
            terrain.setDepth(4)
        } else if(elevation == 'medium') {
            terrain.setDepth(3)
        } else if(elevation == 'high') {
            terrain.setDepth(2)
        } 

        terrain.body.setImmovable(true);
        terrain.body.allowGravity = false;
        terrain.elevation = elevation; // Store platform type on the platform object for easy identification
        terrain.body.checkCollision.down = false
        terrain.body.checkCollision.left = false
        terrain.body.checkCollision.right = false


        const terrainElevation = this.elevationSettings[elevation].baseHeight
        const terrainDistance = this.distanceSettings[distance].baseWidth
        
        terrain.displayHeight = terrainElevation * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound) 
        terrain.displayWidth = terrainDistance * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound) ;

        terrain.isSequenceEnd = false
        terrain.triggeredNewSequence = false

        terrain.setPipeline('GlowPipeline')

        // Populate Terrain
        const terrainBounds = terrain.getBounds()
        // Obstacles
        if(Phaser.Math.FloatBetween(0,100) < 75){
        this.stageManager.obstacleManager.addObstacle(terrainBounds.x + (Phaser.Math.FloatBetween(0.1,0.9) * terrainBounds.width), terrainBounds.top, elevation)
        }
        // Loot 
        this.stageManager.lootManager.addLoot(terrainBounds.x + (Phaser.Math.FloatBetween(0.1,0.9) * terrainBounds.width), terrainBounds.top, elevation)
        // Enemies
        if(Phaser.Math.FloatBetween(0,100) < 50){
            this.stageManager.enemyManager.addEnemy(terrainBounds.x + (Phaser.Math.FloatBetween(0.1,0.9) * terrainBounds.width), terrainBounds.top, elevation)
        }
        
        return terrain


    }

    update(time, delta){

        Object.keys(this.terrainGroups).forEach(elevation => {
            const group = this.terrainGroups[elevation];

            group.getChildren().forEach(terrain => {
                terrain.x -= this.stageManager.baseSpeed

                if (terrain.isSequenceEnd && terrain.x < this.scene.scale.width && !terrain.triggeredNewSequence){
                    //console.log(`Generating new ${terrain.elevation} terrain sequence`);
                    terrain.triggeredNewSequence = true

                    this.generateTerrainSequence(terrain.x + terrain.displayWidth, elevation)
                }

                if (terrain.x < -terrain.displayWidth){
                    terrain.destroy();
                    //console.log(`Destroying ${terrain.elevation} terrain`);
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
