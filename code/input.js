// Keyboard key constants, see here for complete list: http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
var KEYS = {
    BACKSPACE: 8,
    ENTER: 13,
    F1: 112,
    A: 65
};

// Function called when a key is pressed.
function processKeyPress(pressedKey) {
    switch (pressedKey) {
        case KEYS.BACKSPACE:
            FLAPPY.reset();
            return false;
        case KEYS.ENTER:
            FLAPPY.start();
            return false;
        case KEYS.F1:
            FLAPPY.alert("AHHHHHHH Help!");
            return false;
    }

    return true;
}

// Function called when the mouse is clicked or screen tapped for touch screen devices.
function processTap() {
}