export default class InputManager {
    constructor(scene) {
        this.scene = scene
        this.cursors = null;
        this.actionKey1 = null;
        this.actionKey2 = null;
        this.specialKey1 = null;
        this.specialKey2 = null;
        this.modeKey = null;
        this.gamepad = null;

        // Flags for mouse/touch
        this.isLeftMouseDown = false;
        this.isRightMouseDown = false;
        this.isSingleTap = false;
        this.isDoubleTap = false;

        this.lastTapTime = 0; // For detecting double-tap

        // Swipe properties
        this.swipeStart = null;
        this.swipeEnd = null;
        this.swipeDirection = null;
        this.swipeThreshold = 50; // Minimum distance for a swipe
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

        // Mouse click listeners
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isLeftMouseDown = true;
            }
            if (pointer.rightButtonDown()) {
                this.isRightMouseDown = true;
            }

            // Start tracking swipe
            this.swipeStart = { x: pointer.x, y: pointer.y };

            // Check for double-tap
            const currentTime = this.scene.time.now;
            if (currentTime - this.lastTapTime < 500) { // 300ms threshold for double-tap
                this.isDoubleTap = true;
            } else {
                this.isSingleTap = true;
            }
            this.lastTapTime = currentTime;
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased()) {
                this.isLeftMouseDown = false;
            }
            if (pointer.rightButtonReleased()) {
                this.isRightMouseDown = false;
            }

            // Detect swipe direction
            if (this.swipeStart) {
                this.swipeEnd = { x: pointer.x, y: pointer.y };
                this.detectSwipe();
            }

            // Reset single-tap/double-tap flags after releasing
            this.isSingleTap = false;
            this.isDoubleTap = false;

            // Reset swipe data
            this.swipeStart = null;
            this.swipeEnd = null;
        });
    }

    detectSwipe() {
        if (!this.swipeStart || !this.swipeEnd) return;

        const deltaX = this.swipeEnd.x - this.swipeStart.x;
        const deltaY = this.swipeEnd.y - this.swipeStart.y;

        if (Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                this.swipeDirection = deltaX > 0 ? 'right' : 'left';
            } else {
                // Vertical swipe
                this.swipeDirection = deltaY > 0 ? 'down' : 'up';
            }
        } else {
            this.swipeDirection = null; // Not a valid swipe
        }
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
            mode: this.modeKey && Phaser.Input.Keyboard.JustDown(this.modeKey),

            // Swipe-based actions
            swipeUp: this.swipeDirection === 'up',
            swipeDown: this.swipeDirection === 'down',
            swipeLeft: this.swipeDirection === 'left',
            swipeRight: this.swipeDirection === 'right'
        };

        // Mouse/Touch controls
        controls.jump = controls.jump || this.isSingleTap || this.isLeftMouseDown
        controls.action2 = controls.action2 || this.isDoubleTap || this.isRightMouseDown


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

        // Reset swipe direction after processing
        this.swipeDirection = null;

        return controls;
    }
}
