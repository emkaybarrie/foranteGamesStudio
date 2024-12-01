export default class EnvironmentManager {
    constructor(scene, stageManager) {

        // Initialize stage elements here
        this.scene = scene; // Reference to the Phaser scene
        this.stageManager = stageManager
        this.stageConfig = this.stageManager.stageConfig
        //this.baseSpeed = this.stageConfig.baseSpeed;

        this.layers = [];   // Array to hold generated layers

        // Load Stage Background
        console.log("Loading Stage Background using following Stage Config:", this.stageManager.stageConfig); // Log the configuration to the console
        this.loadBackgroundTextures(this.stageConfig.regionId, this.stageConfig.areaId, this.stageConfig.routeId, this.stageConfig.numberOfLayers, this.stageConfig.parallaxSpeeds)


    }

    

    // Backgrounds
    // Generate stage layers based on input parameters
    loadBackgroundTextures(regionId, areaId, routeId, numberOfLayers, parallaxSpeeds) {
        console.log('Region: ' + regionId)
        // Clear existing layers if any
        this.layers.forEach(layer => layer.destroy());
        this.layers = [];

        // Calculate screen width and height to scale the images accordingly
        const { width, height } = this.scene.scale;

        // Loop through the number of layers to generate
        for (let layerNumber = 1; layerNumber <= numberOfLayers; layerNumber++) {
            // Construct the path to the image
            const layerPath = `assets/stages/region_${String(regionId).padStart(2, '0')}/area_${String(areaId).padStart(2, '0')}/route_${String(routeId).padStart(2, '0')}/stageBGs/BG_${String(layerNumber).padStart(2, '0')}-${String(regionId).padStart(2, '0')}-${String(areaId).padStart(2, '0')}-${String(routeId).padStart(2, '0')}.png`;

            // Load the image dynamically
            this.scene.load.image(`stage_BGlayer_${layerNumber}`, layerPath);
        }

        // Ensure assets are loaded, then add them to the scene
        this.scene.load.once('complete', () => {
            for (let layerNumber = numberOfLayers; layerNumber > 0; layerNumber--) {
                // Add the loaded image as a game object in the scene
                const layer = this.scene.add.tileSprite(0, 0, width, height, `stage_BGlayer_${layerNumber}`);
                layer.setOrigin(0, 0);   // Set origin to top-left corner
                layer.setDisplaySize(width, height);  // Scale to screen size

                // Store each layer in the layers array for potential future reference
                this.layers.push(layer);
            }
        });

        // Start loading the assets
        this.scene.load.start();

        this.initiateParallaxEffect(parallaxSpeeds)
    }

        // Parallax function to set varying speeds for each layer
        initiateParallaxEffect(parallaxSpeeds) {
            this.parallaxSpeeds = parallaxSpeeds.slice().reverse();

            // Register the update event for parallax scrolling
            this.scene.events.on('update', this.updateParallax, this);
        }

        // Update function for applying the parallax effect to each layer
        updateParallax() {

            this.layers.forEach((layer, index) => {
                const speedFactor = this.parallaxSpeeds[index] || 0; // Default to 1 if not provided
                layer.tilePositionX += this.stageManager.baseSpeed * speedFactor;

            });
        }
    
}
