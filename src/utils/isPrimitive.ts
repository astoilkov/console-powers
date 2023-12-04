import { Primitive } from 'type-fest'

export default function isPrimitive(value: unknown): value is Primitive {
  const type = typeof value
  return (
    value === null ||
    value === undefined ||
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    type === 'bigint' ||
    type === 'symbol'
  )
}
