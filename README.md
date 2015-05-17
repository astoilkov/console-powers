# console.message

Create beautiful console messages and impress your users

## Used in jsblocks

console.message code is used in jsblocks and achieves amazing debugging experience for the developers using it.
Take a look at the gif below:

![console.message example](http://jsblocks.com/img/debugging.gif)

## Examples

### Arguments missmatch

```javascript
console.message()
	.addSpan('Aruments missmatch:', { color: 'yellow' })
	.addText(' ')
	.addSpan('addTodo()', { color: '#333' })
	.addText(' - ')
	.addSpan('less arguments than the required specified', { color: 'red' })
	.print();
```

## API

### addText()

### addSpan()

### beginSpan()

### endSpan()

### beginGroup()

### endGroup()

### newLine()

### print()