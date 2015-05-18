# console.message

Create beautiful console messages and impress your users

## Used in [jsblocks](http://jsblocks.com)

console.message code is used in [jsblocks](http://jsblocks.com) and achieves amazing debugging experience for the developers using it.
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

## Browser support

The project supports Chrome, Firefox, Safari, Opera, IE7+.
However, it will print messages without styles when they are not supported.

## API

### addText(text:String)

Appends a text to the current message. All styles in the current span are applied.

### addSpan(text:String, styles:Object)

Appends a text with particular style. Styles is an object containing CSS properties.

### beginSpan(styles:Object)

Starts a span with particular style and all appended text after it will use the style.

### endSpan()

Ends the current span styles and backs to the previous styles or the root if there no other parents.

### beginGroup(collapsed:Boolean = false)

Begins a group. By default the group is expanded. Provide true if you want the group to be collapsed.

### endGroup()

Ends the group and returns to writing to the parent message.

### newLine()

Adds a new line to the output.

### print()

Prints the message to the console.