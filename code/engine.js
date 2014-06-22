function FlappyEngine(game) {
    var engine = this;

    // Schedules the next frame
    var nextFrame = function() {
        if (rendering) {
            requestAnimFrame(animate);
        }
    };

    var lastObstacleSprite = null;

    // Updates the sprites, i.e. applying scroll or movement operations.
    var updateSprites = function(elapsedSecs) {
        lastObstaclePosition = 0;

        for (i = 0; i < sprites.length; i++) {
            sprites[i].update(elapsedSecs);
        }
    };

    // Animates the current frame
    var animate = function() {
        var ELAPSED_TIME = 1 / 30.0;

        game.update(ELAPSED_TIME);
        updateSprites(ELAPSED_TIME);

        renderer.render(stage);
        nextFrame();
    };

    var addSprite = function(sprite) {
        sprites.push(sprite);
        stage.addChild(sprite);

        return sprite;
    }

    // Creates the object responsible for rendering the current stage
    var renderer = PIXI.autoDetectRenderer(800, 600);

    // The games stage, Flappy chicken only contains one stage
    var stage = new PIXI.Stage(0x659CEF, true);
    var sprites = [];
    var rendering = false;

    stage.interactive = true;
    stage.mousedown = stage.touchstart = function() {
        game.onFlap();
    }

    buildGameHud(game.author);
    buildGameView(renderer.view);

    this.viewport = RECT.create(0, 0, renderer.width, renderer.height);

    this.start = function() {
        if (rendering == false) {
            rendering = true;
            requestAnimFrame(animate);
        }
    }

    this.pause = function() {
        rendering = false;
    }

    this.createTexture = function(imageId) {
        var element = null;

        if (element = document.getElementById(imageId)) {
            var baseTexture = new PIXI.BaseTexture(element);
            return new PIXI.Texture(baseTexture);
        }
        else {
            return PIXI.Texture.fromImage(imageId);
        }
    }

    this.spriteFromImage = function(imageId, regionRect, textureRect) {
        var sprite = withPlacement(new PIXI.Sprite(this.createTexture(imageId)), regionRect);

        sprite.update = function(elapsedSecs) { };

        return addSprite(sprite);
    }

    this.obstacleSpriteFromImage = function(imageId, regionRects, textureRects, velocity) {
        var texture = this.createTexture(imageId);

        textureRects = {
            pipe: RECT.adjust(textureRects.pipe, RECT.createFromContainer(texture)),
            portal: RECT.adjust(textureRects.portal, RECT.createFromContainer(texture))
        };

        var sprites = {
            pipe: withPlacement(new PIXI.TilingSprite(texture, 1, 1), RECT.adjust(regionRects.pipe, this.viewport)),
            portal: withPlacement(new PIXI.TilingSprite(texture, 1, 1), RECT.adjust(regionRects.portal, this.viewport))
        };

        var region = regionRects.pipe;
        var tr = textureRects.pipe;

        sprites.pipe.tileScale.x = region.width / tr.width;
        sprites.pipe.tileScale.y = region.height / tr.height;
        sprites.pipe.tilePosition.x = tr.x;
        sprites.pipe.tilePosition.y = -tr.y;

        region = regionRects.portal;
        tr = textureRects.portal;

        sprites.portal.tileScale.x = region.width / tr.width;
        sprites.portal.tileScale.y = region.height / tr.height;
        sprites.portal.tilePosition.x = tr.x;
        sprites.portal.tilePosition.y = -tr.y;

        sprites.pipe.velocity = velocity;
        sprites.pipe.value = 1;

        sprites.portal.velocity = velocity;
        sprites.pipe.value = 1;

        var updateObstacle = function(obstacle, elapsedSecs) {
            var inView = obstacle.position.x <= engine.viewport.width;

            obstacle.position.x -= elapsedSecs * obstacle.velocity.x;
            obstacle.position.y -= elapsedSecs * obstacle.velocity.y;

            if (obstacle.value > 0 && obstacle.position.x < (engine.viewport.width - 32) / 2) {
                game.increaseScore(obstacle.value);
                obstacle.value = 0;
            }

            if (obstacle.representative && (inView ^ obstacle.position.x <= engine.viewport.width)) {
                engine.level.createNextObstacle();
            }

            if (obstacle.position.x < -obstacle.width) {
                if (obstacle.stage) {
                    obstacle.stage.removeChild(obstacle);

                    /* TODO: delete this element too (doing so here is inconvenient though given it will screw up loop iterations)
                             until resolved this will pose a small memory leak */
                }
            }
        };

        sprites.portal.update = function(elapsedSecs) { updateObstacle(this, elapsedSecs); }
        sprites.pipe.update = function(elapsedSecs) { updateObstacle(this, elapsedSecs); }

        lastObstacleSprite = sprites.pipe;

        addSprite(sprites.portal);
        addSprite(sprites.pipe);

        return sprites;
    }

    this.parallaxSpriteFromImage = function(imageId, regionRect, textureRect, scrollVelocity) {
        var texture = this.createTexture(imageId);

        if (!textureRect) {
            textureRect = RECT.create(0, 0, texture.width, texture.height);
        }

        // adjust sprite dimensions
        regionRect.width = !regionRect.width ? renderer.width : regionRect.width;
        regionRect.height = !regionRect.height ? renderer.height : regionRect.height;
        regionRect.x = regionRect.x < 0 ? renderer.width + regionRect.x : regionRect.x;
        regionRect.y = regionRect.y < 0 ? renderer.height + regionRect.y : regionRect.y;

        // adjust texture mapping dimensions
        textureRect.width = !textureRect.width ? texture.width : (textureRect.width < 0 ? texture.width + textureRect.width : textureRect.width);
        textureRect.height = !textureRect.height ? texture.height : (textureRect.height < 0 ? texture.height + textureRect.height : textureRect.height);
        textureRect.x = textureRect.x < 0 ? texture.width + textureRect.x : textureRect.x;
        textureRect.y = textureRect.y < 0 ? texture.height + textureRect.y : textureRect.y;

        // create and position the sprite
        var sprite = withPlacement(new PIXI.TilingSprite(texture, regionRect.width, regionRect.height), regionRect);

        // adjust the texture scaling properties based on the ratios between sprite and texture dimensions
        sprite.tileScale.x = regionRect.width / textureRect.width;
        sprite.tileScale.y = regionRect.height / textureRect.height;

        sprite.tilePosition.x = textureRect.x;
        sprite.tilePosition.y = -textureRect.y;

        // supply scrolling velocity
        sprite.scrollVelocity = { x: scrollVelocity.x, y: scrollVelocity.y };

        // TODO: factor this logic into a withScroll method
        sprite.update = function(elapsedSecs) {
            this.tilePosition.x -= elapsedSecs * this.scrollVelocity.x / this.tileScale.x;
            this.tilePosition.y -= elapsedSecs * this.scrollVelocity.y / this.tileScale.y;
        };

        return addSprite(sprite);
    }

    // Create the background using the game object
    if (game.createBackground) {
        game.createBackground(this);
    }

    // Create the game character (the flappy chicken)
    if (game.createCharacter) {
        game.createCharacter(this);
    }

    // Create the pipe obstacles
    if (game.constructLevel) {
        var levelBuilder = {
            obstacleTexture: "content/obstacle.png",
            obstacleMargin: { top: 100, bottom: 100 },
            obstaclePlacement: { width: 64, gap: { x: 192, y: 120 }, first: renderer.width + 32 },
            obstacles: [],
            obstacleSpeed: 10,
            addObstacle: function(position) {
                position = Math.min(100, Math.max(0, position));
                this.obstacles.push(position);
            }
        }

        game.constructLevel(levelBuilder);

        this.level = {
            index: 0,

            createNextObstacle: function() {
                var x = lastObstacleSprite
                    ? lastObstacleSprite.position.x + levelBuilder.obstaclePlacement.gap.x + levelBuilder.obstaclePlacement.width
                    : levelBuilder.obstaclePlacement.first;

                var portalHeight = {
                    top: Math.min(32, levelBuilder.obstacleMargin.top / 2),
                    bottom: Math.min(32, levelBuilder.obstacleMargin.bottom / 2)
                };

                var obstacleGapPlacement = levelBuilder.obstacles[this.index++ % levelBuilder.obstacles.length];
                var width = levelBuilder.obstaclePlacement.width;

                var obstacleGapRange = renderer.height - (levelBuilder.obstacleMargin.top
                    + levelBuilder.obstacleMargin.bottom
                    + levelBuilder.obstaclePlacement.gap.y);

                var openingTop = levelBuilder.obstacleMargin.top + (obstacleGapPlacement / 100.0) * obstacleGapRange;
                var openingBottom = openingTop + levelBuilder.obstaclePlacement.gap.y;

                var pipeHeight = {
                    top: openingTop - portalHeight.top,
                    bottom: renderer.height - (openingBottom + portalHeight.bottom)
                };

                var obstaclePositions = {
                    top: {
                        pipe: RECT.create(x, 0, width, pipeHeight.top),
                        portal: RECT.create(x, pipeHeight.top, width, portalHeight.top)
                    },
                    bottom: {
                        pipe: RECT.create(x, -pipeHeight.bottom, width, pipeHeight.bottom),
                        portal: RECT.create(x, -(pipeHeight.bottom + portalHeight.bottom), width, portalHeight.bottom)
                    },
                };

                var textureRegions = {
                    portal: RECT.create(0, -0, 256, 96),
                    pipe: RECT.create(0, 97, 256, 159)
                };

                var obstacleSpeed = VECTOR.forParallax(levelBuilder.obstacleSpeed);

                engine.obstacleSpriteFromImage(levelBuilder.obstacleTexture, obstaclePositions.top, textureRegions, obstacleSpeed).pipe.representative = true;
                engine.obstacleSpriteFromImage(levelBuilder.obstacleTexture, obstaclePositions.bottom, textureRegions, obstacleSpeed);
            }
        }

        this.level.createNextObstacle();
    }
}

