PlayState = {};

var music;
var playMusic = false;
const LEVEL_COUNT = 3;

PlayState.init = function (data) {
    this.game.renderer.renderSession.roundPixels = true;

    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        space: Phaser.KeyCode.SPACEBAR,
        e: Phaser.KeyCode.E
    });
    
    this.coinPickupCount = 0;
    this.hasKey = false;
    this.hasFrozenKey = false;
    this.triggerFlag = false;
    
    this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState._createHud = function () {
    this.keyIcon = this.game.make.image(10, 35, 'icon:key');
    this.frozenKeyIcon = this.game.make.image(10, 35, 'icon:frozenKey');
    
    this.keyIcon.anchor.set(0, 0.5);
    this.frozenKeyIcon.anchor.set(0, 0);
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);
    
    let coinIcon = this.game.make.image(this.keyIcon.width + 30, 10, 'icon:coin');    
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width, coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);
    
    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.position.set(10, 10);
    this.hud.add(coinScoreImg);
    this.hud.add(this.frozenKeyIcon);
    this.hud.add(this.keyIcon);
    this.hud.fixedToCamera = true;
};

PlayState.create = function () {
    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp'),
        key: this.game.add.audio('sfx:key'),
        frozenKey: this.game.add.audio('sfx:frozenKey'),
        enterToCage: this.game.add.audio('sfx:enterToCage'),
        boneArc: this.game.add.audio('sfx:boneArc'),
        frozenArc: this.game.add.audio('sfx:frozenArc')
    };

    this.game.add.image(0, 0, `background:${this.level}`);
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
    this._createHud();
    
    this.music = this.game.add.audio(`music${this.level}`);
    this._onMusic(this.playMusic = true);
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
    this.coinFont.text = `x${this.coinPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
    this.frozenKeyIcon.frame = this.hasFrozenKey ? 1 : 0;
    
    if (this.triggerFlag) {
        this.timer = this.game.time.create(this.game);
        this.timer.add(2000, function () {
            this.triggerFlag = false;
        }, this);
        this.timer.start();
    }
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    
    this.game.physics.arcade.overlap(this.hero, this.gates, this._onHeroVsGates,
        function (hero, gates) {
            return this.triggerFlag;
        }, this);
    this.game.physics.arcade.collide(this.hero, this.gates);
    this.game.physics.arcade.overlap(this.hero, this.trigger, this._onHeroVsTrigger, null, this);
    
    this.game.physics.arcade.collide(this.hero, this.climbFields);
    
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    
    this.game.physics.arcade.collide(this.blocks, this.platforms);
    this.game.physics.arcade.overlap(this.hero, this.blocks, this._onHeroVsBlock, null, this);
    this.game.physics.arcade.overlap(this.hero, this.deathField, this._onHeroVsDeathField, null, this);
    this.game.physics.arcade.overlap(this.hero, this.leftClimbWalls, this._onHeroClimbLeft, null, this);
    this.game.physics.arcade.overlap(this.hero, this.rightClimbWalls, this._onHeroClimbRight, null, this);
    
    this.game.physics.arcade.overlap(this.hero, this.rightClimbWalls, this._onHeroClimbRight, null, this);
    
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
    this.game.physics.arcade.overlap(this.hero, this.spikes, this._onHeroVsSpikes, null, this);
    
    this.game.physics.arcade.overlap(this.hero, this.spiders, this._onHeroVsEnemy, null, this);
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this);
    this.game.physics.arcade.overlap(this.hero, this.frozenKey, this._onHeroVsFrozenKey, null, this);
    
    this.game.physics.arcade.overlap(this.hero, this.magicdoor, this._onHeroVsMagicDoor,
        function (hero, magicdoor) {
            return this.hasKey;
        }, this);
    this.game.physics.arcade.collide(this.hero, this.magicdoor);
    
    this.game.physics.arcade.overlap(this.hero, this.frozendoor, this._onHeroVsFrozenDoor,
        function (hero, frozendoor) {
            return this.hasFrozenKey;
        }, this);
    this.game.physics.arcade.collide(this.hero, this.frozendoor);
    
    this.game.physics.arcade.overlap(this.hero, this.enterToCage, this._onHeroVsEnterToCage, null, this);
};

PlayState._onHeroVsTrigger = function (hero, trigger) {
    if (this.keys.e.isDown) {
        trigger.activated();
        this.timer = this.game.time.create(this.game);
        this.timer.add(1000, function () {
            trigger.deactivated();
            this.triggerFlag = false;
        }, this);
        this.timer.start();
    }
};

PlayState._onHeroVsGates = function (hero, gates) {
    this.sfx.boneArc.play();
    gates.open();
};

PlayState._onHeroVsMagicDoor = function (hero, magicdoor) {
    this.sfx.boneArc.play();
    magicdoor.open();
};

PlayState._onHeroVsFrozenDoor = function (hero, frozendoor) {
    this.sfx.frozenArc.play();
    frozendoor.open();
};

PlayState._onHeroVsDeathField = function (hero, deathfield) {
    this._onMusic(this.playMusic = false);
    this.game.state.restart(true, false, {level: this.level});
};

PlayState._onHeroVsBlock = function (hero, block) {
    this._onMusic(this.playMusic = false);
    this.game.state.restart(true, false, {level: this.level});
};

PlayState._onHeroVsSpikes = function (hero, spike) {    
    this.timer = this.game.time.create(this.game);
    this.timer.add(200, function () {
        if (hero.body.velocity.x === 0 && hero.body.touching.down || hero.body.velocity.y === 0 && !hero.body.touching.down) {
            this._onMusic(this.playMusic = false);
            this.game.state.restart(true, false, {level: this.level});
        }
    }, this);
    this.timer.start();
    spike.activate();
};

PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce();
        enemy.die();
        this.sfx.stomp.play();
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
        this._onMusic(this.playMusic = false);
        this.game.state.restart(true, false, {level: this.level});
    }
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsFrozenKey = function (hero, frozenKey) {
    this.sfx.frozenKey.play();
    frozenKey.kill();
    this.hasFrozenKey = true;
};

PlayState._onHeroVsEnterToCage = function (hero, enterToCage) {
    this.sfx.enterToCage.play();
    this._onMusic(this.playMusic = false);
    this.game.state.restart(true, false, { level: this.level + 1 });
};

PlayState._onHeroClimbLeft = function (hero, climbWall) {
    if (this.keys.space.isDown) 
        hero.climb('left');
};

PlayState._onHeroClimbRight = function (hero, climbWall) {
    if (this.keys.space.isDown) 
        hero.climb('right');
};

PlayState._onMusic = function (playMusic) {
    if (playMusic) {
        this.music.play();
        this.music.loop = true;
    } else {
        this.music.stop();
    }
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }
    
    const JUMP_HOLD = 200; // ms
    if (this.keys.up.downDuration(JUMP_HOLD)) {
        let didJump = this.hero.jump();
        if (didJump) { this.sfx.jump.play(); }
    }
    else {
        this.hero.stopJumpBoost();
    }
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.leftClimbWalls = this.game.add.group();
    this.rightClimbWalls = this.game.add.group();
    this.bgDecoration = this.game.add.group();
    this.spikes = this.game.add.group();
    this.blocks = this.game.add.group();
    this.rails = this.game.add.group();
    this.climbFields = this.game.add.group();
    
    this.enemyWalls.visible = false;
//    this.leftClimbWalls.visible = false;
//    this.rightClimbWalls.visible = false;

    // spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);
    
     // spawn all spikes
    this._spawnSpikes({spike: data.spike});
    
    // spawn all spikes
    this._spawnBlocks({block: data.block});
    
    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    
    this._spawnDeathField(data.deathField.x, data.deathField.y);
    this._spawnEnterToCage(data.enterToCage.x, data.enterToCage.y);
    this._spawnKey(data.key.x, data.key.y);
    this._spawnFrozenKey(data.frozenKey.x, data.frozenKey.y);
    this._spawnMagicDoor(data.bonearc);
    this._spawnFrozenDoor(data.frozenarc);
    this._spawnGates(data.gates);
    this._spawnTrigger(data.trigger);
    
    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});
    
    // enable gravity
    const GRAVITY = 1700;
    this.game.physics.arcade.gravity.y = GRAVITY;
    this.game.world.setBounds(0, 0, 3388, 900);
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    console.log(platform);
    
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
    
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
    this._spawnLeftClimbWall(platform.x, platform.y + 15);
    this._spawnRightClimbWall(platform.x + sprite.width, platform.y + 15);
    
    if (platform.image === "climbWall" && platform.side === "left") {
        for (let i = 0; i < 3; i++) {
            this._spawnLeftClimbField(platform.x, platform.y + 20 + 150*i);
        }
    }
    
    if (platform.image === "climbWall" && platform.side === "right") {
        for (let i = 0; i < 3; i++) {
            this._spawnRightClimbField(platform.x + 25, platform.y + 100 + 170*i);
        }
    }
};

PlayState._spawnLeftClimbField = function (x, y) {
    let sprite = this.climbFields.create(x, y, 'plat1x1');
    // anchor and y displacement
    sprite.anchor.set(1, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
    
    this._spawnLeftClimbWall(sprite.x - sprite.width, sprite.y);
};

PlayState._spawnRightClimbField = function (x, y) {
    let sprite = this.climbFields.create(x, y, 'plat1x1');
    // anchor and y displacement
    sprite.anchor.set(0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
    
    this._spawnRightClimbWall(sprite.x + sprite.width, sprite.y);
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnGates = function (data) {
    this.gates = new gates(this.game, data.x, data.y);
    this.game.add.existing(this.gates);
};

PlayState._spawnTrigger = function (data) {
    this.trigger = new trigger(this.game, data.x, data.y);
    this.game.add.existing(this.trigger);
};

PlayState._spawnMagicDoor = function (data) {
    this.magicdoor = new magicdoor(this.game, data.x, data.y);
    this.game.add.existing(this.magicdoor);
};

PlayState._spawnFrozenDoor = function (data) {
    this.frozendoor = new frozendoor(this.game, data.x, data.y);
    this.game.add.existing(this.frozendoor);
};

PlayState._spawnSpikes = function (data) {
    data.spike.forEach(function (spikes) {
        let sprite = new spike(this.game, spikes.x, spikes.y);
        this.spikes.add(sprite);
    }, this);
};

PlayState._spawnBlocks = function (data) {
    data.block.forEach(function (blocks) {
        let sprite = new block(this.game, blocks.x, blocks.y, blocks.speed);
        this.blocks.add(sprite);
        this._spawnRail(blocks.x, blocks.y + 200);
    }, this);
};

PlayState._spawnRail = function (x, y) {
    let sprite = this.rails.create(x, y, 'rail');
    // anchor and y displacement
    sprite.anchor.set(1, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnLeftClimbWall = function (x, y, side) {
    let sprite = this.leftClimbWalls.create(x, y, 'leftClimbWall');
    // anchor and y displacement
    sprite.anchor.set(1, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnRightClimbWall = function (x, y) {
    let sprite = this.rightClimbWalls.create(x, y, 'rightClimbWall');
    // anchor and y displacement
    sprite.anchor.set(0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCharacters = function (data) {
    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
    
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
};

PlayState._spawnDeathField = function (x, y) {
    this.deathField = this.bgDecoration.create(x, y, 'ground');
    this.deathField.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.deathField);
    this.deathField.body.allowGravity = false;
    this.deathField.visible = false;
};

PlayState._spawnEnterToCage = function (x, y) {
    this.enterToCage = this.bgDecoration.create(x, y, 'enterToCage');
    this.enterToCage.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.enterToCage);
    this.enterToCage.body.allowGravity = false;
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    
    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();

};

PlayState._spawnFrozenKey = function (x, y) {
    this.frozenKey = this.bgDecoration.create(x, y, 'frozenKey');
    this.frozenKey.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.frozenKey);
    this.frozenKey.body.allowGravity = false;
    
    // add a small 'up & down' animation via a tween
    this.frozenKey.y -= 1;
    this.game.add.tween(this.frozenKey)
        .to({y: this.frozenKey.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();

};