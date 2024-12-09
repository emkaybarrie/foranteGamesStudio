export default class EnemyManager {
    constructor(scene, stageManager) {
        this.scene = scene;
        this.stageManager = stageManager
        this.enemyGroups = this.stageManager.enemyGroups


    }


    addEnemy(x, y, elevation = 'ground', texture = 'enemy', options = {}) {
        const enemy = this.scene.physics.add.sprite(x, y - 50, texture).setOrigin(0, 1);

        // Add Terrain to Terrain group in Stage Manager
        this.enemyGroups[elevation].add(enemy);


        // Set physics properties
        //enemy.body.setImmovable(true);
        enemy.body.allowGravity = true;
        enemy.elevation = elevation; // Store platform type on the platform object for easy identification

        enemy.setDepth(5)
                .setScale(0.15)
                .setSize(enemy.width, enemy.height * 0.8)
                .setTint();


        // Initialize custom properties
        enemy.id = Phaser.Utils.String.UUID()
        // loot.passThrough = options.passThrough || false;
        // loot.slowDownEffect = options.slowDownEffect || false;
        // loot.stopEffect = options.stopEffect || false;
        

        if(Phaser.Math.Between(1, 10) == 1){
            enemy.type = 'elite'
            enemy.setTint()
            enemy.setTexture('enemy2')
            enemy.setScale(0.4)
        } else if(Phaser.Math.Between(1, 5) == 1){
            enemy.type = 'chaser'
            enemy.setTint(0x0000FF)
        } else if(Phaser.Math.Between(1, 3) == 1){
            enemy.type = 'jumper'
            enemy.setTint(0x00FF00)
        }

        enemy.jumpPower = Phaser.Math.Between(500, 1250)
   

        //console.log("Enemy Created: " + enemy.id)

        
    }

    

    enemyCollision(avatar, enemy){
        avatar.takeHit(75)
        //console.log('Avatar collided with Enemy')

     
    }

    update() {
        Object.keys(this.enemyGroups).forEach(elevation => {
            const group = this.enemyGroups[elevation];

            group.getChildren().forEach(enemy => {
                enemy.x -= this.stageManager.baseSpeed;

                // if (terrain.isSequenceEnd && terrain.x < this.scene.scale.width && !terrain.triggeredNewSequence){
                //     console.log(`Generating new ${terrain.elevation} terrain sequence`);
                //     terrain.triggeredNewSequence = true

                //     this.generateTerrainSequence(terrain.x + terrain.displayWidth, elevation)
                // }

                if (enemy.x < -enemy.displayWidth){
                    enemy.destroy();
                    //console.log(`Destroying ${enemy.elevation} enemy`);
                } else {
                    
                    if(enemy.body.touching.down && enemy.type == 'jumper'){
                        enemy.setVelocityY(-enemy.jumpPower)
                    }

                    if(enemy.type == 'chaser'){
                    if (enemy.x < this.stageManager.avatarManager.sprite.x - 150){
                        enemy.flipX = true
                        enemy.setVelocityX(550 + (this.stageManager.addedSpeed * 1.5))
                    } else if (enemy.x > this.stageManager.avatarManager.sprite.x + 150 && enemy.x < this.stageManager.avatarManager.sprite.x + 500){
                        enemy.setVelocityX(-550 - (this.stageManager.addedSpeed * 0.5))
                    }
                    }

                }
            });
        });

    }
}
