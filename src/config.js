export const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 2000 },
            debug: false,
        },
    },
    input: {
        keyboard: true,
        gamepad: true,
    },
};
