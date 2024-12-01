export default class ObstacleManager {
    constructor(scene, stageManager) {
        this.scene = scene;
        this.stageManager = stageManager
        this.obstacleGroups = this.stageManager.obstacleGroups




    }



    addObstacle(x, y, elevation = 'ground', texture = 'dTerrainPlaceholder', options = {}) {
        const obstacle = this.scene.physics.add.sprite(x, y, texture).setOrigin(0, 1);

        // Add Terrain to Terrain group in Stage Manager
        this.obstacleGroups[elevation].add(obstacle);

        obstacle.setDepth(5)
        obstacle.body.setImmovable(true);
        obstacle.body.allowGravity = false;
        obstacle.elevation = elevation; // Store platform type on the platform object for easy identification


        obstacle.setScale(Phaser.Math.Between(2,3))

        // Scale and adjust physics 
        obstacle.setSize(obstacle.width, obstacle.height * 0.8);
         // Additional effects for appearance, like tint or rotation, if desired
         obstacle.setTint(0xff0000); // Example red tint for visibility

         // Set properties based on options
        obstacle.passThrough = options.passThrough || true;
        obstacle.slowDownEffect = options.slowDownEffect || false;
        obstacle.stopEffect = options.stopEffect || false;

        console.log(obstacle)
        
    }

    update() {
        Object.keys(this.obstacleGroups).forEach(elevation => {
            const group = this.obstacleGroups[elevation];

            group.getChildren().forEach(obstacle => {
                obstacle.x -= this.stageManager.baseSpeed;

                // if (terrain.isSequenceEnd && terrain.x < this.scene.scale.width && !terrain.triggeredNewSequence){
                //     console.log(`Generating new ${terrain.elevation} terrain sequence`);
                //     terrain.triggeredNewSequence = true

                //     this.generateTerrainSequence(terrain.x + terrain.displayWidth, elevation)
                // }

                if (obstacle.x < -obstacle.displayWidth){
                    obstacle.destroy();
                    console.log(`Destroying ${obstacle.elevation} terrain`);
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

    obstacleCollision(avatar, obstacle){

        // Call the avatar's takeHit function if a collision occurs
        avatar.takeHit();
        console.log('Avatar collided with Obstacle')

        // // Behavior based on obstacle's properties
        // if (obstacle.passThrough) {
        //     // If pass-through, temporarily disable collision
        //     obstacle.body.checkCollision.none = true;
        //     this.scene.time.delayedCall(500, () => obstacle.body.checkCollision.none = false); // Enable collision after 0.5s
        // } else if (obstacle.slowDownEffect) {
        //     // If slow-down, reduce player speed temporarily
        //     avatar.normalSpeed = 0
        //     avatar.sprite.setVelocityX(avatar.sprite.body.velocity.x * 0.5);
        //     this.scene.time.delayedCall(500, () => avatar.setVelocityX(avatar.normalSpeed)); // Reset speed after 0.5s
        // } else {
        //     // If stop effect, stop the avatar
        //     avatar.sprite.setVelocityX(0);
        // }
    }
}
