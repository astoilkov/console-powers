(function () {
	function ConsoleMessage() {
	  if (!ConsoleMessage.prototype.isPrototypeOf(this)) {
	    return new ConsoleMessage();
	  }
	  this._rootSpan = {
	    styles: {},
	    children: [],
	    parent: null
	  };
	  this._currentSpan = this._rootSpan;
	}
	
	ConsoleMessage.Support = (function () {
	  // Taken from https://github.com/jquery/jquery-migrate/blob/master/src/core.js
	  function uaMatch( ua ) {
	    ua = ua.toLowerCase();
	
	    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	      /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	      /(msie) ([\w.]+)/.exec( ua ) ||
	      ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	      [];
	
	    return {
	      browser: match[ 1 ] || "",
	      version: match[ 2 ] || "0"
	    };
	  }
	  var browserData = uaMatch(navigator.userAgent);
	
	  return {
	    isIE: browserData.browser == 'msie' || (browserData.browser == 'mozilla' && parseInt(browserData.version, 10) == 11)
	  };
	})();
	
	ConsoleMessage.prototype = {
	  beginGroup: function () {
	    this._currentSpan.children.push({
	      type: 'group',
	      parent: this._currentSpan
	    });
	    return this;
	  },
	
	  beginCollapsedGroup: function () {
	    this._currentSpan.children.push({
	      type: 'groupCollapsed'
	    });
	    return this;
	  },
	
	  endGroup: function () {
	    this._currentSpan.children.push({
	      type: 'groupEnd',
	      parent: this._currentSpan
	    });
	    return this;
	  },
	
	  beginSpan: function (styles) {
	    var span = {
	      type: 'span',
	      styles: styles,
	      children: [],
	      parent: this._currentSpan
	    };
	    this._currentSpan.children.push(span);
	    this._currentSpan = span;
	    return this;
	  },
	
	  endSpan: function () {
	    this._currentSpan = this._currentSpan.parent || this._currentSpan;
	    return this;
	  },
	  
	  addSpan: function (text, styles) {
	    this.beginSpan(styles);
	    this.addText(text);
	    this.endSpan();
	    return this;
	  },
	
	  addText: function (message) {
	    this._currentSpan.children.push({
	      type: 'text',
	      message: message,
	      parent: this._currentSpan
	    });
	    return this;
	  },
	
	  newLine: function (type) {
	    this._currentSpan.children.push({
	      type: type || 'log',
	      parent: this._currentSpan
	    });
	    return this;
	  },
	
	  addImage: function () {
	    (function () {
	      var faviconUrl = "http://d2c87l0yth4zbw.cloudfront.net/i/_global/favicon.png",
	        css = "background-image: url('" + faviconUrl + "');" +
	          "background-repeat: no-repeat;" +
	          "display: block;" +
	          "background-size: 13px 13px;" +
	          "padding-left: 13px;" +
	          "margin-left: 5px;",
	        text = "Do you like coding? Visit www.spotify.com/jobs";
	      if (navigator.userAgent.match(/chrome/i)) {
	        console.log(text + '%c', css);
	      } else {
	        console.log('%c   ' + text, css);
	      }
	    })();
	    return this;
	  },
	
	  addElement: function (element) {
	    this._currentSpan.children.push({
	      type: 'element',
	      element: element,
	      parent: this._currentSpan
	    });
	    return this;
	  },
	
	  print: function () {
	    if (typeof console == 'undefined') {
	      return;
	    }
	
	    var messages = [this._newMessage()];
	    var message;
	
	    this._printSpan(this._rootSpan, messages);
	
	    for (var i = 0; i < messages.length; i++) {
	      message = messages[i];
	      if (message.text && message.text != '%c' && console[message.type]) {
	        Function.prototype.apply.call(console[message.type], console, [message.text].concat(message.args));
	      }
	    }
	
	    return this;
	  },
	
	  _printSpan: function (span, messages) {
	    var children = span.children;
	    var message = messages[messages.length - 1];
	
	    this._addSpanData(span, message);
	
	    for (var i = 0; i < children.length; i++) {
	      this._handleChild(children[i], messages);
	    }
	  },
	
	  _handleChild: function (child, messages) {
	    var message = messages[messages.length - 1];
	
	    switch (child.type) {
	      case 'group':
	        messages.push(this._newMessage('group'));
	        break;
	      case 'groupCollapsed':
	        messages.push(this._newMessage('groupCollapsed'));
	        break;
	      case 'groupEnd':
	        message = this._newMessage('groupEnd');
	        message.text = ' ';
	        messages.push(message);
	        messages.push(this._newMessage())
	        break;
	      case 'span':
	        this._printSpan(child, messages);
	        this._addSpanData(child, message);
	        this._addSpanData(child.parent, message);
	        break;
	      case 'text':
	        message.text += child.message;
	        break;
	      case 'element':
	        message.text += '%o';
	        message.args.push(child.element);
	        break;
	      case 'log':
	        messages.push(this._newMessage(child.type));
	        break;
	    }
	  },
	
	  _addSpanData: function (span, message) {
	    if (!ConsoleMessage.Support.isIE) {
	      if (message.text.substring(message.text.length - 2) == '%c') {
	        message.args[message.args.length - 1] = this._stylesString(span.styles);
	      } else {
	        message.text += '%c';
	        message.args.push(this._stylesString(span.styles));
	      }
	    }
	  },
	
	  _newMessage: function (type) {
	    return {
	      type: type || 'log',
	      text: '',
	      args: []
	    };
	  },
	
	  _stylesString: function (styles) {
	    var result = '';
	    for (var key in styles) {
	      result += key + ':' + styles[key] + ';';
	    }
	    return result;
	  }
	};
	
	if (typeof window != 'undefined') {
		if (!window.console) {
			window.console = {};
		}
		
		window.console.message = function () {
			return new ConsoleMessage();
		};
	}
})();