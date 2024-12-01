export default class CameraManager {
    constructor(scene, stageManager) {
        this.scene = scene
        this.mainCamera = this.scene.cameras.main
        this.stageManager = stageManager

        // Camera follow parameters
        this.cameraLagX = 0.25;       // X-axis smooth follow lag
        this.parallaxFactor = 2;   // Factor to simulate parallax on X-axis
        this.baseZoom = 1//1.75;           // Base zoom level
        this.zoomOutLevel1 = 1 //1.25;      // Zoom level when avatar is landing
        this.zoomOutLevel2 = 1;      // Zoom level when avatar is landing
        this.zoomSpeed = 0.01;       // Speed of zoom adjustment

        this.mainCamera.startFollow(this.stageManager.avatarManager.sprite);

        // Optionally set camera bounds to match the game world size
        //this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
        this.mainCamera.setBounds(0, 0, this.scene.physics.world.bounds.width, this.scene.physics.world.bounds.height);
        // Set the initial zoom level
        this.mainCamera.setZoom(1); // Start zoomed out (adjust as needed)



    }


    update() {

        if (this.stageManager.avatarManager.mode == 0){
        // Smooth follow effect on X-axis with parallax adjustment
        const targetX = this.stageManager.avatarManager.sprite.x - (this.mainCamera.width / 2) * this.mainCamera.zoom;
        this.mainCamera.scrollX += (targetX * this.parallaxFactor - this.mainCamera.scrollX) * this.cameraLagX;

        // Determine if zoom should be applied based on avatar’s state (e.g., in the air, near platform)

        if (this.stageManager.avatarManager.sprite.y < 450) {
            // Gradually zoom in
            this.mainCamera.zoom = Phaser.Math.Interpolation.Linear([this.mainCamera.zoom, this.zoomOutLevel2], this.zoomSpeed);
        } else
        if (this.stageManager.avatarManager.sprite.y < 600) {
            // Gradually zoom in
            this.mainCamera.zoom = Phaser.Math.Interpolation.Linear([this.mainCamera.zoom, this.zoomOutLevel1], this.zoomSpeed);
        } else {
            // Gradually reset to base zoom
            this.mainCamera.zoom = Phaser.Math.Interpolation.Linear([this.mainCamera.zoom, this.baseZoom], this.zoomSpeed);
        }
        }
    }
}
