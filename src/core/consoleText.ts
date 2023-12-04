export interface ConsoleText {
  type: 'text'
  text: string
  style: string
}

export function consoleText(text: string, ...styles: string[]): ConsoleText {
  return {
    type: 'text',
    text,
    style: styles.join(';'),
  }
}
