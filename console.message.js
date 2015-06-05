(function () {
  var cssNumbers = {
    columnCount: true,
    fillOpacity: true,
    flexGrow: true,
    flexShrink: true,
    fontWeight: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true
  };

  var support = (function () {
    // Taken from https://github.com/jquery/jquery-migrate/blob/master/src/core.js
    function uaMatch(ua) {
      ua = ua.toLowerCase();

      var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

      return {
        browser: match[1] || "",
        version: match[2] || "0"
      };
    }
    var browserData = uaMatch(navigator.userAgent);

    return {
      isIE: browserData.browser == 'msie' || (browserData.browser == 'mozilla' && parseInt(browserData.version, 10) == 11)
    };
  })();

  function ConsoleMessage() {
    this._rootSpan = {
      styles: {},
      children: [],
      parent: null
    };
    this._currentSpan = this._rootSpan;
    this._waiting = 0;
    this._readyCallback = null;
  }

  ConsoleMessage.prototype = {
    /**
     * Begins a group. By default the group is expanded. Provide false if you want the group to be collapsed.
     * @param {boolean} [expanded = true] -
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    group: function (expanded) {
      this._currentSpan.children.push({
        type: expanded === false ? 'groupCollapsed' : 'group',
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Ends the group and returns to writing to the parent message.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    groupEnd: function () {
      this._currentSpan.children.push({
        type: 'groupEnd',
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Starts a span with particular style and all appended text after it will use the style.
     * @param {Object} styles - The CSS styles to be applied to all text until endSpan() is called
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    span: function (styles) {
      var span = {
        type: 'span',
        styles: apply(styles || {}, this._currentSpan.styles),
        children: [],
        parent: this._currentSpan
      };
      this._currentSpan.children.push(span);
      this._currentSpan = span;
      return this;
    },

    /**
     * Ends the current span styles and backs to the previous styles or the root if there are no other parents.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    spanEnd: function () {
      this._currentSpan = this._currentSpan.parent || this._currentSpan;
      return this;
    },

    /**
     * Appends a text to the current message. All styles in the current span are applied.
     * @param {string} text - The text to be appended
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    text: function (text, styles) {
      this.span(styles);
      this._currentSpan.children.push({
        type: 'text',
        message: text,
        parent: this._currentSpan
      });
      return this.spanEnd();
    },

    /**
     * Adds a new line to the output.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    line: function (type) {
      this._currentSpan.children.push({
        type: type || 'log',
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Adds an image to the output.
     * @param {string} url - The url location of the image.
     * @param {Object}
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    image: function (url, styles) {
      var _this = this;
      var image = new Image();
      var scale = 1;

      styles = apply({
        backgroundImage: 'url(' + url + ')',
        backgroundRepeat: 'no-repeat',
        color: 'transparent',
        fontSize: 1
      }, styles);

      if (styles.zoom != null) {
        scale = parseFloat(styles.zoom) || scale;
      }

      this.text(' ', styles);

      this._wait();

      image.onload = function () {
        var width = this.width * scale;
        var height = this.height * scale;

        styles.backgroundSize = (width + 'px') + ' ' + (height + 'px');
        styles.padding = (height / 2) + 'px ' + (width / 2) + 'px';
        styles.lineHeight = height;

        _this._ready();
      };

      image.onerror = function () {
        _this._ready();
      };

      image.src = url;

      return this;
    },

    /**
     * Adds an interactive DOM element to the output.
     * @param {HTMLElement} element - The DOM element to be added.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    element: function (element) {
      this._currentSpan.children.push({
        type: 'element',
        element: element,
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Adds an interactive object tree to the output.
     * @param {*} object - A value to be added to the output.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    object: function (object) {
      this._currentSpan.children.push({
        type: 'object',
        object: object,
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Prints the message to the console.
     * Until print() is called there will be no result to the console.
     */
    print: function () {
      if (typeof console == 'undefined') {
        return new ConsoleMessage();
      }

      this._onReady(this._print);
      
      return new ConsoleMessage();
    },

    _print: function () {
      var messages = [this._newMessage()];
      var message;

      this._printSpan(this._rootSpan, messages);

      for (var i = 0; i < messages.length; i++) {
        message = messages[i];
        if (message.text && message.text != '%c' && console[message.type]) {
          Function.prototype.apply.call(console[message.type], console, [message.text].concat(message.args));
        }
      }
    },

    _onReady: function (callback) {
      this._readyCallback = callback;
      if (this._waiting === 0) {
        this._ready();
      }
    },

    _wait: function () {
      this._waiting += 1;
    },

    _ready: function () {
      this._waiting -= 1;
      if (this._waiting <= 0) {
        this._waiting = 0;
        this._readyCallback();
      }
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
          messages.push(this._newMessage());
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
        case 'object':
          message.text += '%O';
          message.args.push(child.object);
        case 'log':
          messages.push(this._newMessage(child.type));
          break;
      }
    },

    _addSpanData: function (span, message) {
      if (!support.isIE) {
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
      var value;
      var key;

      for (key in styles) {
        key = this._fixCssStyleKey(key);
        value = styles[key];
        if (typeof value === 'number' && !cssNumbers[key]) {
          value += 'px';
        }
        result += this._toDashKey(key) + ':' + value + ';';
      }
      return result;
    },

    _fixCssStyleKey: function (key) {
      return key.replace(/-\w/g, function (match) {
        return match.charAt(1).toUpperCase();
      });
    },

    _toDashKey: function (key) {
      return key.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });
    }
  };

  function apply(options, object) {
    for (var key in object) {
      if (options[key] === undefined) {
        options[key] = object[key];
      }
    }
    return options;
  }

  if (typeof window != 'undefined') {
    if (!window.console) {
      window.console = {};
    }

    /**
     * Creates a message object.
     * @returns {ConsoleMessage} - The message object
     */
    window.console.message = function () {
      return new ConsoleMessage();
    };
  }
})();
