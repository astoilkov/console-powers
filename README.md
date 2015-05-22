# console.message

Create beautiful console messages and impress your users

## Used in [jsblocks](http://jsblocks.com)

console.message code is used in [jsblocks](http://jsblocks.com) and achieves amazing debugging experience for the developers using it

![console.message example](http://jsblocks.com/img/debugging.gif)

## Examples

### Arguments mismatch

```javascript
console.message()
	.addSpan('Arguments mismatch:', { background: 'yellow' })
	.addText(' ')
	.addSpan('addTodo()', { background: '#ccc' })
	.addText(' - ')
	.addSpan('less arguments than the required specified', { color: 'red' })
	.print();
```

![arguments mismatch example](https://dl.dropboxusercontent.com/u/4277603/console.message/arguments-mismatch-example.png)

### Grouping awesomeness

```javascript
console.message()
	.beginGroup()
	.addSpan('Error occurred while executing code', { color: 'red', fontSize: 24 })
		.beginGroup(true)
		.addSpan('For more information expand the group', { color: 'green' })
		.newLine()
		.addText('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.')
		.print();
```

![grouping awesomeness example](https://dl.dropboxusercontent.com/u/4277603/console.message/grouping-awesomeness-example.png)

## Browser support

The project supports Chrome, Firefox, Safari, Opera, IE7+.
However, it will print messages without styles when they are not supported.

## API

### addText(text:String)

Appends a text to the current message. All styles in the current span are applied.

```javascript
console.message().addText('this is equal to just calling console.log()').print();

console.message()
	.beginSpan({ color: 'red' })
	.addText('Error: ')
	.endSpan()
	.addText('this is more useful scenario')
	.print();
```

![addText() example](https://dl.dropboxusercontent.com/u/4277603/console.message/addText-example.png)

### addSpan(text:String, styles:Object)

Appends a text with particular style. Styles is an object containing CSS properties.

```javascript
console.message()
	.addSpan('This is green!', { color: 'green'})
	.addSpan('This is red!', { color: 'red'})
	.print();
```

![addSpan() example](https://dl.dropboxusercontent.com/u/4277603/console.message/addSpan-example.png)

### beginSpan(styles:Object)

Starts a span with particular style and all appended text after it will use the style.

```javascript
console.message()
	.beginSpan({ color: 'red' })
	.addText('this is red! ')
		.beginSpan({ color: 'green' })
		.addText('this is green! ')
		.endSpan()
	.addText('this is again red!')
	.endSpan()
	.print();
```

![beginSpan() example](https://dl.dropboxusercontent.com/u/4277603/console.message/beginSpan-example.png)

### endSpan()

Ends the current span styles and backs to the previous styles or the root if there are no other parents.
Take a look at the example above.

### beginGroup(collapsed:Boolean = false)

Begins a group. By default the group is expanded. Provide true if you want the group to be collapsed.

```javascript
console.message()
	// pass true if you want to create a collapsed group
	.beginGroup()
	.addText('The group header text')
	.newLine()
	.addText('The group content')
	.endGroup()
	.print();
```

![beginGroup() example](https://dl.dropboxusercontent.com/u/4277603/console.message/beginGroup-example.png)

### endGroup()

Ends the group and returns to writing to the parent message.

```javascript
console.message()
		.beginGroup(true)
		.addText('group')
		.endGroup()
	.addText('Outside of group')
	.print();
```

![endGroup() example](https://dl.dropboxusercontent.com/u/4277603/console.message/endGroup-example.png)

### newLine()

Adds a new line to the output.

```javascript
console.message()
	.addText('first line')
	.newLine()
	.addText('second line')
	.print();
```

![newLine() example](https://dl.dropboxusercontent.com/u/4277603/console.message/newLine-example.png)

### print()

Prints the message to the console.
Every message chaining should end with print. No print() call no message.

```javascript
console.message().addText('just text').print();
```
