Gui.Warning = function(guiConfig){
	this.guiConfig = guiConfig;
	
	this.createContainer();
	this.regenerate();
};
Gui.Warning.prototype = {
	guiConfig: null,
	container: null,
	
	createContainer: function(){
		this.container = document.createElement('div');
		Gui.css(this.container, {position:'absolute', width: '1025px', top:'50px', left:'50px', zIndex:500, backgroundColor:'white', color:'black',fontSize:'12px', padding: '5px', border:'1px solid green', WebkitBorderRadius:'5px', borderRadius:'5px'});
		this.guiConfig.gui.layerContainer.appendChild(this.container);
	},
	
	regenerate: function(){
		this.container.innerHTML = '';
		this.addHeader();
		this.addCloseButton();
		
		var config = this.guiConfig.gui.config;
		var notWarning = this.guiConfig.used;
		var n = 0;
		for (var key in config) if (config.hasOwnProperty(key) && !notWarning[key]) this.createOption(key, !(++n%5));
		
		this.addCloseButton();
	},

	addHeader: function(){
		var top = document.createElement('div');
		Gui.css(top, {height: '1px', backgroundColor: 'black', position: 'relative', top: '-2px', cursor: 'move', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', border: '2px solid black', WebkitBorderRadius:'3px', borderRadius:'3px'});
		this.container.appendChild(top);
		top.onmousedown = this.dragStart.bind(this);

		var head = document.createElement('div');
		head.innerHTML = '<b>Warning toggles</b><br/>';
		this.container.appendChild(head);
	},
	
	createOption: function(desc, cl){
		var config = this.guiConfig.gui.config;
		var e = document.createElement('div');
		Gui.css(e, {cursor: 'pointer', width: '200px', height: '20px',marginRight: '5px', cssFloat: 'left', clear:cl?'left':'none', overflow:'hidden', 'white-space':'pre'});
		e.innerHTML = '<input type="checkbox" '+(config[desc]?'checked ':'')+'/> '+desc;
		e.onclick = function(){
			config[desc] = !config[desc];
			// element we defined above should only have one input...
			e.getElementsByTagName('input')[0].checked = config[desc];
			
			if (window.localStorage) {
				window.localStorage.setItem('zeon-config', JSON.stringify(config));
			}
		}.bind(this);
		this.container.appendChild(e);
	},
	
	addCloseButton: function(){
		var e = document.createElement('div');
		Gui.css(e, {cursor: 'pointer', clear:'left'});
		e.innerHTML = 'close';
		e.onclick = function(){
			this.close();
		}.bind(this);
		this.container.appendChild(e);
	},
	close: function(){
		this.container.parentNode.removeChild(this.container);
		this.guiConfig.guiWarning = null;
		this.guiConfig = null;
	},
	
	dragStart: function(e){
		this.dragStartMouse = {x:e.clientX, y:e.clientY};
		this.dragStartPos = this.getContainerPosition();
		
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
	
	getContainerPosition: function(){
		return {
			x:parseInt(Gui.css(this.container,'left'),10), 
			y:parseInt(Gui.css(this.container,'top'), 10)
		};
	},
0:0};
