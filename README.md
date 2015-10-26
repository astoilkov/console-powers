# console.message

Console messages for cool kids

> I am also working on a [Markdown Editor](http://caret.io). I will appreciate it if you check it out and [tell me](mailto:antonio.stoilkov@gmail.com) what you think.

## Examples

### Cool kids

```javascript
console.message().text('Cool kids', {
	fontSize: 200,
	color: 'hsl(330, 100%, 50%)',
	textShadow: '0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)',
	fontFamily: '\'Permanent Marker\', cursive'
}).print();
```

![cool kids example](https://dl.dropboxusercontent.com/u/4277603/console.message/cool-kids-example.png)

### Used in [jsblocks](http://jsblocks.com)

```javascript
console.message()
    .span({ fontWeight: 'bold'})
    .text('Arguments mismatch:', { background: 'yellow' })
    .text(' ')
    .span({ background: '#eee' })
    .text('addTodo(')
    .text(' ? ', { background: 'red', color: 'white' })
    .text(')')
    .spanEnd()
    .text(' - ')
    .text('less arguments than the required specified', { color: 'red' })
    .print();
```

![console.message example](https://dl.dropboxusercontent.com/u/4277603/console.message/jsblocks-example.gif)

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
It fallbacks to messages without styles when they are not supported.

## API

### text(text:string)

Appends a text to the current message. All styles in the current span are applied.

```javascript
console.message().text('this is equal to just calling console.log()').print();

console.message()
	.text('Error: ', { color: 'red' })
	.text('this is more useful scenario')
	.print();
```

![text() example](https://dl.dropboxusercontent.com/u/4277603/console.message/text-example.png)

### image(url:string, [styles:Object])

Adds an image to the output.

```javascript
console.message()
	.image('http://i.stack.imgur.com/FBVKH.jpg', { zoom: 0.7 })
	.print();
```

![image() example](https://dl.dropboxusercontent.com/u/4277603/console.message/image-example.png)

### element(element:HTMLElement)

Adds an interactive DOM element to the output.

```javascript
console.message()
	.text('Hey take a look at the page body')
	.element(document.body)
	.print();
```

![element() example](https://dl.dropboxusercontent.com/u/4277603/console.message/element-example.png)

### object(object:Object)

Adds an interactive object tree to the output.

```javascript
console.message()
	.text('Hey take a look at the this object ')
	.object({ firstName: 'John', lastName: 'Doe' })
	.print();
```

![object() example](https://dl.dropboxusercontent.com/u/4277603/console.message/object-example.png)

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

![span() example](https://dl.dropboxusercontent.com/u/4277603/console.message/span-example.png)

### spanEnd()

Ends the current span styles and backs to the previous styles or the root if there are no other parents.
Take a look at the example above.

### group(expanded:boolean = true)

Begins a group. By default the group is expanded. Provide false if you want the group to be collapsed.

```javascript
console.message()
	// pass false if you want to create a collapsed group
	.group()
	.text('The group header text')
	.line()
	.text('The group content')
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

### line()

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
Every message chaining should end with `print`. No `print()` call no message.

```javascript
console.message().text('just text').print();
```
