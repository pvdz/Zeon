var BOOKMARKLET = false; //#define BOOKMARKLET

// Buttons source: http://icons.mysitemyway.com/category/simple-black-square-icons/
// http://icons.mysitemyway.com/gallery/post/simple-black-square-icons-natural-wonders/
// http://icons.mysitemyway.com/gallery/post/simple-black-square-icons-culture/
// http://icons.mysitemyway.com/simple-red-square-icons-alphanumeric/

Gui.Nav = function(gui){
	this.gui = gui;

	this.lastNavPos = {};

	this.openFilters = {};

	this.createNavContainer();
	this.addNavHeader(); // top-right corner of menu
	this.addNavCaretInfo();
	this.addNavigators();

	this.addMenuButtons();

	// Z in bottom-right corner
	this.createZButton();
};
Gui.Nav.prototype = {
	gui: null,

	nav: null,
	z: null,

	navInputLen: null,
	minifyButton: null,
	beautifyButton: null,
	configButton: null,
	pragmaButton: null,
	treeButton: null,
	removeButton: null,
	jsdocButton: null,
	varButton: null,

	configPopup: null,

	lastNavPos: null, // array with indices

	hasHorizontalBar: null,
	hasVerticalBar: null,

	openFilters: null,

	createNavContainer: function(){
		this.nav = document.createElement('div');
		this.nav.className = 'zeon-nav';

		Gui.css(this.nav, {
			position: 'absolute',
			bottom: '20px',
			right: '20px',
			border: '1px solid black',
			borderRight: '0px',
			borderBottom: '0px',
			backgroundColor: 'white',
			color: 'black',
			fontSize: '13px',
			padding: '5px',
			WebkitBorderRadius:'10px 0 0 0',
			borderRadius: '10px 0 0 0',
			WebkitBoxShadow: '-1px -1px 3px #ccc',
			boxShadow: '-1px -1px 3px #ccc',
			display: 'none',
			fontFamily: 'Verdana',
			userSelect: 'none',
			webkitUserSelect: 'none',
			zIndex: 9 // must be higher than highest panel and lower than Z...
		});

		this.gui.layerContainer.appendChild(this.nav);

		this.nav.onclick = this.onNavClick.bind(this);
	},
	onNavClick: function(e){
		var action = e.target.className;
		var data = e.target.parentNode.querySelector('.data');

		if (action == 'prev' || action == 'next' || action == 'data') {
			var name = e.target.parentNode.className;
			this.onNavAction(name, action);
		} else if (action == 'name') {
			var name = e.target.parentNode.parentNode.className;
			if (name == 'errors' || name == 'warnings' || name == 'implicitGlobals' || name == 'knownGlobals' || name == 'todofix') {
				this.openFilter(name);
			}
		}

		if (e.target.nodeName != 'A') return false; // dont prevent a's
	},

	addNavHeader: function(){
		this.nav.innerHTML = '<a href="http://zeonjs.com/" target="_blank" style="float:right; font-family:monospace; color:black;">Zeon.js</a>';
	},
	addNavCaretInfo: function(){
		// initialization done in .update()
		this.navInputLen = document.createElement('div');
		this.nav.appendChild(this.navInputLen);

		this.navInputLines = document.createElement('div');
		this.nav.appendChild(this.navInputLines);
	},
	addNavigators: function(){
		this.navs = document.createElement('div');
		this.nav.appendChild(this.navs);
	},

	addMenuButtons: function(){
		this.toolMenu = document.createElement('div');
		Gui.css(this.toolMenu, {marginTop: '5px'});
		this.nav.appendChild(this.toolMenu);
		// menu buttons
		this.addMinifyButton();
		this.addBeautifyButton();
		this.addConfigButton();
		if (BOOKMARKLET) {//#ifdef BOOKMARKLET
		this.addNavMaxButton();
		}//#endif
		this.addProtoButton();
		this.addSaveButton();
		this.addLoadButton();
		this.addTreeButton();
		this.addPragmaButton();
		this.addJsdocButton();
		this.addToJsStringButton();
		this.addFromJsStringButton();
		this.addBookmarkletButton();
		this.addVarButton();
		this.addTrimButton();
		this.addInjectButton();
		//#ifdef DEV_BUILD
		/* this.addAltMinifyButton(); */
		//#endif
		this.addDisambiguationButton();
		this.addProfilerButton();
		this.addBranchButton();
		this.addExtractButton();
		if (BOOKMARKLET) {//#ifdef BOOKMARKLET
		this.addRemoveButton();
		}//#endif
		this.addFuzzButton();
		//#ifdef DEV_BUILD
		if (false) this.addBinButton();
		//#endif
	},
	addMinifyButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.minifyButton = this.createTextLink("Minify");
		} else { //#elsedef
		this.minifyButton = this.createButton('minify', 'Minify');
		} //#endif
		this.minifyButton.onclick = function(){
			var textarea = this.gui.textarea;
			var start = textarea.selectionStart;
			var stop = textarea.selectionStop;
			this.gui.setValue(this.gui.zeon.minify());
			textarea.selectionStart = start;
			textarea.selectionStop = stop;
			textarea.focus();
		}.bind(this);
		this.toolMenu.appendChild(this.minifyButton);
	},
	addBeautifyButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.beautifyButton = this.createTextLink("Beautify");
		} else { //#elsedef
		this.beautifyButton = this.createButton('beautify','Beautify');
		} //#endif
		this.beautifyButton.onclick = function(){
			var textarea = this.gui.textarea;
			var start = textarea.selectionStart;
			var stop = textarea.selectionStop;
			if (this.gui.zeon.btree.length) {
				var tree = new Ast(this.gui.zeon.tree, this.gui.zeon.btree); // this will be my new structure in the next iteration
	//			window.btoken = tree;
	//			console.log('window.btoken', tree);
				this.gui.setValue(tree.beautify(0));
				textarea.selectionStart = start;
				textarea.selectionStop = stop;
				textarea.focus();
			}
		}.bind(this);

		this.toolMenu.appendChild(this.beautifyButton);
	},
	addConfigButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.configButton = this.createTextLink("Config");
		} else { //#elsedef
		this.configButton = this.createButton('config','Config');
		} //#endif
		this.configButton.onclick = function(){
			if (this.configPopup) return;
			this.configPopup = true;
			new Gui.Config(this.gui, function(){ this.configPopup = false; }.bind(this));
		}.bind(this);
		this.toolMenu.appendChild(this.configButton);
	},
	//#ifdef BOOKMARKLET
	addNavMaxButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		var max = document.createElement('div');
		max.className = 'maximize';
		Gui.css(max, {position:'absolute',bottom:'58px',right:'2px',margin:'0',padding:'0 3px 1px 3px',cursor:'pointer',fontWeight:'bold',fontSize:'12px',border:'1px solid black',WebkitBorderRadius:'2px',borderRadius:'2px',color:'black',backgroundColor:'white'});
		max.innerHTML = '+';
		this.nav.appendChild(max);
		max.onclick = function(){
			var lc = this.gui.layerContainer;
			if (lc.parentNode == this.gui.rootContainer) {
				Gui.css(lc, {position:'absolute',top:'1%',left:'1%',width:'98%',height:'98%',zIndex:'9000',backgroundColor:'white'});
				max.innerHTML = '-';
				document.body.appendChild(lc);
			} else {
				Gui.css(lc, {position:'relative',width:'100%',height:'100%',backgroundColor:'transparent'});
				max.innerHTML = '+';
				this.gui.rootContainer.appendChild(lc);
			}
		}.bind(this);
		} else {//#elsedef
		max = document.createElement('img');
		max.src = 'icons/maximize.png';
		max.title = max.alt = 'Maximize';
		Gui.css(max, {cursor: 'pointer', width: '32px', height: '32px', cssFloat: 'left'});
		this.toolMenu.appendChild(max);
		max.onclick = function(){
			var lc = this.gui.layerContainer;
			if (lc.parentNode == this.gui.rootContainer) {
				Gui.css(lc, {position:'absolute',top:'1%',left:'1%',width:'98%',height:'98%',zIndex:'9000',backgroundColor:'white'});
				max.src = 'icons/minimize.png';
				max.title = max.alt = 'Minimize';
				document.body.appendChild(lc);
			} else {
				Gui.css(lc, {position:'relative',width:'100%',height:'100%',backgroundColor:'transparent'});
				max.src = 'icons/maximize.png';
				max.title = max.alt = 'Maximize';
				this.gui.rootContainer.appendChild(lc);
			}
		}.bind(this);
		}//#endif
	},
	//#endif
	addPragmaButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.pragmaButton = this.createTextLink("Process pragmas");
		} else { //#elsedef
		this.pragmaButton = this.createButton('pragma','Process Pragmas');
		} //#endif
		this.pragmaButton.onclick = function(){
			var tree = this.gui.zeon.wtree; // the stream of tokens
			this.processPragmas(tree);
			// now update the textarea
			this.gui.setValue(tree.map(function(token){ return token.value; }).join(''));
		}.bind(this);
		this.toolMenu.appendChild(this.pragmaButton);
	},
	addTreeButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.treeButton = this.createTextLink("Show tree");
		} else { //#elsedef
		this.treeButton = this.createButton('tree', 'Show parse tree', true);
		} //#endif
		this.treeButton.onclick = function(_, immediatelyClose){
			var root = this.gui.zeon.tree;
			var tostring = function(stack,depth){
				var arr = [];
				for (var i=0; i<stack.length; ++i) {
					if (stack[i] instanceof Array) {
						var pairs = [];
						for (var key in stack[i]) {
							if (stack[i].hasOwnProperty(key) && key != +key+'' && !(stack[i][key] instanceof Array)) {
								pairs.push(key+':'+Gui.noctrl(Gui.escape(stack[i][key])));
							}
						}
						var s = '\n'+(new Array(depth+1).join('\t'))+'[('+stack[i].length+') ' + pairs.join(', ');
						s += tostring(stack[i], depth+1);
						s += '\n'+(new Array(depth+1).join('\t'))+']';
						arr.push(s);
					} else {
						var pairs = [];
						for (var key in stack[i]) {
							if (stack[i].hasOwnProperty(key)) {
								if (typeof stack[i][key] == 'object') {
									if (stack[i][key] instanceof Array) pairs.push(key+':'+Gui.escape('<arr:'+stack[i][key].length+'>'));
									else pairs.push(key+':'+Gui.escape('<obj>'));
								}
								else pairs.push(key+':'+Gui.noctrl(Gui.escape(stack[i][key])));
							}
						}
						var s = '\n'+(new Array(depth+1).join('\t'))+'{'+pairs.join(', ')+'}';
						arr.push(s);
					}
				}
				return arr.join();
			}.bind(this);
			root.root = true;
			var s = tostring([root],0);
			var e = document.createElement('pre');
			Gui.css(e, {position:'absolute', zIndex:500, backgroundColor:'white', color:'black',padding: '5px', border: '1px solid black', fontSize:'12px' });
			e.innerHTML = s;
			var f = document.createElement('div');
			Gui.css(f, 'cursor', 'pointer');
			f.innerHTML = 'Close';
			f.onclick = function(){ document.body.removeChild(e); };
			e.insertBefore(f, e.firstChild);
			document.body.insertBefore(e, document.body.firstChild);
			
			// for fuzz testing...
			if (immediatelyClose) f.onclick();
		}.bind(this);
		this.toolMenu.appendChild(this.treeButton);
	},
	//#ifdef BOOKMARKLET
	addRemoveButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.removeButton = this.createTextLink("Remove Zeon");
		} else { //#elsedef
		this.removeButton = this.createButton('delete','Remove Zeon');
		} //#endif
		this.removeButton.onclick = function(){
			this.gui.remove();
		}.bind(this);
		this.toolMenu.appendChild(this.removeButton);
	},
	//#endif
	addJsdocButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.jsdocButton = this.createTextLink("Generate JSDoc");
		} else { //#elsedef
		this.jsdocButton = this.createButton('jsdocs', 'Generate JSDocs');
		} //#endif
		this.jsdocButton.onclick = function(){
			var tree = this.gui.zeon.wtree;

			tree.forEach(function(token, i){
				if (token.isFuncDeclKeyword || token.isFuncExprKeyword || token.isVarKeyword) {
//					console.log("found", token, token.isVarKeyword,(token.isFuncDeclKeyword || token.isFuncExprKeyword))
					if (token.isVarKeyword) {
						var jsdoc = this.gui.zeon.generateVarJsdoc(token);
					} else {
						var jsdoc = this.gui.zeon.generateFunctionJsdoc(token);
					}
					if (jsdoc) {
						// slipstream the jsdoc on the previous line, or inside the existing jsdoc
						if (token.jsdoc) {
							token.jsdoc.value = jsdoc;
						} else {
							var line = token.startLineId;
							var pos = token.tokposw;
							while (pos && tree[--pos].startLineId == line);
							if (tree[pos].name == 10/*lineterminator*/) ++pos; // if not start of input, skip newline we should be currently at
	
							// save it in a new property, otherwise the indentation (using .value) might cause a jsdoc to repeatively be reinserted...
							if (!tree[pos].futureJsdoc) tree[pos].futureJsdoc = '';
							tree[pos].futureJsdoc += jsdoc;
						}
					}
				}
			}, this);
			// now update the textarea
			this.gui.setValue(tree.map(function(token){ return (token.futureJsdoc||'')+token.value; }).join(''));
		}.bind(this);
		this.toolMenu.appendChild(this.jsdocButton);

		//setTimeout(this.jsdocButton.onclick.bind(this), 200);
	},
	addVarButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.varButton = this.createTextLink("Fix hoisting");
		} else { //#elsedef
		this.varButton = this.createButton('var','Fix hoisting', true);
		} //#endif

		this.varButton.onclick = function(){
			var tree = this.gui.zeon.wtree;
			var treenw = this.gui.zeon.btree;

			this.processGlobalVars(tree,treenw);
			this.processLocalVars(tree,treenw);
			this.removeVarStatements(tree,treenw);

			if (this.gui.config['hoisting fix moves func decl to top']) {
				this.processFuncDecls(tree,treenw);
			}

			// now update the textarea
			this.gui.setValue(tree.map(function(token){ return (token.varValue || '') + ((typeof token.newValue == 'string') ? token.newValue : token.value); }).join(''));
		}.bind(this);

		this.toolMenu.appendChild(this.varButton);
	},
	processGlobalVars: function(tree,treenw){
		var vars = this.gui.zeon.globalScope.filter(function(token){
			return !token.isEcma && !token.isBrowser && !token.implicit && !(token instanceof Array) && !token.isFuncDecl;
		}).map(function(token){
			return token.value;
		});

		if (vars.length) {
			// re-indent this statement the same as the next real token
			var indent = this.getIndentation(treenw[0], true).map(function(o){ return o.value; }).join('');
			// note that we must use , instead of ; because the whole must remain a single statement without having to check for it
			tree[0].varValue = indent+'var '+vars.join(', ')+';\n';
			tree[0].newValue = tree[0].value;
		}
	},
	processLocalVars: function(tree,treenw){
		// now all other scopes (functions)
		this.gui.zeon.collects.functions.forEach(function(func){
			// for each function, we have to search for the first token of the body.
			var curly = func.lhc;
			// should we add newlines?
			var nonewline = (curly.startLineId == func.rhc.startLineId);
			// next token, regardless. we will prepend to that token. so empty body is ok.
			next = tree[curly.tokposw+1];

			var vars = func.scope.filter(function(token){
				return !token.isEcma && !(token instanceof Array) && !token.isFuncDecl && !token.isFuncParameter;
			}).map(function(token){
				return token.value;
			});

			if (vars.length) {
				if (nonewline) {
					// space to make `var` not stick to `{`
					next.varValue = ' var '+vars.join(', ')+';';
					next.newValue = next.value;
				} else {
					var indent = this.getIndentation(treenw[curly.tokposb+1], true).map(function(o){ return o.value; }).join('');
					next.varValue = '\n'+indent+'var '+vars.join(', ')+';';
					next.newValue = next.value;
				}
			}
		}, this);
	},
	removeVarStatements: function(tree,treenw){
		// remove all var statements, refactor initializers
		var i = tree.length;
		while (i--) {
			token = tree[i];
			if (token.isVarKeyword) {
				if (token.value == 'var') {
					token.newValue = '';
					var pos = token.tokposw;
					while (tree[++pos] && tree[pos].isWhite) tree[pos].newValue = '';
				}
				// get var stack
				var stack = token.stack;
				// either the semi colon or the ASI token. we replace the entire var statement like that.
				var stop = stack[1];
				// get to decl stack. cry fact; token.stack[0][0] == token.
				// anyways, we just want the stuff that follows. all decls are grouped in arrays so we just need to filter for arrays now
				var decls = stack[0].filter(function(o){
					return o instanceof Array;
				});
				// now each decl will have either one or three elements depending on whether it has an initializer
				var initialized = decls.filter(function(decl){
					if (decl.length == 3) {
						return true;
					} else {
						// erase non-initialized variable names and a comma before or after that token, if any
						this.stackWalk(decl[0], function(token){
							if (token.name == 2/*identifier*/) {
								token.newValue = '';
								if (treenw[token.tokposb+1] && treenw[token.tokposb+1].value == ',') {
									treenw[token.tokposb+1].newValue = '';
								} else if (token.tokposb && treenw[token.tokposb-1].value == ',') {
									treenw[token.tokposb-1].newValue = '';
								}
							}
						}.bind(this));
						// now remove the token from this list
						return false;
					}
				}, this);
				// remove the close token (semi or asi) if the var only contained non-initialized names
				if (initialized.length == 0) {
					stop.newValue = '';
				}
			}
		}
	},
	processFuncDecls: function(tree,treenw){
		// get declarations for each scope, back to forward
		this.gui.zeon.collects.functions.reverse().map(function(o){ return o.scope; }).concat([this.gui.zeon.globalScope]).forEach(function(scope){
			// not all scopes have a function
			if (scope.functions) {
				// get only the declarations
				var decls = scope.functions.filter(function(func){ return func.isFuncDeclKeyword; });
				if (decls.length) {
					var indent;
					if (scope.global) indent = this.getIndentation(treenw[0], true).map(function(o){ return o.value; }).join('');
					else indent = this.getIndentation(treenw[scope.scopeFor.lhc.tokposb+1], true).map(function(o){ return o.value; }).join('');
					
					var val = decls.map(function(func){
						var index = func.tokposw;
						var end = func.rhc.tokposw;
						var s = '';
						var removedLineTerminator = false;
						// remove leading whitespace up and including the line terminator
						while (index-- && tree[index].isWhite) {
							if (tree[index].name == 9/*WHITE_SPACE*/) {
								tree[index].newValue = '';
								tree[index].varValue = '';
							} else {
								if (tree[index].name == 10/*LINETERMINATOR*/) {
									tree[index].newValue = '';
									tree[index].varValue = '';
									removedLineTerminator = true; // only remove one...
								}
								break;
							}
						}
						index = func.tokposw;
						do {
							var token = tree[index];
							s += (token.varValue || '') + ((typeof token.newValue == 'string') ? token.newValue : token.value);
							token.newValue = '';
							token.varValue = '';
						} while (++index <= end);

						return s;
					}).reverse().join('\n'+indent);
	
					if (scope.global) {
						var first = tree[0];
						var suffix = ((typeof first.newValue == 'string') ? first.newValue : first.value);
						first.newValue = 
							(first.varValue || '') + 
							indent + val +
							(suffix?'\n':'') + suffix
						;
						first.varValue = '';
					} else {
						var lhc = scope.scopeFor.lhc;
						var prefix = ((typeof lhc.newValue == 'string') ? lhc.newValue : lhc.value);
						lhc.newValue = 
							prefix +
							'\n' +
							(lhc.varValue || '') + 
							indent + val
						;
						lhc.varValue = '';
					}
				}
			}
		},this);
	},
	addTrimButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.trimButton = this.createTextLink("Trim trailing whitespace");
		} else { //#elsedef
		this.trimButton = this.createButton('trim','Trim trailing whitespace');
		} //#endif
		this.trimButton.onclick = function(){
			var filtered = this.gui.zeon.wtree;
			var n = filtered.length;
			while (n-- && (filtered[n].isWhite || filtered[n].name == 13/*asi*/) && filtered[n].name != 10/*lineterminator*/) filtered[n] = '';
			filtered = filtered.map(function(o){ if (o.isTrailingWhitespace) return ''; return o.value; });

			this.gui.setValue(filtered.join(''));
		}.bind(this);
		this.toolMenu.appendChild(this.trimButton);
	},
	addInjectButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.injectButton = this.createTextLink("Inject calls");
		} else { //#elsedef
		this.injectButton = this.createButton('inject','Inject calls');
		} //#endif
		this.injectButton.onclick = function(_, testName){
			Ast.injectName = testName || prompt('Enter name of function callback', 'callme') || 'callme';
			var ast = new Ast(this.gui.zeon.tree, this.gui.zeon.btree); // this will be my new structure in the next iteration
			this.gui.setValue(ast.heatmap());
		}.bind(this);
		this.toolMenu.appendChild(this.injectButton);
	},
	//#ifdef DEV_BUILD
	addAltMinifyButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.altMinifyButton = this.createTextLink("Alternative minify");
		} else { //#elsedef
		this.altMinifyButton = this.createButton('minify', 'Alternative minify');
		} //#endif
		this.altMinifyButton.onclick = function(){
			var ast = new Ast(this.gui.zeon.tree, this.gui.zeon.btree); // this will be my new structure in the next iteration
			this.gui.setValue(ast.minify());
		}.bind(this);
		this.toolMenu.appendChild(this.altMinifyButton);

	},
	//#endif
	addProfilerButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.profilerButton = this.createTextLink("Visual profiler");
		} else { //#elsedef
		this.profilerButton = this.createButton('profiler','Visual profiler',true);
		} //#endif
		this.profilerButton.onclick = function(){
			var fn = 'callme';
			Ast.injectName = fn;
			var ast = new Ast(this.gui.zeon.tree, this.gui.zeon.btree); // this will be my new structure in the next iteration
			var code = ast.heatmap();
			// start profiler
			var map = [];
			var els = [];
			window[fn] = function(index){
				if (! map[index]) map[index] = 0;
				map[index]++;
			}.bind(this);
			window.t = setTimeout(function(){
				// remove previous red markings
				els.forEach(function(o){
					if (o) o.parentElement.removeChild(o);
				});
				els = [];
				// get highest execution count, this is our ceiling
				var max = Math.max.apply(null, map.filter(function(o){
					return o;
				}));
				// add a new marker for every tracked statement
				map.forEach(function(n, i){
					// we need to determine the length of the statement
					// at least up to the next statement.
					// so starting at the current token, search for the next statement start, 
					// log the length. i'm not very bothered with inaccurate tabs here
					var treenw = gui.zeon.btree;
					var tree = gui.zeon.wtree;
					var start = i = treenw[i].tokposw;
					var next = tree[++i];
					var lastBlack = i;
					// get proper token range (we dont want trailing whitespace)
					while (next && !next.statementStart) {
						if (!next.isWhite) lastBlack = i;
						next = tree[++i];
					}
					// now with the range, collect the lens
					i = start;
					var len = tree[i].len;
					while (i++<lastBlack) len += tree[i].len;
					// use the len for the length of the statement. multi-line statements are going to cause a problem...
					var css = {opacity:(n / max), width:Math.floor(len * gui.fontSize.w) + 'px', height:'15px', 'padding-top':'5px', 'background-color':'red', 'z-index':'0'};
					var bubble = gui.bubbleNoSheet('', tree[start], css, 7, 0, true);
					els[els.length] = bubble;
				}, this);
			}.bind(this), 1000);
			// run code
			var e = document.createElement('script');
			e.text = code;
			document.body.appendChild(e);
			document.body.removeChild(e);
		}.bind(this);
		this.toolMenu.appendChild(this.profilerButton);
	},
	addBranchButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.branchButton = this.createTextLink("Show branching");
		} else { //#elsedef
		this.branchButton = this.createButton('branch','Show branching');
		} //#endif
		this.branchButton.onclick = function walk(){
			var ast = new Ast(this.gui.zeon.tree, this.gui.zeon.btree);
			var s = ast.branch();
			this.gui.setValue(s);
		}.bind(this);
		this.toolMenu.appendChild(this.branchButton);
	},
	addExtractButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.extractButton = this.createTextLink("Extract method");
		} else { //#elsedef
		this.extractButton = this.createButton('extract','Extract method');
		} //#endif
		this.extractButton.onclick = function(){
			var ta = this.gui.textarea;
			var start = ta.selectionStart;
			var end = ta.selectionEnd;
			//console.log("range", start, end)

			// start token should be set by automated zeon systems, so check that first...
			var startToken = this.gui.computeCaretPosAt(start);
			var endToken = this.gui.computeCaretPosAt(end-1);
			// start and end might not be found for whatever reason, if they are equal it regards the same token and we dont do anything
			if (startToken && endToken && startToken != endToken) {
				// now maybe do some validity checks? i think start and end token must be within same indentation level
				var tree = this.gui.zeon.wtree;

				var newName = 'newFunction';
				var indentation = this.getIndentation(startToken).map(function(o){ return o.value; }).join('');
				var index = startToken.tokposw;
				// find var usages and declarations
				var vars = [];
				var decls = [];
				var scopes = [];
				while (index < endToken.tokposw) {
					var current = tree[index];
					// ignore white
					if (current.isWhite) {}
					// regular variable usages
					else if (
						current.meta == 'lead value' &&
						current.name == 2/*identifier*/ &&
						current.value != 'true' &&
						current.value != 'false' &&
						current.value != 'null' &&
						current.value != 'this' &&
						!current.trackingObject.implicit &&
						!current.trackingObject.isEcma &&
						!vars.some(function(o){ if (!o.wasAssignedSomething) o.wasAssignedSomething = current.wasAssignedSomething; return o.trackingObject == current.trackingObject; })
					) {
						vars.push(current);
					}
					// declared variables
					else if (
						current.meta == 'var name' &&
						!decls.some(function(o){ return o.trackingObject == current.trackingObject; }) &&
						!scopes.some(function(o){ return o == current.targetScope; })
					) {
						decls.push(current);
					}
					// functions (collect their scopes to discard vars declared in inner scopes)
					else if (
						current.value == 'function' &&
						current.scope &&
						scopes.indexOf(current.scope) < 0
					) {
						scopes.push(current.scope);
					}

					++index;
				}
				// remove any vars that were declared in this block or where declared in an inner scope
				vars = vars.filter(function(o){ return scopes.indexOf(o.targetScope) < 0 && !decls.some(function(d){ return d.trackingObject == o.trackingObject; }); });
				// only return those parameters which were changed. if a variable that was passed on did not change, we dont need to return it (because the outer scope variable will be the same var, regardless)
				var assignees = vars.filter(function(o){ return o.wasAssignedSomething; });
				// determine variables to return (may not be equal the original collection of vars, so it will not help to slice that array first...)
				var toReturn = assignees.concat(decls);
				// add prefix and postfix to create the function
				startToken.newValue = 'var '+newName+' = function('+vars.map(function(o){ return o.value; }).join(', ')+'){\n'+indentation+'\t'+startToken.value;
				// only return existing and new variables in this scope. we dont have to deal with inner scopes
				if (toReturn.length == 1) {
					endToken.value += '\n'+indentation+'\treturn '+toReturn[0].value+';';
				} else if (toReturn.length) {
					endToken.value += '\n'+indentation+'\treturn ['+toReturn.map(function(o){ return o.value; }).join(', ')+'];';
				}
				endToken.value += '\n'+indentation+'};\n'+indentation;
				// if one value returned, process that here
				if (toReturn.length == 1) {
					if (decls.length) endToken.value += 'var '+decls[0].value+' = ';
					else endToken.value += vars[0].value+' = ';
				}
				// if there were more, an array is returned, save it in a temp return value
				else if (toReturn.length > 1) endToken.value += 'var tmpReturnValue = ';
				// add new function call
				endToken.value += newName+'('+vars.map(function(o){ return o.value; }).join(', ')+');';
				// if multiple vars were returned, declare them here...
				var returnIndex = 0;
				if (decls.length && toReturn.length > 1) {
					endToken.value += '\n'+indentation+decls.map(function(o){ return 'var '+o.value+' = tmpReturnValue['+(returnIndex++)+'];'}).join('\n'+indentation);
				}
				// copy new value to existing variables
				if (assignees.length && toReturn.length > 1) {
					endToken.value += '\n'+indentation+assignees.map(function(o){ return o.value+' = tmpReturnValue['+(returnIndex++)+'];'}).join('\n'+indentation);
				}
				// add one level of indentation to the (new) function body
				var i = startToken.tokposw;
				while (++i<endToken.tokposw) if (tree[i].name == 10/*lineterminator*/) tree[i].value += '\t';
				// create new output and let it parse (take newValue if it exists, to prevent first token.value to mess up rest)
				this.gui.setValue(this.gui.zeon.wtree.map(function(o){ return o.newValue || o.value; }).join(''));
			}
		}.bind(this);
		this.toolMenu.appendChild(this.extractButton);
