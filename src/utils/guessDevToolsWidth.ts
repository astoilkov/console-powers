export default function guessDevToolsWidth(): number | undefined {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (heightDiff > widthDiff && heightDiff >= 100) {
        // DevTools horizontal layout
        return window.innerWidth;
    } else if (widthDiff > heightDiff && widthDiff >= 250) {
        // DevTools vertical layout
        return widthDiff;
    }
}
