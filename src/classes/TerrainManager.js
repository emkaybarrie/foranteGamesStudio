import { config } from "../config.js";
export default class TerrainManager {
    constructor(scene) {

        // Initialize stage elements here
        this.scene = scene; // Reference to the Phaser scene
        this.terrainGroupsPhysics = {
            ground: this.scene.physics.add.staticGroup(),
            low: this.scene.physics.add.staticGroup(),
            medium: this.scene.physics.add.staticGroup(),
            high: this.scene.physics.add.staticGroup()
        };

        this.terrainGroupsTilesprites = this.scene.add.group()
        this.stageConfig = this.scene.stageConfig

        // Chaos Factor Settings - Determine variance for terrain generation
        this.chaosFactorSettings = {
            ground: { chaosLowerBound: 0.95, chaosUpperBound: 1.15},
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
            max: { baseWidth: this.scene.scale.width * 2}
        };

        // Transition Gap Settings
        this.transitionGapSettings = {
            ground: { baseWidth: this.scene.scale.height * 0.25},
            low: { baseWidth: this.scene.scale.height * 0.35  },
            medium: { baseWidth: this.scene.scale.height * 0.45 },
            high: { baseWidth: this.scene.scale.height * 0.55 }
        };

        // Register the update event for manager
        this.scene.events.on('update', this.updateTerrainPosition, this);
    }

    addColliders() {
        // Add a collider for each terrain group with the player
        Object.values(this.terrainGroupsPhysics).forEach(terrain => {
            // Avatar
            this.scene.physics.add.collider(
                this.scene.avatarManager.sprite,
                terrain, 
                (sprite, terrainSegment) => this.handleAvatarCollisions(this.scene.avatarManager, terrainSegment),
                null, 
                this
            );
            // Friendly Projectiles
            this.scene.physics.add.collider(this.scene.friendlyProjectileGroup, terrain, (projectile, terrain) => {
                projectile.destroy()
            });
        });

        // Add a collider for each enenmy group with the terrain group
        Object.values(this.terrainGroupsPhysics).forEach(terrainGroup => {
            this.scene.physics.add.collider(
                this.scene.enemyManager.enemyGroup,
                terrainGroup,
                (enemy, terrain) => {
                    //console.log('Collision detected between terrain and enemy');
                }
            );
        });

        // Object.keys(this.terrainGroupsPhysics).forEach(terrainElevationGroup => {
        //     // Ensure the corresponding key exists in both groups
        //         this.scene.physics.add.collider(
        //             this.scene.enemyManager.enemyGroup,
        //             this.terrainGroupsPhysics[terrainElevationGroup],
        //             (enemy, terrain) => {
        //             // Handle collision logic here
                   
        //             }
        //         );
        
        // });

    
    }

        handleAvatarCollisions(avatar, terrain){

            if(terrain.type == 'slope'){
                if(avatar.mode == 1){

                // Reduce speed when moving up
                if (Math.abs(avatar.sprite.body.velocity.x) > 0) {
                    avatar.sprite.setVelocityX(avatar.sprite.body.velocity.x * 0.35);
                }

                // Optional: Increase vertical position slightly to simulate smoother movement
                avatar.sprite.y -= 1; // Small adjustment upwards

                // Add sliding effect
                if (avatar.sprite.body.velocity.x === 0) {
                    avatar.sprite.setVelocityY(100); // Small downward velocity to simulate sliding
                    if(terrain.direction == 'upRight'){
                        avatar.sprite.x -= 2.5
                        avatar.sprite.y += 2
                    } else {
                        avatar.sprite.x += 2.5
                        avatar.sprite.y += 2
                    }
                    
                }
                } else if (avatar.mode == 0) {
                    if(terrain.yDirection == 'up'){
                        avatar.sprite.y -= 1; // Small adjustment upwards
                        if(avatar.traversalSpeedModifier > 50){
                            avatar.traversalSpeedModifier -= 0.5
                        }
                    } else if (terrain.yDirection == 'down'){
                        avatar.sprite.y += 2; // Small adjustment upwards
                        if(avatar.traversalSpeedModifier < 300){
                        avatar.traversalSpeedModifier += 7.5
                        }
                    }
                    
                }
            }

            if (terrain.type == 'wall'){
                if(avatar.mode == 0){
                avatar.sprite.x -= this.scene.baseSpeed
                avatar.sprite.setVelocityX(0)

                }
            }

        }
    
