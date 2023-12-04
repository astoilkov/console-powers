import { Primitive } from 'type-fest'
import { consoleGroup } from '../../core/consoleGroup'
import { consoleText } from '../../core/consoleText'
import getPrimitiveMessage from './primitiveMessage'
import ConsoleMessage from '../../core/ConsoleMessage'
import isPrimitive from '../../utils/isPrimitive'
import valueMessages from './valueMessages'
import consoleStyles from '../consoleStyles'

export default function arrayMessages(array: unknown[]): ConsoleMessage[] {
  return array.every(isPrimitive)
    ? //
      singleLineArrayMessages(array)
    : multiLineArrayMessages(array)
}

function singleLineArrayMessages(array: Primitive[]): ConsoleMessage[] {
  const header = [
    consoleText('['),
    ...array.flatMap((value, i) => {
      return i === 0
        ? [getPrimitiveMessage(value)]
        : [consoleText(', '), getPrimitiveMessage(value)]
    }),
    consoleText(']'),
  ]

  return [
    consoleGroup({
      header,
      body: multiLineArrayMessages(array),
    }),
  ]
}

function multiLineArrayMessages(array: unknown[]): ConsoleMessage[] {
  return array.flatMap((value, i) => [
    consoleText(`[${i}]: `, consoleStyles.expandedKey),
    ...valueMessages(value),
    consoleText('\n'),
  ])
}
