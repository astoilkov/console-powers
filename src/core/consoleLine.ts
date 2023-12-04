export interface ConsoleLine {
  type: 'line'
}

export function consoleLine(): ConsoleLine {
  return { type: 'line' }
}