    generateTerrain(x, elevation = 'ground', slopeConfig = this.generateTerrainConfig(this.scene.scale.width, this.scene.scale.height * 0.65)) { 
        // Tile indices for flat, sloped, and fill terrain
        const tileIndices = {
            flat: { ground: 1 },
            slope: {
                up: { ground: 3 },
                down: { ground: 4 },
            },
            wall: {
                up: { ground: 5 },  // Wall facing left (up)
                down: { ground: 7 }, // Wall facing right (down)
            },
            fill: { ground: 6 }, // Tile to fill gaps below slopes
            edges: {
                left: { ground: 0 },
                right: { ground: 2 },
            }
        };
    
        // Elevation Y-position based on input
        const elevationOffsets = { 
            ground: this.scene.scale.height, 
            low: this.scene.scale.height * 0.75, 
            high: this.scene.scale.height * 0.5 };
        const baseY = elevationOffsets[elevation] || this.scene.scale.height;
    
        // Scaling and tile dimensions
        const sourceTileWidth = 16;
        const sourceTileHeight = 16;
        const desiredTileSize = 16;
        const scaleFactorX = desiredTileSize / sourceTileWidth;
        const scaleFactorY = desiredTileSize / sourceTileHeight;
    
        // Define terrain group
        const terrainGroup_Local = this.scene.add.group();

        // Tiles to Create on batch
        let tilesToCreate = [];
        // Physics Bodies to  Create on batch
        let physicsBodies = []
        // Objects to populate Terrain with on batch
        let terrainObjects = []

        // Track position for stitching terrain
        let currentX = x;
        let currentY = baseY;

        // Track Terrain Width
        let terrainStartX = x
        let terrainEndX = x
    
        let previousSegment = null; // Track the previous segment for handling transitions

        // Main Slope Config section
        slopeConfig.forEach(segment => {
            const { type, length, yDirection, xDirection, populationConfig } = segment;

            //console.log("Next Tile: " + type)
    
            if (type === 'flat') {
                // Check if the previous segment was an upward slope
                if (previousSegment && previousSegment.type === 'slope' && previousSegment.yDirection === 'up') {
                    // If the previous segment was an upward slope, shift the first flat tile down by 1
                    currentY += desiredTileSize;
                }
    
                // Handle transition from an upward wall (left) to flat (add left edge tile)
                if (previousSegment && previousSegment.type === 'wall' && previousSegment.yDirection === 'up') {
                    const edgeTile = this.scene.add.tileSprite(
                        currentX - desiredTileSize,
                        currentY,
                        desiredTileSize,
                        desiredTileSize,
                        'terrainTileset2',
                        tileIndices.edges.left[elevation]
                    )
                        .setOrigin(0, 1)
                        .setScale(scaleFactorX, scaleFactorY);
                        terrainGroup_Local.add(edgeTile)

                    // Create Physics Body for Segment
                    
                    const terrainPhysicsBodySegment = this.terrainGroupsPhysics[elevation].create(currentX, currentY)
                    terrainPhysicsBodySegment.setOrigin(1, 1)
                    terrainPhysicsBodySegment.displayWidth = desiredTileSize
                    terrainPhysicsBodySegment.displayHeight = desiredTileSize
                    terrainPhysicsBodySegment.body.setSize(desiredTileSize, desiredTileSize)
                    terrainPhysicsBodySegment.setImmovable(true)
                    terrainPhysicsBodySegment.body.allowGravity = false
                    terrainPhysicsBodySegment.body.checkCollision.down = false
                    terrainPhysicsBodySegment.setVisible(false)
                    //terrainPhysicsBodySegment.body.updateFromGameObject()

                    terrainPhysicsBodySegment.type = 'edge'


                }

                let segmentStart = currentX
    
                // Create flat segment
                for (let i = 0; i < Math.round(length / desiredTileSize); i++) {
                    tilesToCreate.push({
                        x: currentX,
                        y: currentY,
                        xSize: desiredTileSize,
                        ySize: desiredTileSize,
                        texture: 'terrainTileset2',
                        frame: tileIndices.flat[elevation],
                        originX: 0,
                        originY: 1,
                        scaleX: scaleFactorX,
                        scaleY: scaleFactorY,
                        tileType: 'flat',
                    });

                    // Fill the gap below the flat tile until we reach baseY
                    const fillStartY = currentY + desiredTileSize;
                    const fillEndY = baseY;

                    const fillYSize = (fillEndY - fillStartY)

                    tilesToCreate.push({
                        x: currentX,
                        y: fillStartY - desiredTileSize,
                        xSize: desiredTileSize,
                        ySize: fillYSize + desiredTileSize,
                        texture: 'terrainTileset2',
                        frame: tileIndices.fill[elevation],
                        originX: 0,
                        originY: 0,
                        scaleX: scaleFactorX,
                        scaleY: scaleFactorY,
                        tileType: 'fill',
                    });

                    currentX += desiredTileSize;
                }

        
                // Create Physics Body for Segment
                let segmentWidth = Math.round((length / desiredTileSize) * desiredTileSize)

                physicsBodies.push({
                    x: segmentStart,
                    y: currentY - desiredTileSize,
                    width: segmentWidth,
                    height: desiredTileSize,
                    originX: 0,
                    originY: 0,
                    bodyType: 'flat'
                });

                // Create Population Data for Segment
                if(populationConfig && populationConfig.length > 0){
                    // // Get bounds for segment
                     let boundsMin = segmentStart + segmentWidth * 0.15
                     let boundsMax = segmentStart + segmentWidth * 0.85

                    // Number of random items to pick
                    const numItemsToPick = Phaser.Math.Between(0, Math.max(1, populationConfig.length - 2)); // Replace with the desired number of items

                    // Shuffle the populationConfig array to randomize order
                    const shuffledConfig = Phaser.Utils.Array.Shuffle([...populationConfig]);

                    // Take the first numItemsToPick items from the shuffled array
                    const selectedItems = shuffledConfig.slice(0, Math.min(numItemsToPick, shuffledConfig.length));

                    // For each selected item, add it to terrainObjects
                    selectedItems.forEach(configItem => {
                        let xPlacement = Phaser.Math.FloatBetween(boundsMin, boundsMax);
                        let topOfBody = currentY - desiredTileSize;

                        // Set X and Y based on segment
                        terrainObjects.push({
                            x: xPlacement,
                            y: topOfBody,
                            type: configItem
                        });
                    });


                }
                
            } else if (type === 'slope') {
                // Calculate step size for slope
                //const stepX = desiredTileSize;
                //const stepY = direction === 'upRight' ? -desiredTileSize : desiredTileSize;
    
                // Adjust position for upwards slope to ensure seamless connection
                if (yDirection === 'up') {
                    currentY -= desiredTileSize;
                }

                let segmentStart = currentX
                let segmentStartY = currentY
    
                // Generate sloped tiles
                for (let i = 0; i < Math.round(length / desiredTileSize); i++) {
                    tilesToCreate.push({
                        x: currentX,
                        y: currentY,
                        xSize: desiredTileSize,
                        ySize: desiredTileSize,
                        texture: 'terrainTileset2',
                        frame: tileIndices.slope[yDirection][elevation],
                        originX: 0,
                        originY: 1,
                        scaleX: scaleFactorX,
                        scaleY: scaleFactorY,
                        tileType: 'slope',
                    });

                    // Fill the gap below the flat tile until we reach baseY
                    const fillStartY = currentY;
                    const fillEndY = baseY;

                    const fillYSize = (fillEndY - fillStartY)

                    tilesToCreate.push({
                        x: currentX,
                        y: fillStartY,
                        xSize: desiredTileSize,
                        ySize: fillYSize,
                        texture: 'terrainTileset2',
                        frame: tileIndices.fill[elevation],
                        originX: 0,
                        originY: 0,
                        scaleX: scaleFactorX,
                        scaleY: scaleFactorY,
                        tileType: 'fill',
                    });

                    // Update position for next slope tile
                    currentX += desiredTileSize;
                    currentY += yDirection === 'up' ? -desiredTileSize : desiredTileSize;
                }

                // Create Physics Body for 
                
                let stepWidth = 2
                let stepHeight = 2
                let numSteps = Math.round((Math.round(length / desiredTileSize) * desiredTileSize) / stepWidth )
                let originX = 0
                let originY = 0

                if(yDirection == 'down'){
                    stepHeight *= -1
                    segmentStartY -= desiredTileSize
                    originX = 1
                } 
            
                // for (let i = 0; i < numSteps; i++){
                //     const x = segmentStart + i * stepWidth
                //     const y = segmentStartY - i * stepHeight
                //     const terrainPhysicsBodySegment = this.terrainGroupsPhysics[elevation].create(x, y, null)
                //     terrainPhysicsBodySegment.setOrigin(originX, originY)
                //     terrainPhysicsBodySegment.displayWidth = stepWidth
                //     terrainPhysicsBodySegment.displayHeight = stepHeight
                //     terrainPhysicsBodySegment.body.setSize(stepWidth, stepHeight)
                //     terrainPhysicsBodySegment.setImmovable(true)
                //     terrainPhysicsBodySegment.body.allowGravity = false
                //     terrainPhysicsBodySegment.body.checkCollision.down = false

                //     terrainPhysicsBodySegment.setVisible(false)

                //     // Tag Physics Body 
                //     terrainPhysicsBodySegment.type = type
                //     terrainPhysicsBodySegment.direction = yDirection
                // }

                for (let i = 0; i < numSteps; i++) {
                    physicsBodies.push({
                        x: segmentStart + i * stepWidth,
                        y: segmentStartY - i * stepHeight,
                        width: stepWidth,
                        height: stepHeight,
                        originX: originX,
                        originY: originY,
                        bodyType: type,
                        yDirection: yDirection
                    });
                }
                
                
            } else if (type === 'wall') {
                // Handle transition to a down wall from flat (add right edge tile)
                if (previousSegment && previousSegment.type === 'flat' && type === 'wall' && yDirection == 'down') {
                    const edgeTile = this.scene.add.tileSprite(
                        currentX,
                        currentY,
                        desiredTileSize,
                        desiredTileSize,
                        'terrainTileset2',
                        tileIndices.edges.right[elevation]
                    )
                        .setOrigin(0, 1)
                        .setScale(scaleFactorX, scaleFactorY);
                        terrainGroup_Local.add(edgeTile)

                    // Create Physics Body for Segment
                    
                    const terrainPhysicsBodySegment = this.terrainGroupsPhysics[elevation].create(currentX, currentY, null)
                    terrainPhysicsBodySegment.setOrigin(0, 1)
                    terrainPhysicsBodySegment.displayWidth = desiredTileSize
                    terrainPhysicsBodySegment.displayHeight = desiredTileSize
                    terrainPhysicsBodySegment.body.setSize(desiredTileSize, desiredTileSize)
                    terrainPhysicsBodySegment.setImmovable(true)
                    terrainPhysicsBodySegment.body.allowGravity = false
                    terrainPhysicsBodySegment.body.checkCollision.down = false
                    terrainPhysicsBodySegment.setVisible(false)

                    //terrainPhysicsBodySegment.body.updateFromGameObject()

                    terrainPhysicsBodySegment.type = 'edge'
                }
    
                // Handle transition to a up wall from flat (add fill tile)
                if (previousSegment && previousSegment.type === 'flat' && type === 'wall' && yDirection == 'up') {
                    const fillTile = this.scene.add.tileSprite(
                        currentX,
                        currentY,
                        desiredTileSize,
                        desiredTileSize,
                        'terrainTileset2',
                        tileIndices.fill[elevation]
                    )
                        .setOrigin(0, 1)
                        .setScale(scaleFactorX, scaleFactorY);
                        terrainGroup_Local.add(fillTile)
                        

                }

                // Handle transition to a up wall from slope (add wall tile)
                if (previousSegment && previousSegment.type === 'slope' && previousSegment.yDirection === 'up' && type === 'wall' && yDirection === 'up') {
                    const fillWallTile = this.scene.add.tileSprite(
                        currentX,
                        currentY,
                        desiredTileSize,
                        desiredTileSize,
                        'terrainTileset2',
                        tileIndices.wall[yDirection][elevation]
                    )
                        .setOrigin(0, 1)
                        .setScale(scaleFactorX, scaleFactorY)
                        .setData('tileType', 'wall'); // Tag as wall tile;
                        terrainGroup_Local.add(fillWallTile)
                }

                // Handle transition to a up wall from slope (add wall tile)
                if (previousSegment && previousSegment.type === 'slope' && previousSegment.yDirection === 'down' && type === 'wall' && yDirection === 'down') {
                    // If the previous segment was a downwards slope, shift the first wall tile left by 1
                    currentX -= desiredTileSize;
                    // If the previous segment was a downwards slope, shift the first flat tile up by 1
                    currentY -= desiredTileSize;
                }

                // Handle wall direction and generate the wall (up or down)
                const wallHeight = length;
    
                // Track the lowest Y of the wall tiles
                let lowestWallY = currentY;
    
                // Adjust the wall direction and Y position
                if (yDirection === 'up') {
                    //currentY = desiredTileSize;  // Move up for the wall
                } else if (yDirection === 'down') {
                    currentY += desiredTileSize;  // Move down for the wall
                }

                let segmentStart = currentX
                let segmentStartY = currentY
    
                // Generate the wall tiles

                for (let i = 0; i < Math.round(wallHeight / desiredTileSize); i++) {
    
                    tilesToCreate.push({
                        x: currentX,
                        y: currentY,
                        xSize: desiredTileSize,
                        ySize: desiredTileSize,
                        texture: 'terrainTileset2',
                        frame: tileIndices.wall[yDirection][elevation],
                        originX: 0,
                        originY: 1,
                        scaleX: scaleFactorX,
                        scaleY: scaleFactorY,
                        tileType: 'wall',
                    });

                    // Fill the gap below the flat tile until we reach baseY
                    const fillStartY = currentY;
                    const fillEndY = baseY;

                    const fillYSize = (fillEndY - fillStartY)

                    tilesToCreate.push({
                        x: currentX,
                        y: fillStartY,
                        xSize: desiredTileSize,
                        ySize: fillYSize,
                        texture: 'terrainTileset2',
                        frame: tileIndices.fill[elevation],
                        originX: 0,
                        originY: 0,
                        scaleX: scaleFactorX,
                        scaleY: scaleFactorY,
                        tileType: 'fill',
                    });                    

                    // Track the lowest Y of the wall tiles
                    lowestWallY = Math.max(lowestWallY, currentY);
    
                    // Update Y position for next wall tile (either up or down)
                    if (yDirection === 'up') {
                        currentY -= desiredTileSize;  // Move up for the wall
                    } else if (yDirection === 'down') {
                        currentY += desiredTileSize;  // Move down for the wall
                    }
                    
                }

                // Update the X position after generating the wall
                currentX += desiredTileSize;
    

                // Physics Body

                // Create Physics Body for Segment
                let segmentHeight = Math.round(length / desiredTileSize) * desiredTileSize
                let originX = 0
                let originY = 0

                if(yDirection == 'up'){
                    originY = 1
                } 

                // Issue - When using this method, collision doesnt work for some reason
                // physicsBodies.push({
                //     x: segmentStart,
                //     y: segmentStartY,
                //     width: desiredTileSize,
                //     height: segmentHeight,
                //     originX: originX,
                //     originY: originY,
                //     bodyType: type
                // });

                const terrainPhysicsBodySegment = this.terrainGroupsPhysics[elevation].create(segmentStart, segmentStartY)
                terrainPhysicsBodySegment.setOrigin(originX, originY)
                terrainPhysicsBodySegment.displayHeight = segmentHeight
                terrainPhysicsBodySegment.displayWidth = desiredTileSize
                terrainPhysicsBodySegment.body.setSize(desiredTileSize, segmentHeight)
                terrainPhysicsBodySegment.setImmovable(true)
                terrainPhysicsBodySegment.body.allowGravity = false
                terrainPhysicsBodySegment.body.checkCollision.down = false
                terrainPhysicsBodySegment.setVisible(false)
                terrainPhysicsBodySegment.type = 'wall'
    
                
            }

            // Update previous segment
            previousSegment = segment;
  
        });

        // Once iteration is complete, batch-create all the tiles in one go
        tilesToCreate.forEach(tileData => {
            const tile = this.scene.add.tileSprite(tileData.x, tileData.y, tileData.xSize, tileData.ySize, tileData.texture, tileData.frame)
                .setOrigin(tileData.originX, tileData.originY)
                .setScale(tileData.scaleX, tileData.scaleY)
                .setData('tileType', tileData.tileType);
            terrainGroup_Local.add(tile);
        });

        // Batch-create all physics bodies in one go
        physicsBodies.forEach(bodyData => {
            const terrainSegment = this.terrainGroupsPhysics[elevation].create(bodyData.x, bodyData.y);
            terrainSegment.setOrigin(bodyData.originX, bodyData.originY); // Align bottom-left corner
            terrainSegment.displayWidth = bodyData.width;
            terrainSegment.displayHeight = bodyData.height;
            terrainSegment.body.setSize(bodyData.width, bodyData.height);
            terrainSegment.setImmovable(true);
            terrainSegment.body.allowGravity = false;
            terrainSegment.body.checkCollision.down = false
            terrainSegment.setVisible(false);
            terrainSegment.type = bodyData.bodyType
            terrainSegment.yDirection = bodyData.yDirection
        });

        // Batch-create all terrain objects in one go
        terrainObjects.forEach(objectPlacementData => {
                this.scene[`${objectPlacementData.type}Manager`].add(
                    objectPlacementData.x,
                    objectPlacementData.y
                )     
        });
        
        // Add depth and return the physics body
        const depthMap = { ground: 5, low: 4, high: 2 };
        const depth = depthMap[elevation] || 1;
        terrainGroup_Local.setDepth(depth)

        //

        terrainGroup_Local.children.iterate(sprite => {
            terrainEndX += sprite.width;
        });

        // Assuming you have a group named terrainGroup_Local
        const firstChild = terrainGroup_Local.getFirst(true);
        firstChild.terrainStart = true
        // Assuming you have a group named terrainGroup_Local
        const lastChild = terrainGroup_Local.getLast(true);
        lastChild.terrainEnd = true

        let terrainGroupWidth = lastChild.x + lastChild.width - terrainStartX

        terrainGroup_Local.terrainGroupWidth = terrainGroupWidth
        
        this.terrainGroupsTilesprites.add(terrainGroup_Local)
        // Return the terrain group
        return terrainGroup_Local;
    }

