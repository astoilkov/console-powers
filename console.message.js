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
    this._waiting = 0;
    this._readyCallback = null;
  }

  ConsoleMessage.prototype = {
    /**
     * Begins a group. By default the group is expanded. Provide true if you want the group to be collapsed.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    beginGroup: function (collapsed) {
      this._currentSpan.children.push({
        type: collapsed === true ? 'groupCollapsed' : 'group',
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Ends the group and returns to writing to the parent message.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    endGroup: function () {
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

    /**
     * Ends the current span styles and backs to the previous styles or the root if there are no other parents.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    endSpan: function () {
      this._currentSpan = this._currentSpan.parent || this._currentSpan;
      return this;
    },

    /**
     * Appends a text with particular style. Styles is an object containing CSS properties.
     * @param {string} text - The text to be added.
     * @param {Object} styles - Object with all styles that will be applied to the text.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    addSpan: function (text, styles) {
      this.beginSpan(styles);
      this.addText(text);
      this.endSpan();
      return this;
    },

    /**
     * Appends a text to the current message. All styles in the current span are applied.
     * @param {string} text - The text to be appended
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    addText: function (text) {
      this._currentSpan.children.push({
        type: 'text',
        message: text,
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Adds a new line to the output.
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    newLine: function (type) {
      this._currentSpan.children.push({
        type: type || 'log',
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Adds an image to the output.
     * @param {string} url - The url location of the image.
     * @param {number}
     * @returns {ConsoleMessage} - Returns the message object itself to allow chaining.
     */
    addImage: function (url, scale) {
      var _this = this;
      var image = new Image();
      var styles = {
        backgroundImage: 'url(' + url + ')',
        backgroundRepeat: 'no-repeat',
        color: 'transparent',
        fontSize: 1,
        paddingLeft: 13,
        marginLeft: 5
      };

      scale = typeof scale == 'number' ? scale : 1;

      this.addSpan(' ', styles);

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
    addElement: function (element) {
      this._currentSpan.children.push({
        type: 'element',
        element: element,
        parent: this._currentSpan
      });
      return this;
    },

    /**
     * Prints the message to the console.
     * Until print() is called there will be no result to the console.
     * @returns {ConsoleMessage} - Returns a new ConsoleMessage instance.
     */
    print: function () {
      if (typeof console == 'undefined') {
        return;
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
      if (this._waiting === 0) {
        callback.call(this);
      } else {
        this._readyCallback = callback;
      }
    },

    _wait: function () {
      this._waiting += 1;
    },

    _ready: function () {
      this._waiting -= 1;
      if (this._waiting === 0 && this._readyCallback) {
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
      var value;
      var key;

      for (key in styles) {
        key = this._fixCssStyleKey(key);
        value = styles[key];
        if (typeof value === 'number' && !ConsoleMessage.CssNumbers[key]) {
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

  ConsoleMessage.CssNumbers = {
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

  ConsoleMessage.Support = (function () {
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

  if (typeof window != 'undefined') {
    if (!window.console) {
      window.console = {};
    }

    window.console.message = function () {
      return new ConsoleMessage();
    };

    /**
     * Logs
     * @param {string} url - The url location of the image.
     * @param {number}
     */
    window.console.image = function (url, scale) {
      new ConsoleMessage().addImage(url, scale).print();
    };

    /**
     * Outputs an interactive DOM element.
     * @param {HTMLElement} element - The DOM element to be outputed.
     */
    window.console.element = function (element) {
      new ConsoleMessage().addElement(element).print();
    };
  }
})();
