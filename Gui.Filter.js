Gui.Filter = function(gui, name, items, nav, pos, data){
	this.gui = gui;
	this.name = name;
	this.nav = nav;
	this.createContainer(pos);
	this.addHeader(name);
	this.data = data;
	for (var key in items) if (items.hasOwnProperty(key)) {
		this.addItem(key, items[key]);
	}
	this.addCloseButton();
};

Gui.Filter.prototype = {
	gui: null,
	name: null,
	nav: null,
	data: null,
	container: null,
	dragStartMouse: null,
	dragStartPos: null,

	createContainer: function(pos){
		this.container = document.createElement('div');
		this.container.className = 'zeon-filter';
		Gui.css(this.container, {position:'absolute', left:pos.x+'px', top:pos.y+'px', zIndex:500, backgroundColor:'white', color:'black',fontSize:'12px', padding: '5px', border:'1px solid green', WebkitBorderRadius:'5px', borderRadius:'5px'});
		this.nav.gui.layerContainer.appendChild(this.container);

		this.container.onclick = function(e){
			var action = e.target.className;
			if (action == 'prev' || action == 'next' || action == 'current') {
				var name = e.target.parentElement.getAttribute('data-message');
				var count = e.target.parentElement.getAttribute('data-count');
				var pos = this.getAndUpdatePosForDesc(name, count, action);
				var go = this.gui.navPos[name] + 1;
				var found = 0;
				for (var i=0; i<this.data.length; ++i) {
					switch (this.name) {
						case 'errors':
							if (this.data[i].error && this.data[i].error.msg == name) ++found;
							break;
						case 'warnings':
							if (this.data[i].warnings.indexOf(name) >= 0) ++found;
							break;
						case 'implicitGlobals':
							if (this.data[i].value == name) ++found;
							break;
						case 'knownGlobals':
							if (this.data[i].value == name) ++found;
							break;
						case 'todofix':
							if (this.data[i].value == name) ++found;
							break;
						default:
							console.warn('unknown filter type', this.name);
					}
					if (found == go) break;
				}
				if (found == go) {
					this.gui.showCircleAtMatch(this.data[i], name);
				}

				e.target.parentNode.getElementsByClassName('current')[0].innerHTML = pos;
			}
		}.bind(this);
	},
	addHeader: function(name){
		var top = document.createElement('div');
		Gui.css(top, {height: '1px', backgroundColor: 'black', position: 'relative', top: '-2px', cursor: 'move', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', border: '2px solid black', WebkitBorderRadius:'3px', borderRadius:'3px'});
		this.container.appendChild(top);
		top.onmousedown = this.dragStart.bind(this);

		var head = document.createElement('div');
		head.innerHTML = '<b>'+name+'</b><br/><br/>';
		this.container.appendChild(head);
	},
	addItem: function(desc, count){
		var e = document.createElement('div');
		var pos = this.getAndUpdatePosForDesc(desc, count);
		// there's a delegate to catch clicks on/in this element. the prev, current and next classes cause actions. the data-message of their parent is the warning being used.
		e.innerHTML =
			'<span style="white-space: pre; font-family: monospace;" data-message="'+desc+'" data-count="'+count+'">'+
				(count>1?'<span class="prev" style="cursor:pointer;">&lt;</span>':' ')+
				' <span class="current" style="cursor:pointer;">'+pos+'</span> '+
				(count>1?'<span class="next" style="cursor:pointer;">&gt;</span>':' ')+
			' |</span> '+
			desc+' '+
			'<b>'+count+'x</b>'
		;
		this.container.appendChild(e);
	},
	addCloseButton: function(onClose){
		this.container.appendChild(document.createElement('br'));
		var e = document.createElement('div');
		Gui.css(e, 'cursor', 'pointer');
		e.innerHTML = 'close';
		e.onclick = function(){
			this.close();
			if (onClose) onClose();
		}.bind(this);
		this.container.appendChild(e);
	},
	close: function(){
		if (this.container.parentNode) {
			this.container.parentNode.removeChild(this.container);
			delete this.nav.openFilters[this.name]; // remove yourself from open containers...
			this.nav = null;
		}
	},
	getAndUpdatePosForDesc: function(desc, count, action){
		var pos = this.gui.navPos[desc] || 0;
		if (action == 'prev') --pos;
		else if (action == 'next') ++pos;
		if (pos >= count) pos = 0;
		if (pos < 0) pos = count-1;
		this.gui.navPos[desc] = pos;
		if (count == 0) pos = ' 0';
		else if (pos < 9) pos = ' '+(pos+1);
		else pos = pos+1+'';
		return pos;
	},

	dragStart: function(e){
		this.dragStartMouse = {x:e.clientX, y:e.clientY};
		this.dragStartPos = this.getPosition();

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

	getPosition: function(){
		return {
			x:parseInt(Gui.css(this.container,'left'),10),
			y:parseInt(Gui.css(this.container,'top'), 10)
		};
	},
0:0};