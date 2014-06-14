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
    },

    adjust: function(rect, bounds) {
        return RECT.create(
            rect.x < 0 ? bounds.width + rect.x : rect.x,
            rect.y < 0 ? bounds.height + rect.y : rect.y,
            !rect.width ? bounds.width : rect.width,
            !rect.height ? bounds.height : rect.height);
    }
};

var VECTOR = {
    create: function(x, y) {
        return { x: x, y: y };
    },

    forParallax: function(x) {
        return VECTOR.create(x, 0);
    }
};

var HUD = {
    selectStyle: function(element) { },
    specifyText: function(element, text) { },
    specifyHtml: function(element, html) { },
    injectGameHud: function(studentName) { },
    injectGameView: function(view) { }
}