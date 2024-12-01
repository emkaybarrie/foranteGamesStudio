export default class InputManager {
    constructor(scene) {
        this.scene = scene
        this.cursors = null;
        this.attackKey = null;
        this.defendKey = null;
        this.gamepad = null;
    }

    setupControls() {
        // Set up arrow keys and space key
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        // Set up additional keys for attack and defend
        this.actionKey1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.actionKey2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.specialKey1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.specialKey2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        this.modeKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Set up gamepad controls (if needed)
        this.scene.input.gamepad.once('connected', (pad) => {
            this.gamepad = pad;
        });
    }

    update() {

        const controls = {
            left: this.cursors && this.cursors.left.isDown,
            right: this.cursors && this.cursors.right.isDown,
            up: this.cursors && this.cursors.up.isDown,
            down: this.cursors && this.cursors.down.isDown,
            jump: this.cursors && this.cursors.space.isDown,
            action1: this.actionKey1 && this.actionKey1.isDown, // Check for A key attack
            action2: this.actionKey2 && this.actionKey2.isDown, // Check for A key attack
            special1: this.specialKey1 && this.specialKey1.isDown, // Check for A key attack
            special2: this.specialKey2 && this.specialKey2.isDown, // Check for W key attack
            mode: this.modeKey && Phaser.Input.Keyboard.JustDown(this.modeKey)
        };

        return controls;


        // Handle gamepad controls if connected
        if (this.gamepad) {
            if (this.gamepad.A) {
                // Handle attack
            }
        }
    }
}
