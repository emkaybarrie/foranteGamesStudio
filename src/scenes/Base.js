export default class Base extends Phaser.Scene {
    constructor() {
        super('Base');
    }

    init(data) {
        console.log(data)

        this.playerData = data.dataPacket

        console.log(this.playerData.alias)
    }

    create() {
        this.add.text(400, 100, this.playerData.alias, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 150, 'Select a Region', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        
        const regions = ['Region 1', 'Region 2', 'Region 3', 'Region 4'];
        this.regionTexts = regions.map((region, index) => {
            return this.add.text(400, 200 + index * 40, region, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        });

        this.selectedRegion = 0;
        this.highlightRegion();

        this.input.keyboard.on('keydown-UP', () => this.selectRegion(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.selectRegion(1));
        this.input.keyboard.on('keydown-ENTER', () => this.startBadlands());
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('Start');
        });
    }

    highlightRegion() {
        this.regionTexts.forEach((text, index) => {
            text.setStyle({ fill: index === this.selectedRegion ? '#ff0' : '#fff' });
        });
    }

    selectRegion(direction) {
        this.selectedRegion = Phaser.Math.Wrap(this.selectedRegion + direction, 0, this.regionTexts.length);
        this.highlightRegion();
    }

    startBadlands() {
        this.scene.start('Badlands', { region: this.selectedRegion + 1, playerData: this.playerData });
    }
}
