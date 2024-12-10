export default class TouchControls {
    constructor(scene, inputManager) {
        this.scene = scene;
        this.inputManager = inputManager;
        this.buttons = {};
    }

    create() {
        // Detect if the game is running on mobile
        if (this.scene.sys.game.device.os.desktop) {
            const { width, height } = this.scene.scale;

            // Button size and spacing
            const buttonSize = Math.min(width, height) * 0.1;
            const padding = buttonSize * 0.2;

            // === D-PAD ===
            const dpadX = width * 0.15;
            const dpadY = height * 0.75;

            // Up
            this.createButton(dpadX, dpadY - buttonSize - padding, 'up', () => {
                this.inputManager.controls.up = true;
            }, () => {
                this.inputManager.controls.up = false;
            });

            // Down
            this.createButton(dpadX, dpadY + buttonSize + padding, 'down', () => {
                this.inputManager.controls.down = true;
            }, () => {
                this.inputManager.controls.down = false;
            });

            // Left
            this.createButton(dpadX - buttonSize - padding, dpadY, 'left', () => {
                this.inputManager.controls.left = true;
            }, () => {
                this.inputManager.controls.left = false;
            });

            // Right
            this.createButton(dpadX + buttonSize + padding, dpadY, 'right', () => {
                this.inputManager.controls.right = true;
            }, () => {
                this.inputManager.controls.right = false;
            });

            // === ACTION BUTTONS ===
            const actionX = width * 0.85;
            const actionY = height * 0.75;

            // Action buttons: A, B, X, Y
            this.createButton(actionX + buttonSize + padding, actionY, 'A', () => {
                this.inputManager.controls.action2 = true;
            }, () => {
                this.inputManager.controls.action2 = false;
            });

            this.createButton(actionX, actionY + buttonSize + padding, 'B', () => {
                this.inputManager.controls.action1 = true;
            }, () => {
                this.inputManager.controls.action1 = false;
            });

            this.createButton(actionX - buttonSize - padding, actionY, 'X', () => {
                this.inputManager.controls.special2 = true;
            }, () => {
                this.inputManager.controls.special2 = false;
            });

            this.createButton(actionX, actionY - buttonSize - padding, 'Y', () => {
                this.inputManager.controls.special1 = true;
            }, () => {
                this.inputManager.controls.special1 = false;
            });
        }
    }

    createButton(x, y, label, onPress, onRelease) {
        const size = Math.min(this.scene.scale.width, this.scene.scale.height) * 0.1;

        // Create button graphics (circle for simplicity)
        const button = this.scene.add.circle(x, y, size / 2, 0xffffff, 0.3);
        button.setStrokeStyle(2, 0x000000, 1);
        button.setDepth(9)

        // Button highlight behavior
        button.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                button.setFillStyle(0xffffff, 1);
                onPress();
            })
            .on('pointerup', () => {
                button.setFillStyle(0xffffff, 0.3);
                onRelease();
            })
            .on('pointerout', () => {
                button.setFillStyle(0xffffff, 0.3);
                onRelease();
            });

        // Add label text
        const text = this.scene.add.text(x, y, label, {
            font: `${size / 3}px Arial`,
            color: '#000',
        }).setOrigin(0.5);

        text.setDepth(9)

        // Store references for cleanup or updates
        this.buttons[label] = { button, text };
    }

    destroy() {
        // Destroy all buttons and labels
        Object.values(this.buttons).forEach(({ button, text }) => {
            button.destroy();
            text.destroy();
        });
        this.buttons = {};
    }
}
