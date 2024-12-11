
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

    // generateTerrain(x, elevation = 'ground', distance = 'standard', textureMatchStage = true, textureOverride = null){

    //     const chaosLowerBound = this.chaosFactorSettings[elevation].chaosLowerBound
    //     const chaosUpperBound = this.chaosFactorSettings[elevation].chaosUpperBound

    //     var texture = null

    //     if(textureMatchStage){
    //         texture = `${elevation}_common`
    //     }
 
    //     const terrain = this.scene.physics.add.sprite(x, this.scene.scale.height, texture).setOrigin(0, 1);

    //     // Add Terrain to Terrain group in Stage Manager
    //     this.terrainGroups[elevation].add(terrain);

    //     // 
    //     if(elevation == 'ground'){
    //         terrain.setDepth(5)
    //     } else if(elevation == 'low') {
    //         terrain.setDepth(4)
    //     } else if(elevation == 'medium') {
    //         terrain.setDepth(3)
    //     } else if(elevation == 'high') {
    //         terrain.setDepth(2)
    //     } 

    //     terrain.body.setImmovable(true);
    //     terrain.body.allowGravity = false;
    //     terrain.elevation = elevation; // Store platform type on the platform object for easy identification
    //     terrain.body.checkCollision.down = false
    //     terrain.body.checkCollision.left = false
    //     terrain.body.checkCollision.right = false


    //     const terrainElevation = this.elevationSettings[elevation].baseHeight
    //     const terrainDistance = this.distanceSettings[distance].baseWidth
        
    //     terrain.displayHeight = terrainElevation * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound) 
    //     terrain.displayWidth = terrainDistance * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound) ;

    //     terrain.isSequenceEnd = false
    //     terrain.triggeredNewSequence = false

    //     terrain.setPipeline('GlowPipeline')

    //     // Populate Terrain
    //     const terrainBounds = terrain.getBounds()
    //     // Obstacles
    //     if(Phaser.Math.FloatBetween(0,100) < 75){
    //     this.stageManager.obstacleManager.addObstacle(terrainBounds.x + (Phaser.Math.FloatBetween(0.1,0.9) * terrainBounds.width), terrainBounds.top, elevation)
    //     }
    //     // Loot 
    //     this.stageManager.lootManager.addLoot(terrainBounds.x + (Phaser.Math.FloatBetween(0.1,0.9) * terrainBounds.width), terrainBounds.top, elevation)
    //     // Enemies
    //     if(Phaser.Math.FloatBetween(0,100) < 50){
    //         this.stageManager.enemyManager.addEnemy(terrainBounds.x + (Phaser.Math.FloatBetween(0.1,0.9) * terrainBounds.width), terrainBounds.top, elevation)
    //     }
        
    //     return terrain


    // }

    //// generateTerrain(x, elevation = 'ground', distance = 'standard', textureMatchStage = true, textureOverride = null) {
    //     const chaosLowerBound = this.chaosFactorSettings[elevation].chaosLowerBound;
    //     const chaosUpperBound = this.chaosFactorSettings[elevation].chaosUpperBound;
    
    //     // Determine the texture to use
    //     var texture = textureOverride || (textureMatchStage ? `${elevation}_common` : null);
    
    //     // Calculate terrain dimensions
    //     const terrainElevation = this.elevationSettings[elevation].baseHeight;
    //     const terrainDistance = this.distanceSettings[distance].baseWidth;
    //     const terrainHeight = terrainElevation * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound);
    //     const terrainWidth = terrainDistance * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound);
    
    //     // Create the TileSprite for visuals
    //     const tileSprite = this.scene.add.tileSprite(x, this.scene.scale.height, terrainWidth, terrainHeight, texture).setOrigin(0, 1);
    
    //     // Add a physics body for collision
    //     const physicsBody = this.scene.physics.add.staticImage(x + terrainWidth / 2, this.scene.scale.height - terrainHeight / 2);
    //     physicsBody.displayWidth = terrainWidth;
    //     physicsBody.displayHeight = terrainHeight;
    //     physicsBody.body.setSize(terrainWidth, terrainHeight);
    
    //     // Combine both layers into one object
    //     physicsBody.setData('tileSprite', tileSprite); // Link TileSprite to physics body
    //     tileSprite.setData('physicsBody', physicsBody); // Link physics body to TileSprite
    
    //     // Add physics body to the terrain group
    //     this.terrainGroups[elevation].add(physicsBody);
    
    //     // Set depth based on elevation
    //     const depthMap = { ground: 5, low: 4, medium: 3, high: 2 };
    //     physicsBody.setDepth(depthMap[elevation] || 1);
    //     tileSprite.setDepth(depthMap[elevation] || 1);
    
    //     // Physics settings
    //     physicsBody.body.setImmovable(true);
    //     physicsBody.body.allowGravity = false;
    //     physicsBody.body.checkCollision.down = false;
    //     physicsBody.body.checkCollision.left = false;
    //     physicsBody.body.checkCollision.right = false;
    
    //     // Additional properties for terrain
    //     physicsBody.elevation = elevation; // Store elevation type
    //     physicsBody.isSequenceEnd = false;
    //     physicsBody.triggeredNewSequence = false;
    
    //     // Apply pipeline for visual effects (if necessary)
    //     tileSprite.setPipeline('GlowPipeline');
    
    //     // Populate terrain with obstacles, loot, and enemies
    //     const terrainBounds = physicsBody.getBounds();
    //     if (Phaser.Math.FloatBetween(0, 100) < 75) {
    //         this.stageManager.obstacleManager.addObstacle(
    //             terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
    //             terrainBounds.top,
    //             elevation
    //         );
    //     }
    //     this.stageManager.lootManager.addLoot(
    //         terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
    //         terrainBounds.top,
    //         elevation
    //     );
    //     if (Phaser.Math.FloatBetween(0, 100) < 50) {
    //         this.stageManager.enemyManager.addEnemy(
    //             terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
    //             terrainBounds.top,
    //             elevation
    //         );
    //     }
    
    //     return physicsBody; // Return the physics object for external reference
    // }

    generateTerrain(x, elevation = 'ground', distance = 'standard', textureMatchStage = true, textureOverride = null) {
        const chaosLowerBound = this.chaosFactorSettings[elevation].chaosLowerBound;
        const chaosUpperBound = this.chaosFactorSettings[elevation].chaosUpperBound;
    
        // Determine texture
        var texture = textureOverride || (textureMatchStage ? `${elevation}_common` : null);
    
        // Calculate dimensions
        const terrainElevation = this.elevationSettings[elevation].baseHeight;
        const terrainDistance = this.distanceSettings[distance].baseWidth;
        const terrainHeight = terrainElevation * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound);
        const terrainWidth = terrainDistance * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound);
    
        // Create the TileSprite for visuals
        const tileSprite = this.scene.add.tileSprite(x, this.scene.scale.height, terrainWidth, terrainHeight, texture).setOrigin(0, 1);
    
        // Create the physics body
        const physicsBody = this.scene.physics.add.staticImage(x + terrainWidth / 2, this.scene.scale.height - terrainHeight / 2);
        physicsBody.displayWidth = terrainWidth;
        physicsBody.displayHeight = terrainHeight;
        physicsBody.body.setSize(terrainWidth, terrainHeight);
    
        // Link TileSprite and physics body
        physicsBody.setData('tileSprite', tileSprite);
        tileSprite.setData('physicsBody', physicsBody);
    
        // Add physics body to the group
        if (!this.terrainGroups[elevation]) {
            console.error(`Group for elevation '${elevation}' not initialized.`);
        } else {
            this.terrainGroups[elevation].add(physicsBody);
        }
    
        // Set depth for visual layering
        const depthMap = { ground: 5, low: 4, medium: 3, high: 2 };
        physicsBody.setDepth(depthMap[elevation] || 1);
        tileSprite.setDepth(depthMap[elevation] || 1);
    
        // Physics settings
        console.log(physicsBody);
        //physicsBody.body.setImmovable(true);
        physicsBody.body.allowGravity = false;
        physicsBody.body.checkCollision.down = false;
        physicsBody.body.checkCollision.left = false;
        physicsBody.body.checkCollision.right = false;
    
        // Additional properties
        physicsBody.elevation = elevation; // Store elevation type
        physicsBody.isSequenceEnd = false;
        physicsBody.triggeredNewSequence = false;
    
        // Apply visual pipeline
        tileSprite.setPipeline('GlowPipeline');
    
        // Populate terrain
        const terrainBounds = physicsBody.getBounds();
        if (Phaser.Math.FloatBetween(0, 100) < 75) {
            this.stageManager.obstacleManager.addObstacle(
                terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
                terrainBounds.top,
                elevation
            );
        }
        this.stageManager.lootManager.addLoot(
            terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
            terrainBounds.top,
            elevation
        );
        if (Phaser.Math.FloatBetween(0, 100) < 50) {
            this.stageManager.enemyManager.addEnemy(
                terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
                terrainBounds.top,
                elevation
            );
        }
    
        return physicsBody; // Return the physics object for external references
    }
    
    
    
    

    update(time, delta){

        Object.keys(this.terrainGroups).forEach(elevation => {
            const group = this.terrainGroups[elevation];

            group.getChildren().forEach(terrain => {
      // Move the physics body
      terrain.x -= this.stageManager.baseSpeed;

      // Reposition and refresh the static body
      terrain.setPosition(terrain.x, terrain.y); 
      terrain.body.updateFromGameObject();
  
      // Update the linked tileSprite
      const tileSprite = terrain.getData('tileSprite');
      if (tileSprite) {
          tileSprite.x = terrain.x - terrain.displayWidth / 2;
      }
  
      // Handle sequence generation
      if (terrain.isSequenceEnd && terrain.x < this.scene.scale.width && !terrain.triggeredNewSequence) {
          terrain.triggeredNewSequence = true;
  
          this.generateTerrainSequence(terrain.x + terrain.displayWidth, elevation);
      }
  
      // Cleanup off-screen terrain
      if (terrain.x < -terrain.displayWidth) {
          terrain.destroy(); // Destroy physics body
          if (tileSprite) {
              tileSprite.destroy(); // Destroy visual sprite
          }
      }
            });
        });
    }



}
