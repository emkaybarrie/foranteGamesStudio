const preload = (scene) => {
    // Load images
    scene.load.image('titleScreen', 'assets/images/titleScreens/titleScreen_01.png');

    scene.load.image('prologue', 'assets/images/MainMenu/prologue.png');
    scene.load.image('story', 'assets/images/MainMenu/story.png');
    scene.load.image('explore_1', 'assets/images/MainMenu/explore_1.png');

    scene.load.image('gold', 'assets/images/gold.png');
    scene.load.image('enemy', 'assets/images/enemy.png');
    scene.load.image('enemy2', 'assets/images/enemy2.png');
    scene.load.image('dTerrainPlaceholder', 'assets/images/dTerrainPlaceholder.png');
    scene.load.image('ground_common', 'assets/images/ground_common.png');
    scene.load.image('ground_uncommon', 'assets/images/ground_uncommon.png');
    scene.load.image('low_common', 'assets/images/low_common.png');
    scene.load.image('low_uncommon', 'assets/images/low_uncommon.png');
    scene.load.image('medium_common', 'assets/images/medium_common.png');
    scene.load.image('medium_uncommon', 'assets/images/medium_uncommon.png');
    scene.load.image('high_common', 'assets/images/high_common.png');
    // Load Sprites

    // Load audio
    const musicList = {
        1:'142',
        2:'BlameBrett',
        3:'Francesca',
        4:'FromEden',
        5:'KingsSeason',
        6:'Spartacus',
        7:'StayCrunchy',
        8:'XylemUp',
    }
    scene.load.audio('backgroundMusic1', 'assets/music/placeholder_142.mp3');
    scene.load.audio('backgroundMusic2', 'assets/music/placeholder_BlameBrett.mp3');
    scene.load.audio('backgroundMusic3', 'assets/music/placeholder_Francesca.mp3');
    scene.load.audio('backgroundMusic4', 'assets/music/placeholder_FromEden.mp3');
    scene.load.audio('backgroundMusic5', 'assets/music/placeholder_KingsSeason.mp3');
    scene.load.audio('backgroundMusic6', 'assets/music/placeholder_Spartacus.mp3');
    scene.load.audio('backgroundMusic7', 'assets/music/placeholder_StayCrunchy.mp3');
    scene.load.audio('backgroundMusic8', 'assets/music/placeholder_XylemUp.mp3');
};

export default preload;                                                                                
