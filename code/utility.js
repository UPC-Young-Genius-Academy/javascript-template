var RECT = {
    create: function(x, y, width, height) {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    },

    createFromContainer: function(container) {
        return RECT.create(0, 0, container.width, container.height);
    },

    createFromCenterOf: function(rectContainer, width, height) {
        var x = rectContainer.x + (rectContainer.width / 2) - (width / 2);
        var y = rectContainer.y + (rectContainer.height / 2) - (height / 2);

        return RECT.create(x, y, width, height);
    },

    hasCollision: function(r1, r2) {
        return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
    }
};