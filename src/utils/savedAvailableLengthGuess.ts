import guessAvailableLength from "./guessAvailableLength";
import guessDevToolsWidth from "./guessDevToolsWidth";

const STORAGE_KEY = "node_modules/console-powers/guessedAvailableLength";

export default function savedAvailableLengthGuess(): number {
    if (isDevToolsOpen()) {
        updateAvailableLength();
        return guessAvailableLength();
    }
    try {
        const length = Number.parseFloat(
            localStorage.getItem(STORAGE_KEY) ?? "",
        );
        return Number.isNaN(length) ? guessAvailableLength() : length;
    } catch {
        return guessAvailableLength();
    }
}

function updateAvailableLength() {
    if (isDevToolsOpen()) {
        const length = guessAvailableLength();
        localStorage.setItem(STORAGE_KEY, String(length));
    }
}

function isDevToolsOpen(): boolean {
    return guessDevToolsWidth() !== undefined;
}

updateAvailableLength();
window.addEventListener("resize", updateAvailableLength);
