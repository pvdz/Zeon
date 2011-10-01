// to create bookmarklet
// goto http://marijnhaverbeke.nl/uglifyjs
// put in tokenizer.js and zeparser.js
// (optionally) put in unicode.js
// put in zeon.js
// put in gui.js
// put in gui.nav.js
// put in gui.config.js
// (optionally) copy result and paste in http://pcd.qfox.nl/ and copy result back in uglify
// make sure that at the bottom, there's a Zeon.start(); being called
// compress with uglify
// the result is bookmarklet-ready


// Function.prototype.bind polyfill
if (!Function.prototype.bind) {
	Function.prototype.bind = function(obj){
		var slice = [].slice, args = slice.call(arguments, 1), self = this, nop = function(){
		}, bound = function(){
			return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
		};
		nop.prototype = self.prototype;

		bound.prototype = new nop();

		return bound;
	};
}

// beautifier uses this
if (!Number.prototype.tabs) {
	Number.prototype.tabs = function(){
		if (!Number.tabcache[this]) {
			var s = '';
			for (var i=0; i<this; ++i) s += '\t';
			Number.tabcache[this] = s;
		}
		return Number.tabcache[this];
	};
	Number.tabcache = {};
}

var Gui = function(textarea){
	this.textarea = textarea;

	this.config = Gui.getCurrentConfig();
	
	if (!BOOKMARKLET) { //#ifndef BOOKMARKLET
	// set directly to textarea.value because we havent parsed anything yet at this point
	if (this.config['load saved code at start']) textarea.value = localStorage.getItem('doc');

	if (document.location.hash.length > 1) {
		var val = document.location.hash.slice(1);
		textarea.value = val;
	}
	} //#endif

	this.initUI();
	this.computeFontSizes();
	this.fixTextareLinePadding();
	this.textarea.value += this.minLinePadding;

	this.autoUpdater();
	
	this.searchHistory = [];
	
	this.navPos = {};
};
Gui.css = function(e,p,v){
	if (e instanceof Array) {
		return e.map(function(o){ return Gui.css(o,p,v); }, this);
	} else if (p instanceof Object) {
		for (var key in p) Gui.css(e,key,p[key]);
	} else if (v) {
		var camel = p.replace(/-./g, function(r){ return r.substring(1).toUpperCase(); });
		e.style[camel] = v;
	} else {
		var t = document.defaultView.getComputedStyle(e, null);
		return t.getPropertyValue(p);
	}
};
Gui.copyCss = function(e,f, p){
	if (f instanceof Array) {
		for (var i=0; i<f.length; ++i) Gui.copyCss(e,f[i],p);
	} else if (p instanceof Array) {
		for (var i=0; i<p.length; ++i) Gui.copyCss(e,f,p[i]);
	} else if (e instanceof Array) {
		for (var i=0; i<e.length; ++i) Gui.copyCss(e[i],f,p);
	} else {
		var camel = p.replace(/-./g, function(r){ return r.substring(1).toUpperCase(); });
		var dash = p.replace(/[A-Z]/g, function(r){ return '-'+r.toLowerCase(); });
		f.style[camel] = Gui.css(e, dash);
	}
};
Gui.getSize = function(e){
	// you better make sure e exists.
	return {w:parseInt(Gui.css(e,"width"),10),h:parseInt(Gui.css(e,"height"),10)};
};
Gui.getSizef = function(e){
	// you better make sure e exists.
	return {w:parseFloat(Gui.css(e,"width")),h:parseFloat(Gui.css(e,"height"))};
};
Gui.escape = function(s){
	if (typeof s != 'string') return s;
	return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
Gui.noctrl = function(s){
	if (typeof s != 'string') return s;
	return s.replace(/\n/g, '\u21b5').replace(/\t/g, '\\t'); // return = \u21b5
};
Gui.getCurrentConfig = function(){
	if (window.localStorage) {
		var str = window.localStorage.getItem('zeon-config');
		if (str) try { return JSON.parse(str); } catch(e) {}
	}
	return Zeon.getNewConfig();
};


Gui.zeonify = function(textarea, expose){
	var gui = new Gui(textarea);
	textarea.focus();
	// i debug through console :)
	if (expose) window.gui = gui;
	return gui;
};

/**
 * Convert all textarea's on the current page to a Zeon
 * @param {boolean} expose
 */
Gui.start = function(expose, textarea){
	var lastZeon = false;
	if (textarea) {
		lastZeon = Gui.zeonify(textarea, expose);
	} else {
		Array.prototype.slice.call(document.getElementsByTagName('textarea'), 0).forEach(function(textarea){ lastZeon = Gui.zeonify(textarea, expose); });
	}
	return lastZeon;
};

Gui.webkit = function(expose){
	// textarea is actually a table
	var table = document.getElementsByClassName('text-editor')[0];
	var content = Array.prototype.slice.call(document.querySelectorAll('.webkit-line-content', table), 0).map(function(e){ return e.textContent; }).join('\n');
	var textarea = document.createElement('textarea');
	textarea.value = content;

	var s = textarea.style;
	s.position = 'absolute';
	s.top = '0';
	s.left = '0';
	s.fontFamily = 'Menlo, monospace';
	s.fontSize = '11px';
	s.paddingTop = '4px'; // alignment...

	textarea.setAttribute('rows', 60);
	textarea.setAttribute('cols', 150);

	table.appendChild(textarea);

	return Zeon.start(expose);
};

/**
 * Construct a new textarea+zeon for the list of files (objects {data,src?})
 * @param {Array<data,src>} files
 * @param {Object} afterElement=false When given, the textarea is added after this element
 * @param {Object} expose Create global zeon var with handle
 */
Gui.files = function(files, afterElement, expose){
	console.log("Zeon.files", files.slice(0))
	// textarea is actually a table
	var content = files.map(function(o){ return '\n; //! '+(o.src || 'inline script')+' !//\n'+o.data; }).join('');
	var textarea = document.createElement('textarea');
	textarea.value = content;

	var s = textarea.style;
	s.position = 'absolute';
	s.top = '0';
	s.left = '0';
	s.fontFamily = 'Menlo, monospace';
	s.fontSize = '11px';

	//textarea.setAttribute('rows', 60);
	//textarea.setAttribute('cols', 150);

	if (afterElement) afterElement.parentElement.insertBefore(textarea, afterElement);
	else document.body.appendChild(textarea);

	var z = Zeon.start(expose);

	return z;
};

Gui.prototype = {
	config: null,

	fontSize:0,
	charsX:0,
	charsY:0,

	caret: null,
	caretCol: 0,
	caretRow: 0,
	caretStale: true,
	caretVisible: false,

	rootContainer: null,
	layerContainer: null,
	textarea: null,
	caretLayer: null,
	syntaxLayer: null,
		markLayerUnder: null,
		sourceLayer: null,
		markLayerOver: null,
		sourceLayer: null,
	ruler: null,

	baseLeftPadding: 0,
	defaultLeftPadding: 5,
	showLineNumbers: true,
	lineNumberPadding: 10,

	minLines: null, // number of newlines added to textarea to make sure you can scroll another page down. should be superfluous to the user.
	minLinePadding: null, // cached padding string

	guiNav: null,
	navMessage: null,
	navMessageTimer: null,
	navPos: null,

	caretTimer: null,
	updateTimer: null,

	_originalWrapAttr: null,
	_originalNoWrapAttr: null,
	_originalSpellcheckAttr: null,
	_originalAutocapitalizeAttr: null,
	_originalAutoCorrectAttr: null,

	removed: false, // has this zeon instance been knifed?

	regexPragmaHead: /^(\/\/#\w+\s+)(\w+)/,
	regexPragmaMacro: /^(\/\/#\w+\s+)(\w+)(\s+)(.+)?/,

	regexTwinMark: null,

	bubbleCache: null, // when set, new calls to bubble() are put in here
	markCache: null, // when set, new calls to addMark() are put in here

	zeonClassPrefix: 'zeon-prefix-',
	styleCache: null,
	styleSheet: null,

	searchHistory: null,
	
	autoUpdater: function(){
		try {
			this.update(false);
		} finally {
			this.updateTimer = setTimeout(this.autoUpdater.bind(this), 20);
		}
	},
	update: function(forced){
		var input = this.getValue();
		if (!forced && input == this.lastInput) return;
		this.lastInput = input;

		var dbg = document.getElementById('dbg');
		if (dbg) dbg.innerHTML = '';

		var failed = false;

		this.zeon = new Zeon(input, this.config);
		this.parse();
		this.process();

		this.refreshSyntaxHighlight();
		this.onTextareaSizeChange();
		this.startCaretBlink();
		this.autoScroll();

		this.guiNav.updateNav();

		clearTimeout(this.navMessageTimer);
		Gui.css(this.navMessage, 'display', 'none');
	},
	parse: function(input){
		this.input = input;
		var start = +new Date;
		this.zeon.parse(input);
		this.debug("parse time: "+((+new Date) - start)+' ms');
		if (this.zeon.parser.errorStack.length) {
			this.debug('<span style="color:red;">Found '+this.zeon.tokenizer.errorStack.length+" tokenizer & "+this.zeon.parser.errorStack.length+' parser errors. First:</span> '+this.zeon.parser.errorStack[0].msg);
		} else if (this.zeon.tokenizer.errorStack.length) {
			this.debug('<span style="color:red;">Found '+this.zeon.tokenizer.errorStack.length+" tokenizer & "+this.zeon.parser.errorStack.length+' parser errors. First:</span> Tokenizer: '+(this.zeon.tokenizer.errorStack[0].error.msg||this.zeon.tokenizer.errorStack[0].error.error.msg));
		}
	},
	process: function(){
		// preprocess result. sort by lines, find last match
		var start = +new Date;

		var times = this.zeon.startProcess();

		this.debug("post process time: "+((+new Date) - start)+' ms ('+times.join(', ')+')');
	},

	showMessage: function(msg){
		var nm = this.navMessage;
		nm.innerHTML = msg;
		Gui.css(nm, 'display', 'inline');
		clearTimeout(this.navMessageTimer);
		this.navMessageTimer = setTimeout(function(){ Gui.css(nm, 'display', 'none'); }, 5000);
	},

	initUI: function(){
		var textarea = this.textarea;

		this.initTextareaAttributes(textarea);

		this.createLayers();
		this.initContainer();
		this.initLayerContainer();
		this.initLayers();
		this.initLineNumberBar();

		this.guiNav = new Gui.Nav(this);
		this.addTopMessage();

		this.updatePaddingLeft();

		if (!this.config['markers']) {
			Gui.css([this.markLayerUnder, this.markLayerOver], 'display', 'none');
		}

		this.addLayersToDom();

//		this.createTestButton();

		this.initTextareaEvents();
	},
	initTextareaAttributes: function(textarea){
		// firefox doesnt listen to the word-wrap property...
		this._originalWrapAttr = textarea.getAttribute('wrap');
		textarea.setAttribute('wrap', 'off');
		// IE9 does it differently
		this._originalNoWrapAttr = textarea.getAttribute('nowrap');
		textarea.setAttribute('nowrap', 'true'); // IE9
		// spell checker will get it wrong
		this._originalSpellcheckAttr = textarea.getAttribute('spellcheck');
		textarea.setAttribute('spellcheck', 'false'); // iew.
		// this aint java
		this._originalAutocapitalizeAttr = textarea.getAttribute('autocapitalize');
		textarea.setAttribute('autocapitalize', 'off'); // ios meh.
		// if only...
		this._originalAutoCorrectAttr = textarea.getAttribute('autocorrect');
		textarea.setAttribute('autocorrect', 'off'); // ios meh.
	},
	createLayers: function(){
		// contains all elements, replaces the original textarea
		this.rootContainer = document.createElement('div');
		this.rootContainer.className = 'zeon-root-container';
		// all elements are relative to this element... we cant safely set position of the root to 'relative', even though we really want to.
		this.layerContainer = document.createElement('div');
		this.layerContainer.className = 'zeon-layer-container';
		// contains the highlighted text, but none of the marks
		this.syntaxLayer = document.createElement('div');
		this.syntaxLayer.className = 'zeon-syntax-layer';
		// contains all the marks (pretty much any indicator except the text color)
		this.markLayerUnder = document.createElement('div');
		this.markLayerUnder.className = 'zeon-mark-layer-under';
		this.sourceLayer = document.createElement('div');
		this.sourceLayer.className = 'zeon-source-layer';
		this.markLayerOver = document.createElement('div');
		this.markLayerOver.className = 'zeon-mark-layer-over';

		this.syntaxLayer.appendChild(this.markLayerUnder);
		this.syntaxLayer.appendChild(this.sourceLayer);
		this.syntaxLayer.appendChild(this.markLayerOver);

		// only contains the caret
		this.caretLayer = document.createElement('div');
		this.caretLayer.className = 'zeon-caret-layer';
		// have to simulate this because the textarea becomes invisible (and that includes the caret)
		this.caret = document.createElement('span');
		this.caret.className = 'zeon-caret';
	},
	initContainer: function(){
		// set up root.
		Gui.css(this.rootContainer, {padding:'0'});
		var parentStyles = [
			'position', 'top', 'left', 'width', 'height', 'float', 'display',
			'margin-left','margin-top','margin-right','margin-bottom',
			'background-color'
		];
		Gui.copyCss(this.textarea, this.rootContainer, parentStyles);
		Gui.css(this.rootContainer,{border:'0', overflow: 'visible'}); // prevent scrollbars in firefox
	},
	initLayerContainer: function(){
		// now set up parent. it will be position relative and span the entire width/height of the root
		// it will hold all the other layers and is relative to the outer zeon container
		Gui.css(this.layerContainer, {
			position:'relative', 
			overflow:'hidden', 
			border: '1px solid black', 
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			'box-sizing': 'border-box'
		});
		Gui.copyCss(this.textarea, this.layerContainer, ['width','height']);
	},
	initLayers: function(){
		// set the position affecting css properties on all the layers

		// put all layers at the top-left corner, spanning the entire layerContainer. 
		// we also must have whitespace:pre;wordwrap: because we can't cope with breaking mid-sentence.
		// we reset float here, because if the original textarea was floating, only the parent will need to float.
		var requiredStyles = {
			position: 'absolute', left: '0', top: '0', width: '100%', height: '100%',
			'white-space':'pre', 'word-wrap':'normal',
			'float':'none',
			margin:'0', padding: '0',
			'background-color':'transparent',
			resize: 'none',
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			'box-sizing': 'border-box'
		};
		Gui.css([this.textarea, this.caretLayer, this.syntaxLayer, this.markLayerUnder, this.sourceLayer, this.markLayerOver], requiredStyles);

		// the syntax layer must mimic all the properties from the textarea that affect text size/positioning
		var stylesToCopy = [
			'font-family', 'font-size', 'line-height', 'vertical-align',
			'word-spacing', 'letter-spacing', 'text-align'
		];
		Gui.copyCss(this.textarea, this.syntaxLayer, stylesToCopy);

		// the syntax and caret layer should not overflow and be otherwise invisible
		Gui.css([this.syntaxLayer, this.caretLayer], {overflow:'hidden', 'background-color':'transparent'});
		// only the layerContainer should have a border.
		Gui.css([this.textarea, this.markLayerUnder, this.sourceLayer, this.markLayerOver, this.syntaxLayer, this.caretLayer],'border', '0');
		// the textarea should generate scrollbars because onscroll will cause scroll effect on other layers
		Gui.css(this.textarea, {color: 'transparent', outline: 'none', overflow:'auto' });
		// the actual caret should move around the caret layer like a butterfly!
		Gui.css(this.caret, {position: 'absolute', top: '0', left: '0', width: '1px', height: '15px', 'background-color': 'blue' });

	},
	initLineNumberBar: function(){
		this.ruler = document.createElement('div');
		this.ruler.className = 'zeon-line-number-bar';
		// this is the gutter on the left side of the gui (if visible at all)
		Gui.css(this.ruler, {position:'absolute', top:'0', left:'0', 'min-height':'100%', color:'black', 'background-color':'#ccc', 'font-size': '12px', 'white-space':'pre', 'text-align':'right', padding: '0 3px 0 2px'});
		// the gutter must also mimic any text size/position affecting properties
		var stylesToCopy = ['box-sizing','font-family','font-size', 'font-weight', 'line-height', 'vertical-align', 'white-space'];
		Gui.copyCss(this.textarea, this.ruler, stylesToCopy);
	},

	getValue: function(){
		return this.textarea.value.slice(0,-this.minLines);
	},
	setValue: function(val){
		this.textarea.value = val+this.minLinePadding;
	},

	addTopMessage: function(){
		var msgp = document.createElement('div');
		msgp.className = 'zeon-top-message';
		Gui.css(msgp, {
			position: 'absolute',
			top: '15px',
			left: '5px',
			right: '20px',
			'text-align': 'center'
		});
		this.layerContainer.appendChild(msgp);

		this.navMessage = document.createElement('span');
		Gui.css(this.navMessage, {
			'background-color': 'white',
			color: 'red',
			'font-weight': 900,
			border: '1px solid red',
			padding: '5px',
			display: 'none',
			'-webkit-border-radius':'10px',
			'border-radius': '10px'
		});
		msgp.appendChild(this.navMessage);
	},

	updatePaddingLeft: function(){
		// increase left padding, optionally also take line numbers into account
		var newPadding = this.defaultLeftPadding+(this.showLineNumbers?this.lineNumberPadding:0);
		Gui.css([this.syntaxLayer, this.caretLayer, this.textarea], 'padding-left', newPadding+'px');
		//Gui.css(this.textarea, 'width', (parseInt(Gui.css(this.layerContainer, 'width'),10) - (newPadding)) + 'px');
		// the mark layer needs margin, because absolutely positioned elements see the border as 0x0, and ignore the padding.
		Gui.css([this.markLayerUnder, this.sourceLayer, this.markLayerOver], 'margin-left', newPadding+'px');
		this.onTextareaSizeChange();
	},

	addLayersToDom: function(){
		var parent = this.textarea.parentNode;

		// put main container in position of textarea
		parent.insertBefore(this.rootContainer, this.textarea);
		// put all layers in the layer container (textarea on top!)
		var lc = this.layerContainer;
		lc.appendChild(this.syntaxLayer);
		lc.appendChild(this.caretLayer);
		lc.appendChild(this.textarea); // last!
		// and the caret
		this.caretLayer.appendChild(this.caret);
		// put the layer container in the main container
		this.rootContainer.appendChild(this.layerContainer);
	},
/*
	createTestButton: function(){
		var testbtn = document.createElement('div');
		Gui.css(testbtn, {
			position:'absolute',
			top:'25px',
			right:'25px',
			'background-color':'white',
			border: '1px solid red',
			cursor: 'pointer',
			color:'black',
			padding:'3px'
		});
		testbtn.innerHTML = 'test';
		testbtn.onclick = function(){
			var tree = new Ast(this.zeon.tree, this.zeon.btree); // this will be my new structure in the next iteration
//			window.btoken = tree;
//			console.log('window.btoken', tree);
			var inp = document.createElement('input');
			inp.value = Ast.getHeatPlate()+tree.heatmap();
			document.body.insertBefore(inp, document.body.firstChild);
			inp.focus();
			inp.select();
		}.bind(this);
		this.layerContainer.appendChild(testbtn);
//console.log("remove me! testbtn");
//setTimeout(this.beautifyButton.onclick, 500)
	},
*/
	initTextareaEvents: function(){
		var textarea = this.textarea;
		textarea.onkeydown = this.onTextareaKeyDown.bind(this);
		textarea.onkeyup = this.onTextareaKeyUp.bind(this);
		textarea.onkeypress = this.onTextareaKeyPress.bind(this);
		textarea.onclick = this.onTextareaClick.bind(this);
		textarea.onscroll = this.autoScroll.bind(this); // also does this.updateCaretPos();
		textarea.onchange = this.onTextareaSizeChange.bind(this);
		textarea.onselect = this.onTextareaSelectionChange.bind(this);
	},
	onTextareaKeyDown: function(e){
		if (e.keyCode == 9) { // Tab key. we want it to insert an actual tab.
			e.preventDefault(); // dont jump. unfortunately, also/still doesnt insert the tab.
			var textarea = this.textarea;
			var input = this.getValue();
			var remove = e.shiftKey;
			var posstart = textarea.selectionStart;
			var posend = textarea.selectionEnd;
			// if anything has been selected, add one tab in front of any line in the selection
			if (posstart != posend) {
				posstart = input.lastIndexOf('\n', posstart) + 1;
				var compensateForNewline = input[posend-1] == '\n';
				var before = input.substring(0,posstart);
				var after = input.substring(posend-(compensateForNewline?1:0));
				var selection = input.substring(posstart,posend);

				// now add or remove tabs at the start of each selected line, depending on shift key state
				// note: this might not work so good on mobile, as shiftKey is a little unreliable...
				if (remove) {
					if (selection[0] == '\t') selection = selection.substring(1);
					selection = selection.split('\n\t').join('\n');
				} else {
					selection = selection.split('\n');
					if (compensateForNewline) selection.pop();
					selection = '\t'+selection.join('\n\t');
				}

				// put it all back in...
				this.setValue(before+selection+after);
				// reselect area
				textarea.selectionStart = posstart;
				textarea.selectionEnd = posstart + selection.length;
			} else {
				var val = this.getValue();
				this.setValue(val.substring(0,posstart) + '\t' + val.substring(posstart));
				textarea.selectionEnd = textarea.selectionStart = posstart + 1;
			}
		} else if (e.keyCode == 71 && e.ctrlKey){ // ctrl+g, go to line
			var line = null;
			if (line = parseInt(prompt('line?'), 10)) {
				this.textarea.scrollTop = this.fontSize.h * (line-3);
				this.textarea.selectionStart = this.textarea.selectionEnd = this.zeon.lines[Math.max(0, line-1)].start
			}
		} else if (e.keyCode == 66 && e.ctrlKey){ // ctrl+b, go to pos
			var pos = null;
			if (pos = parseInt(prompt('pos?'), 10)) {
				var token = this.computeCaretPosAt(pos);
				if (token) {
					this.textarea.scrollTop = this.fontSize.h * (token.startLineId-3);
				} else {
					this.textarea.scrollTop = this.fontSize.h * (lines.length-1);
				}
				this.textarea.selectionStart = this.textarea.selectionEnd = pos;
			}
		} else if (e.keyCode == 70 && e.ctrlKey) { // ctrl+f, find. check for 70, even though lower case f is 102... 
			new Gui.Search(this);
			e.preventDefault();
			return false;
		} else if (e.keyCode == 114) { // F3, find next/prev.
			var target = false;
			 
			// find prev
			if (this.textarea.selectionStart != this.textarea.selectionEnd) {
				target = this.getValue().substring(this.textarea.selectionStart,this.textarea.selectionEnd);
			} else if (this.searchHistory.length) {
				target = this.searchHistory[0];
			}

			if (target) {
				// create search object, press next/prev and close it.
				var search = new Gui.Search(this);
				search.setSearch(target);
				if (e.ctrlKey) search.searchPrev();
				else search.searchNext();
				search.close();
			}
			
			e.preventDefault(); // prevents browser search box behavior
			return false;
		} else if (e.keyCode == 83 && e.ctrlKey) { // ctrl+s
			localStorage.setItem('doc', this.getValue());
			e.preventDefault(); // prevents browser search box behavior
			this.showMessage('Source saved to local storage');
			return false;
		} else if (e.keyCode == 76 && e.ctrlKey) { // ctrl+l
			this.setValue(localStorage.getItem('doc'));
			e.preventDefault(); // prevents browser search box behavior
			this.showMessage('Source loaded from local storage');
			return false;
		}
		
		//console.log(e.keyCode)
		
		this.caretStale = true;
		this.startCaretBlink();
	},
	onTextareaKeyUp: function(e){
		this.caretStale = true;
		this.startCaretBlink();
		this.onTextareaSizeChange();
	},
	onTextareaKeyPress: function(e){
		var textarea = this.textarea;
		if (e.keyCode == 13) { // return: match indentation of previous line
			var input = this.getValue();
			var posstart = textarea.selectionStart;
			var posend = textarea.selectionEnd;

			var before = input.substring(0,posstart);
			var after = input.substring(posend);

			var ws = '';
			var star = '';
			if (before) {
				// scan from start of current line
				var start = before.lastIndexOf('\n', posstart)+1;
				var pos = start;
				// put pos after whitespace
				while (before[pos] && Tokenizer.regexWhiteSpace.test(before[pos])) ++pos;

				var postoken = this.computeCaretPosAt(before.length);
				var token = postoken;
				// skip to first token that starts _before_ the current position
				while (token && token.start >= before.length && token.tokposw) token = this.zeon.wtree[token.tokposw-1];
				if (token && token.start < before.length) {
					if ((token.isComment || token.name == 14/*error*/) && token.value.substring(0,3) == '/**' && token.value.slice(-2) != '*/') {
						// indentation of the comment
						ws = before.substring(start,pos);
						// check if jsdoccing a function...
						var pos = 0;
						// skip whitespace
						while (after[pos] && (Tokenizer.regexWhiteSpace.test(after[pos]) || Tokenizer.regexLineTerminator.test(after[pos]))) ++pos;
						// if next non-white char is a star, just add a star. you're in a multi line comment, it must be a related star.
						if (after[pos] == '*') {
							// get the whitespace before that star we found, we'll mimic it.
							var wsBegin = pos;
							while (after[wsBegin-1] && Tokenizer.regexWhiteSpace.test(after[wsBegin-1])) --wsBegin;
							ws = after.substring(wsBegin,pos);
							// add the star and the indentation, put the caret one space after the new star
							star = '* ';
							this.setValue(before+'\n'+ws + star + after);
							textarea.selectionStart = textarea.selectionEnd = posstart+ws.length+star.length+1;
							return false; // prevent return being added to textarea. we'll do that, thanks!
						} else {
							// if (after.substring(pos, pos+8) == 'function' && (Tokenizer.regexWhiteSpace.test(after[pos+8]) || Tokenizer.regexLineTerminator.test(after[pos+8])) || after[pos+8] == '(')

							// look for next token. we're looking for one of the following patterns:
							// - Func: function
							// - Func: var x = function
							// - else Var(s): var x
							// - Func: x = function
							// - else Var: x =
							// - Func: x: function
							// - else Var: x:
							
							// we must first move to the first black token...
							var current = token;
							while (current.isWhite && (current = this.zeon.wtree[current.tokposw+1]));
							// first next black token is now in current. check patterns from above...
							
							var tree = this.zeon.btree;
							
							var target = false;
							var isFunction = false;
							if (current.isFuncDeclKeyword) {
								target = current;
								isFunction = true;
							} else if (current.isVarKeyword) {
								// func if var name and assignment follow
								// var(s) otherwise
								var pos = current.tokposb;
								if (tree[pos+1] && tree[pos+1].name == 2/*identifier*/ && tree[pos+2] && tree[pos+2].value == '=' && tree[pos+3] && tree[pos+3].isFuncExprKeyword) {
									target = tree[pos+3]; // func
									isFunction = true;
								} else {
									// var
									target = current;
								}
							} else if (current.isPropertyOf) {
								var pos = current.tokposb;
								if (tree[pos+1] && tree[pos+1].value == ':' && tree[pos+2] && tree[pos+2].isFuncExprKeyword) {
									target = tree[pos+2]; // func
									isFunction = true;
								} else {
									// var
									target = current;
								}
							} else if (current.leadValue) {
								target = current; // regular variable
							}
							
							if (target) {
								if (isFunction) var jsdoc = this.zeon.generateFunctionJsdoc(target);
								else {
									var jsdoc = this.zeon.generateVarJsdoc(target);
									if (jsdoc && !target.isPropertyOf) jsdoc = '\n'+jsdoc;
								}
								if (jsdoc) {
									// replace existing /** too...
									this.setValue(before.slice(0, -4)+jsdoc + after.slice(1));
									textarea.selectionStart = textarea.selectionEnd = posstart+ws.length+3+1;
									return false; // prevent return being added to textarea. we'll do that, thanks!
								}
							}
						}
					} else if (before[pos] == '*' && token && token.name == 8/*COMMENT_MULTI*/ && posstart < token.stop) {
						// add a star if you pressed enter in a multi line comment and the current line "starts" with a star
						star = '*';
						if (after[0] != '/') star += ' '; // pressing it between the closing */ of the comment...
						ws = before.substring(start,pos);
						after = ws + star + after;
						this.setValue(before+'\n'+after);
						textarea.selectionStart = textarea.selectionEnd = posstart+ws.length+star.length+1;
						return false; // prevent return being added to textarea. we'll do that, thanks!
					} else if (before[pos] == '/' && token && token.name == 8/*COMMENT_MULTI*/ && posstart < token.stop) { // pressing return after the /** while still IN the comment
						// add a star if you pressed enter in a multi line comment and the current line "starts" with a star
						star = ' * ';
						ws = before.substring(start,pos);
						after = ws + star + after;
						this.setValue(before+'\n'+after);
						textarea.selectionStart = textarea.selectionEnd = posstart+ws.length+star.length+1;
						return false; // prevent return being added to textarea. we'll do that, thanks!
					}
				}
				// if code reaches here, we were not in a multi-line comment line starting with a star or forward slash + star + star (else it will have returned)
				
				// match previous indentation. if we returned from {, increase indentation.
				if (postoken) {
					var index = postoken.tokposw-1;
					while (index > 0 && this.zeon.wtree[index].isWhite && this.zeon.wtree[index].name != 10/*line_terminator*/) --index;
				}
				var extraIndentation = postoken && index > 0 && this.zeon.wtree[index].value == '{';
				
				var start = before.lastIndexOf('\n', posstart)+1;
				if (start < 0) start = 0;
				var pos = start;
				
				// find whitespace up to first non-whitespace
				while (before[pos] && Tokenizer.regexWhiteSpace.test(before[pos])) ++pos;
				ws = before.substring(start,pos);
				after = ws + (extraIndentation?'\t':'') + after;
				
				this.setValue(before+'\n'+after);
				textarea.selectionStart = textarea.selectionEnd = posstart+ws.length+(extraIndentation?1:0)+1;
				return false; // prevent return being added to textarea. we'll do that, thanks!
			}
		}
	},
	onTextareaClick: function(e){
		if (e.ctrlKey) {
			var pos = this.textarea.selectionStart;
			var token = this.computeCaretPosAt(pos);
			if (token) {
				if (token.trackingObject && token.trackingObject.refs && token.trackingObject.refs.length) {
					token.trackingObject.refs.some(function(target){
						if (target.meta == 'var name' || target.meta == 'func decl name' || target.meta == 'func expr name' || target.meta == 'parameter') {
							this.textarea.selectionEnd = this.textarea.selectionStart = token.start;
							setTimeout(function(){
								this.textarea.selectionStart = this.textarea.selectionEnd = target.start;
								this.caretStale = true;
								this.startCaretBlink();
							}.bind(this), 1);
							this.showCircleAtMatch(target);
							return true;
						}
					},this);
				} else if (token.twin) {
					setTimeout(function(){ 
						this.textarea.selectionEnd = this.textarea.selectionStart = token.twin.start;
						this.caretStale = true;
						this.startCaretBlink(); 
					}.bind(this), 1);
					this.showCircleAtMatch(token.twin);
					return true;
				}
			}
		}
		
		this.caretStale = true;
		this.startCaretBlink();
	},
	onTextareaSizeChange: function(){
		this.guiNav.resize();

		if (typeof this.minLines == 'number') {
			var val = this.getValue();
			this.fixTextareLinePadding();
			this.setValue(val);
		}
	},
	onTextareaSelectionChange: function(){
		this.fixCaretBounds();
	},
	autoScroll: function(){
		this.syntaxLayer.scrollLeft = this.textarea.scrollLeft;
		this.syntaxLayer.scrollTop = Math.floor(this.textarea.scrollTop);
		this.updateCaretPos();
	},

	fixCaretBounds: function(){
		var len = this.getValue().length;
		if (this.textarea.selectionStart > len) this.textarea.selectionStart = len;
		if (this.textarea.selectionEnd > len) this.textarea.selectionEnd = len;
	},
	remove: function(){
		this.removed = true;
		// copy some events such that the textarea wont jump around
		Gui.copyCss(this.rootContainer, this.textarea, ['color','background-color','position','top','left','width','height','display','margin-left','margin-top','margin-right','margin-bottom']);
		Gui.css(this.textarea, {'border': '1px solid black', padding: '3px'});
		// replace root with textarea. all other nodes will be recycled.
		this.rootContainer.parentNode.replaceChild(this.textarea, this.rootContainer);
		// detach events
		this.textarea.onclick = null;
		this.textarea.onscroll = null;
		this.textarea.onmousedown = null;
		this.textarea.onmousemove = null;
		this.textarea.onmouseup = null;
		this.textarea.onkeydown = null;
		this.textarea.onkeyup = null;
		this.textarea.onkeypress = null;
		this.textarea.onchange = null;
		this.textarea.ondragenter = null;
		this.textarea.ondragover = null;
		this.textarea.ondragleave = null;
		this.textarea.ondrop = null;
		// reset certain attributes
		this.resetTextareaAttributes();
		// remove all running timers
		clearTimeout(this.caretTimer);
		clearTimeout(this.updateTimer);
		// clear circular reference
		this.guiNav = null;
	},
	resetTextareaAttributes: function(textarea){
		this.textarea.setAttribute('wrap', this._originalWrapAttr);
		this.textarea.setAttribute('nowrap', this._originalNoWrapAttr); // IE9
		this.textarea.setAttribute('spellcheck', this._originalSpellcheckAttr); // iew.
		this.textarea.setAttribute('autocapitalize', this._originalAutocapitalizeAttr); // ios meh.
		this.textarea.setAttribute('autocorrect', this._originalAutoCorrectAttr); // ios meh.
	},

	resize: function(width, height){
		Gui.css([this.layerContainer, this.syntaxLayer, this.markLayerUnder, this.sourceLayer, this.markLayerOver, this.caretLayer, this.rootContainer], {width:width+'px', height:height+'px'});
		return this;
	},
	setPaddingTop: function(n){
		// this method will create padding and set the proper styles to the proper components to make that magic happen
		Gui.css([this.textarea, this.syntaxLayer, this.ruler], 'padding-top', n+'px');
		Gui.css([this.markLayerOver, this.markLayerUnder, this.caretLayer, this.sourceLayer], 'margin-top', n+'px');
		return this;
	},

	debug: function(){
		var e = document.getElementById('dbg');
		if (e) {
			var f = document.createElement('div');
			f.innerHTML = Array.prototype.slice.call(arguments).join(', ');
			e.appendChild(f);
		}
		return arguments[0];
	},
	output: function(){
		var e = document.getElementById('out');
		if (e) {
			var f = document.createElement('div');
			f.innerHTML = Array.prototype.slice.call(arguments).join(', ');
			e.appendChild(f);
		}
		return arguments[0];
	},

	computeFontSizes: function(){
		this.fontSize = this.getFontSize();
		this.charsX = Gui.getSize(this.textarea).w / this.fontSize.w;
		this.charsY = Gui.getSize(this.textarea).h / this.fontSize.h;
	},
	fixTextareLinePadding: function(){
		// number of lines to populate the textarea with at all times
		var min = this.minLines = (Math.floor(this.charsY) == this.charsY ? this.charsY - 1 : Math.floor(this.charsY))-2;
		var val = '';
		for (var i=0; i<min; ++i) val += '\n';
		this.minLinePadding = val;
	},
	getFontSize: function(){
		var e = document.createElement('span');

		// we need to copy a bunch of styles from the textarea to get the correct size.
		var toCopy = [
			'box-sizing', 'white-space',
			'font-family', 'font-size', 'font-weight', 'line-height', 'vertical-align', 'word-spacing', 'letter-spacing', 'text-align'
		];
		Gui.copyCss(this.textarea, e, toCopy);

		// make sure the width/height can change
		Gui.css(e, {position:'absolute', width:'auto', height:'auto'});
		document.body.appendChild(e);

		// now measure the difference before and after for one x. since we'll assume 'pre', x has the same size as any other character.
		var before = Gui.getSizef(e);
		e.innerHTML = 'x';
		var after = Gui.getSizef(e);
		document.body.removeChild(e); // cleanup

		// that's it :)
		return {w:after.w-before.w, h:after.h-before.h};
	},
	matchToColRow: function(match){
		var lineStart = this.zeon.lines[match.startLineId].start;
		var lastPosOnLine = Math.min(this.zeon.lines[match.startLineId].stop, match.stop);
		var col = this.tabMagic(this.lastInput, lineStart, lastPosOnLine);
		return {col:col, row:match.startLineId};
	},
	colRowToXY: function(c,r){
		return {x:c * this.fontSize.w, y:r * this.fontSize.h};
	},

	tabMagic: function(input, lineStart, stop, startCol){
		// given input, which column would stop be if we use tab stops
		// (tabs arent static 8 chars, they are the remaining number of chars
		// up to the next tabstop, which for browsers is always at 8 byte
		// interval, which you cant really reliably change)
		var pos = lineStart;
		var col = startCol || 0;
		while (pos < stop) {
			if (input[pos] == '\t') col += 8-(col % 8);
			else ++col;
			++pos;
		}
		return col;
	},

	syntaxColorSettings: {
		regex: 'color:green;', // regex
		identifier: 'color:black;', // identifiers
		keyword: 'color:blue;',
		hex: 'color:green;',
		dec: 'color:green;',
		singleString: 'color:green;',
		doubleString: 'color:green;',
		singleComment: 'color:#c1ad3e;',
		multiComment: 'color:grey;',
		whitespace: 'border-bottom:1px solid #eee;',
		lineTerminator: '',
		punctuator: 'color:orange;',
		label: '',

		error: 'background-color:red;color:white;',

		varDecl: '',
		undefinedVar: 'text-decoration:line-through;',
		unusedVar: 'text-decoration:line-through;',
		prematureUsage: 'font-style:italic;',
		duplicateProperty: 'text-decoration:line-through;',
		leadValue: '',
		ecma: 'text-decoration:none;color: pink;',
		browser: 'text-decoration:none;color:orange;',
		relic: '',

		lookupDepth1: 'text-decoration:none;',
		lookupDepth2: 'background-color:rgba(255,255,0, 0.1);text-decoration:none;',
		lookupDepth3: 'background-color:rgba(255,255,0, 0.2);text-decoration:none;',
		lookupDepth4: 'background-color:rgba(255,255,0, 0.3);text-decoration:none;',
		lookupDepth5: 'background-color:rgba(255,255,0, 0.4);text-decoration:none;',
		lookupDepth6: 'background-color:rgba(255,255,0, 0.5);text-decoration:none;',
		lookupDepth7: 'background-color:rgba(255,255,0, 0.6);text-decoration:none;',
		lookupDepth8: 'background-color:rgba(255,255,0, 0.7);text-decoration:none;',
		lookupDepth9: 'background-color:rgba(255,255,0, 0.8);text-decoration:none;',
		lookupDepthx: 'background-color:rgba(255,255,0, 0.9);text-decoration:none;',

		jsdocPragma: 'color: black; background-color: #eee;',
		jsdocParam: 'color: black;',
		jsdocFirstParam: 'border-bottom: 1px solid black;',
		jsdocSecondParam: 'border-bottom: 1px dashed black;',
		jsdocRest: 'color: #555;',

		trailingWhitespace: 'background-color: #F49B9B;'
	},

	getOutput: function(){
		if (!this.config['zeon visual output']) {
			// you could even just not do anything here and disable the transparency of the textarea...
			return Gui.escape(this.zeon.wtree.map(function(o){ return o.value; }).join(''));
		}

		// dont display bubbles and marks immediately
		this.bubbleCache = [];
		this.markCache = [];

		this.styleCache = [];

		var parser = ZeParser; // cache
		this.markLayerOver.innerHTML = '';
		this.markLayerUnder.innerHTML = '';
		var lines = this.zeon.lines;
		var tree = this.zeon.wtree;
		var outputStrings = [];
		var fontStyles = [];
		fontStyles.push('font-family:'+Gui.css(this.textarea,'font-family').replace(/"/g,"'")+';');
		fontStyles.push('font-size:'+Gui.css(this.textarea,'font-size')+';');
		fontStyles.push('font-weight:'+Gui.css(this.textarea,'font-weight')+';');
		fontStyles.push('line-height:'+Gui.css(this.textarea,'line-height')+';');
		var pragmaCausedIgnore = false;

		var activePragmaStart = null;

		for (var i=0; i<tree.length; ++i) {
			var match = tree[i];
			if (match.name == 14/*error*/) {
				// show error before the trailing whitespace, rather than after. unless match.errorHasContent is true.
				var prev = match.errorHasContent ? match : (this.zeon.btree[match.tokposb-1] || match);
				this.showErrorMark(prev);

				// for tokenizer errors, show the content anyways
				if (match.tokenError) {
					outputStrings.push('<span class="'+this.getCssId(this.syntaxColorSettings.error+fontStyles.join(''))+'">'+Gui.escape(match.value)+'</span>');
				}
			} else {
				var styles = ['color:black;'].concat(fontStyles);
				var value = Gui.escape(match.value);

				// if ignoring due to pragma, only un-ignore if pragma of same level of if-else-if-else-defs
				var pragmaIgnoreLast = false;
				// if processing another ifdef, ignore nested ones...
				if ((!activePragmaStart && match.pragmaName == 'ifdef') || match.pragmaStart == activePragmaStart) {
					// for the endif, clearly the remove thing is reset, regardless
					if (match.isPragma && match.pragmaName == 'endif') {
						pragmaIgnoreLast = pragmaCausedIgnore;
						pragmaCausedIgnore = false;
					} else if (pragmaCausedIgnore && match.isPragma && match.pragmaStart == pragmaCausedIgnore) {
						// cant be the ifdef
						if (match.isPragmaArgDefined) pragmaCausedIgnore = false;
					} else if (match.isPragma) {
						if (match.pragmaName == 'ifdef') {
							if (!match.isPragmaArgDefined) pragmaCausedIgnore = match;
							activePragmaStart = match;
						}
						// for the elseifs, they always cause a ignore (because otherwise it will take the already ignored branch)
						else if (match.pragmaName == 'elseifdef') pragmaCausedIgnore = match;
						// same as elseifs
						else if (match.pragmaName == 'elsedef') pragmaCausedIgnore = match;
					}
				}
				if (activePragmaStart && match.pragmaStart == activePragmaStart && match.pragmaName == 'endif') {
					activePragmaStart = null;
				}

				if ((pragmaCausedIgnore || pragmaIgnoreLast || match.inPragmaLine) && this.config['dim undefined ifdefs']) {
					// pragma's would remove this code, dim it
					styles.push('color:#bbbbbb;');
				} else {
					if (match.leadValue) styles.push(this.syntaxColorSettings.leadValue);

					// variables
					if (match.varNameDecl) {
						if (match.wasAlreadyDeclared) {
							var css = {color:'black','background-color':'orange'};
							this.bubble('vv', match, css);
						}
						if (match.unused) {
							styles.push(this.syntaxColorSettings.unusedVar);
						}
					} else if (match.isLabel) {
						styles.push(this.syntaxColorSettings.label);
					} else if (match.scopeLookupDepth === 0) { // must be number and only if 0, it is a undefined var
						styles.push(this.syntaxColorSettings.undefinedVar);
					} else if (match.scopeLookupDepth > 0) {
						styles.push(this.syntaxColorSettings['lookupDepthx'+(match.scopeLookupDepth>9?'x':match.scopeLookupDepth)]);
					} else if (match.scopeLookupDepth < 0 && !match.trackingObject.isEcma && !match.trackingObject.isBrowser) {
						// this is css for the actual text
						styles.push(this.syntaxColorSettings.undefinedVar);
					}

					if (match.propOverwritten) {
						// this is css for the actual text
						styles.push(this.syntaxColorSettings.duplicateProperty);
						this.bubble('2x', match, css);
					}

					// show scope lookup depth
					if (match.scopeLookupDepth && this.config['scope depth'] && (match.scopeLookupDepth < 0 || match.scopeLookupDepth > this.config['warn if scope depth exceeds'])) {
						var css = {color:'black','background-color':'yellow'};
						if (match.scopeLookupDepth < 0) {
							// this is only css for the bubble
							css = {color:'black', 'background-color':'orange', 'text-decoration':'line-through'};
						}
						this.bubble(Math.abs(match.scopeLookupDepth), match, css);
					}

					if (match.prematureUsage && !match.trackingObject.isFuncDecl) {
						styles.push(this.syntaxColorSettings.prematureUsage);
					}

					if (match.trackingObject) {
						if (match.trackingObject.isEcma) {
							// warn!
							styles.push(this.syntaxColorSettings.ecma);
						} else if (match.trackingObject.isBrowser) {
							// warn...
							styles.push(this.syntaxColorSettings.browser);
						}
					}

					// script capital P = power set = Weierstrass p. whatever :p
					if (match.duplicatePropertyDecl) this.bubble('&#8472;', match, {color:'black','background-color':'orange'});

					if (match.badPrefixOperand) this.bubble('!', match, {color:'white','background-color':'red'});

					if (match.warning && this.config['warnings']) this.showWarnings(match);

					if (match.isDirective) this.bubble('D', match, {color:'white','background-color':'green'});

					if (match.isMacro) this.bubble('M', match, {color:'black','background-color':'yellow'}, 12);

					if (((match.trackingObject && (match.meta == 'func decl name' || match.meta == 'var name') && match.trackingObject.isConstructor) || (match.value == 'function' && match.isConstructor))) {
						this.bubble('*', match, {color:'white','background-color':'green', 'line-height': '10px'});
					}
					
					if (match.deadCode) this.bubble('\u2620', match, {color:'black', border:'0', 'font-size': '18px'}, -8, 10);

					if (match.jsdocIncomplete) {
						// find correct position in the jsdoc and add a warning token...
						var pos = match.trackingObject.jsdocOriginalLine.indexOf('@param');
						this.bubble(
							'?', 
							match.trackingObject.jsdoc, 
							{color:'black','background-color':'yellow'}, 
							Math.floor((pos+7)*this.fontSize.w), 
							Math.floor(match.trackingObject.relLineId*this.fontSize.h+6));
					}

					this.annotateType(match);

					if (match.name == 2/*identifier*/ && parser.regexIsKeywordOrReserved.test(match.value)) styles.push(this.syntaxColorSettings.keyword);
					else if (match.name == 1) styles.push(this.syntaxColorSettings.regex);
					else if (match.name == 2) styles.push(this.syntaxColorSettings.identifier);
					else if (match.name == 3) styles.push(this.syntaxColorSettings.hex);
					else if (match.name == 4) styles.push(this.syntaxColorSettings.dec);
					else if (match.name == 5) styles.push(this.syntaxColorSettings.singleString);
					else if (match.name == 6) styles.push(this.syntaxColorSettings.doubleString);
					else if (match.name == 7) styles.push(this.syntaxColorSettings.singleComment);
					else if (match.name == 8) styles.push(this.syntaxColorSettings.multiComment);
					else if (match.name == 9) styles.push(this.syntaxColorSettings.whitespace);
					else if (match.name == 10) styles.push(this.syntaxColorSettings.lineTerminator);
					else if (match.name == 11) styles.push(this.syntaxColorSettings.punctuator);

					if (match.isTrailingWhitespace && this.config['trailing whitespace cue']) styles.push(this.syntaxColorSettings.trailingWhitespace);

					if (match.name == 8/*COMMENT_MULTI*/ && match.jsdoc) {
						// construct jsdoc, try to keep the original bytes in tact (length and position)
						value =
							match.jsdoc.map(function(line){
								if (line instanceof Array) {
									//           0              1      2   3       4     5             6    7     8    9     10
									// line = ["matched part", " * ", "@", "name", " ", "p1 p2 rest", "p1", " ", "p2", " ", "rest"]
									var str = Gui.escape(line[1]);

									str += '<span class="'+this.getCssId(this.syntaxColorSettings.jsdocPragma)+'">@'+Gui.escape(line[3])+'</span>';
									// some pragmas have special structure. for the rest just append the remainder of the line
									if (line[3] != 'param' && line[3] != 'var') return str + Gui.escape(line[4]||'') + Gui.escape(line[5]||'');

									// must be a @param
									str += Gui.escape(line[4] || '');
									str += typeof line[6] == 'string' ? '<span class="'+this.getCssId(this.syntaxColorSettings.jsdocFirstParam)+'">'+Gui.escape(line[6])+'</span>' : '';
									str += Gui.escape(line[7] || '');
									str += typeof line[8] == 'string' ? '<span class="'+this.getCssId(this.syntaxColorSettings.jsdocSecondParam)+'">'+Gui.escape(line[8])+'</span>' : '';
									str += Gui.escape(line[9] || '');
									str += typeof line[10] == 'string' ? '<span class="'+this.getCssId(this.syntaxColorSettings.jsdocRest)+'">'+Gui.escape(line[10])+'</span>' : '';

									return str;
								}
								return Gui.escape(line);
							}, this).join('\n')
						;
						if (match.hasTodofix) value = value.replace(this.zeon.regexToDoFix, this.replaceTodofix.bind(this));
					} else if (match.hasTodofix || match.isPragma) {
						var value = Gui.escape(match.value);
						if (match.hasTodofix) value = value.replace(this.zeon.regexToDoFix, this.replaceTodofix.bind(this));
						if (match.isPragma) {
							value = this.colorPragma(match, styles, value);
						}
					}
				}

				var stlOut = '';
				if (styles.length) stlOut = ' class="'+this.getCssId(styles.join(''))+'"';
				outputStrings.push('<span'+stlOut+'>'+value+'</span>');
			}
		}
		return outputStrings.join('');
	},
	replaceTodofix: function(hit){
		return '<b class="'+this.getCssId('color:orange;text-decoration:underline;text-transform:uppercase;')+'">'+hit+'</b>';
	},
	colorPragma: function(match, stlOut, value){
		// pragma will be a single comment in the form of //#<name> arg rest
		if (match.isPragma) {
			switch (match.pragmaName) {
				case 'define':
					if (match.pragmaArg) {
						stlOut.push('color:green;');
						value = value.replace(this.regexPragmaHead, function(_,b,c){ return b+'<b>'+c+'</b>'; });
					} else {
						stlOut.push('color:red;');
					}
					break;

				case 'ifdef':
					if (match.pragmaArg && match.pragmaStop) {
						if (match.isPragmaArgDefined) {
							stlOut.push('color:green;');
							value = value.replace(this.regexPragmaHead, function(_,b,c){ return b+'<b>'+c+'</b>'; });
						} else {
							stlOut.push('color:orange;');
							if (match.pragmaArg) value = value.replace(this.regexPragmaHead, function(_,b,c){ return b+'<b><strike>'+c+'</strike></b>'; });
						}
					} else {
						stlOut.push('color:red;');
					}
					break;
				case 'elseifdef':
					if (match.pragmaArg && match.pragmaPrev && match.pragmaNext) {
						if (match.isPragmaArgDefined) {
							stlOut.push('color:green;');
							value = value.replace(this.regexPragmaHead, function(_,b,c){ return b+'<b>'+c+'</b>'; });
						} else {
							stlOut.push('color:orange;');
							if (match.pragmaArg) value = value.replace(this.regexPragmaHead, function(_,b,c){ return b+'<b><strike>'+c+'</strike></b>'; });
						}
					} else {
						stlOut.push('color:red;');
					}
					break;
				case 'elsedef':
					if (match.pragmaPrev && match.pragmaNext) {
						if (match.isPragmaArgDefined) {
							stlOut.push('color:green;');
						} else {
							stlOut.push('color:orange;');
						}
					} else {
						stlOut.push('color:red;');
					}
					break;

				case 'inline':
				case 'finline':
					if (match.pragmaArg && match.pragmaStop) {
						stlOut.push('color:green;');
						if (match.pragmaArg) value = value.replace(this.regexPragmaHead, function(_,b,c){ return b+'<b>'+c+'</b>'; });
					} else {
						stlOut.push('color:red;');
					}
					break;

				case 'endif':
					if (match.pragmaStart) {
						stlOut.push('color:green;');
					} else {
						stlOut.push('color:red;');
					}
					break;

				case 'endline':
				case 'fendline':
					if (match.pragmaStart) {
						stlOut.push('color:green;');
					} else {
						stlOut.push('color:red;');
					}
					break;

				case 'macro':
					if (match.pragmaArg && match.pragmaRest) {
						stlOut.push('color:green;');
						value = value.replace(this.regexPragmaMacro, function(_,b,c,d,e){ return b+'<b>'+c+'</b>'+d+(e?'<u>'+e+'</u>':''); });
					} else {
						stlOut.push('color:red;');
					}
					break;
			}
		}

		return value;
	},
	showWarnings: function(match){
		if (!this.config[match.warning]) return;
		switch (match.warning) {
			case 'missing block good':
				this.bubble('{', match, {color:'black','background-color':'yellow'});
				break;
			case 'missing block bad':
				this.bubble('{', match, {color:'white','background-color':'red'});
				break;
			case 'assignment in header':
				this.bubble('&equiv;', match, {color:'white','background-color':'red'});
				break;
			case 'weak comparison':
				// dont show warning if lhs is typeof result (cos that's always string)
				if (!match.isTypeofOperator) this.bubble('=', match, {color:'black','background-color':'yellow'});
				break;
			case 'dangling underscore':
				this.bubble('_', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'dot and not can be confusing':
				this.bubble('r', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'inc dec operator':
				this.bubble('&plusmn;', match, {color:'black','background-color':'yellow'}, 8);
				break;
			case 'comma in group makes inc/dec fail':
				this.bubble(',', match, {color:'white','background-color':'red'});
				break;
			case 'binary operator':
				this.bubble('b', match, {color:'black','background-color':'yellow'});
				break;
			case 'use dot access':
				this.bubble('.', match, {color:'white','background-color':'red'});
				break;
			case 'continue only in loops':
			case 'break needs loop or label':
			case 'return only in function':
				this.bubble('f', match, {color:'white','background-color':'red'});
				break;
			case 'trailing decimal':
			case 'leading decimal': // for now, treat the same
				this.bubble('.', match, {color:'black','background-color':'yellow'});
				break;
			case 'regex confusion':
				this.bubble('/', match, {color:'black','background-color':'yellow'});
				break;
			case 'number dot':
				this.bubble('.', match, {color:'white','background-color':'red'});
				break;
			case 'assignment bad':
			case 'assignment this': // treat the same
				this.bubble('&ne;', match, {color:'white','background-color':'red'});
				break;
			case 'bad string escapement':
			case 'unlikely regex escapement':
				this.bubble('\\', match, {color:'black','background-color':'yellow'});
				break;
			case 'avoid hex':
				this.bubble('H', match, {color:'black','background-color':'yellow'});
				break;
			case 'caller callee':
				this.bubble('!', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'octal escape':
				this.bubble('8', match, {color:'white','background-color':'red'});
				break;
			case '00':
				this.bubble('0', match, {color:'black','background-color':'yellow'});
				break;
			case 'regexp call':
				this.bubble('r', match, {color:'white','background-color':'red'});
				break;
			case 'confusing plusses':
				this.bubble('+', match, {color:'black','background-color':'yellow'});
				break;
			case 'confusing minusses':
				this.bubble('-', match, {color:'black','background-color':'yellow'});
				break;
			case 'double bang':
				this.bubble('!', match, {color:'black','background-color':'yellow'});
				break;
			case 'control char':
			case 'unsafe char':
				this.bubble('c', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'invalid unicode escape in string':
				this.bubble('u', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'invalid unicode escape in regex':
				this.bubble('u', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'invalid hex escape in string':
				this.bubble('x', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'invalid hex escape in regex':
				this.bubble('x', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'catch var assignment':
				this.bubble('e', match, {color:'white','background-color':'red'});
				break;
			case 'bad constructor':
				this.bubble('c', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'array constructor':
				this.bubble('a', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'error constructor':
				this.bubble('e', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'very bad constructor':
				this.bubble('c', match, {color:'white','background-color':'red'}, 10);
				break;
			case 'Function is eval':
				this.bubble('e', match, {color:'black','background-color':'yellow'}, 15);
				break;
			case 'function wrapped':
				this.bubble('f', match, {color:'black','background-color':'yellow'});
				break;
			case 'document.write':
				this.bubble('w', match, {color:'white','background-color':'red'});
				break;
			case 'iteration function':
				this.bubble('i', match, {color:'black','background-color':'orange'});
				break;
			case 'empty block':
				this.bubble('&epsilon;', match, {color:'black','background-color':'yellow'});
				break;
			case 'eval':
				this.bubble('e', match, {color:'white','background-color':'red'}, 15);
				break;
			case 'empty regex char class':
				this.bubble('[]', match, {color:'black','background-color':'yellow'});
				break;
			case 'extra comma':
				this.bubble(',', match, {color:'black','background-color':'yellow'});
				break;
			case 'double new':
				this.bubble('N', match, {color:'white','background-color':'red', 'text-decoration':'line-through'});
				break;
			case 'double delete':
				this.bubble('D', match, {color:'white','background-color':'red', 'text-decoration':'line-through'});
				break;
			case 'undefined':
				this.bubble('u', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'duplicate objlit prop':
				this.bubble('d', match, {color:'white','background-color':'red'});
				break;
			case 'timer eval':
				this.bubble('e', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'group vars':
				this.bubble('\u21D1', match, {color:'black','background-color':'yellow', 'padding-top': '2px'});
				break;
			case 'func decl at top':
				this.bubble('\u21D1', match, {color:'black','background-color':'yellow'});
				break;
			case 'is label':
				this.bubble('L', match, {color:'black','background-color':'yellow'});
				break;
			case 'math call':
				this.bubble('!', match, {color:'white','background-color':'red'});
				break;
			case 'new wants parens':
				this.bubble('(', match, {color:'black','background-color':'yellow'});
				break;
			case 'missing radix':
				this.bubble('r', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'nested comment':
				this.bubble('*', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'new statement':
				this.bubble('n', match, {color:'black','background-color':'yellow'});
				break;
			case 'dont use __proto__':
				this.bubble('&#9763;', match, {'font-size': '30px',border:'0', color:'red'}, 3, 10);
				break;
			case 'empty switch':
			case 'quasi empty switch':
			case 'empty clause':
				this.bubble('&epsilon;', match, {color:'black','background-color':'yellow'});
				break;
			case 'clause should break':
				this.bubble('b', match, {color:'black','background-color':'yellow'});
				break;
			case 'switch is an if':
				this.bubble('i', match, {color:'black','background-color':'yellow'});
				break;
			case 'unwrapped for-in':
				this.bubble('!', match, {color:'black','background-color':'yellow'});
				break;
			case 'in out of for':
				this.bubble('f', match, {color:'black','background-color':'yellow'});
				break;
			case 'use {}':
				this.bubble('{}', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'use []':
				this.bubble('[]', match, {color:'black','background-color':'yellow'}, 10);
				break;
			case 'double block':
				this.bubble('{', match, {color:'black','background-color':'yellow'});
				break;
			case 'useless block':
				this.bubble('{', match, {color:'black','background-color':'yellow'});
				break;
			case 'use capital namespacing':
				this.bubble('C', match, {color:'black','background-color':'yellow'});
				break;
			case 'constructor called as function':
				this.bubble('f', match, {color:'black','background-color':'yellow'});
				break;
			case 'cannot inc/dec on call expression':
				this.bubble('c', match, {color:'white','background-color':'red'});
				break;
			case 'inc/dec only valid on vars':
				this.bubble('v', match, {color:'white','background-color':'red'});
				break;
			case 'bad asi pattern':
				this.bubble(';', match, {color:'black','background-color':'yellow'});
				break;
			case 'unlikely typeof result':
				this.bubble('t', match, {color:'black','background-color':'yellow'});
				break;
			case 'weird typeof op':
				this.bubble('?', match, {color:'black','background-color':'yellow'});
				break;
			case 'typeof always string':
				this.bubble('s', match, {color:'black','background-color':'yellow'});
				break;
			case 'static expression':
				this.bubble('s', match, {color:'black','background-color':'yellow'});
				break;
			case 'static condition':
				this.bubble('s', match, {color:'white','background-color':'red'});
				break;
			case 'pragma requires name parameter':
				this.bubble('n', match, {color:'white','background-color':'red'});
				break;
			case 'pragma requires value parameter':
				this.bubble('v', match, {color:'white','background-color':'red'});
				break;
			case 'missing ifdef':
				this.bubble('i', match, {color:'white','background-color':'red'});
				break;
			case 'missing inline':
				this.bubble('i', match, {color:'white','background-color':'red'});
				break;
			case 'pragma start missing end':
				this.bubble('/', match, {color:'white','background-color':'red'});
				break;
			case 'macro name should be identifier':
				this.bubble('i', match, {color:'white','background-color':'red'});
				break;
			case 'is dev relic':
				this.bubble('d', match, {color:'white', 'background-color':'black'}, 12);
				break;
			case 'weaker operator than neighbor':
				this.bubble('w', match, {color:'black','background-color':'yellow'});
				break;
			case 'useless multiple throw args':
				this.bubble('a', match, {color:'black','background-color':'yellow'});
				break;
			case 'unnecessary parentheses':
				this.bubble('(', match, {color:'black','background-color':'yellow'});
				break;
			case 'uninitialized value in loop':
				this.bubble('L', match, {color:'black','background-color':'yellow'});
				break;
			case 'jsdoc type mismatch':
				break; // bubble is added elsewhere.
			case 'prop not declared on proto':
				this.bubble('P', match, {color:'black','background-color':'yellow'});
				break;
			case 'trailing comma':
				this.bubble('t', match, {color:'black','background-color':'yellow'});
				break;
			case 'ASI':
				// show mark before the trailing whitespace, rather than after (where it belongs, though)
				var prev = this.zeon.btree[match.tokposb-1] || match;
				this.showAsiMark(prev);
				break;
			case 'empty statement':
				this.bubble('&epsilon;', match, {color:'black','background-color':'orange'});
				break;
			case 'premature usage':
				this.bubble('P', match, {color:'black','background-color':'yellow'});
				break;
			case 'unused':
				this.bubble('u;', match, {color:'black','background-color':'orange'});
				break;
			case 'dead code': // skull and bones, always shown so see getoutput
				break;
			case 'useless parens':
				this.bubble('(;', match, {color:'black','background-color':'orange'});
				break;
			case 'known implicit global':
				break;
			case 'unknown implicit global':
				break;
			case 'duplicate label':
				this.bubble('ll', match, {'background-color':'red', color:'white'});
				break;
			case 'label not found':
				this.bubble('L', match, {'background-color':'red',color:'white'});
				break;
			case 'silly delete construct':
				this.bubble('d', match, {'background-color':'red',color:'white'});
				break;
			case 'delete not a function':
				this.bubble('f', match, {color:'black','background-color':'yellow'});
				break;
			case 'weird delete operand':
				this.bubble('p', match, {'background-color':'red',color:'white'});
				break;
			case 'cannot call/apply that':
				this.bubble('(', match, {'background-color':'red',color:'white'});
				break;
			case 'func expr name is read-only':
				this.bubble('f', match, {'background-color':'red',color:'white'});
				break;

			default:
				console.error('unknown warning: '+match.warning);
		}
	},
	annotateType: function(match){
		if (!this.config['type annotations']) return;
		if (match.isWhite || match.name == 11/*PUNCTUATOR*/) return;

		var types = false;

//		console.log("annotateType", match.value, match, match.varType, match.trackingObject)

//		if (match.isNumber) types = ['number'];
//		else if (match.isString) types = ['string'];
//		else if (match.name == 1/*reg_exp*/) types = ['regexp'];

		if (match.varType) { // assignment
			types = match.varType;
		} else if (match.trackingObject && match.trackingObject.varType) {
			types = match.trackingObject.varType;
		}

		if (types) {
			//console.log("types before", types.slice(0))
			types = Zeon.getUniqueItems(types); // filter duplicates
			//console.log("types after", types.slice(0))

			// if the object was marked as an array or function at some point, it's unlikely to be a regular object later.
			if (types.indexOf('Array') >= 0 || types.indexOf('Function') >= 0) types = types.filter(function(o){ return (o != 'Object'); });

			var h = 2; // line-height of the underbar
			if (types.length == 2) h = 2;
			else if (types.length != 1) h = 1;

			types.forEach(function(type, i){
				//console.log("iter", type, i)
				var color = false;
				if (type == 'string') color = 'green';
				else if (type == 'number') color = 'blue';
				else if (type == 'regexp') color = 'orange';
				else if (type == 'boolean') color = 'cyan';
				else if (type == 'undefined' || type == 'null') color = 'grey';
				else if (type == 'Array') color = 'purple';
				else if (type == 'Function') color = 'pink';

				if (color) {
					var css = {
						width: Math.floor(match.len * this.fontSize.w)+'px',
						height: h+'px',
						'background-color': color
					};
					var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
					var row = match.startLineId;
					this.showMark(col, row, css, 0, 15+(i*h));
				} else if (type == 'Object') {
					var css = {
						width: Math.floor(match.len * this.fontSize.w)+'px',
						height: 0+'px',
						'border-top': '2px dotted black'
					};
					var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
					var row = match.startLineId;
					this.showMark(col, row, css, 0, 15);
				}
			}, this);
		}
	},
	addLineNumbers: function(){
		// TOFIX: add the line number bar to the main container and resize the layerContainer accordingly...
		var arr = [1]; // always show at least a 1 in an empty document
		for (var i=1; i<this.zeon.lines.length; ++i) arr[i] = i+1;
		this.lineNumberPadding = (((this.zeon.lines.length-1).toString().length) * 6) + 10; // 5px per char for number of chars of highest pos, and an additional 5px

		this.ruler.innerHTML = arr.join('\n');
		this.syntaxLayer.insertBefore(this.ruler, this.syntaxLayer.firstChild);

		this.updatePaddingLeft();
	},

	getCssId: function(str){
		var id = this.styleCache.indexOf(str);
		if (id < 0) {
			id = this.styleCache.length;
			this.styleCache.push(str);
		}

		return this.zeonClassPrefix+id;
	},

	refreshSyntaxHighlight: function(){
		Gui.css(this.syntaxLayer, {display:'none'});
		var fs;
		while (fs = this.markLayerUnder.firstChild) this.markLayerUnder.removeChild(fs);
		while (fs = this.markLayerOver.firstChild) this.markLayerOver.removeChild(fs);
		while (fs = this.sourceLayer.firstChild) this.sourceLayer.removeChild(fs);

		var start = +new Date;
		var input = this.lastInput;
		var out = this.getOutput()+'<div style="height: 500px;"> </div>'; // without tag, if you click longer pages in chrome, the div would crop the newlines causing a desync with the textarea.
		this.debug("output generation time: "+((+new Date) - start)+' ms');
		var start = +new Date;
		this.sourceLayer.innerHTML = out;
		this.flushCaches();
		this.addLineNumbers();
		this.debug("display time: "+((+new Date) - start)+' ms');
		Gui.css(this.syntaxLayer, {display:'block'});
	},

	computeCaretPos: function(){
		if (!this.zeon || !this.zeon.lines) return; // not yet computed
		if (this.zeon.lines.length == 0) return; // no input
		this.caretStale = false;
		this.fixCaretBounds();

		var pos = this.textarea.selectionStart;
		var token = this.computeCaretPosAt(pos);

		var changed = this.lastCaretPos != pos; // this.caretToken != token; // col != this.caretCol || (token && token.startLineId != this.caretRow);
		this.lastCaretPos = pos;
		this.caretToken = token;
		if (token) {
			// multi line comments and strings with line continuations
			var lines = this.zeon.lines;
			var lineId = token.startLineId;
			if (token.hasNewline && token.name != 10/*lineterminator*/) {
				while (lines[lineId].stop <= pos) ++lineId;
			}
			var col = this.tabMagic(this.lastInput, lines[lineId].start, pos);
			this.caretCol = col;
			this.caretRow = lineId;
		} else { // at EOF
			var changed = true;
			this.caretRow = this.zeon.lines.length-1;
			var col = this.tabMagic(this.lastInput, this.zeon.lines[this.caretRow].start, pos);
			this.caretCol = col;
		}

		// TOFIX: i think the changed part is a bug for input change
		if (changed) this.caretPosChanged();
	},
	computeCaretPosAt: function(pos){
		var token = false;
		if (this.zeon.lines.length) { // no input
			var row = this.posToRow(pos);
			token = this.rowPosToToken(row, pos);
		}
		return token;
	},
	posToRow: function(pos){
		var lines = this.zeon.lines;
		for (var y=0; y<lines.length-1; ++y) {
			if (lines[y].stop > pos) break;
		}
		if (y == lines.length) --y; // end of input
		return y;
	},
	rowPosToToken: function(row, pos){
		var line = this.zeon.lines[row];
		var token = null;
		// find nearest token
		// if this line is completely covered by a certain match (multi line string/comment), return that match
		if (line.coveredBytoken && line.coveredBytoken.stop > pos) {
			token = line.coveredBytoken;
		} else {
			// search for the match in this line...
			for (var i=0; i<line.length; ++i) {
				if (line[i].stop > pos) break;
			}
			token = line[i];
			// should only be undefined if eol
		}
		return token;
	},

	//#ifdef ALT_POS_COMPUTE
	// only use this if we enable the "compute pos for all tokens" part, which is too heavy so is disabled by default
	computeCaretPos_alt: function(){
		if (!this.zeon.lines) return; // not yet computed so we cant get a fix
		this.caretStale = false;
		if (this.zeon.lines.length == 0) return; // no input

		// all tokens have the correct col/row computed in process
		// so what we do is we simply try to find the token closest
		// to the current caret pos.
		var caretPos = this.textarea.selectionStart;

		// first find the correct line where the caret currently is
		var lines = this.zeon.lines;
		for (var row=0; row<lines.length-1; ++row) if (lines[row].stop > caretPos) break;
		if (row == lines.length) --row; // end of input
		var line = lines[row];
		var tokenIndex = 0;
		var caretToken;
		if (line.length) {
			// we know the start of the line (relative to source length)
			// and we know caret pos (with same offset). So we can deduct
			// one from another to get an approximation of the column in
			// that row. We use that to determine which token to start
			// searching at.
			// so get the % of the position, mul that with the number of
			// tokens in this line, and use that index as the start.
			tokenIndex = Math.min(line.length-1, Math.floor(((caretPos - line.start) / (line.stop - line.start)) * line.length));
			var searchStart = line[tokenIndex];
			// so first determine search direction, left or right.
			var delta = searchStart.stop <= caretPos ? 1 : -1;
			// search tokens till you find the one that the caret starts at or is inside of
			while (line[tokenIndex+delta] && !(line[tokenIndex].start <= caretPos && line[tokenIndex].stop > caretPos)) tokenIndex += delta;
			caretToken = line[tokenIndex];
		}

		var col;
		if (tokenIndex == 0 && line.coveredBytoken && line.coveredBytoken.stop > caretPos) {
			console.log("special");
		} else {
			// so the caret is in front of or inside caretToken
			if (caretToken.start == caretPos) {
				col = caretToken.col;
			} else if (!caretToken.tabs) {
				// this token contains no tabs
				col = caretToken.col + (caretPos - caretToken.start);
			} else {
				//console.log("tabs")
				// token must contain tabs. they are logged with {pos:int,col:int} objects. find your position.
				var tabi = 0;
				while (tabi < caretToken.tabs.length-1 && caretToken.tabs[tabi].pos < caretPos) ++tabi;
				col = caretToken.tabs[tabi].col + (caretPos - caretToken.tabs[tabi].pos);
			}

			if (caretPos == caretToken.stop) col = caretToken.col + caretToken.cols; // only for eof... right?
		}

		this.caretToken = caretToken;

		var changed = col != this.caretCol || row != this.caretRow;
		this.caretCol = col;
		this.caretRow = row;

		// TOFIX: i think the changed part is a bug for input change
		if (changed) this.caretPosChanged();
	},
	//#endif
	updateCaretPos: function(){
		if (this.caretStale) this.computeCaretPos();
		var p = this.colRowToXY(this.caretCol, this.caretRow);
		this.caret.style.left = Math.floor(p.x-this.textarea.scrollLeft) + this.defaultLeftPadding + (this.showLineNumbers?this.lineNumberPadding:0) + 'px';
		this.caret.style.top = Math.floor(p.y-this.textarea.scrollTop) + 'px';
	},
	startCaretBlink: function(){
		clearTimeout(this.caretTimer);

		if (this.caretStale) {
			this.computeCaretPos();
			this.updateCaretPos();
		}
		this.caret.style.display = 'block';
		this.caretVisible = true;

		// "blink" caret
		var blink = function(){
			// only show caret if element has focus at all
			if ((this.textarea == document.focusNode || this.textarea == document.activeElement) && !this.caretVisible) {
				if (this.caretStale) {
					this.computeCaretPos();
					this.updateCaretPos();
				}
				this.caret.style.display = 'block';
				this.caretVisible = true;
			} else {
				this.caret.style.display = 'none';
				this.caretVisible = false;
			}
			this.caretTimer = setTimeout(blink, 500);
		}.bind(this);
		this.caretTimer = setTimeout(blink, 500);
	},
	caretPosChanged: function(){
		// remove all marks added for caret position (if still relevant, they'll be regenerated now)
		// possible optimization is to 
		if (this.caretMarkTrash) {
			for (var i=0; i<this.caretMarkTrash.length; ++i) {
				if (this.caretMarkTrash[i].parentNode) this.caretMarkTrash[i].parentNode.removeChild(this.caretMarkTrash[i]);
			}
		}
		var trash = this.caretMarkTrash = [];

		// try to find a pair to match...		
		var leftHook, rightHook;
		// caret is in front or inside this token
		var match = this.caretToken;
		//#ifdef DEV_BUILD
		if (match) console.log('caret:',match); // on caret change
		//#endif
		if (match) {
			// TOFIX: this is very inefficient. will kill you at the end of long single lines
			var mstart = Math.max(match.start, this.zeon.lines[this.caretRow].start);
			var mstop = Math.min(match.stop, this.zeon.lines[this.caretRow].stop);
			var colstart = this.tabMagic(this.lastInput, this.zeon.lines[this.caretRow].start, mstart);
			var colstop = this.tabMagic(this.lastInput, mstart, mstop, colstart);
			// cover token ever so gently :)
			var css = {
				width: Math.floor((colstop-colstart)*this.fontSize.w)+'px',
				height: Math.floor(this.fontSize.h)+'px',
				'background-color': 'rgba(0, 255, 0, 0.2)'
			};
			trash[trash.length] = this.showMark(
				colstart,
				this.caretRow,
				css
			);

			// regex highlighting
			if (this.regexTwinMark) {
				this.regexTwinMark = this.regexTwinMark.parentElement && void this.regexTwinMark.parentElement.removeChild(this.regexTwinMark);
			}
			if (match.name == 1/*regex*/) {
				// match parens, square and curly brackets
				var pos = this.textarea.selectionStart;
				var chr = this.textarea.value[pos];
				var relpos = pos - match.start;
				var twin = match.twinfo[relpos];
				if (twin) {
					var width = Math.floor(Math.abs(this.fontSize.w*(match.twinfo[relpos]-relpos)))+'px';
					var css = {
						width:width,
						height: '5px',
						border: '1px solid red'
					};
					if (relpos > twin) css['margin-left'] = '-'+width; // compensate for moving it to the left
					this.regexTwinMark = this.showMark(colstart+relpos, this.caretRow, css, 3)
				}
			}

			// determine matching pairs (paren, curly, bracket), shown below
			if (match.twin) {
				leftHook = match;
				rightHook = match.twin;
			} else if (match.tokposw && this.textarea.selectionStart == match.start) { // if not first token and caret is at start of a token; check left token for pair
				if (this.zeon.wtree[match.tokposw-1].twin) {
					leftHook = this.zeon.wtree[match.tokposw-1];
					rightHook = this.zeon.wtree[match.tokposw-1].twin;
				}
			}

			if (this.config['caret popup']) {
				var dom = this.showCaretPopup(match, trash, Gui);
				if (dom) trash.push(dom);
			}

			// highlight all occurrences of this variable or property
			// these are tracked through the scope object. 
			// so only the vars are highlit which actually refer to this variable.
			if (match.trackingObject) {
				if (match.trackingObject.refs) {
					var refs = match.trackingObject.refs;
					for (var i=0; i<refs.length; ++i) {
						var ref = refs[i];
						var css = {
							width: Math.floor((ref.stop-ref.start)*this.fontSize.w)+'px',
							height: Math.floor(this.fontSize.h)+'px',
							'background-color': 'rgba(0, 255, 255, 0.2)'
						};
						var col = this.tabMagic(this.lastInput, this.zeon.lines[ref.startLineId].start, ref.start);
						var row = ref.startLineId;
						trash[trash.length] = this.showMark(col, row, css);
					}
				}

				// if this var was part of a jsdoc, highlight that too.
				if (match.trackingObject.jsdocOriginalLine) {
					var mto = match.trackingObject;
					// highlight entire line, excluding indentation...
					var pos = mto.jsdocOriginalLine.indexOf('*');
					if (pos < 0) pos = mto.jsdocOriginalLine.indexOf('@');

					var css = {
						width: Math.floor(mto.jsdocOriginalLine.length*this.fontSize.w)+'px',
						height: Math.floor(this.fontSize.h)+'px',
						'background-color': 'rgba(0, 255, 255, 0.2)'
					};

					var start = this.zeon.lines[mto.jsdoc.startLineId+mto.relLineId].start;
					var col = this.tabMagic(this.lastInput, start, start+pos);
					var row = mto.jsdoc.startLineId+mto.relLineId;
					trash[trash.length] = this.showMark(col, row, css);
				}
			}
		} else if (this.zeon.wtree[this.zeon.wtree.length-1] && this.zeon.wtree[this.zeon.wtree.length-1].twin) {
			// cursor at end of input, last token has a twin, highlight them.
			leftHook = this.zeon.wtree[this.zeon.wtree.length-1].twin;
			rightHook = this.zeon.wtree[this.zeon.wtree.length-1];
		}

		if (leftHook && rightHook) {
			// highlight this match {([)}] and its twin
			var css = {
				width: Math.floor(this.fontSize.w)+'px',
				height: Math.floor(this.fontSize.h)+'px',
				'background-color': 'rgba(0, 0, 255, 0.2)'
			};
			// the line can be empty if an error occurred.
			if (this.zeon.lines[leftHook.startLineId] && this.zeon.lines[rightHook.startLineId]) {
				var col = this.tabMagic(this.lastInput, this.zeon.lines[leftHook.startLineId].start, leftHook.start);
				var row = leftHook.startLineId;
				trash[trash.length] = this.showMark(col, row, css);
				col = this.tabMagic(this.lastInput, this.zeon.lines[rightHook.startLineId].start, rightHook.start);
				row = rightHook.startLineId;
				trash[trash.length] = this.showMark(col, row, css);
			}
		}
	},

	showCaretPopup: function(match, trash, Gui){
		var dom = null;
		if (match.trackingObject && match.trackingObject.properties) {
			// show tracking object properties
			var css = {
				'background-color': 'rgb(255, 255, 0)',
				color: 'black',
				'z-index': 5
			};
			var propContent = '(to.props)<br/>';
			propContent += 'pos:'+match.start+',line:'+match.startLineId+',tree:'+match.tokposb+'<br/>';
			propContent += 'jspath:'+this.zeon.getJspath(match)+'\n';
			if (match.trackingObject.isConstructor) propContent += 'Constructor: '+Gui.escape(match.trackingObject.constructorName)+'<br/>';
			propContent += 'Type(s):'+Zeon.getUniqueItems(match.trackingObject.varType).map(function(t){
				// if type is Array, return the type of array if we have it...
				if (t == 'Array' && match.trackingObject.arrayTypes) return 'Array['+match.trackingObject.arrayTypes.join(',')+']';
				return t;
			}).map(Gui.escape).join(',')+'<br/>';
			propContent += 'Properties:<br/>'+Zeon.getUniqueItems(Object.keys(match.trackingObject.properties)).map(Gui.escape).join('<br/>');
			var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
			var row = match.startLineId;
			dom = this.showMark(col, row, css, 0, 15, propContent);
		} else if (match.definedProperties) {
			// show match properties
			var css = {
				'background-color': 'rgb(255, 255, 0)',
				color: 'black',
				'z-index': 5
			};
			var propContent = '(defprops)<br/>';
			propContent += 'pos:'+match.start+',line:'+match.startLineId+',btree:'+match.tokposb+'<br/>';
			propContent += 'jspath:'+this.zeon.getJspath(match)+'\n';
			if (match.isConstructor) propContent += 'Constructor: '+Gui.escape(match.constructorName)+'<br/>';
			propContent += 'Type(s):'+(match.trackingObject?Zeon.getUniqueItems(match.trackingObject.varType).map(Gui.escape).join(','):(match.varType?Zeon.getUniqueItems(match.varType).map(Gui.escape).join(','):'?'))+'<br/>';
			propContent += 'Properties:<br/>'+Zeon.getUniqueItems(Object.keys(match.definedProperties)).map(Gui.escape).join('<br/>');
			var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
			var row = match.startLineId;
			dom = this.showMark(col, row, css, 0, 15, propContent);
		} else if (match.trackingObject && match.trackingObject.varType && match.trackingObject.varType.length) {
			// show tracking object type(s)
			var css = {
				'background-color': 'rgb(255, 255, 0)',
				color: 'black',
				'z-index': 5
			};

			// get the prototype tracking object
			var constr = match.targetPrototype || (match.trackingObject && match.trackingObject.targetPrototype);
			var func = constr && (constr.functionStack || (constr.trackingObject && constr.trackingObject.functionStack));
			if (func) func = func[0];
			var proto = func && func.prototypeProperties;
			var propContent = '(to.types)<br/>';
			propContent += 'pos:'+match.start+',line:'+match.startLineId+',btree:'+match.tokposb+'<br/>';
			if (match.trackingObject.jsdocOriginalLine) {
				var str = match.trackingObject.jsdocOriginalLine;
				var result = str.match(/^\s*\**\s*(.*)/);
				if (result && result[1]) {
					propContent += 'JSDoc: '+Gui.escape(result[1])+'\n';
				}
			} else if (match.trackingObject.jsdocVarDesc) {
				propContent += 'JSDoc:\n<i>'+Gui.escape(match.trackingObject.jsdocVarDesc)+'</i>\n';
			} else if (match.trackingObject.functionStack && match.trackingObject.functionStack.lastJsdoc) {
				var cmt = this.getJsdocDesc(match.trackingObject.functionStack.lastJsdoc);
				if (cmt) propContent += 'JSDoc:\n<i>'+Gui.escape(cmt)+'</i>';
			} else if (match.jsdoc) {
				var cmt = this.getJsdocDesc(match.jsdoc);
				if (cmt) propContent += 'JSDoc:\n<i>'+Gui.escape(cmt)+'</i>';
			}
			propContent += 'jspath:'+this.zeon.getJspath(match)+'\n';
			if (match.trackingObject.isConstructor) propContent += 'Constructor: '+Gui.escape(match.trackingObject.constructorName)+'<br/>';
			propContent += 'Type(s):'+Zeon.getUniqueItems(match.trackingObject.varType).map(function(t){
				// if type is Array, return the type of array if we have it...
				if (t == 'Array' && match.trackingObject.arrayTypes) return 'Array['+match.trackingObject.arrayTypes.join(',')+']';
				return t;
			}).map(Gui.escape).join(',')+'<br/>';
			if (proto) propContent += 'From prototype:<br/>'+Object.keys(proto).map(Gui.escape).join('<br/>')+'<br/>';
			if (match.trackingObject.varType && match.trackingObject.varType.indexOf('Function') >= 0) { 
				if (match.functionStack && match.functionStack[0].varType) {
					propContent += 'Returns: '+match.functionStack[0].varType.map(Gui.escape).join(', ');
				}
			}

			var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
			var row = match.startLineId;
			dom = this.showMark(col, row, css, 0, 15, propContent);
		} else if (match.value == 'function') {
			// show function return types and throw types
			var css = {
				'background-color': 'rgb(255, 255, 0)',
				color: 'black',
				'z-index': 5
			};

			var returnTypes = 'undefined';
			if (match.varType && match.varType.length) returnTypes = Zeon.getUniqueItems(match.varType).map(Gui.escape).join(',');

			var throwTypes = 'none';
			if (match.throws && match.throws.length) throwTypes = Zeon.getUniqueItems(match.throws).map(Gui.escape).join(',');

			var propContent = '(function keyword)<br/>';
			propContent += 'Returns: '+returnTypes+'<br/>Throws: '+throwTypes+'<br/>';
			propContent += 'pos:'+match.start+',line:'+match.startLineId+',btree:'+match.tokposb+'<br/>';
			if (match.jsdoc) {
				var cmt = this.getJsdocDesc(match.jsdoc);
				if (cmt) propContent += 'JSDoc:\n<i>'+Gui.escape(cmt)+'</i>';
			}
			propContent += 'jspath:'+this.zeon.getJspath(match)+'\n';
			if (match.isConstructor) propContent += 'Constructor: '+Gui.escape(match.constructorName)+'<br/>';
			if (match.prototypeProperties) propContent += 'Prototype:<br/>'+Object.keys(match.prototypeProperties).map(Gui.escape).join('<br/>');

			var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
			var row = match.startLineId;
			dom = this.showMark(col, row, css, 0, 15, propContent);
		} else if (match.varType && match.varType.length) {
			// match had types but no tracking object? object literal properties can have this
			if (!match.isPropertyOf || !match.isPropertyOf.isObjectLiteralStart) console.log("had types but no tracking object with types?");

			// show match type(s)
			var css = {
				'background-color': 'rgb(255, 255, 0)',
				color: 'black',
				'z-index': 5
			};
			var propContent = '(match.types)<br/>';
			propContent += 'pos:'+match.start+',line:'+match.startLineId+',tree:'+match.tokposb+'<br/>';
			if (match.trackingObject && match.trackingObject.jsdocOriginalLine) {
				var str = match.trackingObject.jsdocOriginalLine;
				var result = str.match(/^\s*\**\s*(.*)/);
				if (result && result[1]) {
					propContent += 'JSDoc: '+Gui.escape(result[1])+'\n';
				}
			} else if (match.functionStack && match.functionStack.lastJsdoc) {
				var cmt = this.getJsdocDesc(match.functionStack.lastJsdoc);
				if (cmt) propContent += 'JSDoc:\n<i>'+Gui.escape(cmt)+'</i>';
			}
			propContent += 'jspath:'+this.zeon.getJspath(match)+'\n';
			if (match.isConstructor) propContent += 'Constructor: '+Gui.escape(match.constructorName)+'<br/>';
			propContent += 'Type(s):'+Zeon.getUniqueItems(match.varType).map(Gui.escape).join(',')+'<br/>';
			var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
			var row = match.startLineId;
			dom = this.showMark(col, row, css, 0, 15, propContent);
		}  else if (match.expressionArg || (match.twin && match.twin.expressionArg)) {
			// show resulting var type(s) of group or dynamic property access (contains an expressions stack with single expression)
			// only highlight the token tho

			var resultType = this.zeon.getType(match.expressionArg || match.twin.expressionArg);

			if (resultType instanceof Array) resultType = Zeon.getUniqueItems(resultType).map(Gui.escape);

			if (typeof resultType == 'string') {}
			else if (!resultType) resultType = '?';
			else if (resultType.value == 'new') {
				if (resultType.targetExpression && resultType.targetExpression.constructorName) resultType = Gui.escape(resultType.targetExpression.constructorName);
				else resultType = 'new-object-instance(todo)';
			}
			else if (resultType.isObjectLiteralStart) resultType = 'Object';
			else if (resultType.isArrayLiteralStart) resultType = 'Array';
			else if (resultType.isFunction) resultType = 'Function';
			else if (resultType instanceof Array) {} // tostring will fix
			else resultType = '?';

			var css = {
				'background-color': 'rgb(100, 0, 255)',
				color: 'white',
				'z-index': 5
			};

			var propContent = '(grouped)<br/>';
			propContent += 'Result type(s) of group:<br/>'+(resultType || "&lt;Unknown&gt;")+'<br/>';
			propContent += 'pos:'+match.start+',line:'+match.startLineId+',btree:'+match.tokposb+'<br/>';
			var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
			var row = match.startLineId;
			dom = this.showMark(col, row, css, 0, 15, propContent);
		}
		return dom;
	},
	getJsdocDesc: function(token){
		return token.jsdoc.map(function(s){
			if (s instanceof Array) return '';
			var result = /^(?:(?:\s*\/\*+\s*([^*\s].+?)\s*\*+\/)|(?:\s*\/\*+\s*([^*\s].+?)\s*)|(?:\s*(.*?[^*\s]+)\*+\/\s*)|(?:\s*\**\s*([^*\/\s].+?)\s*))$/.exec(s);
			if (result && (result[1] || result[2] || result[3] || result[4])) return (result[1] || result[2] || result[3] || result[4])+'\n';
			return '';
		}).join('');
	},

	showAsiMark: function(match){
		var colrow = this.matchToColRow(match);
		var pos = this.colRowToXY(colrow.col, colrow.row);
		var css = {position:'absolute', left: -2+Math.floor(pos.x)+'px', top: 8+Math.floor(pos.y)+'px', width: '2px', height: '8px', 'background-color': 'red'};

		if (this.markCache) this.markCache.push({css1:css});
		else return this.markPop(null, css, null);
	},
	showErrorMark: function(match){
		var colrow = this.matchToColRow(match);
		var pos = this.colRowToXY(colrow.col, colrow.row);
		var css = {position:'absolute', left: -10+Math.floor(pos.x)+'px', top: Math.floor(pos.y)+'px', width: '20px', height: '20px', border: '1px solid red', '-webkit-border-radius':'10px', 'border-radius': '10px'};

		if (this.markCache) this.markCache.push({css1:css});
		else return this.markPop(null, css, null);
	},
	showMark: function(col, row, css2, relLeft, relTop, content){
		if (typeof relLeft != 'number') relLeft = 0;
		if (typeof relTop != 'number') relTop = 0;
		var pos = this.colRowToXY(col, row);
		var css1 = {position:'absolute', left: relLeft+Math.floor(pos.x)+'px', top: relTop+Math.floor(pos.y)+'px'};

		if (this.markCache) this.markCache.push({c:content, css1:css1, css2:css2});
		else return this.markPop(content, css1, css2);
	},
	markPop: function(content, css1, css2){
		var mark = document.createElement('span');
		if (content != null) mark.innerHTML = content;
		Gui.css(mark, css1);
		if (css2) Gui.css(mark, css2);
		this.markLayerOver.appendChild(mark);
		return mark;
	},
	bubble: function(c, match, css2, relLeft, relTop, under){
		var css1 = this.getCssForBubble(match, relLeft, relTop);
		if (this.bubbleCache) this.bubbleCache.push({c:c, css1:css1, css2:css2, under:under});
		else return this.bubblePop(c, css1, css2, false, under);
	},
	bubbleNoSheet: function(c, match, css2, relLeft, relTop, under){
		var css1 = this.getCssForBubble(match, relLeft, relTop);
		return this.bubblePop(c, css1, css2, true, under);
	},
	getCssForBubble: function(match, relLeft, relTop){
		if (typeof relLeft != 'number') relLeft = 0;
		if (typeof relTop != 'number') relTop = 0;
		var row = match.startLineId;
		var col = this.tabMagic(this.lastInput, this.zeon.lines[match.startLineId].start, match.start);
		var pos = this.colRowToXY(col, row);

		var css = {
			position:'absolute',
			left: -8+relLeft+Math.floor(pos.x)+'px',
			top: -3+relTop+Math.floor(pos.y)+'px',
			border: '1px solid black',
			'-webkit-border-radius':'10px',
			'border-radius': '10px',
			margin: 0,
			width: '10px',
			height: '10px',
			'line-height': '8px',
			'text-align': 'center',
			'font-size': '10px',
			'font-weight': 900,
			opacity: 0.4
		};

		return css;
	},
	bubblePop: function(c, css1, css2, noSheet, under){
		var mark = document.createElement('span');
		mark.innerHTML = c;

		if (noSheet) {
			Gui.css(mark, css1);
			Gui.css(mark, css2);
		} else {
			var s = '';
			for (var key in css1) if (css1.hasOwnProperty(key)) s += key+':'+css1[key]+';';
			if (css2) for (var key in css2) if (css2.hasOwnProperty(key)) s += key+':'+css2[key]+';';
			mark.className = this.getCssId(s);
		}

		if (under) this.markLayerUnder.appendChild(mark);
		else this.markLayerOver.appendChild(mark);

		return mark;
	},
	flushMarkCache: function(){
		this.markCache.forEach(function(o){ this.markPop(o.c, o.css1, o.css2); }, this);
		this.markCache = null;
	},
	flushBubbleCache: function(){
		this.bubbleCache.forEach(function(o){ this.bubblePop(o.c, o.css1, o.css2); }, this);
		this.bubbleCache = null;
	},
	flushCaches: function(){
		var parent = this.markLayerOver.parentNode;
		parent.removeChild(this.markLayerOver);
		this.flushBubbleCache();
		this.flushMarkCache();
		parent.appendChild(this.markLayerOver);

		if (this.styleSheet) this.styleSheet.parentNode.removeChild(this.styleSheet);
		var sheet = this.styleCache.map(function(o, i){ return '.'+this.zeonClassPrefix+i+' {'+o+'}\n'; }, this).join('');
		var ss = document.createElement('style');
		ss.innerHTML = sheet;
		document.body.appendChild(ss);
		this.styleSheet = ss;
	},

	showCircleAtMatch: function(match, name){
		if (match.error && match.error.before && match.tokposb) {
			// show error after previous match
			match = this.zeon.btree[match.tokposb-1];
			// since this shows it before the given token, get the next token so it shows it at the end of the previous token
			match = this.zeon.wtree[match.tokposw+1];
		}
		if (this.lastFocusCircle && this.lastFocusCircle.parentNode) this.lastFocusCircle.parentNode.removeChild(this.lastFocusCircle);
		var colrow = this.matchToColRow(match);
		var mark = this.lastFocusCircle = document.createElement('span');
		var pos = this.colRowToXY(colrow.col - (name!='asis'&&name!='errors'?match.value.length:0), colrow.row);
		var x = -20+Math.floor(pos.x);
		var y = -12+Math.floor(pos.y);
		var css = {position:'absolute', left: x+'px', top: y+'px', width: '42px', height: '40px', border: '3px solid blue', '-webkit-border-radius':'30px', 'border-radius': '30px'};
		if (css) Gui.css(mark, css);
		this.markLayerOver.appendChild(mark);
		
		// cleanup
		clearTimeout(this.lastFocusCircle);
		this.circleTimer = setTimeout(function(){
			if (mark.parentNode) mark.parentNode.removeChild(mark);
		}.bind(this), 2000);

		// move to position
		this.textarea.scrollLeft = Math.max(0, x-(window.innerWidth-100));
		this.textarea.scrollTop = Math.max(0, y-300);

		return mark;
	},

	/**
	 * Enable drag and drop for this textarea. Should probably not do that by default :)
	 * This is basically the same code as I wrote for uglifyjs: http://marijnhaverbeke.nl/uglifyjs
	 */
	enableDnD: function(){
		if (window.File && window.FileReader && window.FileList) {
			var syntaxLayer = this.syntaxLayer;

			var stopEvent = function(e){
				e.stopPropagation();
				e.preventDefault();
			};

			// take a FileList object and process all the files it contains
			var processFiles = function(files){
				for (var i = 0; i < files.length; ++i)
					read(files[i]);
			};

			var stl = document.createElement('style');
			stl.type = 'text/css';
			var css = '\
				/* pulsy! and a bgcolor as fallback for non-webkit */\
				@-webkit-keyframes zeon-pulse {\
					0% { background: white; }\
					100% { background: #6af; }\
				}\
				.zeon-active-drop-target {\
					-webkit-animation-name: zeon-pulse;\
					-webkit-animation-duration: 0.7s;\
					-webkit-animation-iteration-count: infinite;\
					-webkit-animation-direction: alternate;\
					-webkit-animation-timing-function: in-and-out;\
					background: #6af;\
				}\
			';
			if (stl.styleSheet) stl.styleSheet.cssText = css;
			else stl.innerHTML = css;
			document.head.appendChild(stl);

			// read a single File with a FileReader
			// onload, append the result to the textarea (with a return appended to it)
			// and a comment to make clear the file starts there.
			var read = function(file){
				var fr = new FileReader;
				fr.onload = function(e){
					var v = this.getValue();
					this.setValue(
						v + (v ? '\n\n' : '') +
						';// #################################\n' +
						' // ## Start of file: ' +
						file.name +
						'\n' +
						' // #################################\n\n' +
						fr.result
					);
				}.bind(this);
				// on error flash red?
				fr.onabort = function(e){
					console.log("The file read was aborted... (maybe you're in a local file on chrome?)", e);
				};
				fr.onerror = function(e){
					console.log("There was an error reading the file... (maybe you're in a local file on chrome?)", e);
				};
				// start read (script files are utf-8, no? :)
				fr.readAsText(file);
			}.bind(this);

			// dragging onto textarea
			this.textarea.ondragenter = function(evt){
				stopEvent(evt);
				syntaxLayer.className += ' zeon-active-drop-target';
			};
			// drag-moving over the textarea
			this.textarea.ondragover = function(evt){
				stopEvent(evt);
			};
			// no-longer dragging over the textarea
			this.textarea.ondragleave = function(evt){
				stopEvent(evt);
				syntaxLayer.className = syntaxLayer.className.replace(/ ?zeon-active-drop-target/g, '');
			};
			// dropped on the textarea
			this.textarea.ondrop = function(evt){
				stopEvent(evt);
				syntaxLayer.className = syntaxLayer.className.replace(/ ?zeon-active-drop-target/g, '');

				var files = evt.dataTransfer.files; // FileList object.
				if (files) {
					console.log("files",files)
					processFiles(files);
				} else try {
					console.log("doooooo")
					var text = evt.dataTransfer.getData("Text");
					this.value += text;
				} catch (e) {
					console.log("baaaar")
				}
			};
		}
	},

	//#ifdef REMOVE_ME (do not push to production) 
	save: function(){
		var source = 'file';
		var target = 'file';
		webkitRequestFileSystem(window.PERSISTENT, 5 * 1024, function(fs){
			fs.root.getFile(source, null, function(f){
				console.log("opened", source, 'isfile', f.isFile, 'name', f.name, 'path', f.fullPath);
				console.log("File", f.file());
			}, handleError);
		}, handleError);
		webkitRequestFileSystem(window.PERSISTENT, 5 * 1024, function(fs){
			fs.root.getFile(target, {create:true}, function(f){
				console.log(['created', target, 'isfile', f.isFile, 'name', f.name, 'path', f.fullPath]);
				f.createWriter(function(writer){
					console.log("constructing blob...");
					var bb = new WebKitBlobBuilder();
					bb.append("Lorem ipsum");
					console.log("setting up writer");
					writer.onwrite = function done(evt){
						console.log("Write completed.");
					};
					writer.onerror = function error(evt){
						console.log("Write failed:", evt);
						handleError(evt.currentTarget.error);
					};
					console.log("writing...");
					writer.write(bb.getBlob());
				});
			}, handleError);
		}, handleError);
		webkitRequestFileSystem(window.PERSISTENT, 5 * 1024, function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var fetch = function(cb){
				dirReader.readEntries(function(results){
					if (results.length) {
						entries = entries.concat(Array.prototype.slice.call(results, 0));
						fetch(cb);
					}
					else cb();
				}, handleError);
			};
			fetch(function(){
				entries.forEach(function(entry){
					entry.remove(function(){
						console.log('Directory removed.');
					}, handleError);
					console.log("entry", entry.name, entry);
				});
			});
		});
		function handleError(e) {
			var msg = '';
			switch (e.code) {
				case FileError.QUOTA_EXCEEDED_ERR:
					msg = 'QUOTA_EXCEEDED_ERR';
					break;
				case FileError.NOT_FOUND_ERR:
					msg = 'NOT_FOUND_ERR';
					break;
				case FileError.SECURITY_ERR:
					msg = 'SECURITY_ERR';
					break;
				case FileError.INVALID_MODIFICATION_ERR:
					msg = 'INVALID_MODIFICATION_ERR';
					break;
				case FileError.INVALID_STATE_ERR:
					msg = 'INVALID_STATE_ERR';
					break;
				default:
					msg = 'Unknown Error';
					break;
		
			}
			;
			console.log('Error: ' + msg);
			//list(fs);
		}

	},
	//#endif
0:0};

// specific to the webkit remote debugger
//Zeon.start(true);

/*

//init:

var textarea = document.getElementsByTagName('textarea')[0];
var zeon = new Zeon(textarea);
textarea.focus();

*/