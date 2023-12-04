import ConsoleMessage from '../core/ConsoleMessage'

export interface ConsoleApply {
  type: 'apply'
  style: string
  messages: ConsoleMessage[]
}

export function consoleApply(messages: ConsoleMessage[], ...styles: string[]): ConsoleApply {
  return {
    type: 'apply',
    style: styles.join(';'),
    messages,
  }
}
