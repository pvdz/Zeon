Gui.Search = function(gui){
	this.gui = gui;

	this.createContainer();
	this.addContent();
};

Gui.Search.prototype = {
	container: null,
	gui: null,

	domSearch: null,
	domType: null,
	domIsWrap: null,
	domIsCS: null,
	domIsRegex: null,
	domPrev: null,

	dragStartMouse: null,
	dragStartPos: null,

	addContent: function(){
		this.addHeader();

		var head = document.createElement('b');
		head.innerHTML = 'Search ';
		var search = this.domSearch = document.createElement('input');
		search.onkeypress = function(e){ if (e.keyCode == 13) next.onclick(); }
		this.setSearch(this.gui.getValue().slice(this.gui.textarea.selectionStart, this.gui.textarea.selectionEnd));
//		this.setSearch('?foo?***');
//		this.setSearch('foo');
		var isRegex = this.domIsRegex = document.createElement('input');
		isRegex.type = 'checkbox';
		isRegex.checked = false;
		isRegex.onclick = this.changedRegexOrType.bind(this);
		var regexText = document.createElement('span');
		regexText.innerHTML = 'Regex ';
		var isCS = this.domIsCS = document.createElement('input');
		isCS.type = 'checkbox';
		isCS.checked = false;
		var csText = document.createElement('span');
		csText.innerHTML = 'CaseSensitive ';
		var isWrap = this.domIsWrap = document.createElement('input');
		isWrap.type = 'checkbox';
		isWrap.checked = true;
		var wrapText = document.createElement('span');
		wrapText.innerHTML = 'Wrap ';
		var type = document.createElement('span');
		type.innerHTML = '<select>'+
				'<option selected>Anywhere</option>'+
				'<option >Identifiers</option>'+
				'<option>- Var names</option>'+
				'<option >- Property names</option>'+
				'<option >Strings</option>'+
				'<option >- Single</option>'+
				'<option>- Double</option>'+
				'<option>Comment</option>'+
				'<option>- Single</option>'+
				'<option>- Multi</option>'+
				'<option>Regex</option>'+
			'</select>';
		this.domType = type = type.firstChild;
		type.onchange = this.changedRegexOrType.bind(this);
		var prev = this.domPrev = document.createElement('input');
		prev.type = 'button';
		prev.value = "Prev";
		prev.onclick = this.searchPrev.bind(this);
		var next = document.createElement('input');
		next.type = 'button';
		next.value = "Next";
		next.onclick = this.searchNext.bind(this);
		var close = document.createElement('input');
		close.type = 'button';
		close.value = "Close";
		close.onclick = this.close.bind(this);

		this.container.appendChild(head);
		this.container.appendChild(search);
		search.focus();
		search.selectionStart = 0;
		search.selectionEnd = search.value.length;
		this.container.appendChild(isRegex);
		this.container.appendChild(regexText);
		this.container.appendChild(isCS);
		this.container.appendChild(csText);
		this.container.appendChild(isWrap);
		this.container.appendChild(wrapText);
		this.container.appendChild(type);
		this.container.appendChild(prev);
		this.container.appendChild(next);
		this.container.appendChild(close);
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
	},
	close: function(){
		this.container.parentNode.removeChild(this.container);
		this.gui = null;
	},

	setSearch: function(val){
		this.domSearch.value = val.replace(/\u21b5/g,'\\\u21b5').replace(/\n/g,'\u21b5');
	},
	getSearch: function(){
		return this.domSearch.value.replace(/\u21b5/g,'\n').replace(/\\\u21b5/g,'\u21b5');
	},

	searchPrev: function(){
		if (this.domType.selectedIndex === 0) {
			var target = this.getSearch();
			var currentPos = this.gui.textarea.selectionStart;
			var pos = -1;
			if (currentPos) pos = this.gui.getValue().lastIndexOf(target, currentPos-1);
			if (pos < 0 && this.domIsWrap.checked) pos = this.gui.getValue().lastIndexOf(target);
			if (pos >= 0) {
				this.hit(pos, pos + target.length);
			}
		} else {
			var tree = this.gui.zeon.wtree;
			var pos = this.gui.textarea.selectionStart;
			var start = this.gui.computeCaretPosAt(pos); // length-1 because otherwise it would take the lineterminator, makes us having to check for */ though
			if (start) {
				var found = false;
				var pass = 0;
				var startpos = start.tokposw;
				var target = this.getSearch();
				// if not regex, escape all the characters (just escape them all, regardless)
				target = this.toRegex(target);
				while (!found && (++pass == 1 || (pass == 2 && this.domIsWrap.checked))) {
					if (pass == 1) {
						// before current position (starting at pos)
						pos = start.tokposw;
					} else {
						// after current position (start at end)
						pos = tree.length;
					}
					while (!found && ((pass == 1 && pos--) || (pass == 2 && --pos >= startpos))) {
						found = this.searchBody(tree, pos, this.domType.selectedIndex, target);
					}
				}
			}
		}
	},
	searchNext: function(){
		var target = this.getSearch();

		var history = this.gui.searchHistory;
		if (history[0] != target) history.unshift(target);

		if (this.domType.selectedIndex === 0) {
			var currentPos = this.gui.textarea.selectionEnd;
			var pos = -1;
			if (this.domIsRegex.checked || !this.domIsCS.checked) {
				target = this.toRegex(target, true);
				target.lastIndex = currentPos;
				pos = target.exec(this.gui.getValue());
				if (!pos && this.domIsWrap.checked) {
					target.lastIndex = 0;
					pos = target.exec(this.gui.getValue());
				}
				if (pos) {
					this.hit(pos.index, target.lastIndex);
				}
			} else {
				pos = this.gui.getValue().indexOf(target, currentPos);
				if (pos < 0) pos = this.gui.getValue().indexOf(target);
				if (pos >= 0) {
					this.hit(pos, pos + target.length);
				}
			}
		} else {
			var tree = this.gui.zeon.wtree;
			var pos = this.gui.textarea.selectionStart;
			var start = this.gui.computeCaretPosAt(pos); // length-1 because otherwise it would take the lineterminator, makes us having to check for */ though
			if (start) {
				var found = false;
				var pass = 0;
				var startpos = start.tokposw;
				// if not regex, escape all the characters (just escape them all, regardless)
				target = this.toRegex(target);
				while (!found && (++pass == 1 || (pass == 2 && this.domIsWrap.checked))) {
					if (pass == 1) {
						// before current position (starting at pos)
						pos = start.tokposw;
					} else {
						// after current position (start at end)
						pos = -1;
					}
					while (!found && ((pass == 1 && ++pos < tree.length) || (pass == 2 && ++pos <= startpos))) {
						found = this.searchBody(tree, pos, this.domType.selectedIndex, target);
					}
				}
			}
		}
	},
	searchBody: function(tree, pos, type, target, found){
		var testing = tree[pos];
		var okToken = false;
		switch (type) {
			case 1: // var names
				okToken = testing.name == 2/*identifier*/;
				break;
			case 2: // var names
				okToken = testing.name == 2/*identifier*/ && testing.leadValue;
				break;
			case 3: // property names
				okToken = testing.isPropertyName;
				break;
			case 4: // strings
				okToken = testing.isString;
				break;
			case 5: // single string
				okToken = testing.name == 5/*STRING_SINGLE*/;
				break;
			case 6: // double string
				okToken = testing.name == 6/*STRING_DOUBLE*/;
				break;
			case 7: // comment
				okToken = testing.isComment;
				break;
			case 8: // single line
				okToken = testing.name == 7/*COMMENT_SINGLE*/;
				break;
			case 9: // multi line
				okToken = testing.name == 8/*COMMENT_MULTI*/;
				break;
			case 10: // regex
				okToken = testing.name == 1/*regex*/;
				break;
			default:
				console.log("unknown search token type", type);
		}
		if (okToken) {
			if (testing.value.search(target) >= 0) {
				found = true;
				// select this token
				this.hit(testing.start, testing.stop);
				return true;
			}
		}
	},

	hit: function(start, end){
		this.gui.textarea.selectionStart = start;
		this.gui.textarea.selectionEnd = end;

		var token = this.gui.computeCaretPosAt(start);
		var colrow = this.gui.matchToColRow(token);
		var xy = this.gui.colRowToXY(colrow.col - (start-token.start), colrow.row);

		// move to position
		this.gui.textarea.scrollLeft = Math.max(0, xy.x-(window.innerWidth-150));
		this.gui.textarea.scrollTop = Math.max(0, xy.y-300);
	},

	changedRegexOrType: function(){
		// if regex in "anywhere", disable prev. otherwise enable it
		this.domPrev.disabled = (this.domIsRegex.checked && this.domType.selectedIndex === 0);
	},
	toRegex: function(body, global){
		if (!this.domIsRegex.checked) body = body.split('').map(function(s){ return (/[a-zA-Z0-9]/.test(s) ? '' : '\\') + s.replace(/\n/g,'n'); }).join('');
		return new RegExp(body, (this.domIsCS.checked?'':'i')+(global?'g':''));
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
























