var SETTINGS = {
    author: "Replace this setting value with your name [in code/game/settings.js]",

    rendering: {
        width: 640,
        height: 480,
        background: {
            color: 0x659CEF
        }
    },

    obstacles: {
        velocity: 100,
        placement: {
            width: 64,
            spacing: 192,
            openingHeight: 20
        },
        gap: {
            margin: 100,
            height: 120
        }
    },

    textures: {
        // Background textures
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

        // Player textur
        player: {
            url: "content/bird.png"
        },

        // Obstacle texture
        obstacle: {
            url: "content/obstacle.png",
            spriteRegions: {
                top_opening: { x: 0, y: 0, width: 128, height: 96 },
                top_tube: { x: 0, y:96, width: 128, height: 160 },
                bot_opening: { x: 0, y: 0, width: 128, height: 96 },
                bot_tube: { x: 0, y:96, width: 128, height: 160 }
            }
        }
    }
};