/*
setTimeout(function(){
	this.gui.textarea.selectionStart = 330;
	this.gui.textarea.selectionEnd = 568;
	this.extractButton.onclick();
}.bind(this), 500);
*/
	},
	addDisambiguationButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.disambiguationButton = this.createTextLink("Disambiguate operators");
		} else { //#elsedef
		this.disambiguationButton = this.createButton('disambiguation','Disambiguate operators');
		} //#endif
		this.disambiguationButton.onclick = function(){
			// stack tree
			var tree = this.gui.zeon.tree;
			// find all operators marked isAmbiguous. wrap their operands in parens.
			this.gui.zeon.disambiguate();
			// update output
			this.gui.setValue(this.gui.zeon.wtree.map(function(o){ return o.value; }).join(''));
		}.bind(this);
		this.toolMenu.appendChild(this.disambiguationButton);

		//setTimeout(this.disambiguationButton.onclick.bind(this),500);
	},
	addToJsStringButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.toJsstringButton = this.createTextLink("To JS string");
		} else { //#elsedef
		this.toJsstringButton = this.createButton('tojsstring','To JS string');
		} //#endif
		this.toJsstringButton.onclick = function(){
			this.gui.setValue("'"+this.gui.getValue().replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/\t/g,'\\t').replace(/'/g,"\\'")+"'");
		}.bind(this);
		this.toolMenu.appendChild(this.toJsstringButton);
	},
	addFromJsStringButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.toJsstringButton = this.createTextLink("From JS string");
		} else { //#elsedef
		this.toJsstringButton = this.createButton('fromjsstring','From JS string');
		} //#endif
		this.toJsstringButton.onclick = function(){
			var val = this.gui.getValue();
			val = val.slice(1,-1).replace(/\\(.)/g,function(s, a){
				if (a == 'n') return '\n';
				if (a == 't') return '\t';
				if (a== 'r') return '\r';
				return a;
			});
			this.gui.setValue(val);
		}.bind(this);
		this.toolMenu.appendChild(this.toJsstringButton);
	},
	addBookmarkletButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.bookmarkletButton = this.createTextLink("To bookmarklet");
		} else { //#elsedef
		this.bookmarkletButton = this.createButton('bookmarklet','To bookmarklet');
		} //#endif
		this.bookmarkletButton.onclick = function(){
			this.gui.setValue('javascript:'+this.gui.zeon.minify(true, true)); // no reduction, no newlines
		}.bind(this);
		this.toolMenu.appendChild(this.bookmarkletButton);
	},
	addSaveButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.saveButton = this.createTextLink("Save");
		} else { //#elsedef
		this.saveButton = this.createButton('save','Save');
		} //#endif
		this.saveButton.onclick = function(){
			localStorage.setItem('doc', this.gui.getValue());
		}.bind(this);
		this.toolMenu.appendChild(this.saveButton);
	},
	addLoadButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.loadButton = this.createTextLink("Load");
		} else { //#elsedef
		this.loadButton = this.createButton('load','Load');
		} //#endif
		this.loadButton.onclick = function(){
			this.gui.setValue(localStorage.getItem('doc'));
		}.bind(this);
		this.toolMenu.appendChild(this.loadButton);
	},
	addProtoButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.protoButton = this.createTextLink("Declare prototype properties");
		} else { //#elsedef
		this.protoButton = this.createButton('proto','Declare prototype properties');
		} //#endif
		this.protoButton.onclick = function(){
			this.gui.zeon.btree.forEach(function(token){
				if (token.leadValue && token.value == 'this' && token.leadValueTarget !== true && token.trackingObject && token.trackingObject.properties && token.targetScope && token.targetScope.scopeFor) {
					var func = token.targetScope.scopeFor.functionStack;
					if (func) {
						var props = token.trackingObject.properties;
						Object.keys(props).forEach(function(name){
							if (!props[name].isDeclaredOnProto && !props[name].cannotDeterminePrototype) {
								var constrName = 'fixme/*unable to determine name*/';
								if (func.assignedToObjLitProperty) {
									var obj = func.assignedToObjLitProperty.isPropertyOf;
								} else {
									if (func.assignedToLead && func.assignedToLead.isPropertyOf && func.assignedToLead.isPropertyOf.value == 'prototype') {
										var proto = func.assignedToLead.isPropertyOf.trackingObject;
										// yes, we can add more trickery and fetch the constructorname... but really.
									} else if (func.assignedToLead && func.assignedToLead.trackingObject && func.assignedToLead.trackingObject.properties && func.assignedToLead.trackingObject.properties.prototype) {
										var proto = func.assignedToLead.trackingObject.properties.prototype;
										constrName = func[0].constructorName;
									}
									if (proto && proto.assignedObjLit) {
										var obj = proto.assignedObjLit;
									}
								}
								
								if (obj) {
									if (!obj.definedProperties[name]) {
										obj.value = obj.value + name + ':null,';
										obj.definedProperties[name] = true;
									}
								} else if (proto) {
									if (func && func[0] && func[0].rhc) {
										var last = func[0].rhc;
										if (func[0].isFuncExprKeyword && this.gui.zeon.btree[last.tokposb+1]) last = this.gui.zeon.btree[last.tokposb+1];
										last.value += '\n'+constrName+'.prototype.'+name+' = null;';
									}
								}
							}
						},this);
					}
				}
			},this);
			this.gui.setValue(this.gui.zeon.wtree.map(function(o){ return o.value; }).join(''));
		}.bind(this);
		this.toolMenu.appendChild(this.protoButton);
		
		//setTimeout(this.protoButton.onclick, 500)
	},
	addFuzzButton: function(){
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.fuzzButton = this.createTextLink("Start fuzzer");
		} else { //#elsedef
		this.fuzzButton = this.createButton('fuzz','Start fuzzer');
		} //#endif

		var options = [
			function(){ this.minifyButton.onclick(); }.bind(this),          // 0
			function(){ this.beautifyButton.onclick(); }.bind(this),        // 1
			function(){ this.pragmaButton.onclick(); }.bind(this),          // 2
			function(){ this.treeButton.onclick(null,true); }.bind(this),   // 3 (immediately closes)
			function(){ this.jsdocButton.onclick(); }.bind(this),           // 4
			function(){ this.varButton.onclick(); }.bind(this),             // 5
			function(){ this.trimButton.onclick(); }.bind(this),            // 6
			function(){ this.injectButton.onclick(null,'fuzztest'); }.bind(this), // 5
			function(){ this.branchButton.onclick(); }.bind(this),          // 7
			function(){ this.disambiguationButton.onclick }.bind(this),     // 8
			function(){ this.toJsstringButton.onclick(); }.bind(this),      // 9
			function(){ this.bookmarkletButton.onclick(); }.bind(this),     // 10
			function(){ this.saveButton.onclick(); }.bind(this),            // 11
			function(){ this.loadButton.onclick(); }.bind(this),            // 12
			function(){ this.protoButton.onclick(); }.bind(this)            // 13
		];

		this.fuzzButton.onclick = function(){
			if (this.fuzzTimer) {
				clearInterval(this.fuzzTimer);
				this.fuzzTimer = 0;
			} else {
				var toolsWithErrors = false;
				this.fuzzTimer = setInterval(function(){
					var code = false;
					while (!code) {
						try {
							var next = Math.floor(Math.random()*4);
							switch (next) {
								case 0: 
									var code = fuzzRuderManOrg(19);
									break;
								case 1: 
									var code = fuzzRudermanMod(19);
									break;
								case 2:
									var code = crapFuzzer();
									break;
								default: 
									var code = fuzzZee();
									break;
							}
						} catch (e){}
					}
					try {
						var screwed = ['bug', 'in zeon', code];

						if (toolsWithErrors) this.gui.setValue(code.slice(3)); // cause a lot of errors
						else this.gui.setValue(code);
						this.gui.update(true);
						
						if (toolsWithErrors || !this.gui.zeon.hasError) {
							var lastId = Math.floor(Math.random()*options.length);
							var screwed = ['bug', lastId, code];
							options[lastId]();
						}
						
						screwed = null;
					} finally {
						if (screwed) {
							setTimeout(function(){ console.log(screwed); },10);
						}
					}
				}.bind(this), 10);
			}
		}.bind(this);
		this.toolMenu.appendChild(this.fuzzButton);
	},
	//#ifdef DEV_BUILD
	addBinButton: function(){ // just a test..
	/*
		if (BOOKMARKLET) { //#ifdef BOOKMARKLET
		this.binButton = this.createTextLink("Create binary");
		} else { //#elsedef
		this.binButton = this.createButton('bin','Create binary',true);
		} //#endif
		this.binButton.onclick = function(){
			var stream = this.gui.zeon.wtree;
			
			stream.forEach(function(token){
				if (token.isWhite && token.value != '\n') continue; // meh.
				
				switch (token.name){
					
				}
			});
			
			
			
		}.bind(this);
		this.toolMenu.appendChild(this.binButton);
		*/
	},
	//#endif

	createTextLink: function(text){
		var div = document.createElement('div');
		Gui.css(div, {cursor: 'pointer', backgroundColor: 'white', color: 'black', textDecoration: 'underline', padding: '3px'});
		div.innerHTML = text;
		return div;
	},
	createButton: function(name, alt, cl){
		var img = document.createElement('img');
		img.src = 'icons/'+name+'.png';
		img.title = img.alt = alt;
		Gui.css(img, {cursor: 'pointer', width: '32px', height: '32px', cssFloat: 'left'});
		if (cl) Gui.css(img, 'clear', 'left');
		return img;
	},

	processPragmas: function(tree){
		// now cut away all tokens that would be stripped by the ifdefs
		// go from back to front, because we need to maintain the order as we go back
		// whenever you remove elements before n, make sure you update n too
		var n = tree.length;
		while (--n >= 0) {
			var token = tree[n];
			if (token.pragmaName == 'define' && token.pragmaArg) {
				// remove comment+newline
				this.removePragmaLine(tree, token);
			} else if (token.pragmaName == 'macro' && token.pragmaRest) {
				var toRemove = 1;
				// also remove any token on the same line as the comment
				while (tree[n-(toRemove+1)] && tree[n-(toRemove+1)].startLineId == token.startLineId) ++toRemove;
				tree.splice(n-toRemove, toRemove+2); // +2 = comment and newline
				n -= toRemove;
			} else if (token.pragmaName == 'ifdef') {
				// now remove all ifdefs that are not defined, taking care of the elseifdefs and elsedefs, walking back to forward (again)
				var end = token.pragmaStop;
				if (end) {
					// there are two modes here. if there's a prev, we walk the prev/next chain. otherwise it's just the start/stop combo.
					var prev = end.pragmaPrev;
					if (prev) {
						do {
							// remove current last pragma line
							this.removePragmaLine(tree, end);

							// remove body unless defined
							if (!prev.isPragmaArgDefined) {
								console.log("body not defined", prev.pragmaName)
								// remove all tokens between start and stop
								// this is actually the tokposw+2 and end.pragmaPosEnd (right before the end pragma line)
								tree.splice(prev.tokposw+2, (end.pragmaPosEnd+1)-(prev.tokposw+2));
							}

							// go the previous combo
							end = prev;
							prev = end.pragmaPrev;
						} while (prev);
					} else if (end.pragmaStart) { // might not exist, on error
						// remove last pragma line
						this.removePragmaLine(tree, end);

						if (!token.isPragmaArgDefined) {
							// remove all tokens between start(+2) and stop(.pragmaPosEnd)
							tree.splice(token.tokposw+2, end.pragmaPosEnd-(token.tokposw+2)); // +2 = comment and line terminator after comment
						}
					}
					// remove the start pragma line
					this.removePragmaLine(tree, token);
				}
			} else if (token.pragmaName == 'inline'){
				// remove body completely
				var startPos = token.tokposw +2; // set after comment
				var lastPos = token.pragmaStop.tokposw +2; // also after comment
				tree.splice(startPos, lastPos-startPos);
				// remove start line
				n -= this.removePragmaLine(tree, token);
			} else if (token.toBeInlined) {
				// get indentation of current line...
				var ws = this.getIndentation(token);
				ws = ws.map(function(o){ return o.value; }).join('');
				// remove complete line that contained token
				// replace value of token with macro
				// remove original indentation, replace with that of the current line
				var from = token.tokposw;
				var to = from;
				var line = token.startLineId;
				while (tree[from-1] && tree[from-1].startLineId == line) --from;
				while (tree[to+1] && tree[to+1].startLineId == line) ++to;
				++to;

				// at the start of each line, prepend the indentation
				// the to-be-inlined code is already de-indented
				var lastLine = -1;
				token.value = token.toBeInlined.pragmaValue.map(function(o){
					if (o.startLineId != lastLine) {
						o.value = ws+o.value;
						lastLine = o.startLineId;
					}
					return o.value;
				}).join('');

				tree.splice(from, to-from, token);
				n -= token.tokposw - from;
			} else if (token.isMacro) {
				// fetch the macro, replace the value of this identifier with the contents of the macro. dont worry about
				// invalidating the token. The tokens are only going to be used for creating new output, which solely uses
				// their token.value and that's basically what we want.
				token.value = token.isMacro.pragmaRest;
				if (token.isMacro.pragmaNameParts.length > 1) {
					// remove leading parts
					var toRemove = (token.isMacro.pragmaNameParts.length*2) - 2;
					tree.splice(n-toRemove, toRemove);
					n -= toRemove;
				}
			}
		}
	},
	removePragmaLine: function(tree, pragma){
		// remove the pragma, the line terminator that follows it (if any) and any tokens tagged inPraga
		var start = pragma.pragmaPosEnd+1;
		var stop = pragma.tokposw+2;
		var len = stop - start;
		console.log(start, stop, len)
		tree.splice(start, len);
		return len;
	},
	getIndentation: function(token, ignoreToken){
		var pos = token.tokposw;
		var line = token.startLineId;
		var tree = this.gui.zeon.wtree;
		// move to start of line
		while (pos-- && tree[pos].startLineId == line);
		// collect all whitespace
		var ws = [];
		var next = tree[++pos];
		while (next && next.name == 9/*whitespace*/ && (next != token || ignoreToken) && tree[pos].startLineId == line) {
			ws.push(next);
			next = tree[++pos];
		}
//		console.log('ws',ws);
		return ws;
	},

	stackToString: function(stack){
		return stack.map(function(o){
			if (o instanceof Array) return this.stackToString(o);
			else return o.value;
		}, this).join('');
	},
	stackWalk: function(stack, func){
		if (stack instanceof Array) stack.forEach(function(o){ this.stackWalk(o, func); }, this);
		else func(stack);
	},

	createZButton: function(){
		// menu button
		var btn = document.createElement('div');
		Gui.css(btn, {
			width: '200px',
			height: '200px',
			position: 'absolute',
			top: 0,
			left: 0,
			WebkitBorderRadius:'100px',
			borderRadius: '100px',
			backgroundColor: '#eee',
			textIndent: '32px',
			lineHeight: '80px',
			fontWeight: '800',
			fontSize: '30px',
			fontFamily: '"Courier New"',
			cursor: 'pointer',
			WebkitBoxShadow: '-1px -1px 5px black',
			boxShadow: '-1px -1px 5px black',
			textShadow: '#ef928f 1px 1px 0.5px',
			userSelect: 'none',
			webkitUserSelect: 'none',
			'z-index': 10 // must be higher than highest panel...
		});
		btn.innerHTML = 'Z';

		var btnp = document.createElement('div');
		btnp.className = 'zeon-menu-button';
		Gui.css(btnp, {
			position: 'absolute',
			right: '0px',
			bottom: '0px',
			width: '60px',
			height: '60px',
			overflow: 'hidden'
		});
		btnp.onclick = function(){
			Gui.css(this.nav, 'display', Gui.css(this.nav, 'display') == 'none' ? 'block' : 'none');
		}.bind(this);
		btnp.appendChild(btn);
		this.gui.layerContainer.appendChild(btnp);

		this.z = btnp;
	},

	onNavAction: function(name, action){
		var index = this.lastNavPos[name];

		var warnings = this.gui.zeon.collects[name].filter(function(o){ return this.gui.config[o.warning]; }, this);
		if (action == 'prev') {
			if (index <= 0) this.lastNavPos[name] = Math.max(0, warnings.length-1);
			else --this.lastNavPos[name];
		} else if (action == 'next') {
			++this.lastNavPos[name];
			if (this.lastNavPos[name] >= warnings.length) this.lastNavPos[name] = 0;
		}

		var target = warnings[this.lastNavPos[name]];

		this.updateNav();

		if (target) {
			this.gui.showCircleAtMatch(target, name);
			if (name == 'errors') {
				this.gui.showMessage(target.error.msg);
			} else if (name == 'warnings') {
				this.gui.showMessage(target.warning);
			}
		}
	},
	openFilter: function(name){
		var pos = {x:50, y:50};
		if (this.openFilters[name]) {
			pos = this.openFilters[name].getPosition();
			this.openFilters[name].close();
		}

		var data = this.gui.zeon.collects[name];
		var obj = {};
		if (name == 'errors') {
			data.forEach(function(o){
				 if (obj[o.error.msg]) ++obj[o.error.msg];
				 else obj[o.error.msg] = 1;
			});
		} else if (name == 'warnings') {
			data.forEach(function(o){
				// all warnings are stored in the .warnings array
				o.warnings.forEach(function(w){
					if (obj[w]) ++obj[w];
					else obj[w] = 1;
				});
			});
		} else {
			data.forEach(function(o){
				 if (obj[o.value]) ++obj[o.value];
				 else obj[o.value] = 1;
			});
		}

		this.openFilters[name] = new Gui.Filter(this.gui, name, obj, this, pos, data);
	},

	resize: function(){
		if (this.z) {
			var textarea = this.gui.textarea;
			if ((textarea.scrollHeight>textarea.clientHeight) != this.hasHorizontalBar) {
				this.hasHorizontalBar = !this.hasHorizontalBar;
				Gui.css([this.z, this.nav], 'right', this.hasHorizontalBar?'16px':'0');
			}
			if ((textarea.scrollWidth>textarea.clientWidth) != this.hasVerticalBar) {
				this.hasVerticalBar= !this.hasVerticalBar;
				Gui.css([this.z, this.nav], 'bottom', this.hasVerticalBar?'16px':'0');
			}
		}
	},

	updateNav: function(){
		var inp = this.gui.lastInput || '';
		this.navInputLen.innerHTML = '<div>Len: '+inp.length+'</div>';
		var lines = (this.gui && this.gui.zeon && this.gui.zeon.lines) || [];
		this.navInputLines.innerHTML = '<div>Lines: '+lines.length+'</div>';

		this.setNavs(
			this.createNavRow('errors', 'Errors'),
			this.createNavRow('warnings', 'Warnings'),
			this.createNavRow('implicitGlobals', 'Unknown globals'),
			this.createNavRow('knownGlobals', 'Known globals'),
			this.createNavRow('jsdocs', 'JSDocs'),
			this.createNavRow('objlits', 'Object literals'),
			this.createNavRow('arrlits', 'Array literals'),
			this.createNavRow('functions', 'Functions'),
			this.createNavRow('todofix', 'Todo Tofix Fixme')
		);

		// refresh all open filters
		for (var key in this.openFilters) if (this.openFilters.hasOwnProperty(key) && this.openFilters[key]) this.openFilter(key);
	},
	createNavRow: function(name, desc){
		if (!this.gui.zeon) return document.createElement('div');

		var collects = this.gui.zeon.collects;
		var count = collects[name].length;
		if (name == 'warnings') count = collects[name].filter(function(o){ return this.gui.config[o.warning]; }, this).length;
		if (!this.lastNavPos[name]) this.lastNavPos[name] = 0; // init
		if (this.lastNavPos[name] >= count) this.lastNavPos[name] = Math.max(0, count-1);

		var e = document.createElement('pre');
		e.className = name;
		Gui.css(e, 'margin', '0 0 0 5px');
		e.innerHTML =
			(count>1?
				'<span class="prev" style="cursor:pointer;">&lt;</span>'
			:' ')+
			' '+
			(count?
				'<span class="data" style="cursor:pointer;">'+(this.lastNavPos[name]<9?' ':'')+(count?(this.lastNavPos[name]+1):0)+'</span>'
			:'  ')+
			' '+
			(count>1?
				'<span class="next" style="cursor:pointer;">&gt;</span>'
			:' ')+
			' '+
			'<span style="font-family: Verdana;">'+
				'<span class="name">'+desc+'</span>: '+
				'<b>'+count+'x</b>'+
			'</span>'+
		'';

		return e;
	},
	setNavs: function(__args){
		this.navs.innerHTML = '';
		for (var i=0; i<arguments.length; ++i) {
			this.navs.appendChild(arguments[i]);
		}
	},

0:0};
