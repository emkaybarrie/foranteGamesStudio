const preload = (scene) => {
    // Load images
    scene.load.image('titleScreenText1', 'assets/images/titleScreens/titleText_01.png');
    scene.load.image('titleScreenText2', 'assets/images/titleScreens/titleText_02.png');
    scene.load.image('titleScreenText3', 'assets/images/titleScreens/titleText_03.png');
    scene.load.image('titleScreenText4', 'assets/images/titleScreens/titleText_04.png');
    scene.load.image('titleScreenText5', 'assets/images/titleScreens/titleText_05.png');
    scene.load.image('titleScreenText6', 'assets/images/titleScreens/titleText_06.png');

    scene.load.image('titleScreen1', 'assets/images/titleScreens/titleScreen_01.png');
    scene.load.image('titleScreen2a', 'assets/images/titleScreens/titleScreen_02aFixed1.png');
    scene.load.image('titleScreen2b', 'assets/images/titleScreens/titleScreen_02aFixed2.png');
    scene.load.image('titleScreen2c', 'assets/images/titleScreens/titleScreen_02bFixed.png');


    

    scene.load.image('prologue', 'assets/images/MainMenu/prologue.png');
    scene.load.image('story0', 'assets/images/MainMenu/story.png');
    scene.load.image('story1', 'assets/images/MainMenu/story_01.png');
    scene.load.image('story2', 'assets/images/MainMenu/story_02.png');
    scene.load.image('story3', 'assets/images/MainMenu/story_03.png');
    scene.load.image('story4', 'assets/images/MainMenu/story_04.png');
    scene.load.image('story5', 'assets/images/MainMenu/story_05.png');
    scene.load.image('story6', 'assets/images/MainMenu/story_06.png');
    scene.load.image('story7', 'assets/images/MainMenu/story_07.png');
    scene.load.image('story8', 'assets/images/MainMenu/story_08.png');
    scene.load.image('story9', 'assets/images/MainMenu/story_09.png');
    scene.load.image('story10', 'assets/images/MainMenu/story_10.png');
    scene.load.image('story11', 'assets/images/MainMenu/story_11.png');
    scene.load.image('story12', 'assets/images/MainMenu/story_12.png');
    scene.load.image('story13', 'assets/images/MainMenu/story_13.png');
    scene.load.image('story14', 'assets/images/MainMenu/story_14.png');
    scene.load.image('explore_1', 'assets/images/MainMenu/explore_01.png');

    scene.load.image('city', 'assets/images/Base/city.png');
    scene.load.image('regionNorth', 'assets/images/Base/regionNorth.png');
    scene.load.image('regionSouth', 'assets/images/Base/regionSouth.png');
    scene.load.image('regionEast', 'assets/images/Base/regionEast.png');
    scene.load.image('regionWest', 'assets/images/Base/regionWest.png');

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
