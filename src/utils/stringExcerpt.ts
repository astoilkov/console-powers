export default function stringExcerpt(
    string: string,
    maxLength: number,
): string {
    if (string.length > maxLength) {
        const middle = Math.floor(maxLength / 2);
        return `${string.slice(0, middle)}…${string.slice(-(middle - 1))}`;
    }
    return string;
}
