var FLAPPY = {
    Background: function(y, height, parallaxSpeed, textureInfo) {
        this.y = y;
        this.height = height;
        this.parallaxSpeed = parallaxSpeed;
        this.textureInfo = textureInfo;
        this.next = null;

        this.createInstance = function() {
            RESOURCES.game.session.objects.push(
                new BackgroundInstance(this.y, this.height, this.parallaxSpeed, this.textureInfo, this.next));
        }

        if (RESOURCES.game.static.backgrounds.length > 0) {
            RESOURCES.game.static.backgrounds[RESOURCES.game.static.backgrounds.length - 1].next = this;
        }

        RESOURCES.game.static.backgrounds.push(this);
    },

    Player: function(key, tint) {
        this.key = key;
        this.tint = tint;

        this.createInstance = function() {
            RESOURCES.game.session.objects.push(new PlayerInstance(this));
        }

        RESOURCES.game.static.players[0] = this;
    },

    Obstacle: function(gap) {
        this.gap = Math.max(Math.min(gap, 100), 0);

        RESOURCES.game.static.obstacles.push(this);
    },

    initialize: function() {
        RESOURCES.pixi.renderer.view.className = "viewport";

        $("#author").html(SETTINGS.author);
        $("#screen_container").append(RESOURCES.pixi.renderer.view);

        FLAPPY.reset();

        requestAnimFrame(FLAPPY.__animate);
    },

    reset: function() {
        // Remove all session objects.
        RESOURCES.game.session.objects = [];
        RESOURCES.game.session.colliders = [];

        // Reset score.
        RESOURCES.game.session.score = 0;

        // Produce the world bounds collider
        RESOURCES.game.session.colliders.push({
            hasCollision: function(rect) {
                return (rect.y < 0) || (rect.y + rect.h > SETTINGS.rendering.height);
            }
        });

        // Produce a brand new stage.
        RESOURCES.pixi.stage = new PIXI.Stage(SETTINGS.rendering.background.color, true);
        RESOURCES.pixi.stage.mousedown = RESOURCES.pixi.stage.touchstart = function() {
            processTap();
        };

        // Initialize parallax background sprites.
        if (RESOURCES.game.static.backgrounds.length > 0) {
            RESOURCES.game.static.backgrounds[RESOURCES.game.static.backgrounds.length - 1].next = {
                createInstance: function() {
                    FLAPPY.__initializeObstacles();
                    FLAPPY.__initializePlayers();
                }
            };

            RESOURCES.game.static.backgrounds[0].createInstance();
        }
        else {
            FLAPPY.__initializeObstacles();
            FLAPPY.__initializePlayers();
        }

        // Move game to the ready state
        RESOURCES.game.session.state = STATE.READY;

        // Provide a instructional message to the user.
        FLAPPY.instruction("Press ENTER to start a new game.")
    },

    start: function() {
        if (RESOURCES.game.session.state == STATE.READY) {
            RESOURCES.game.session.state = STATE.RUNNING;
            FLAPPY.message("Game running.")
        }
    },

    gameOver: function() {
        if (RESOURCES.game.session.state == STATE.RUNNING) {
            RESOURCES.game.session.state = STATE.GAME_OVER;
            FLAPPY.alert("GAME OVER!");
        }
    },

    resize: function() {
        var game = $("#game_container");
        var screen = $("#screen_container");
        var heightPadding = 0;

        game.height($(body).height() - ($("#status_container").outerHeight(true) + heightPadding));

        screen.height(game.height() - $("#hud_container").height());
        screen.width(game.width());
    },

    message: function(msg) {
        FLAPPY.__displayMessage(msg, "message");
    },

    instruction: function(msg) {
        FLAPPY.__displayMessage(msg, "instruction");
    },

    alert: function(msg) {
        FLAPPY.__displayMessage(msg, "alert");
    },

    input: function(pressedKey) {
        var binding = RESOURCES.game.session.bindings[pressedKey];

        if (binding) {
            binding.pressed(pressedKey);
            return false;
        }

        return processKeyPress(pressedKey);
    },

    __displayMessage: function(msg, style) {
        var statusElement = $("#status");

        statusElement.removeClass("message instruction alert");
        statusElement.addClass(style);
        statusElement.text(msg);
    },

    __animate: function() {
        var indices = [];

        // Update objects and record the dead ones.
        for (var c = 0; c < RESOURCES.game.session.objects.length; c++) {
            if (!RESOURCES.game.session.objects[c].update(1 / 30.0)) {
                indices.unshift(c);
            }
        }

        // Remove dead objects.
        for (var index in indices) {
            RESOURCES.game.session.objects.splice(indices[index], 1);
        }

        // Update the HUD score.
        $("#score").text(RESOURCES.game.session.score);

        // Render the scene.
        RESOURCES.pixi.renderer.render(RESOURCES.pixi.stage);

        // Schedule the next frame.
        requestAnimFrame(FLAPPY.__animate);
    },

    __initializePlayers: function() {
        for (var player = 0; player < RESOURCES.game.static.players.length; player++) {
            RESOURCES.game.static.players[player].createInstance();
        }
    },

    __initializeObstacles: function() {
        var obstacleInitialPosition = SETTINGS.rendering.width;
        var obstacleClearingLine = SETTINGS.rendering.width * 2
            + SETTINGS.obstacles.placement.spacing
            + SETTINGS.obstacles.placement.width;
        var obstacleCount = RESOURCES.game.static.obstacles.length;
        var previousObstacle = {};

        while (obstacleCount > 0 && obstacleInitialPosition < obstacleClearingLine) {
            for (var obstacleIndex = 0; obstacleIndex < obstacleCount; obstacleIndex++) {
                var obstacle = RESOURCES.game.static.obstacles[obstacleIndex];
                var obstacleInstance = new ObstacleInstance(
                   obstacle.gap,
                   obstacleInitialPosition,
                   SETTINGS.obstacles.placement.width,
                   SETTINGS.obstacles.velocity);

                RESOURCES.game.session.objects.push(obstacleInstance);
                RESOURCES.game.session.colliders.push(obstacleInstance);

                previousObstacle.next = obstacleInstance;
                previousObstacle = obstacleInstance;

                obstacleInitialPosition += SETTINGS.obstacles.placement.spacing + SETTINGS.obstacles.placement.width;
            }
        }
    },
};