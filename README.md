# console.message

Console messages for the cool kids

## Used in [jsblocks](http://jsblocks.com)

console.message code is used in [jsblocks](http://jsblocks.com) and achieves amazing debugging experience for the developers using it

![console.message example](http://jsblocks.com/img/debugging.gif)

## Examples

### Arguments mismatch

```javascript
console.message()
	.text('Arguments mismatch:', { background: 'yellow' })
	.text(' ')
	.text('addTodo()', { background: '#ccc' })
	.text(' - ')
	.text('less arguments than the required specified', { color: 'red' })
	.print();
```

![arguments mismatch example](https://dl.dropboxusercontent.com/u/4277603/console.message/arguments-mismatch-example.png)

### Grouping awesomeness

```javascript
console.message()
	.group()
	.text('Error occurred while executing code', { color: 'red', fontSize: 24 })
		.group(false)
		.text('For more information expand the group', { color: 'green' })
		.line()
		.text('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.')
		.print();
```

![grouping awesomeness example](https://dl.dropboxusercontent.com/u/4277603/console.message/grouping-awesomeness-example.png)

## Browser support

The project supports Chrome, Firefox, Safari, Opera, IE7+.
However, it will print messages without styles when they are not supported.

## API

### text(text:String)

Appends a text to the current message. All styles in the current span are applied.

```javascript
console.message().text('this is equal to just calling console.log()').print();

console.message()
	.text('Error: ', { color: 'red' })
	.text('this is more useful scenario')
	.print();
```

![text() example](https://dl.dropboxusercontent.com/u/4277603/console.message/text-example.png)

### span(styles:Object)

Starts a span with particular style and all appended text after it will use the style.

```javascript
console.message()
	.span({ color: 'red' })
	.text('this is red! ')
		.span({ color: 'green' })
		.text('this is green! ')
		.spanEnd()
	.text('this is again red!')
	.spanEnd()
	.print();
```

![spanStart() example](https://dl.dropboxusercontent.com/u/4277603/console.message/span-example.png)

### spanEnd()

Ends the current span styles and backs to the previous styles or the root if there are no other parents.
Take a look at the example above.

### group(expanded:boolean = true)

Begins a group. By default the group is expanded. Provide true if you want the group to be collapsed.

```javascript
console.message()
	// pass true if you want to create a collapsed group
	.group()
	.text('The group header text')
	.line()
	.line('The group content')
	.groupEnd()
	.print();
```

![group() example](https://dl.dropboxusercontent.com/u/4277603/console.message/group-example.png)

### groupEnd()

Ends the group and returns to writing to the parent message.

```javascript
console.message()
		.group(false)
		.text('group')
		.groupEnd()
	.text('Outside of group')
	.print();
```

![groupEnd() example](https://dl.dropboxusercontent.com/u/4277603/console.message/groupEnd-example.png)

### newLine()

Adds a new line to the output.

```javascript
console.message()
	.text('first line')
	.line()
	.text('second line')
	.print();
```

![line() example](https://dl.dropboxusercontent.com/u/4277603/console.message/line-example.png)

### print()

Prints the message to the console.
Every message chaining should end with print. No print() call no message.

```javascript
console.message().text('just text').print();
```
