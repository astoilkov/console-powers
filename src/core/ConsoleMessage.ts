import { ConsoleText } from './consoleText'
import { ConsoleObject } from './consoleObject'
import { ConsoleLine } from './consoleLine'
import { ConsoleGroup } from './consoleGroup'

type ConsoleMessage = ConsoleText | ConsoleObject | ConsoleLine | ConsoleGroup

export default ConsoleMessage
