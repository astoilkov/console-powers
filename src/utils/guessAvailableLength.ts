export default function guessAvailableLength(): number {
    // - if a window is 1400px wide, a DevTools window positioned horizontally
    //   will have around 1150 space for printing characters on one line. note
    //   that this is variable due to the right side being taken by the name of
    //   the function that called logging which varies in length
    // - then, you have around 250px of margins that DevTools is adding
    // - then, each character is around 6.6px wide
    const CHAR_WIDTH = 6.6;
    const DEV_TOOLS_MARGINS = 250;
    return Math.round((window.innerWidth - DEV_TOOLS_MARGINS) / CHAR_WIDTH);
}
