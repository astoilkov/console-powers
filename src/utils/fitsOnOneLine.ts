import { ConsoleText } from '../core/consoleText'
import mathSum from '../../../math-extras/mathSum'

// - if a window is 1400px wide, a DevTools window positioned horizontally
//   will have around 1150 space for printing characters on one line. note
//   that this is variable due to the right side being taken by the name of
//   the function that called logging which varies in length
// - the above means you have around 250px of margins that DevTools is adding
// - each character is around 6.6px wide
// - this means that you can print around 174 characters per line
const DEV_TOOLS_MAX_CHARS_PER_LINE = 174

// 1400px window
// devTools horizontal
// max 1150 width in the console containing 174 characters with an average with of 6.6px
export default function fitsOnOneLine(messages: ConsoleText[]): boolean {
  const charsCount = mathSum(messages.map((message) => message.text.length))
  return charsCount <= DEV_TOOLS_MAX_CHARS_PER_LINE
}
