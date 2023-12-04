import hasOwnProperty from 'has-own-prop'

export default function isIterable(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    hasOwnProperty(value, Symbol.iterator) &&
    typeof value[Symbol.iterator] === 'function'
  )
}
