LoadingState = {};

LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
};

LoadingState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');

    this.game.load.image('background:0', 'images/background00.png');
    this.game.load.image('background:1', 'images/background01.png');
    this.game.load.image('ground', 'images/ground.png');
    
    this.game.load.image('column', 'images/column.png');
    this.game.load.image('plat1x1', 'images/plat1x1.png');
    this.game.load.image('plat1x2', 'images/plat1x2.png');
    this.game.load.image('plat1x3', 'images/plat1x3.png');
    this.game.load.image('plat1x6', 'images/plat1x6.png');
    this.game.load.image('plat1x9', 'images/plat1x9.png');
    this.game.load.image('plat2x2', 'images/plat2x2.png');
    this.game.load.image('plat4x1', 'images/plat4x1.png');
    this.game.load.image('plat2x1', 'images/plat2x1.png');
    this.game.load.image('plat8x1', 'images/plat8x1.png');
    this.game.load.image('plat12x1', 'images/plat12x1.png');
    this.game.load.image('climbWall', 'images/climbWall.png');
    
    this.game.load.image('enterToCage', 'images/enterToCage.png');
    this.game.load.image('block', 'images/block.png');
    this.game.load.image('rail', 'images/rail.png');

    this.game.load.image('icon:coin', 'images/coin_icon.png');
    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('key', 'images/key.png');
    this.game.load.image('frozenKey', 'images/frozen-key.png');
    
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('leftClimbWall', 'images/climb_wall.png');
    this.game.load.image('rightClimbWall', 'images/climb_wall.png');
    this.game.load.image('climbWallField', 'images/climbWallField.png');
    
    this.game.load.spritesheet('hero', 'images/hero1.png', 62, 50);
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 36, 20);
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('gates', 'images/gates.png', 102, 121);
    this.game.load.spritesheet('trigger', 'images/trigger.png', 39, 66);
    this.game.load.spritesheet('magicdoor', 'images/magic-door.png', 100, 150);
    this.game.load.spritesheet('frozendoor', 'images/frozen-door.png', 100, 143);
    this.game.load.spritesheet('spike', 'images/spikes.png', 39, 30);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 43, 60);
    this.game.load.spritesheet('icon:frozenKey', 'images/frozen-key_icon.png', 43, 60);

    this.game.load.audio('sfx:jump', 'audio/jump.mp3');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:key', 'audio/pickup-key.mp3');
    this.game.load.audio('sfx:frozenKey', 'audio/pickup-frozenKey.mp3');
    this.game.load.audio('sfx:enterToCage', 'audio/enter-to-cage.mp3');
    
    this.game.load.audio('music0', 'audio/bgm1.mp3');
    this.game.load.audio('music1', 'audio/bgm2.mp3');
    
    this.game.load.audio('sfx:boneArc', 'audio/bone-arc.mp3');
    this.game.load.audio('sfx:frozenArc', 'audio/frozen-arc.mp3');
    
    this.game.load.audio('sfx:spike', 'audio/spike.mp3');
    this.game.load.audio('sfx:block', 'audio/block.mp3');
    
};

LoadingState.create = function () {
    this.game.state.start('play', true, false, {level: 0});
};