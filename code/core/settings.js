var SETTINGS = {
    // Defines the author name text displayed in the HUD.
    author: "Replace SETTINGS.author with your name in code/game/settings.js",

    player: {
        // Defines the player's width in pixels.
        width: 32,
        // Defines the player's height, in pixels.
        height: 32,
        // Defines the amount of gravity applied to the player, this value should be negative.
        gravity: -100,
        // Defines the amount of lift generated during a flap, this value should be positive.
        lift: 140,
        // Defines the player's maximum speed.
        speedLimit: 220
    },

    rendering: {
        // Defines the stage's rendering width.
        width: 640,
        // Defines the stage's rendering height.
        height: 480,
        background: {
            // Defines the stage's background color.
            color: 0x659CEF,
            // Defines the stage's background color after game over.
            gameOverColor: 0x222222
        }
    },

    obstacles: {
        // Defines the speed of the pipe obstacle scrolling. This should be the same as the ground speed.
        velocity: 85,
        placement: {
            // Defines the pipe width.
            width: 64,
            // Defines the horizontal distance between pipes.
            spacing: 248,
            // Defines the size of the obstacles head.
            openingHeight: 20
        },
        gap: {
            // Defines the obstacle's minimum distance from the top and bottom.
            margin: 64,
            // Defines the size of the gap between top and bottom pipe.
            height: 120
        }
    },

    textures: {
        // Defines background textures.
        distantClouds: {
            url: "content/distantClouds.png"
        },
        nearClouds: {
            url: "content/nearClouds.png"
        },
        distantMountains: {
            url: "content/distantMountains.png"
        },
        nearMountains: {
            url: "content/nearMountains.png"
        },
        ground: {
            url: "content/ground.png"
        },

        // Defines the player texture.
        player: {
            url: "content/bird.png"
        },

        // Defines the obstacle texture.
        obstacle: {
            url: "content/obstacle.png",
            spriteRegions: {
                top_opening: { x: 0, y: 0, width: 128, height: 95 },
                top_tube: { x: 0, y: 96, width: 128, height: 160 },
                bot_opening: { x: 0, y: 0, width: 128, height: 95 },
                bot_tube: { x: 0, y: 96, width: 128, height: 160 }
            }
        }
    }
};