    generateTerrainConfig(maxLandWidth, maxLandHeight){
        let availableLandWidth = maxLandWidth
        const heightBufferZone = this.scene.scale.height * 0.1
        const absoluteMaxHeight = this.scene.scale.height - heightBufferZone
        const maximumLandHeight = Math.min(maxLandHeight, absoluteMaxHeight)
        let availableLandHeight = maximumLandHeight

        // Initialise config packet
        const terrainConfig = []
        const tileSize = 16
        const header_footerWidth = 80

        // Mappings for terrain generation - based on previous segment
        const typeMappings = {
            flat: ['slope', 'wall'],
            slope: ['flat'], 
            wall: ['flat'], 
        };
        const yDirections = ['up', 'down'];

        // Max and min length constraints for the segments
            const minSegmentLength = 64; // minimum length of each segment
            const maxSegmentLength = 320; // maximum length of each segment
            const maxHeightChange_Wall_Up = 125; // maximum allowed height change for slopes or walls

        // Create terrain header
        //console.log('Generating config for terrain header...')
            // Wall
            let type = 'wall'
            let length = 32
            let yDirection = 'up'
            let xDirection = 'left'
            let populationConfig = null

            // Push to config
            terrainConfig.push({ type, length, yDirection, xDirection});

            // Update available land space
            availableLandHeight -= length 
            availableLandWidth -= tileSize 

            // Flat
            type = 'flat'
            length = header_footerWidth - tileSize
            xDirection = null
            yDirection = null

            // Push header to config
            terrainConfig.push({ type, length, yDirection, xDirection });
            
            // Update available land space
            availableLandHeight -= tileSize
            availableLandWidth -= length

        // Generate remaining terrain based on algo and parameters
        //console.log('Generating config for terrain body...')

            while (availableLandWidth > header_footerWidth){
            //console.log('Available Terrain Width: ' + availableLandWidth)
            //console.log('Available Terrain Height: ' + availableLandHeight)
            //console.log('Generating terrain segment...')
            // Generation Logic
            // Confirm last segment
            let previousSegment = terrainConfig.length > 0 ? terrainConfig[terrainConfig.length - 1] : null
            // Select next segment type
            type = typeMappings[previousSegment.type][Math.floor(Math.random() * typeMappings[previousSegment.type].length)];
            // Set segment direction parameters
            yDirection = null
            xDirection = null
                // Set Y Direction based on available land height space
                if(type != 'flat'){
                    yDirection = yDirections[Math.floor(Math.random() * yDirections.length)]
                    // Override if up/down limit reached
                    if(availableLandHeight >= maximumLandHeight - tileSize * 3) yDirection = 'up'
                    if(availableLandHeight <= 0) yDirection = 'down'
                }
                // Set X Direction for wall based on y Direction
                if (type == 'wall'){
                    xDirection = yDirection == 'up'? 'left' : 'right'
                }

            // Set length based on available land width/height space
                // Initialise contraints and set based on type
                let minLengthContraint = tileSize
                let maxLengthConstraint = tileSize
                // Flat
                if(type == 'flat'){
                    minLengthContraint = Math.min(minSegmentLength, availableLandWidth)
                    maxLengthConstraint = Math.min(maxSegmentLength, availableLandWidth)
                }
                // Wall
                if(type == 'wall'){
                    if(yDirection == 'up'){
                        minLengthContraint = Math.max(Math.min(minSegmentLength, availableLandHeight), tileSize)
                        maxLengthConstraint = Math.max(Math.min(maxSegmentLength, availableLandHeight), tileSize)
                        maxLengthConstraint = Math.min(maxLengthConstraint, maxHeightChange_Wall_Up)
                    } else if (yDirection == 'down'){
                        minLengthContraint = Math.max(Math.min(minSegmentLength, maxLandHeight - availableLandHeight),tileSize)
                        maxLengthConstraint = Math.max(Math.min(maxSegmentLength, maxLandHeight - availableLandHeight - tileSize * 5), tileSize)
                    }
                    
                }
                // Slope
                if(type == 'slope'){
                    if(yDirection == 'up'){
                        minLengthContraint = Math.max(Math.min(minSegmentLength, availableLandWidth, availableLandHeight), tileSize)
                        maxLengthConstraint = Math.max(Math.min(maxSegmentLength, availableLandHeight, availableLandHeight), tileSize)
                    } else if (yDirection == 'down'){
                        minLengthContraint = Math.max(Math.min(minSegmentLength, availableLandWidth, maxLandHeight - availableLandHeight ), tileSize)
                        maxLengthConstraint = Math.max(Math.min(maxSegmentLength, availableLandHeight, maxLandHeight - availableLandHeight - tileSize * 5), tileSize)
                    }
                }

            length = Phaser.Math.Between(minLengthContraint, maxLengthConstraint)

            // Set Terrain Objects that can be populated
                // Add Population Logic
            populationConfig = ['obstacle', 'loot', 'enemy']
            
            // Push data to config
                //console.log(`Pushing ${type} to terrain config`)
            terrainConfig.push({ type, length, yDirection, xDirection, populationConfig });
            
            // Update available land space
            if(yDirection == 'up'){
                availableLandHeight -= type != 'flat'? length : tileSize
            } else if (yDirection == 'down') {
                availableLandHeight += type != 'flat'? length : tileSize
            } 
            availableLandWidth -= type != 'wall'? length: tileSize
            }
        
        // Create terrain footer
        //console.log('Generating config for terrain footer...')
            // Flat
            type = 'flat'
            length = header_footerWidth - tileSize
            xDirection = null
            yDirection = null

            // Push header to config
            //console.log(`Pushing ${type} to terrain config`)
            terrainConfig.push({ type, length, yDirection, xDirection });

            // Update available land space
            availableLandHeight -= tileSize
            availableLandWidth -= length

            // Wall
            type = 'wall'
            length = 32
            yDirection = 'down'
            xDirection = 'right'

            // Push to config
            //console.log(`Pushing ${type} to terrain config`)
            terrainConfig.push({ type, length, yDirection, xDirection});

            // Update available land space
            availableLandHeight -= length 
            availableLandWidth -= tileSize 

            console.log('Terrain Config Generated successfully', terrainConfig)
            return terrainConfig
            
    }

