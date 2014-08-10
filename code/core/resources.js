var STATE = {
    READY: "ready",
    RUNNING: "running",
    GAME_OVER: "game-over"
};

var RESOURCES = {
    pixi: {
        renderer: PIXI.autoDetectRenderer(SETTINGS.rendering.width, SETTINGS.rendering.height),
        stage: null
    },

    game: {
        soundFX: {
            score: new Audio("content/audio/score.ogg")
        },

        static: {
            obstacles: [],
            players: [],
            backgrounds: []
        },

        session: {
            state: STATE.READY,
            score: 0,
            objects: [],
            colliders: [],
            bindings: [],
        }
    },

    loader: {
        cache: {
            sprites: {}
        },

        getSprite: function(textureInfo, callback, options) {
            options = options || {};

            if (options.noCache && RESOURCES.loader.cache.sprites[textureInfo.url] != null) {
                callback.onSpriteLoad(RESOURCES.loader.cache.sprites[textureInfo.url]);
            }

            var loader = new PIXI.AssetLoader([textureInfo.url], false);

            loader.onComplete = function() {
                var texture = PIXI.Texture.fromImage(textureInfo.url);
                var result = null;

                if (textureInfo.spriteRegions == null) {
                    if (options.tiling == null) {
                        result = new PIXI.Sprite(texture);
                    }
                    else {
                        result = new PIXI.TilingSprite(texture, options.tiling.width, options.tiling.height);
                        result.texture = texture;
                    }
                }
                else {
                    result = {};

                    for (var spriteKey in textureInfo.spriteRegions) {
                        var region = textureInfo.spriteRegions[spriteKey];
                        var sprite = null;

                        if (options.tiling == null) {
                            sprite = new PIXI.Sprite(texture);
                        }
                        else {
                            sprite = new PIXI.TilingSprite(texture, options.tiling.width, options.tiling.height);
                            sprite.texture = texture;
                            sprite.tilePosition = { x: region.x, y: -region.y };
                            sprite.tileScale.x = options.tiling.width / region.width;
                            sprite.tileScale.y = options.tiling.height / region.height;
                        }

                        result[spriteKey] = sprite;
                    }
                }

                if (!options.noCache) {
                    // cache the result.
                    RESOURCES.loader.cache.sprites[textureInfo.url] = result;
                }

                // present the loaded sprite(s) to the caller.
                callback.onSpriteLoad(result);
            };

            loader.load();
        }
    }
};