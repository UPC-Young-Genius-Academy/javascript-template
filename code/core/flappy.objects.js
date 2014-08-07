function BackgroundInstance(y, height, parallaxSpeed, textureInfo, nextBackground) {
    var sprite = null;
    var position = 0;
    var instance = this;

    this.reset = function() {
        position = 0;
        RESOURCES.game.session.objects.push(this);
    };

    // Scrolls a background sprite based on it's parallax speed.
    this.update = function(dt) {
        position -= dt * parallaxSpeed;

        if (sprite == null) {
            return true;
        }

        sprite.tilePosition.x = position / sprite.tileScale.x;

        return true;
    };

    this.__createSprite = function() {
        var options = {
            tiling: { width: SETTINGS.rendering.width, height: height }
        };

        var callback = {
            onSpriteLoad: function(callbackSprite) {
                sprite = callbackSprite;

                sprite.tileScale.x = sprite.width / sprite.texture.width;
                sprite.tileScale.y = sprite.height / sprite.texture.height;
                sprite.tilePosition.x = 0;
                sprite.tilePosition.y = 0;

                sprite.position.y = y;

                RESOURCES.pixi.stage.addChild(sprite);
                RESOURCES.game.session.objects.push(instance);

                if (nextBackground != null) {
                    nextBackground.createInstance();
                }
            }
        };

        RESOURCES.loader.getSprite(textureInfo, callback, options);
    };

    this.__createSprite();
}

function ObstacleInstance(gap, initialPosition, width, velocity) {
    var sprites = null;

    this.position = initialPosition;
    this.next = null;

    // Moves an obstacle based on its speed.
    this.update = function(dt) {
        this.position -= dt * velocity;

        // Determine whether the obstacle has moved past the left side of the screen.
        if (this.position + width < 0) {
            var lastObstacleInstance = this.next;

            // Search for the current last obstacle.
            while (lastObstacleInstance.next != null) {
                lastObstacleInstance = lastObstacleInstance.next;
            }

            // Place this obstacle behind the last one.
            this.position = lastObstacleInstance.position + SETTINGS.obstacles.placement.spacing + width;

            // Mark this obstacle as the new last obstacle instance.
            lastObstacleInstance.next = this;
            this.next = null;
        }

        // Move the obstacle sprites if they are present. The sprites might not be immediately available
        // due to load delay.
        if (sprites != null) {
            if (sprites.top_opening) { sprites.top_opening.position.x = this.position; }
            if (sprites.top_tube) { sprites.top_tube.position.x = this.position; }
            if (sprites.bot_opening) { sprites.bot_opening.position.x = this.position; }
            if (sprites.bot_tube) { sprites.bot_tube.position.x = this.position; }
        }

        return true;
    }

    this.__createSprites = function() {
        sprites = {};

        var callback = {
            onSpriteLoad: function(callbackSprites) {
                sprites = callbackSprites;

                var gapTop = SETTINGS.rendering.height
                    - (SETTINGS.obstacles.gap.margin * 2 + SETTINGS.obstacles.gap.height);

                sprites.top_opening.height = SETTINGS.obstacles.placement.openingHeight;
                sprites.top_opening.tileScale.y *= sprites.top_opening.height;
                sprites.top_opening.tilePosition.y = 0;

                sprites.bot_opening.height = SETTINGS.obstacles.placement.openingHeight;
                sprites.bot_opening.tileScale.y *= sprites.bot_opening.height;

                // Determining obstacle sprite verticle placement.
                sprites.top_opening.position.y = gapTop - sprites.top_opening.height;
                sprites.top_tube.position.y = 0;
                sprites.top_tube.height = sprites.top_opening.position.y - 30;
                sprites.top_tube.tileScale.y *= sprites.top_tube.height;

                sprites.bot_opening.position.y = gapTop + SETTINGS.obstacles.gap.height;
                sprites.bot_tube.position.y = sprites.bot_opening.position.y + sprites.bot_opening.height;
                //sprites.bot_tube.height = SETTINGS.rendering.height - sprites.bot_tube.position.y;
                sprites.bot_tube.tileScale.y *= sprites.bot_tube.height;

                RESOURCES.pixi.stage.addChild(sprites.top_opening);
                RESOURCES.pixi.stage.addChild(sprites.top_tube);
                RESOURCES.pixi.stage.addChild(sprites.bot_opening);
                RESOURCES.pixi.stage.addChild(sprites.bot_tube);
            }
        };

        var options = {
            noCache: true,
            tiling: {
                width: SETTINGS.obstacles.placement.width,
                height: 1
            }
        };

        RESOURCES.loader.getSprite(SETTINGS.textures.obstacle, callback, options);
    }

    this.__createSprites();
}