    updateTerrainPosition() {
        let repositionSpeed = this.scene.baseSpeed
        // Move all terrain physics objects and update
        Object.values(this.terrainGroupsPhysics).forEach(terrainGroup => {
            terrainGroup.children.iterate((object) => {
                if(object){
                object.x -= repositionSpeed; // Move each container


                if (object.body) {
                    object.body.updateFromGameObject();
                }

                if(object){
                if (object.x < -this.scene.scale.width * 0.5) {
                    object.destroy() 
                    //console.log('Physics object destroyed')
                }
                }
            }
             
            });
        });

        // Move all terrain tilesprite objects
        this.terrainGroupsTilesprites.getChildren().forEach(tileGroup => {

                tileGroup.getChildren().forEach(tileSprite => {

                if(tileSprite){
                    // Move each TileSprite to the left
                    tileSprite.x -= repositionSpeed;  // Adjust the value (-1) for the speed you want
            
                    if(tileSprite){
                    // Geenerate new terrain
                    if (tileSprite.terrainEnd && tileSprite.x + tileSprite.width < this.scene.scale.width && !tileGroup.generateNewTerrain) {
                        tileGroup.generateNewTerrain = true
                        this.generateTerrain((this.scene.scale.width + this.scene.scale.width * 0.125) *
                                Phaser.Math.FloatBetween(
                                    this.chaosFactorSettings.ground.chaosLowerBound,
                                    this.chaosFactorSettings.ground.chaosUpperBound
                                ),
                                'ground'
                        );
                    }

                    // Destroy
                    if (tileSprite.x < -tileSprite.width - this.scene.scale.width * 0.1 ) {
                        tileSprite.destroy() 
                        //console.log('Tilesprite destroyed')
                    }

                    }
                }
            });
        });

    }