function withPlacement(sprite, placementRect) {
    sprite.position.x = placementRect.x;
    sprite.position.y = placementRect.y;
    sprite.width = placementRect.width;
    sprite.height = placementRect.height;

    return sprite;
}

function createRect(x, y, width, height) {
    return {
        x: x,
        y: y,
        width: width,
        height: height
    };
}

function withClassName(element, className) {
    element.className = className;
    return element;
}

function withText(element, text) {
    element.appendChild(document.createTextNode(text));
    return element;
}

function withHtml(element, html) {
    element.innerHTML = html;
    return element;
}

function buildGameHud(studentName) {
    var gameHud = document.getElementById("gameHud");

    if (gameHud != null) {
        if (null == document.getElementById("gameTitle")) {
            gameHud.appendChild(withText(withClassName(document.createElement("H1"), "gameTitle"), "Flappy Chicken"));
        }

        if (null == document.getElementById("gameAuthor")) {
            gameHud.appendChild(withHtml(withClassName(document.createElement("H1"), "gameAuthor"), "Game Author: <b class='author'>" + studentName + "</b>"));
        }
    }
}

function buildGameView(view) {
    var gameRegion = document.getElementById("gameRegion");

    if (null != gameRegion) {
        if (null == document.getElementById("gameView")) {
            view.className = "gameView";
            view.id = "gameView";
            gameRegion.appendChild(view);
        }
    }
}