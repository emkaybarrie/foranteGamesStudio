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

        


        // Handle gamepad controls if connected
        if (this.gamepad) {
            // Joystick for movement
            const leftStickX = this.gamepad.axes[0] ? this.gamepad.axes[0].getValue() : 0;
            const leftStickY = this.gamepad.axes[1] ? this.gamepad.axes[1].getValue() : 0;

            controls.left = leftStickX < -0.5; // Tilt joystick left
            controls.right = leftStickX > 0.5; // Tilt joystick right
            controls.up = leftStickY < -0.75; // Tilt joystick up
            controls.down = leftStickY > 0.75; // Tilt joystick down

            // Buttons for actions
            controls.jump = this.gamepad.buttons[0] && this.gamepad.buttons[0].pressed; // A button
            controls.action1 = this.gamepad.buttons[5] && this.gamepad.buttons[5].pressed; // Right bumper
            controls.action2 = this.gamepad.buttons[4] && this.gamepad.buttons[4].pressed; // Left bumper
            controls.special1 = this.gamepad.buttons[7] && this.gamepad.buttons[7].pressed; // Right trigger
            controls.special2 = this.gamepad.buttons[6] && this.gamepad.buttons[6].pressed; // Left trigger

            
        }

        return controls;
    }
}