    generateStartTerrain(){
        // Start Zone Set Up
        this.generateTerrain(0, 'ground', [
            { type: 'flat', length: config.width * 0.25},                 
            { type: 'slope', length: config.height * 0.05, yDirection: 'up'},  
            { type: 'flat', length: config.width * 0.05},                 
            { type: 'slope', length: config.height * 0.05, yDirection: 'up' }, 
            { type: 'flat', length: config.width * 0.15},                
            { type: 'wall', length: config.height * 0.05, yDirection: 'up' },  
            { type: 'flat', length: config.width * 0.1},                 
            { type: 'wall', length: config.height * 0.05, yDirection: 'up' }, 
            { type: 'flat', length: config.width * 0.1},
            { type: 'slope', length: config.height * 0.1, yDirection: 'up' },
            { type: 'flat', length: config.width * 0.2}, 
            // Switch to Mode 1
            { type: 'flat', length: config.width * 0.35},    
            { type: 'wall', length: config.height * 0.1, yDirection: 'down' },
            { type: 'flat', length: config.width * 0.1},
            { type: 'slope', length: config.height * 0.1, yDirection: 'down' },
            { type: 'flat', length: config.width * 0.4},    
            { type: 'wall', length: config.height * 0.05, yDirection: 'down' },                  
        ]);

        const starterMajorReward = this.scene.add.image(config.width * 0.9, (config.height * 0.69) - (config.width * 0.1), 'majorRewardShrine')
        .setOrigin(0.5, 1)
        .setDisplaySize(config.width * 0.1,config.width * 0.1)
        .setDepth(5);
        const unactivatedShrineEffect = this.scene.add.sprite(starterMajorReward.x - (starterMajorReward.displayWidth * 0.27), starterMajorReward.y - (starterMajorReward.displayHeight * 0.875))
        unactivatedShrineEffect.setDepth(5).setAlpha(0.5)
        unactivatedShrineEffect.anims.play('animation_MajorReward');  // Start the animation created earlier

        // Add check in the update method
        this.scene.events.on('update', () => {
            if (this.scene.avatarManager.sprite.x >= starterMajorReward.x && !this.scene.stageStart) { 
            this.scene.scene.pause(); // Pause this scene
            this.scene.scene.launch('BlessingsScreen', 
                { 
                mainScene: this.scene, 
                avatar: this.scene.avatarManager, 
                blessingsConfig:{numOptions: 3, type: 'skill', category: 'random', maxRarity: 'uncommon'} }); // Launch the pause menu scene
            this.scene.scene.bringToTop('BlessingsScreen');
                
            } else if (this.scene.stageStart && !this.scene.starterBlessingSelected){
                this.scene.starterBlessingSelected = true
                this.scene.stageProgressionActive = true

                this.scene.cameraManager.mainCamera.flash(500, 48, 25, 52)
                unactivatedShrineEffect.destroy()

                this.scene.avatarManager.mode = 0

                // Register the update event for the scene
                this.scene.events.on('update', () => {
                    if(this.scene.avatarManager.sprite.x >= this.scene.avatarManager.xRepositionUpperBound){
                        this.scene.avatarManager.sprite.x -= 2.5
                    }
                    if(starterMajorReward.x + starterMajorReward.displayWidth / 2 > 0){
                        starterMajorReward.x -= this.scene.baseSpeed
                    } else {
                        starterMajorReward.destroy()
                        this.scene.messageBox.destroy()
                        this.scene.message.destroy()
                    }
                });


                
 
            }
        });
    }


  

}




