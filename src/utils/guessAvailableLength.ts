export default function guessAvailableLength(): number {
    // - if a window is 1400px wide, a DevTools window positioned horizontally
    //   will have around 1150 space for printing characters on one line. note
    //   that this is variable due to the right side being taken by the name of
    //   the function that called logging which varies in length
    // - then, you have around 250px of margins that DevTools is adding
    // - then, each character is around 6.6px wide
    const CHAR_WIDTH = 6.6;
    const DEV_TOOLS_CONSOLE_X_PADDING = 28;
    // taken by DevTools for displaying the filename where the console.log() was called
    const DEV_TOOLS_EXTRA_RIGHT_SPACING = 200;
    const guessedAvailableWidth =
        guessDevToolsWidth() -
        DEV_TOOLS_CONSOLE_X_PADDING * 2 -
        DEV_TOOLS_EXTRA_RIGHT_SPACING;
    return Math.round(guessedAvailableWidth / CHAR_WIDTH);
}

function guessDevToolsWidth(): number {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (heightDiff > widthDiff && heightDiff >= 100) {
        // DevTools horizontal layout
        return window.innerWidth;
    } else if (widthDiff > heightDiff && widthDiff >= 250) {
        // DevTools vertical layout
        return widthDiff;
    }
    return window.outerWidth;
}
