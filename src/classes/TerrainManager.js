
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
            high: { baseHeight: this.scene.scale.height * 0.8 }
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
            ground: { baseWidth: this.scene.scale.height * 0.25},
            low: { baseWidth: this.scene.scale.height * 0.35  },
            medium: { baseWidth: this.scene.scale.height * 0.45 },
            high: { baseWidth: this.scene.scale.height * 0.55 }
        };


    }

    generateTerrainSequence(lastTerrainEnd = this.scene.scale.width, elevation = 'ground', numberOfTerrainSegments = 5){

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

            const terrainType = {
                0: null,
                1: 'normal',
                2: 'platform'
            }

            if(Phaser.Math.FloatBetween(0, 100) < 85 || elevation == 'ground' || i == numberOfTerrainSegments){
                const generatedTerrain = this.generateTerrain(targetStartX, elevation, distanceSelections[Phaser.Math.Between(1, 3)], terrainType[Phaser.Math.Between(0, 0)])
                generatedTerrain.id = i
                if (i === numberOfTerrainSegments){
                    generatedTerrain.isSequenceEnd = true
                    // this.scene.tweens.add({
                    //     targets: generatedTerrain,  // The terrain to animate
                    //     alpha: {from: 1, to: 0.5},
                    //     //tint: { from: 0xFFFFFF, to: 0xFFFF00 },  // Change color to yellow (glowing effect)
                    //     //displayHeight: generatedTerrain.displayHeight * 1.01, // Increase height by 1%
                    //     yoyo: true,                 // Return to the starting position
                    //     repeat: -1,                 // Repeat infinitely
                    //     ease: 'Sine.easeInOut',     // Smooth easing for natural motion
                    //     duration: 500               // Time in milliseconds for one up-and-down cycle
                    // });
                } 

            lastTerrainEnd = generatedTerrain.x + generatedTerrain.displayWidth
            } else {
                lastTerrainEnd = Math.max(lastTerrainEnd + this.scene.scale.width, this.scene.scale.width)
                console.log('Skipped Generation - new terrain to be generated at: ' + lastTerrainEnd)
            }

            

            
        }
        

    }

    generateTerrain(
        x, 
        elevation = 'ground', 
        distance = null, // Determined based on chance if null
        terrainType = null, // Determined based on chance if null
        useTopRow = true, 
        textureMatchStage = true, 
        textureOverride = null, 
        populateTerrain = true
    ) {
        // Define terrain type chances based on elevation
        const terrainTypeChancesByElevation = {
            ground: { normal: 95, platform: 5 },  
            low: { normal: 90, platform: 10 },   
            medium: { normal: 70, platform: 30 }, 
            high: { normal: 55, platform: 45 }    
        };
    
        // Define distance chances based on elevation
        const distanceChancesByElevation = {
            ground: { short: 10, standard: 60, far: 30 },   
            low: { short: 30, standard: 50, far: 10 },      
            medium: { short: 50, standard: 30, far: 20 },   
            high: { short: 75, standard: 20, far: 5 }      
        };
    
        // Define rarity chances
        const rarityChances = {
            common: 70,   // 70% chance
            uncommon: 20, // 20% chance
            rare: 10      // 10% chance
        };
    
        // Determine distance if not provided
        if (!distance) {
            const distanceChances = distanceChancesByElevation[elevation] || { standard: 100 }; // Default to 100% standard
            const randomValue = Phaser.Math.FloatBetween(0, 100);
            let accumulatedChance = 0;
    
            for (const [dist, chance] of Object.entries(distanceChances)) {
                accumulatedChance += chance;
                if (randomValue <= accumulatedChance) {
                    distance = dist;
                    break;
                }
            }
        }
    
        // Determine terrain type if not provided
        if (!terrainType) {
            const terrainTypeChances = terrainTypeChancesByElevation[elevation] || { normal: 100 }; // Default to 100% normal
            const randomValue = Phaser.Math.FloatBetween(0, 100);
            let accumulatedChance = 0;
    
            for (const [type, chance] of Object.entries(terrainTypeChances)) {
                accumulatedChance += chance;
                if (randomValue <= accumulatedChance) {
                    terrainType = type;
                    break;
                }
            }
        }
    
        // Determine terrain rarity
        const rarityRoll = Phaser.Math.FloatBetween(0, 100);
        let terrainRarity = 'common'; // Default rarity
        let accumulatedRarityChance = 0;
    
        for (const [rarity, chance] of Object.entries(rarityChances)) {
            accumulatedRarityChance += chance;
            if (rarityRoll <= accumulatedRarityChance) {
                terrainRarity = rarity;
                break;
            }
        }

        // Define terrain tiles for each region
        // const terrainTilesByRegion = {
        //     1: { ground: 16, low: 20, medium: 16, high: 20 },
        //     2: { ground: 18, low: 18, medium: 18, high: 18 },
        //     3: { ground: 30, low: 32, medium: 34, high: 36 },
        //     // Add more regions as needed
        // };

        // const terrainTopRowTilesByRegion = {
        //     1: { ground: 0, low: 0, medium: 0, high: 0 },
        //     2: { ground: 18, low: 18, medium: 18, high: 18 },
        //     3: { ground: 30, low: 32, medium: 34, high: 36 },
        //     // Add more regions as needed
        // };

        // // Get terrain tiles based on the current region
        // const terrainTiles = terrainTilesByRegion[this.scene.region] || terrainTilesByRegion[1]; // Default to region 1 if undefined
        // const topRowTiles = terrainTopRowTilesByRegion[this.scene.region] || terrainTilesByRegion[1]; // Default to region 1 if undefined
        
        // Define which tile index corresponds to which terrain type
        const terrainTiles = {
            ground: 16,  // Main body tile index
            low: 18,
            medium: 20,
            high: 22
        };

    
        const topRowTiles = {
            ground: 0,  // Top row tile index for ground
            low: 2,
            medium: 4,
            high: 6
        };
    
        // Define platform thickness bounds for each elevation
        const platformThicknessSettings = {
            ground: { min: 64, max: 128 },
            low: { min: 48, max: 96 },
            medium: { min: 32, max: 64 },
            high: { min: 16, max: 48 }
        };
    
        // Get the correct tile based on terrain type
        const tileIndex = terrainTiles[elevation] || 0; 
        const topTileIndex = topRowTiles.hasOwnProperty(elevation) && topRowTiles[elevation] !== undefined ? topRowTiles[elevation] : tileIndex;
    
        // Chaos bounds
        const chaosLowerBound = this.chaosFactorSettings[elevation].chaosLowerBound;
        const chaosUpperBound = this.chaosFactorSettings[elevation].chaosUpperBound;
    
        // Determine texture
        let texture = null;
        const desiredTileSize = 64;
        let scaleFactorX = 1;
        let scaleFactorY = 1;
    
        if (textureMatchStage) {
            texture = this.scene.textures.get('terrainTileSet');
            const frame = texture.get('frame' + tileIndex);
    
            if (!frame) {
                console.error("Tile index is out of bounds or the texture was not correctly loaded.");
                return;
            }
    
            const tileWidth = frame.width;
            const tileHeight = frame.height;
            scaleFactorX = desiredTileSize / tileWidth;
            scaleFactorY = desiredTileSize / tileHeight;
    
            if (desiredTileSize < tileWidth) {
                scaleFactorX = 1;
                scaleFactorY = 1;
            }
        } else {
            texture = textureOverride || `${elevation}_default`;
            const textureImage = this.scene.textures.get(texture);
            const textureWidth = textureImage.getSourceImage().width;
            const textureHeight = textureImage.getSourceImage().height;
    
            scaleFactorX = desiredTileSize / textureWidth;
            scaleFactorY = desiredTileSize / textureHeight;
    
            if (desiredTileSize < textureWidth) {
                scaleFactorX = 1;
                scaleFactorY = 1;
            }
        }
    
        // Calculate terrain dimensions
        const terrainElevation = this.elevationSettings[elevation].baseHeight;
        const terrainDistance = this.distanceSettings[distance].baseWidth;
        const terrainWidth = terrainDistance * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound);
    
        let terrainHeight = terrainElevation * Phaser.Math.FloatBetween(chaosLowerBound, chaosUpperBound);
        let yPosition = this.scene.scale.height; // Normal terrain is rooted to the screen bottom
    
        if (terrainType === 'platform') {
            // For platforms, constrain the thickness and height
            const thicknessBounds = platformThicknessSettings[elevation] || { min: 16, max: 64 };
            const platformThickness = Phaser.Math.Between(thicknessBounds.min, thicknessBounds.max);
            terrainHeight = platformThickness;
    
            // Adjust Y position so the top edge aligns with normal terrain
            const maxHeightOffset = this.scene.scale.height - (terrainElevation * chaosUpperBound);
            const minHeightOffset = this.scene.scale.height - (terrainElevation * chaosLowerBound);
            const platformTopY = Phaser.Math.FloatBetween(minHeightOffset, maxHeightOffset);
    
            yPosition = platformTopY + terrainHeight / 2; // Center platform around the Y value
        }
    
        // Create the TileSprite for the main body
        const tileSprite = this.scene.add.tileSprite(x, yPosition, terrainWidth, terrainHeight, 'terrainTileset', tileIndex).setOrigin(0, 1);
        tileSprite.setTileScale(scaleFactorX, scaleFactorY);
        tileSprite.setDisplaySize(terrainWidth, terrainHeight);

        let topTileSprite = null
    
       if(useTopRow){
        // Create the TileSprite for the top row
        topTileSprite = this.scene.add.tileSprite(x, yPosition - terrainHeight + (desiredTileSize / 2), terrainWidth, desiredTileSize / 2, 'terrainTileset', topTileIndex).setOrigin(0, 1);
        topTileSprite.setTileScale(scaleFactorX, scaleFactorY);
        topTileSprite.setDisplaySize(terrainWidth, desiredTileSize / 2);
       }
    
        // Create the physics body
        const physicsBody = this.scene.physics.add.staticImage(x, yPosition).setOrigin(0, 1);
        physicsBody.displayWidth = terrainWidth;
        physicsBody.displayHeight = terrainHeight;
        physicsBody.body.setSize(terrainWidth, terrainHeight);
    
        // Link TileSprite and physics body
        physicsBody.setData('tileSprite', tileSprite);
        tileSprite.setData('physicsBody', physicsBody);

        if(useTopRow){
        physicsBody.setData('topTileSprite', topTileSprite);
        topTileSprite.setData('physicsBody', physicsBody);
        }
    
        if (!this.terrainGroups[elevation]) {
            console.error(`Group for elevation '${elevation}' not initialized.`);
        } else {
            this.terrainGroups[elevation].add(physicsBody);
        }
    
        // Set depth for visual layering
        const depthMap = { ground: 5, low: 4, medium: 3, high: 2 };
        physicsBody.setDepth(depthMap[elevation] || 1);
        tileSprite.setDepth(depthMap[elevation] || 1);
        if(useTopRow){
        topTileSprite.setDepth(depthMap[elevation] || 1);
        }
    
        physicsBody.body.allowGravity = false;
        physicsBody.body.checkCollision.down = false;
        physicsBody.body.checkCollision.left = false;
        physicsBody.body.checkCollision.right = false;
    
        // Additional properties
        physicsBody.elevation = elevation;
        physicsBody.rarity = terrainRarity; // Assign rarity to the terrain
        physicsBody.distance = distance;   // Assign distance to the terrain
        physicsBody.isSequenceEnd = false;
        physicsBody.triggeredNewSequence = false;
        physicsBody.hasTopTileSprite = useTopRow
    
        // Apply visual pipeline
        tileSprite.setPipeline('GlowPipeline');
    
        if (populateTerrain) {
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
    
            const enemiesToSpawn = Phaser.Math.Between(1, 3);

                    // Rarity stub
                    // Predefined rarity chances
                    const rarityChances = {
                        rare: 5,     // 5% chance for 'rare'
                        uncommon: 15, // 15% chance for 'uncommon'
                        common: 80    // 70% chance for 'common' (default)
                    };
                    const rand = Phaser.Math.FloatBetween(0, 100);  // Get a random number between 0 and 100

                    // Check for rare, uncommon, or common based on the predefined chance ranges
                    if (rand < rarityChances.rare) {
                        this.enemyRarity = 'rare';
                    } else if (rand < rarityChances.rare + rarityChances.uncommon) {
                        this.enemyRarity =  'uncommon';
                    } else {
                        this.enemyRarity =  'common'; // Default if no other rarity is picked
                    }

            for (let i = 0; i < enemiesToSpawn; i++) {
                if (Phaser.Math.FloatBetween(0, 100) < 35) {
                    this.stageManager.enemyManager.addEnemy(
                        terrainBounds.x + Phaser.Math.FloatBetween(0.1, 0.9) * terrainBounds.width,
                        terrainBounds.top,
                        elevation,
                        'region1',
                        'stage1',
                        this.enemyRarity
                    );
                }
            }
        }

    
        return physicsBody;
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
                    const topTileSprite = terrain.getData('topTileSprite');
                    
                    if (tileSprite) {
                        tileSprite.x = terrain.x
                       // topTileSprite.x = terrain.x
                    }

                    if (topTileSprite){
                        topTileSprite.x = terrain.x
                    }
                    


                    // Handle sequence generation
                    if (terrain.isSequenceEnd && terrain.x < this.scene.scale.width && !terrain.triggeredNewSequence) {
                        //console.log('New Sequence being generated at: ' + terrain.x )
                        terrain.triggeredNewSequence = true;
                
                        this.generateTerrainSequence(terrain.x + terrain.displayWidth, elevation, Phaser.Math.Between(1, 7));
                    }
            
                    // Cleanup off-screen terrain
                    if (terrain.x < -terrain.displayWidth) {
                        //console.log('Terrain destroyed at: '+ terrain.x )
                        terrain.destroy(); // Destroy physics body
                        if (tileSprite) {
                            tileSprite.destroy(); // Destroy visual sprite
                        }

                        if (topTileSprite){
                            topTileSprite.destroy()
                        }
                    }
            });
        });
    }



}
