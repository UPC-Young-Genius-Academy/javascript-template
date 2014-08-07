var FLAPPY = {
    Background: function(y, height, parallaxSpeed, textureInfo) {
        this.y = y;
        this.height = height;
        this.parallaxSpeed = parallaxSpeed;
        this.textureInfo = textureInfo;
        this.next = null;

        this.createInstance = function() {
            RESOURCES.game.static.objects.push(
                new BackgroundInstance(this.y, this.height, this.parallaxSpeed, this.textureInfo, this.next));
        }

        if (RESOURCES.game.static.backgrounds.length > 0) {
            RESOURCES.game.static.backgrounds[RESOURCES.game.static.backgrounds.length - 1].next = this;
        }

        RESOURCES.game.static.backgrounds.push(this);
    },

    Obstacle: function(gap) {
        this.gap = Math.max(Math.min(gap, 100), 0);

        RESOURCES.game.static.obstacles.push(this);
    },

    initialize: function() {
        RESOURCES.pixi.renderer.view.className = "viewport";

        $("#author").text(SETTINGS.author);
        $("#screen").append(RESOURCES.pixi.renderer.view);

        FLAPPY.reset();

        requestAnimFrame(FLAPPY.__animate);
    },

    reset: function() {
        // Remove all session objects.
        RESOURCES.game.session.objects = [];
        RESOURCES.game.session.colliders = [];

        // Produce a brand new stage.
        RESOURCES.pixi.stage = new PIXI.Stage(SETTINGS.rendering.background.color, true);

        // Initialize parallax background sprites.
        if (RESOURCES.game.static.backgrounds.length > 0) {
            RESOURCES.game.static.backgrounds[0].createInstance();
        }

        // Initialize obstacle sprites.
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

                obstacleInitialPosition += SETTINGS.obstacles.placement.spacing;
            }
        }
    },

    __animate: function() {
        var indices = [];

        for (var c = 0; c < RESOURCES.game.session.objects.length; c++) {
            if (!RESOURCES.game.session.objects[c].update(1 / 30.0)) {
                indices.unshift(c);
            }
        }

        for (var index in indices) {
            RESOURCES.game.session.objects.splice(index, 1);
        }

        RESOURCES.pixi.renderer.render(RESOURCES.pixi.stage);

        requestAnimFrame(FLAPPY.__animate);
    }
};