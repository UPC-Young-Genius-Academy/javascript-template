function BackgroundInstance(y, height, parallaxSpeed, textureInfo, nextBackground) {
    var sprite = null;
    var position = 0;
    var instance = this;
    var fade = 0;

    this.reset = function() {
        position = 0;
        RESOURCES.game.session.objects.push(this);
    };

    // Scrolls a background sprite based on it's parallax speed.
    this.update = function(dt) {
        if (RESOURCES.game.session.state != STATE.GAME_OVER) {
            position -= dt * parallaxSpeed;
        }
        else {
            fade = Math.min(1, fade + dt * 0.33);

            position -= dt * parallaxSpeed * (1 - fade * fade);

            sprite.tint = this.__lerp(
                0xFFFFFF,
                SETTINGS.rendering.background.gameOverColor,
                fade * fade
            );

            RESOURCES.pixi.stage.setBackgroundColor(this.__lerp(
                SETTINGS.rendering.background.color,
                SETTINGS.rendering.background.gameOverColor,
                fade * fade));
        }

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
                sprite.tileScale.y = (sprite.height + 1) / sprite.texture.height;
                sprite.tilePosition.x = 0;
                sprite.tilePosition.y = -1;

                sprite.position.y = y;

                RESOURCES.pixi.stage.addChild(sprite);

                if (nextBackground != null) {
                    nextBackground.createInstance();
                }
            }
        };

        RESOURCES.loader.getSprite(textureInfo, callback, options);
    };

    this.__lerp = function(start, finish, s) {
        s = Math.max(0, Math.min(1, s || 0));

        var r = ((finish & 0xFF0000) >> 16) * s + ((start & 0xFF0000) >> 16) * (1 - s);
        var g = ((finish & 0xFF00) >> 8) * s + ((start & 0xFF00) >> 8) * (1 - s);
        var b = (finish & 0xFF) * s + (start & 0xFF) * (1 - s);

        return (r << 16) + (g << 8) + b;
    };

    this.__createSprite();
}

function PlayerInstance(player) {
    var sprite = null;

    this.position = {
        x: (SETTINGS.rendering.width - SETTINGS.player.width) / 2,
        y: (SETTINGS.rendering.height - SETTINGS.player.height) / 2,
        w: SETTINGS.player.width,
        h: SETTINGS.player.height
    };

    this.velocity = {
        x: 0,
        y: 0
    };

    this.update = function(dt) {
        if (RESOURCES.game.session.state != STATE.READY) {
            this.position.x += this.velocity.x * dt;
            this.position.y += this.velocity.y * dt;

            if (this.position.y > SETTINGS.player.speedLimit) {
            }

            this.velocity.y -= SETTINGS.player.gravity * dt;

            this.velocity.y = Math.max(Math.min(this.velocity.y, SETTINGS.player.speedLimit), -SETTINGS.player.speedLimit);


        }

        if (RESOURCES.game.session.state == STATE.RUNNING) {
            for (var collider in RESOURCES.game.session.colliders) {
                if (RESOURCES.game.session.colliders[collider].hasCollision(this.position)) {
                    this.velocity.y = 0;
                    FLAPPY.gameOver();
                }
            }
        }

        if (sprite != null) {
            sprite.position.x = this.position.x;
            sprite.position.y = this.position.y;
        }

        return true;
    }

    this.pressed = function(pressedKey) {
        if (RESOURCES.game.session.state == STATE.RUNNING) {
            this.velocity.y -= SETTINGS.player.lift;
        }
    }

    this.__createSprite = function() {
        var callback = {
            onSpriteLoad: function(callbackSprite) {
                sprite = callbackSprite;

                sprite.position.y = 0;
                sprite.position.x = 0;
                sprite.width = SETTINGS.player.width;
                sprite.height = SETTINGS.player.height;

                sprite.tint = player.tint || 0xFFFFFF;

                RESOURCES.pixi.stage.addChild(sprite);
            }
        };

        RESOURCES.loader.getSprite(SETTINGS.textures.player, callback);
    }

    this.__createSprite();

    RESOURCES.game.session.bindings[player.key] = this;
}

function ObstacleInstance(gap, initialPosition, width, velocity) {
    var sprites = null;

    this.position = initialPosition;
    this.next = null;
    this.canScore = true;
    this.bounds = {
        gapTop: 0,
        gapBottom: 0,
    };

    // Moves an obstacle based on its speed.
    this.update = function(dt) {
        if (RESOURCES.game.session.state == STATE.RUNNING) {
            this.position -= dt * velocity;

            // Update score if obstacle passes player.
            if (this.canScore && ((this.position + width) < ((SETTINGS.rendering.width - SETTINGS.player.width) / 2))) {
                this.canScore = false;
                RESOURCES.game.session.score++;
                RESOURCES.game.soundFX.score.play();
            }

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
                this.canScore = true;
            }
        }

        // Move obstacle sprites into place if they are present.
        if (sprites != null) {
            if (sprites.top_opening) { sprites.top_opening.position.x = this.position; }
            if (sprites.top_tube) { sprites.top_tube.position.x = this.position; }
            if (sprites.bot_opening) { sprites.bot_opening.position.x = this.position; }
            if (sprites.bot_tube) { sprites.bot_tube.position.x = this.position; }
        }

        return true;
    }

    this.hasCollision = function(rect) {
        return !(
            (rect.x > this.position + width) ||
            (rect.x + rect.w < this.position) ||
            ((rect.y > this.bounds.gapTop) && (rect.y + rect.h < this.bounds.gapBottom)));
    }

    this.__createSprites = function() {
        var instance = this;

        sprites = {};

        var callback = {
            onSpriteLoad: function(callbackSprites) {
                sprites = callbackSprites;

                var gapSpan = SETTINGS.rendering.height
                    - (SETTINGS.obstacles.gap.margin * 2 + SETTINGS.obstacles.gap.height);

                instance.bounds.gapTop = (gap / 100.0) * gapSpan + SETTINGS.obstacles.gap.margin;
                instance.bounds.gapBottom = instance.bounds.gapTop + SETTINGS.obstacles.gap.height;

                sprites.top_opening.height = SETTINGS.obstacles.placement.openingHeight;
                sprites.top_opening.tileScale.y *= sprites.top_opening.height;
                sprites.top_opening.tilePosition.y = 0;

                sprites.bot_opening.height = SETTINGS.obstacles.placement.openingHeight;
                sprites.bot_opening.tileScale.y *= sprites.bot_opening.height;

                // Determining obstacle sprite verticle placement.
                sprites.top_opening.position.y = instance.bounds.gapTop - sprites.top_opening.height;
                sprites.top_tube.position.y = 0;
                sprites.top_tube.height = sprites.top_opening.position.y;
                sprites.top_tube.tileScale.y *= sprites.top_tube.height;

                sprites.bot_opening.position.y = instance.bounds.gapBottom;
                sprites.bot_tube.position.y = sprites.bot_opening.position.y + sprites.bot_opening.height;
                sprites.bot_tube.height = SETTINGS.rendering.height - sprites.bot_tube.position.y;
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