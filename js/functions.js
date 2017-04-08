// =============================================================================
// sprites
// =============================================================================

// hero sprite
function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);

    this.animations.add('stop', [0], 8, true);
    this.animations.add('run', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 8, true); // 8fps looped
    this.animations.add('sprint', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 16, true);
    this.animations.add('jump', [11, 12, 13, 14, 15], 8, true);
    this.animations.add('fall', [15]);
    this.animations.add('catching', [17, 18, 19, 20], 15, true);
    this.animations.add('down', [16], 8, true);
    
    // physic properties
    this.game.physics.enable(this);
    this.game.camera.follow(this, 2);
    this.body.collideWorldBounds = true;
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;


Hero.prototype.move = function (direction) {
    this.keys = this.game.input.keyboard.addKeys({
        V: Phaser.KeyCode.V
    });
    
    const SPEED = (this.keys.V.isDown) ? 300 : 200;
    this.body.velocity.x = direction * SPEED;
    
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
        Camera.x = this.scale.x;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
        Camera.y = this.scale.y;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 250;
    let canJump = this.body.touching.down && this.alive && !this.isFrozen;

    if (canJump || this.isBoosting) {
        this.body.velocity.y = -JUMP_SPEED;
        this.isBoosting = true;
    }

    return canJump;
};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.climb = function (side) {
    this.body.velocity.y = -350;
    
    const bounceX = (side === 'left') ? 350 : -350;
    
    this.timer = this.game.time.create(this.game);
    this.timer.add(300, function () {
        this.body.velocity.x = bounceX;
    }, this);
    this.timer.start();
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype._getAnimationName = function () {
    
    let name = 'stop'; // default animation
    let falling = true;

    this.keys = this.game.input.keyboard.addKeys({
        space: Phaser.KeyCode.SPACEBAR
    });
    
    // jumping
    if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
        
        if (this.keys.space.isDown) {
            name = 'catching';
        }
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

function Camera(map, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = map.cols * map.tsize - width;
    this.maxY = map.rows * map.tsize - height;
}

Camera.SPEED = 200; // pixels per second

Camera.prototype.move = function (delta, dirx, diry) {
    // move camera
    this.x += dirx * Camera.SPEED * delta;
    this.y += diry * Camera.SPEED * delta;
    // clamp values
    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));
};

function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    
    this.animations.play('crawl');
    
    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

function magicdoor(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'magicdoor');

    // anchor
    this.anchor.set(0.5);
    
    // animation
    this.animations.add('close', [0]);
    this.animations.add('open', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10);
    
    this.animations.play('close');
    
    // physic properties
    this.game.physics.enable(this);
    this.body.immovable = true;
    this.body.allowGravity = false;
}

magicdoor.prototype = Object.create(Phaser.Sprite.prototype);
magicdoor.prototype.constructor = magicdoor;

magicdoor.prototype.open = function () {
    this.body.enable = false;

    this.animations.play('open').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

function frozendoor(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'frozendoor');

    // anchor
    this.anchor.set(0.5);
    
    // animation
    this.animations.add('close', [0]);
    this.animations.add('open', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 8);
    
    this.animations.play('close');
    
    // physic properties
    this.game.physics.enable(this);
    this.body.immovable = true;
    this.body.allowGravity = false;
}

frozendoor.prototype = Object.create(Phaser.Sprite.prototype);
frozendoor.prototype.constructor = frozendoor;

frozendoor.prototype.open = function () {
    this.body.enable = false;

    this.animations.play('open').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

function spike(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spike');

    // anchor
    this.anchor.set(0.5);
    
    // animation
    this.animations.add('still', [0]);
    this.animations.add('activated', [1, 2], 5);
    this.animations.add('deactivated', [1, 0], 5);
    
    this.animations.play('still');
    
    // physic properties
    this.game.physics.enable(this);
    this.body.immovable = true;
    this.body.allowGravity = false;
}

spike.prototype = Object.create(Phaser.Sprite.prototype);
spike.prototype.constructor = spike;

spike.prototype.activate = function () {
    this.sfx = {
        spike: this.game.add.audio('sfx:spike')
    };
    
    this.animations.play('activated').onComplete.addOnce(function () {
        this.sfx.spike.play();
        this.animations.play('deactivated');
    }, this);
};

function block(game, x, y, speed) {
    Phaser.Sprite.call(this, game, x, y, 'block');

    // anchor
    this.anchor.set(0.5);
    
    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.allowGravity = false;
    
    // add a small 'up & down' animation via a tween
    this.y -= 10;
    this.game.add.tween(this)
        .to({y: this.y + 200}, speed, Phaser.Easing.Exponential.InOut)
        .yoyo(true)
        .loop()
        .start();
}

// inherit from Phaser.Sprite
block.prototype = Object.create(Phaser.Sprite.prototype);
block.prototype.constructor = block;

function gates(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'gates');

    // anchor
    this.anchor.set(0.5);
    
    // animation
    this.animations.add('closed', [0]);
    this.animations.add('open', [1, 2, 3], 5);
    this.animations.add('close', [3, 2, 1], 5);
    
    this.animations.play('closed');
    
    // physic properties
    this.game.physics.enable(this);
    this.body.immovable = true;
    this.body.allowGravity = false;
}

gates.prototype = Object.create(Phaser.Sprite.prototype);
gates.prototype.constructor = gates;

gates.prototype.open = function () {
    this.sfx = {
        gates_open: this.game.add.audio('sfx:gates_open')
    };
    
    this.animations.play('open').onComplete.addOnce(function () {
        this.sfx.gates_open.play();
    }, this);
};

gates.prototype.close = function () {
    this.sfx = {
        gates_close: this.game.add.audio('sfx:gates_close')
    };
    
    this.animations.play('close').onComplete.addOnce(function () {
        this.sfx.gates_close.play();
    }, this);
};

function trigger(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'trigger');

    // anchor
    this.anchor.setTo(0.5, 1);
    
    // animation
    this.animations.add('still', [0]);
    this.animations.add('activated', [1, 2, 3], 2);
    this.animations.add('returning', [3, 2, 1], 2);
    
    this.animations.play('closed');
    
    // physic properties
    this.game.physics.enable(this);
    this.body.immovable = true;
    this.body.allowGravity = false;
}

trigger.prototype = Object.create(Phaser.Sprite.prototype);
trigger.prototype.constructor = trigger;

trigger.prototype.activated = function () {
    this.sfx = {
        gates_open: this.game.add.audio('sfx:trigger_activate')
    };
    
    this.animations.play('activated').onComplete.addOnce(function () {
        this.sfx.gates_open.play();
    }, this);
};
    
trigger.prototype.deactivated = function () {
    this.sfx = {
        gates_open: this.game.add.audio('sfx:trigger_deactivate')
    };
    
    this.animations.play('returning').onComplete.addOnce(function () {
        this.sfx.gates_open.play();
    }, this);
};