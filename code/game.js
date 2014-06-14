function FlappyGame() {
    var INITIAL_GRAVITY = { enabled: false, amount: 150 };
    var SPEED_LIMIT = { maxFall: 250, maxLift: 150, lift: 300 };

    this.author = "Update the code to place your name here!";

    this.createBackground = function(engine){
        createBackgroundParallax(engine);
    };

    this.createCharacter = function(engine) {
        var CHICKEN_URL = "content/bird.png";

        this.chickenSprite = engine.spriteFromImage(CHICKEN_URL, RECT.createFromCenterOf(engine.viewport, 32, 32));
        this.chickenSprite.velocity = VECTOR.create(0, 0);
    };

    this.constructLevel = function(levelBuilder) {
        constructLevel(levelBuilder);
    };

    this.reset = function() {
        this.gravity = { enabled: INITIAL_GRAVITY.enabled, amount: INITIAL_GRAVITY.amount };
    };

    this.onFlap = function() {
        if (this.gravity.enabled && this.chickenSprite) {
            this.chickenSprite.velocity.y = Math.max(-SPEED_LIMIT.maxLift, this.chickenSprite.velocity.y - SPEED_LIMIT.lift);
        }

        this.gravity.enabled = true;
    };

    this.update = function(elapsedSecs) {
        if (this.gravity.enabled && this.chickenSprite) {
            this.chickenSprite.position.y += this.chickenSprite.velocity.y * elapsedSecs;
            this.chickenSprite.velocity.y = Math.min(SPEED_LIMIT.maxFall, this.chickenSprite.velocity.y + this.gravity.amount * elapsedSecs);
        }
    };

    this.increaseScore = function(amount) {
    };

    this.reset();
}

function createBackgroundParallax(engine) {
    engine.parallaxSpriteFromImage("content/distantClouds.png", RECT.create(0, 0, null, 80), null, VECTOR.forParallax(30));
    engine.parallaxSpriteFromImage("content/nearClouds.png", RECT.create(0, 20, null, 80), null, VECTOR.forParallax(45));
    engine.parallaxSpriteFromImage("content/distantMountains.png", RECT.create(0, -240, null, 200), null, VECTOR.forParallax(22));
    engine.parallaxSpriteFromImage("content/nearMountains.png", RECT.create(0, -300, null, 260), null, VECTOR.forParallax(55));
    engine.parallaxSpriteFromImage("content/ground.png", RECT.create(0, -40, null, 40), null, VECTOR.forParallax(90));
}

function constructLevel(levelBuilder) {
    levelBuilder.obstacleSpeed = 90;
    levelBuilder.addObstacle(0);
    levelBuilder.addObstacle(100);
}