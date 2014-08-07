/*
var GAME_GRAVITY_RATE = 150;

var GAME_SPEED_LIMIT = {
    maxFall: 250,
    maxLift: 150,
    lift: 300
};

var GAME_AUTHOR = "Update the code to place your name here!";
*/

new FLAPPY.Background(  0,  80,  30, SETTINGS.textures.distantClouds);
new FLAPPY.Background( 20,  80,  45, SETTINGS.textures.nearClouds);
new FLAPPY.Background(220, 220,  22, SETTINGS.textures.distantMountains);
new FLAPPY.Background(160, 280,  55, SETTINGS.textures.nearMountains);
new FLAPPY.Background(440,  40, 100, SETTINGS.textures.ground);
/*

new FLAPPY.Obstacle(0);
new FLAPPY.Obstacle(50);
new FLAPPY.Obstacle(100);

FLAPPY.ObstacleSpeed = 100;
*/

new FLAPPY.Obstacle(0);

FLAPPY.initialize();

/*
function createBackgroundParallax(engine) {
    engine.parallaxSpriteFromImage("content/distantClouds.png", RECT.forParallax(0, 80), VECTOR.forParallax(30));
    engine.parallaxSpriteFromImage("content/nearClouds.png", RECT.forParallax(20, 80), VECTOR.forParallax(45));
    engine.parallaxSpriteFromImage("content/distantMountains.png", RECT.forParallax(-240, 200), VECTOR.forParallax(22));
    engine.parallaxSpriteFromImage("content/nearMountains.png", RECT.forParallax(-300, 260), VECTOR.forParallax(55));
    engine.parallaxSpriteFromImage("content/ground.png", RECT.forParallax(-40, 40), VECTOR.forParallax(100));


}

function constructLevel(levelBuilder) {
    levelBuilder.obstacleSpeed = 100;
    levelBuilder.addObstacle(0);
    levelBuilder.addObstacle(50);
    levelBuilder.addObstacle(100);
}
*/