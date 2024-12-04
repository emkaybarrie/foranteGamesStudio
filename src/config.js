export const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2000 },
            fps: 60,
            debug: false,
        },
    },
    input: {
        keyboard: true,
        gamepad: true,
    },
};
