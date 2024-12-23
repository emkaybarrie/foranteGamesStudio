export default class CameraManager {
    constructor(scene, stageManager) {
        this.scene = scene
        this.mainCamera = this.scene.cameras.main
        this.stageManager = stageManager


        this.mainCamera.startFollow(this.stageManager.avatarManager.sprite);

        // Optionally set camera bounds to match the game world size
        //this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
        this.mainCamera.setBounds(0, 0, this.scene.physics.world.bounds.width, this.scene.physics.world.bounds.height);
        // Set the initial zoom level
        this.mainCamera.setZoom(1); // Start zoomed out (adjust as needed)



    }


    update() {

    }
}
