new FLAPPY.Background(  0,  80,  30, SETTINGS.textures.distantClouds);
new FLAPPY.Background( 20,  80,  45, SETTINGS.textures.nearClouds);
new FLAPPY.Background(220, 220,  22, SETTINGS.textures.distantMountains);
new FLAPPY.Background(160, 280,  55, SETTINGS.textures.nearMountains);
new FLAPPY.Background(440,  40,  80, SETTINGS.textures.ground);

new FLAPPY.Player(KEYS.A);

new FLAPPY.Obstacle(0);
new FLAPPY.Obstacle(100);

FLAPPY.initialize();