Gui.Config = function(gui, onClose){
	this.gui = gui;
	this.onClose = onClose;
	this.used = {};

	this.createContainer();
	this.addContent();
};
Gui.Config.prototype = {
	container: null,
	gui: null,
	used: null, // track which options have been used. all other options must be warning options... prevents us from having to manually define the warning options, again.
	onClose: null,

	addContent: function(){
		this.addHeader();

		this.addWarningOption();
		this.addMarkerOption();
		this.addScopeOption();
		this.addRulerOption();
		this.addAnnotationOption();
		this.createOption('minify variable names too');
		this.createOption('minify property names too');
		this.createOption('minify property names always');
		this.createOption('minify uses newlines for semis');
		this.createOption('hoisting fix moves func decl to top');
		this.createOption('caret popup');
		this.createOption('load saved code at start');
		this.addTrailingWhitespaceOption();
		this.addDisableZeonOption();

		this.addCloseButton(this.onClose);
	},
	createContainer: function(){
		this.container = document.createElement('div');
		Gui.css(this.container, {position:'absolute', top:'50px', left:'50px', zIndex:500, backgroundColor:'white', color:'black',fontSize:'12px', padding: '5px', border:'1px solid green', WebkitBorderRadius:'5px', borderRadius:'5px'});
		this.gui.layerContainer.appendChild(this.container);
	},
	addHeader: function(){
		var top = document.createElement('div');
		Gui.css(top, {height: '1px', backgroundColor: 'black', position: 'relative', top: '-2px', cursor: 'move', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', border: '2px solid black', WebkitBorderRadius:'3px', borderRadius:'3px'});
		this.container.appendChild(top);
		top.onmousedown = this.dragStart.bind(this);

		var head = document.createElement('div');
		Gui.css(head, {padding: '2px 0'});
		head.innerHTML = '<b>Config</b> ';
		this.container.appendChild(head);

		var e = document.createElement('span');
		Gui.css(e, {'cursor': 'pointer'});
		e.innerHTML = '(reset)';
		e.onclick = function(){
			var obj = Zeon.getNewConfig();
			var config = this.gui.config;
			for (var key in obj) if (obj.hasOwnProperty(key)) config[key] = obj[key];

			if (window.localStorage) {
				window.localStorage.setItem('zeon-config', JSON.stringify(config));
			}

			this.container.innerHTML = '';
			this.addContent();
			if (this.guiWarning) this.guiWarning.regenerate();
		}.bind(this);
		head.appendChild(e);
	},
	addWarningOption: function(){
		this.createOption(
			'warnings',
			function(val){
				this.gui.zeon.enableWarnings = val;
				// need to completely parse it again because if warnings are disabled, it's not (completely) checked by the post process
				this.gui.update(true);
			}
		);

		var e = document.createElement('div');
		Gui.css(e, {'cursor': 'pointer', padding: '2px 0'});
		e.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;configure...';
		e.onclick = function(){
			if (!this.guiWarning) this.guiWarning = new Gui.Warning(this);
		}.bind(this);
		this.container.appendChild(e);
	},
	createLintOption: function(name){
		this.createOption(
			name,
			function(){ this.gui.refreshSyntaxHighlight(true); },
			true
		);
	},
	addMarkerOption: function(){
		this.createOption(
			'markers',
			function(newval){ Gui.css(this.gui.markLayer, 'display', newval?'block':'none'); }
		);
	},
	addScopeOption: function(){
		this.createOption(
			'scope depth',
			function(){ this.gui.refreshSyntaxHighlight(true); }
		);
	},
	addRulerOption: function(){
		this.createOption(
			'ruler',
			function(newval){
				Gui.css(this.gui.ruler, 'display', newval?'block':'none');
				this.gui.updatePaddingLeft();
			}
		);
	},
	addAnnotationOption: function(){
		this.createOption(
			'type annotations',
			function(){ this.gui.refreshSyntaxHighlight(true); }
		);
	},
	addTrailingWhitespaceOption: function(){
		this.createOption(
			'trailing whitespace cue',
			function(){ this.gui.refreshSyntaxHighlight(true); }
		);
	},
	addDisableZeonOption: function(){
		this.createOption(
			'zeon visual output',
			function(){ this.gui.refreshSyntaxHighlight(); }
		);
	},
	createOption: function(desc, callback, indent){
		this.used[desc] = true;
		var config = this.gui.config;
		var e = document.createElement('div');
		Gui.css(e, 'cursor', 'pointer');
		e.innerHTML = (indent?'&nbsp;&nbsp;&nbsp;&nbsp;':'')+'<input type="checkbox" '+(config[desc]?'checked ':'')+'/> '+desc;
		e.onclick = function(){
			config[desc] = !config[desc];
			if (callback) callback.call(this, config[desc]);
			// element we defined above should only have one input...
			e.getElementsByTagName('input')[0].checked = config[desc];

			if (window.localStorage) {
				window.localStorage.setItem('zeon-config', JSON.stringify(config));
			}
		}.bind(this);
		this.container.appendChild(e);
	},
	addCloseButton: function(onClose){
		this.container.appendChild(document.createElement('br'));
		var e = document.createElement('div');
		Gui.css(e, 'cursor', 'pointer');
		e.innerHTML = 'close';
		e.onclick = function(){
			this.close();
			onClose();
		}.bind(this);
		this.container.appendChild(e);
	},
	close: function(){
		if (this.guiWarning) {
			this.guiWarning.close();
			this.guiWarning = null;
		}
		this.container.parentNode.removeChild(this.container);
		this.gui = null;
	},

	dragStart: function(e){
		this.dragStartMouse = {x:e.clientX, y:e.clientY};
		this.dragStartPos = this.getConfigPosition();

		document.body.onmousemove = this.dragMove.bind(this);
		document.body.onmouseup = this.dragStop.bind(this);
	},
	dragMove: function(e){
		if (this.dragStartMouse) {
			Gui.css(this.container, {
				left: this.dragStartPos.x + (e.clientX - this.dragStartMouse.x) + 'px',
				top: this.dragStartPos.y + (e.clientY - this.dragStartMouse.y) + 'px'
			});
		}
	},
	dragStop: function(){
		document.body.onmousemove = null;
		document.body.onmouseup = null;
		this.dragStartMouse = null;
		this.dragStartPos = null;
	},
	getConfigPosition: function(){
		return {
			x:parseInt(Gui.css(this.container,'left'),10),
			y:parseInt(Gui.css(this.container,'top'), 10)
		};
	},
0:0};