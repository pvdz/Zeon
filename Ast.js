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

window.Ast = function(stack, list){
	// for now, just return this custom object...
	return this.generate(stack, list);
};
Ast.getHeatString = function(obj){
	return Ast.injectName+'('+obj.listId+')';
};
Ast.injectName = 'callme';

Ast.prototype = {

	// https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
	// of these, only ternary (?:) and assignments are right associative: x=y=z => x=(y=z). ternary is done implicitly by the parser :)
	// so all others are left associative (when precedence is equal, take left to right)
	precedence: {
		'*':1, '/':1, '%':1,
		'+':2, '-':2,
		'<<':3, '>>':3, '>>>':3,
		'<':4, '<=':4, '>':4, '>=':4, 'in':4, 'instanceof':4,
		'==':5, '!=':5, '===':5, '!===':5,
		'&':6,
		'^':7,
		'|':8,
		'&&':9,
		'||':10,
		'?':11, ':':11, // always put ? left of :
		'=':12, '<<=':12, '>>=':12, '>>>=':12, '+=':12, '-=':12, '*=':12, '/=':12, '%=':12, '&=':12, '^=':12, '|=':12,
		',':13
	},

	root: null, // semantic parse tree by the parser
	list: null, // token stream, array with all non-whitespace tokens

	/**
	 * Create an AST when given the extended result (with array annotations) from the parser
	 * @param {Object} stack
	 */
	generate: function(stack, list){
		this.list = list; // token stream, no whitespace
		this.root = this.SOURCE_ELS(stack);
		return this.root;
	},

	copyMeta: function(stack, obj){
		obj.listId = stack.tokposb || stack.nextBlack || 0;
		var node = this.list[obj.listId];
		if (node) {
			obj.row = node.startLineId;
			obj.len = node.len;
		}
	},

	SOURCE_ELS: function(stack){
		var arr = [];
		this.copyMeta(stack, arr);
		arr.type = 'SOURCE_ELS';
		arr.isSOURCEELS = true;
		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];
			if (s instanceof Array) {
				if (s.desc == 'func decl') arr.push(this.FUNCDECL(s));
				else if (s.desc == 'statement') arr.push(this.STATEMENT(s));
				else if (s.desc == 'statement-parent' && s.sub == 'block') {
					var x = this.BLOCK(s);
					arr.push(x);
				}
				// stmt.parent always wraps at most one statement
				else if (s.desc == 'statement-parent') {
					var x = this.SOURCE_ELS(s);
					arr.push(x[0]);
				}
				else if (s.desc == 'var decl') arr.push(this.VAR(s[0]));
				else if (s.desc == 'expressions') arr.push(this.EXPRESSIONS(s));
				else throw console.log(['array error', stack, s]), "unknown type here: "+s.desc;
			} else {
				if (s.value == ';') { arr.push(this.EMPTY(s)); } // ignore; probably semi from expression-statement
				else if (s.value == '{' || s.value == '}') { } // ignore; function body
				else if (s.name == 13/*asi*/) { } // ignore?
				//else if (!s.isWhite) throw console.log(['non array error',s,stack]), "unknown token here: "+s;
			}
		}

		arr.beautify = function(indent){
			indent |= 0;
			var items = arr.map(function(o,i){
				return (i?indent.tabs():'')+o.beautify(indent)+(o.isEXPRESSIONS?';':'')+'\n';
			});
			return items.join('');
		};

		arr.minify = function(){
			return arr.map(function(o){
				return o.minify() + (o.isEXPRESSIONS?';':'');
			}).join('');
		};

		arr.funstat = function(){
			return arr.map(function(o){
				if (o.isEXPRESSIONS) return '(mapping("exprs"),('+o.funstat()+'));';
				return o.funstat();
			}).join('');
		};

		arr.heatmap = function(){
			return arr.map(function(o){
				if (o.isEXPRESSIONS) { return '('+Ast.getHeatString(o)+',('+o.heatmap()+'));'; }
				return o.heatmap();
			}).join('');
		};

		arr.branch = function(indent, state){
			indent |= 0;
			if (!state) state = {collect:true}; // should be root call...
			var broke = false;
			var items = arr.map(function(o,i){
				if (broke) return '';
				broke = o.isRETURN || o.isBREAK || o.isCONTINUE || o.isTHROW;
				return (i?indent.tabs():'')+o.branch(indent, state)+(o.isEXPRESSIONS?';':'')+'\n';
			});
			return items.join('');
		};

		return arr;
	},
	FUNCDECL: function(stack){
		// so we're looking for the function keyword, opening paren of header, argument tokens, start of body

		var obj = {type:'FUNCDECL', isFUNCDECL: true, args:[]};
		this.copyMeta(stack, obj);
		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];

			if (i == 0) obj.firstToken = s;
			else if (s.name == 2/*identifier*/ && !obj.headerStart) obj.name = s;
			else if (s.value == '(') obj.headerStart = s;
			else if (s.name == 2/*identifier*/) obj.args.push(s);
			else if (s.desc == 'func body') {
				obj.bodyStart = s;
				obj.body = this.SOURCE_ELS(s);
				break; // we've got all we need!
			}
		}

		obj.beautify = function(indent){
			return 'function '+obj.name.value+'('+obj.args.map(function(o){ return o.value; }).join(', ')+') {\n'+(indent+1).tabs()+obj.body.beautify(indent+1)+indent.tabs()+'}';
		};

		obj.minify = function(){
			return 'function '+obj.name.value+'('+obj.args.map(function(o){ return o.value; }).join(',')+'){'+
				obj.body.minify()+
			'}';
		};

		obj.funstat = function(){
			return 'function '+obj.name.value+'('+obj.args.map(function(o){ return o.value; }).join(',')+'){'+
				'mapping("funcdecl");' +
				obj.body.funstat()+
			'}';
		};

		obj.heatmap = function(){
			return 'function '+obj.name.value+'('+obj.args.map(function(o){ return o.value; }).join(',')+'){'+
				Ast.getHeatString(obj)+';' +
				obj.body.heatmap()+
			'}';
		};

		obj.branch = function(indent, state){
			// use new state object...
			var state = {collect:true};
			// first do a dry run. this gives us the original function and collects all possible switches
			var org = 'function '+obj.name.value+'('+obj.args.map(function(o){ return o.value; }).join(', ')+') {\n'+(indent+1).tabs()+obj.body.branch(indent+1, state)+indent.tabs()+'}';
			
			delete state.collect;
			// now _we_ control the variations, make sure we get them all. collect the result for all of them.
			var keys = Object.keys(state);
			var variators = keys.length; // -1 = collect
			state.collect = false; // prevent lookup fails (meh)
			// reset states
			keys.forEach(function(n){ state[n] = 0; });

			// collect all unique derived functions
			var derivatives = [];
			var ok = true;
			while (ok) {
				var body = obj.body.branch(indent+1, state);
				if (derivatives.indexOf(body) < 0) {
					derivatives.push(body);
				}

				var index = 0;
				while (index < keys.length && state[keys[index]]++) { // if state is 1, it would become 2 which would overflow and would reset and move on to the next one
					state[keys[index]] = 0;
					++index;
				}
				ok = index < keys.length;
			}

			// now compose the functions from the bodies we've collected
			var n = 0;
			var s = derivatives.map(function(d){
				return 'function '+obj.name.value+'_'+(++n)+'('+obj.args.map(function(o){ return o.value; }).join(', ')+') {\n'+(indent+1).tabs()+d+indent.tabs()+'}\n';
			}).join('');

			// prepend original if multiple versions were found
			if (n>1) s = org+'\n' + s;
			// replace if just one
			else s = org;
			
			return s;
		};

		return obj;
	},
	FUNCEXPR: function(stack){
		// so we're looking for the function keyword, opening paren of header, argument tokens, start of body

		var obj = {type:'FUNCEXPR', isFUNCEXPR: true, args:[]};
		this.copyMeta(stack, obj);
		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];

			if (i == 0) obj.firstToken = s;
			else if (s.name == 2/*identifier*/ && !obj.headerStart) obj.name = s;
			else if (s.value == '(') obj.headerStart = s;
			else if (s.name == 2/*identifier*/) obj.args.push(s);
			else if (s.desc == 'func body') {
				obj.bodyStart = s;
				obj.body = this.SOURCE_ELS(s);
				break; // we've got all we need!
			}
		}

		obj.beautify = function(indent){
			return 'function'+(obj.name?' '+obj.name.value:'')+'('+obj.args.map(function(o){ return o.value; }).join(', ')+'){\n'+
				(indent+1).tabs()+obj.body.beautify(indent+1)+indent.tabs()+
			'}';
		};

		obj.minify = function(indent){
			return 'function'+(obj.name?' '+obj.name.value:'')+'('+obj.args.map(function(o){ return o.value; }).join(',')+'){'+
				obj.body.minify()+
			'}';
		};

		obj.funstat = function(indent){
			return 'function'+(obj.name?' '+obj.name.value:'')+'('+obj.args.map(function(o){ return o.value; }).join(',')+'){'+
				'mapping("funcexpr");' +
				obj.body.funstat()+
			'}';
		};

		obj.heatmap = function(indent){
			return 'function'+(obj.name?' '+obj.name.value:'')+'('+obj.args.map(function(o){ return o.value; }).join(',')+'){'+
				Ast.getHeatString(obj)+';' +
				obj.body.heatmap()+
			'}';
		};

		obj.branch = function(indent, state){
			// use new state object...
			var state = {collect:true};
			// first do a dry run. this gives us the original function and collects all possible switches
			var org = 'function '+(obj.name?' '+obj.name.value:'')+'('+obj.args.map(function(o){ return o.value; }).join(', ')+') {\n'+(indent+1).tabs()+obj.body.branch(indent+1, state)+indent.tabs()+'}';
			
			delete state.collect;
			// now _we_ control the variations, make sure we get them all. collect the result for all of them.
			var keys = Object.keys(state);
			var variators = keys.length; // -1 = collect
			state.collect = false; // prevent lookup fails (meh)
			// reset states
			keys.forEach(function(n){ state[n] = 0; });

			// collect all unique derived functions
			var derivatives = [];
			var ok = true;
			while (ok) {
				var body = obj.body.branch(indent+1, state);
				if (derivatives.indexOf(body) < 0) {
					derivatives.push(body);
				}

				var index = 0;
				while (index < keys.length && state[keys[index]]++) { // if state is 1, it would become 2 which would overflow and would reset and move on to the next one
					state[keys[index]] = 0;
					++index;
				}
				ok = index < keys.length;
			}

			// now compose the functions from the bodies we've collected
			var n = 0;
			var s = 
				derivatives.map(function(d){
					return 'function '+(obj.name?' '+obj.name.value:'')+'_'+(++n)+'('+obj.args.map(function(o){ return o.value; }).join(', ')+') {\n'+(indent+1).tabs()+d+indent.tabs()+'},';
				}).join('');

			// prepend original if multiple versions were found (last derived function will have trailing comma)
			if (n>1) s = '('+s+org+')';
			// replace if just one
			else s = org;
			
			return s;

		};

		return obj;
	},
	STATEMENT: function(stack){
		// a single statement (not a node, just a switch)
		switch (stack.sub) {
			case 'if':
				return this.IF(stack);
			case 'debugger':
				return this.DEBUGGER(stack);
			case 'while':
				return this.WHILE(stack);
			case 'for':
				if (stack.forType == 'in') return this.FOR_IN(stack);
				return this.FOR_EACH(stack);
			case 'labeled':
				return this.LABEL(stack);
			case 'expression':
				return this.EXPRESSIONS(stack[0]);
			case 'try':
				return this.TRY(stack);
			case 'switch':
				return this.SWITCH(stack);
			case 'do':
				return this.DO(stack);
			case 'var':
				return this.VAR(stack[0]);
			case 'return':
				return this.RETURN(stack);
			case 'break':
				return this.BREAK(stack);
			case 'continue':
				return this.CONTINUE(stack);
			case 'throw':
				return this.THROW(stack);
			case 'block':
				return this.BLOCK(stack);
			case 'with':
				return this.WITH(stack);
			default:
				if (stack.desc == 'statement-parent') return this.STATEMENT(stack[0]);
				if (stack.desc == 'expressions') return this.EXPRESSIONS(stack);
				if (stack.emptyStatement) return this.EMPTY(stack);
				if (stack.name == 14/*error*/) return this.VOID(stack);

				throw console.log(['unknown statement error stack:', stack]), 'unknown statement: '+stack.sub;
		}
	},
	IF: function(stack){
		var obj = {type:'IF', isIF: true, firstToken:stack[0], hasElse:false};
		this.copyMeta(stack, obj);
		// looking for first, header, cond, statement

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];

			if (s.statementHeaderStart) obj.headerStart = s;
			else if (s.desc == 'expressions') obj.condition = this.EXPRESSIONS(s);
			else if (s.desc == 'statement-parent' && !obj.hasElse) {
				obj.ifStatement = this.STATEMENT(s);
			} else if (s.sub == 'else') {
				obj.hasElse = true;

				for (var j=0; j<s.length; ++j) {
					var t = s[j];
					if (t.value == 'else') obj.elseToken = t;
					else if (t.desc == 'statement-parent') obj.elseStatement = this.STATEMENT(t);
				}
			}
		}

		obj.beautify = function(indent){
			/*
			if (!obj.condition.beautify) debugger;
			if (!obj.ifStatement || !obj.ifStatement.beautify) debugger;
			if (obj.hasElse && !obj.elseStatement.beautify) debugger;
			*/

			return 'if ('+obj.condition.beautify(indent)+') '+
				obj.ifStatement.beautify(indent) +(obj.ifStatement.isEXPRESSIONS?';':'')+
				(!obj.hasElse?'':'\n'+indent.tabs()+'else '+obj.elseStatement.beautify(indent)+(obj.elseStatement.isEXPRESSIONS?';':''));
		};

		obj.minify = function(){
			return 'if'+
				'('+obj.condition.minify()+')'+
					obj.ifStatement.minify() + (obj.ifStatement.isEXPRESSIONS?';':'')+
					(obj.hasElse?
						'else '+obj.elseStatement.minify() + (obj.elseStatement.isEXPRESSIONS?';':'')
					:'');
		};

		obj.funstat = function(){
			return 'if(mapping("if"),('+obj.condition.funstat()+'))'+
				obj.ifStatement.funstat() +(obj.ifStatement.isEXPRESSIONS?';':'')+'\n'+
				(obj.hasElse?
					'else '+
					'{mapping("if");'+obj.elseStatement.funstat()+(obj.elseStatement.isEXPRESSIONS?';':'')+'}'
				:'');
		};

		obj.heatmap = function(){
			return 'if('+Ast.getHeatString(obj)+',('+obj.condition.heatmap()+'))'+
				obj.ifStatement.heatmap() +(obj.ifStatement.isEXPRESSIONS?';':'')+
				(obj.hasElse?
					'else '+
					'{'+Ast.getHeatString(obj)+';'+obj.elseStatement.heatmap()+(obj.elseStatement.isEXPRESSIONS?';':'')+'}'
				:'');
		};

		obj.branch = function(indent, state){
			if (state.collect) {
				state[obj.firstToken.tokposw] = false;
				// return original function
				return 'if ('+obj.condition.branch(indent, state)+') '+
					obj.ifStatement.branch(indent, state) +(obj.ifStatement.isEXPRESSIONS?';':'')+
					(!obj.hasElse?'':'\n'+indent.tabs()+'else '+obj.elseStatement.branch(indent, state)+(obj.elseStatement.isEXPRESSIONS?';':''));
			} else if (!state[obj.firstToken.tokposw]) {
				var returnValue =
					obj.condition.branch(indent, state)+';\n' +
					indent.tabs() + obj.ifStatement.branch(indent, state) + (obj.ifStatement.isEXPRESSIONS?';':'')
				;
			} else if (obj.hasElse && state[obj.firstToken.tokposw]) {
				var 
					returnValue = obj.condition.branch(indent, state)+';\n' +
					indent.tabs() + obj.elseStatement.branch(indent, state) + (obj.elseStatement.isEXPRESSIONS?';':'')
				;
			} else {
				var returnValue = '';
			}

			return returnValue;
		};

		return obj;
	},
	DEBUGGER: function(stack){
		var obj = {
			type:'DEBUGGER',
			isDEBUGGER:true,
			firstToken:stack[0],
			beautify:function(){ return 'debugger;'; },
			minify:function(){ return 'debugger;'; },
			funstat:function(){ return '{mapping("debugger");debugger;}'; },
			heatmap:function(){ return '{'+Ast.getHeatString(obj)+';debugger;}'; },
			branch:function(){ return 'debugger;'; }
		};

		this.copyMeta(stack, obj);

		return obj;
	},
	WHILE: function(stack){
		var obj = {type:'WHILE', isWHILE: true, firstToken:stack[0]};

		this.copyMeta(stack, obj);

		// looking for first, header, cond, statement

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];

			if (s.statementHeaderStart) obj.headerStart = s;
			else if (s.desc == 'expressions') obj.condition = this.EXPRESSIONS(s);
			else if (s.desc == 'statement-parent') {
				obj.statement = this.STATEMENT(s);
				break; // end
			}
		}

		obj.beautify = function(indent){
			return 'while ('+obj.condition.beautify(indent)+') '+obj.statement.beautify(indent)+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.minify = function(){
			return 'while('+obj.condition.minify()+')'+obj.statement.minify() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.funstat = function(){
			return 'while(mapping("while"),('+obj.condition.funstat()+'))'+obj.statement.funstat()+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.heatmap = function(){
			return 'while('+Ast.getHeatString(obj)+',('+obj.condition.heatmap()+'))'+obj.statement.heatmap()+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.branch = function(indent, state){
			if (state.collect) {
				state[obj.firstToken.tokposw] = false;
				return 'while ('+obj.condition.branch(indent, state)+') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
			}
			if (!state[obj.firstToken.tokposw]) {
				return 'while ('+obj.condition.branch(indent, state)+') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
			}

			return obj.condition.branch(indent, state)+';';
		};

		return obj;
	},
	FOR_IN: function(stack){
		var obj = {type:'FOR_IN', isFORIN: true, firstToken:stack[0], left:null,op:null,right:null};

		this.copyMeta(stack, obj);

		// looking for first, header, cond, statement

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];
			if (s.statementHeaderStart) obj.headerStart = s;
			else if (s.desc == 'expressions' && !obj.left) obj.left = this.EXPRESSIONS(s);
			else if (s.desc == 'var decl' && !obj.left) obj.left = this.VAR(s);
			else if (s.desc == 'expressions' && !obj.right) obj.right = this.EXPRESSIONS(s);
			else if (s.value == 'in') obj.op = s;
			else if (s.desc == 'statement-parent') {
				obj.statement = this.STATEMENT(s);
				break; // end
			}
		}

		obj.beautify = function(indent){
			return 'for ('+obj.left.beautify(indent, true)+' in '+obj.right.beautify(indent)+') '+obj.statement.beautify(indent)+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.minify = function(){
			// tofix: prevent semi after the first expression
			return 'for('+obj.left.minify(true)+' in '+obj.right.minify()+')'+obj.statement.minify() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.funstat = function(){
			// tofix: prevent semi after first expression
			return 'for('+obj.left.funstat(true)+' in '+obj.right.funstat()+'){mapping("forin");'+obj.statement.funstat()+(obj.statement.isEXPRESSIONS?';':'')+"}";
		};

		obj.heatmap = function(){
			// tofix: prevent semi after first expression
			return 'for('+obj.left.heatmap(true)+' in '+obj.right.heatmap()+'){'+Ast.getHeatString(obj)+';'+(obj.statement.isEXPRESSIONS?';':'')+obj.statement.heatmap()+"}";
		};

		obj.branch = function(indent, state){
			if (state.collect) {
				state[obj.firstToken.tokposw] = false;
				return 'for ('+obj.left.branch(indent, state, true)+' in '+obj.right.branch(indent, state)+') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
			}
			if (!state[obj.firstToken.tokposw]) {
				return 'for ('+obj.left.branch(indent, state, true)+' in '+obj.right.branch(indent, state)+') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
			}

			// add both parts of the header, but seperately.
			// TOFIX: refine: if the left part is not declaring or initialising, remove it completely
			// TOFIX: refine: if the right part is dead code, remove it
			return obj.left.branch(indent, state, true)+';\n'+indent.tabs()+obj.right.branch(indent, state)+';';
		};

		return obj;
	},
	FOR_EACH: function(stack){
		var obj = {type:'FOR_EACH', firstToken:stack[0], isFOREACH: true, left:null, one:null, mid:null, two:null, right:null};

		this.copyMeta(stack, obj);

		// looking for first, header, left, mid, right, statement
		var semis = 0;

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];

			if (s.statementHeaderStart) obj.headerStart = s;
			else if (s.desc == 'expressions') {
				if (semis == 0) {
					// this is either an expressions stack or a var decl stack
					obj.left = this.EXPRESSIONS(s);
				} else if (semis == 1) {
					obj.mid = this.EXPRESSIONS(s); // this is the condition
				} else if (semis == 2) {
					obj.right = this.EXPRESSIONS(s);
				}
			} else if (s.desc == 'var decl') {
				obj.left = this.VAR(s);
			} else if (s.value == ';') {
				++semis;
				if (semis == 1) obj.one = s;
				else if (semis == 2) obj.two = s;
			} else if (s.desc == 'statement-parent') {
				obj.statement = this.STATEMENT(s);
				break; // end
			}
		}

		obj.beautify = function(indent){
			return 'for ('+
				(obj.left?obj.left.beautify(indent, true):'')+';'+
				(obj.mid?' '+obj.mid.beautify(indent):'')+';'+
				(obj.right?' '+obj.right.beautify(indent):'')+
			') '+obj.statement.beautify(indent)+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.minify = function(){
			return 'for('+
				(obj.left?obj.left.minify(true):'')+';'+
				(obj.mid?obj.mid.minify():'')+';'+
				(obj.right?obj.right.minify():'')+
			')'+obj.statement.minify() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.funstat = function(){
			return 'for('+
				(obj.left?obj.left.funstat(true):'')+';'+
				(obj.mid?obj.mid.funstat():'')+';'+
				(obj.right?obj.right.funstat():'')+
			'){'+
				'mapping("foreach");'+
				obj.statement.funstat()+(obj.statement.isEXPRESSIONS?';':'')+
			'}';
		};

		obj.heatmap = function(){
			return 'for('+
				(obj.left?obj.left.heatmap(true):'')+';'+
				(obj.mid?obj.mid.heatmap():'')+';'+
				(obj.right?obj.right.heatmap():'')+
			'){'+
				Ast.getHeatString(obj)+';'+
				obj.statement.heatmap()+(obj.statement.isEXPRESSIONS?';':'')+
			'}';
		};

		obj.branch = function(indent, state){
			if (state.collect) {
				state[obj.firstToken.tokposw] = false;
				return 'for ('+
					(obj.left?obj.left.branch(indent, state, true):'')+';'+
					(obj.mid?' '+obj.mid.branch(indent, state):'')+';'+
					(obj.right?' '+obj.right.branch(indent, state):'')+
				') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
			}
			if (!state[obj.firstToken.tokposw]) {
				return 'for ('+
					(obj.left?obj.left.branch(indent, state, true):'')+';'+
					(obj.mid?' '+obj.mid.branch(indent, state):'')+';'+
					(obj.right?' '+obj.right.branch(indent, state):'')+
				') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
			}

			// TOFIX: refine..
			return (
				(obj.left?obj.left.branch(indent, state, true)+';\n':'')+
				(obj.mid?(obj.left?indent.tabs():'')+obj.mid.branch(indent, state)+';\n':'')
			);
		};

		return obj;
	},
	BLOCK: function(stack){
		// blocks should only contain statements. but we dont have to validate here, the parser has already doen that :)
		var arr = [];
		var obj = {type:'BLOCK', isBLOCK:true, firstToken:stack[0], statements:arr};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			var item = stack[i];
			if (item.value == '{') obj.curlyOpen = item;
			else if (item.value == '}') obj.curlyClose = item;
			else if (item.desc == 'statement-parent' && item.sub == 'block') arr.push(this.BLOCK(item));
			else if (item.desc == 'statement-parent') arr.push(this.STATEMENT(item[0]));
		}

		obj.beautify = function(indent){
			indent |= 0;

			var s = '{\n';
			++indent;
			s += arr.map(function(o){
				return indent.tabs()+o.beautify(indent)+(o.isEXPRESSIONS?';':'')+'\n';
			}).join('');
			--indent;
			s += indent.tabs()+'}';

			return s;
		};

		obj.minify = function(){
			var s = '{';
			s += arr.map(function(o){
				return o.minify()+(o.isEXPRESSIONS?';':'');
			}).join('');
			s += '}';
			return s;
		};

		obj.funstat = function(){
			var s = '{mapping("block");';
			s += arr.map(function(o){
				if (o.isEXPRESSIONS) return 'mapping("exprs"),('+o.funstat()+');';
				return o.funstat();
			}).join('');
			s += '}';
			return s;
		};

		obj.heatmap = function(){
			var s = '{'+Ast.getHeatString(obj)+';';
			s += arr.map(function(o){
				if (o.isEXPRESSIONS) return Ast.getHeatString(o)+',('+o.heatmap()+');';
				return o.heatmap();
			}).join('');
			s += '}';
			return s;
		};

		obj.branch = function(indent, state){
			indent |= 0;

			var s = '{\n';
			++indent;
			var broke = false;
			s += arr.map(function(o){
				if (broke) return '';
				broke = o.isRETURN || o.isBREAK || o.isCONTINUE || o.isTHROW;
				return indent.tabs()+o.branch(indent, state)+(o.isEXPRESSIONS?';':'')+'\n';
			}).join('');
			--indent;
			s += indent.tabs()+'}';

			return s;
		};

		return obj;
	},
	VAR: function(stack){
		var obj = {type:'VAR', isVAR:true, firstToken:stack[0], decls:[]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];
			if (s.desc == 'single var decl') obj.decls.push(this.VAR_DECL(s));
		}

		obj.beautify = function(indent, noSemi){
			return 'var '+obj.decls.map(function(o){ return o.beautify(indent); }).join(', ')+(noSemi?'':';');
		};

		obj.minify = function(noSemi){
			return 'var '+obj.decls.map(function(o){ return o.minify(); }).join(',')+(noSemi?'':';');
		};

		obj.funstat = function(noSemi){
			if (noSemi) return 'var '+obj.decls.map(function(o){ return o.funstat(); }).join(','); // dont do anything here, its the var decl inside a for
			return '{mapping("var"); var '+obj.decls.map(function(o){ return o.funstat(); }).join(',')+';}';
		};

		obj.heatmap = function(noSemi){
			if (noSemi) return 'var '+obj.decls.map(function(o){ return o.heatmap(); }).join(','); // dont do anything here, its the var decl inside a for
			return '{'+Ast.getHeatString(obj)+'; var '+obj.decls.map(function(o){ return o.heatmap(); }).join(',')+';}';
		};

		obj.branch = function(indent, state, noSemi){
			return 'var '+obj.decls.map(function(o){ return o.branch(indent, state); }).join(', ')+(noSemi?'':';');
		};

		return obj;
	},
	VAR_DECL: function(stack){
		// looking for name and expr
		var obj = {type:'VAR_DECL', isVARDECL:true, initializer:null};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];
			if (s.desc == 'sub-expression') obj.name = this.SUBEXPRESSION(s);
			else if (s.desc == 'expressions') obj.initializer = this.EXPRESSIONS(s)[0];
		}

		obj.beautify = function(indent){
			return obj.name.beautify()+(!obj.initializer?'':' = '+obj.initializer.beautify(indent));
		};

		obj.minify = function(){
			return obj.name.minify()+(!obj.initializer?'':'='+obj.initializer.minify());
		};

		obj.funstat = function(){
			return obj.name.funstat()+(!obj.initializer?'':'='+obj.initializer.funstat());
		};

		obj.heatmap = function(){
			return obj.name.heatmap()+(!obj.initializer?'':'='+obj.initializer.heatmap());
		};

		obj.branch = function(indent, state){
			return obj.name.branch(indent, state)+(!obj.initializer?'':' = '+obj.initializer.branch(indent, state));
		};

		return obj;
	},
	EMPTY: function(stack){
		var obj = {
			type:'EMPTY',
			isEMPTY:true,
			firstToken:stack,
			beautify: function(){ return ';'; },
			minify: function(){ return ';'; },
			funstat: function(){ return 'mapping("empty");'; },
			heatmap: function(){ return Ast.getHeatString(obj)+';'; },
			branch: function(){ return ';'; }
		};

		this.copyMeta(stack, obj);

		return obj;
	},
	VOID: function(stack){ // error gets this... 
		var obj = {
			type:'VOID',
			isVOID:true,
			firstToken:stack,
			beautify: function(){ return ''; },
			minify: function(){ return ''; },
			funstat: function(){ return ''; },
			heatmap: function(){ return ''; },
			branch: function(){ return ''; }
		};

		this.copyMeta(stack, obj);

		return obj;
	},
	LABEL: function(stack){
		// cut away the mandatory expressions and expression layer
		stack = stack[0][0][0];

		var obj = {type:'LABEL', isLABEL:true, name:stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'statement-parent') {
				obj.statement = this.STATEMENT(stack[i]);
				break; // end
			}
		}

		obj.beautify = function(indent){
			return obj.name.value+':\n'+(indent+1).tabs()+obj.statement.beautify(indent+1) + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.minify = function(){
			return obj.name.value+':'+obj.statement.minify() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.funstat = function(){
			return obj.name.value+':'+obj.statement.funstat() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.heatmap = function(){
			return obj.name.value+':'+obj.statement.heatmap() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.branch = function(indent, state){
			return obj.name.value+':\n'+(indent+1).tabs()+obj.statement.branch(indent+1, state) + (obj.statement.isEXPRESSIONS?';':'');
		};

		return obj;
	},
	TRY: function(stack){
		var obj = {type:'TRY', isTRY:true, firstToken: stack[0], catchKeyword:null, catchBlock:null, finallyKeyword:null, finallyBlock:null};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].sub == 'tryblock') obj.tryBlock = this.BLOCK(stack[i]);
			else if (stack[i].sub == 'catch') {
				obj.catchKeyword = stack[i].sub[0];
				obj.catchBlock = this.BLOCK(stack[i].slice(0));
				// find the catch var
				var found = false;
				var index = 0;
				while (index < stack[i].length) {
					if (stack[i][index].meta == 'var name') {
						obj.catchVar = stack[i][index];
						break;
					}
					++index;
				}
			} else if (stack[i].sub == 'finally') {
				obj.finallyKeyword = stack[i].sub[0];
				obj.finallyBlock = this.BLOCK(stack[i].slice(0));
			}
		}

		obj.beautify = function(indent){
			var s = 'try '+obj.tryBlock.beautify(indent);
			if (obj.catchBlock) s += ' catch('+obj.catchVar.value+') '+obj.catchBlock.beautify(indent);
			if (obj.finallyBlock) s += ' finally '+obj.finallyBlock.beautify(indent);

			return s;
		};

		obj.minify = function(){
			var s = 'try'+obj.tryBlock.minify();
			if (obj.catchBlock) s += 'catch('+obj.catchKeyword.value+')'+obj.catchBlock.minify();
			if (obj.finallyBlock) s += 'finally'+obj.finallyBlock.minify();

			return s;
		};

		obj.funstat = function(){
			var s = 'try'+obj.tryBlock.funstat();
			if (obj.catchBlock) s += 'catch('+obj.catchKeyword.value+')'+obj.catchBlock.funstat();
			if (obj.finallyBlock) s += 'finally'+obj.finallyBlock.funstat();

			return s;
		};

		obj.heatmap = function(){
			var s = 'try'+obj.tryBlock.heatmap();
			if (obj.catchBlock) s += 'catch('+obj.catchKeyword.value+')'+obj.catchBlock.heatmap();
			if (obj.finallyBlock) s += 'finally'+obj.finallyBlock.heatmap();

			return s;
		};

		obj.branch = function(indent, state){
			var s = 'try '+obj.tryBlock.branch(indent, state);
			if (obj.catchBlock) s += ' catch('+obj.catchVar.value+') '+obj.catchBlock.branch(indent, state);
			if (obj.finallyBlock) s += ' finally '+obj.finallyBlock.branch(indent, state);

			return s;
		};

		return obj;
	},
	SWITCH: function(stack){
		// list of clauses
		// index of default in the clause list, if any
		var obj = {type:'SWITCH', isSWITCH:true, firstToken: stack[0], clauses:[]};

		this.copyMeta(stack, obj);

		var prevHead = null;
		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];
			if (s.desc == 'expressions') obj.condition = this.EXPRESSIONS(s);
			else if (s.value == '(') obj.headerStart = s;
			else if (s.desc == 'switch clause header') prevHead = s;
			else if (s.desc == 'switch clause body') obj.clauses.push(this.CLAUSE(prevHead, s));
		}

		obj.beautify = function(indent){
			var s = 'switch ('+obj.condition.beautify(indent)+') {\n';
			++indent;
			for (var i=0; i<obj.clauses.length; ++i) {
				s += obj.clauses[i].beautify(indent);
			}
			--indent;
			s += '\n'+indent.tabs()+'}';
			return s;
		};

		obj.minify = function(){
			var s = 'switch('+obj.condition.minify()+'){';
			for (var i=0; i<obj.clauses.length; ++i) {
				s += obj.clauses[i].minify();
			}
			s += '}';
			return s;
		};

		obj.funstat = function(){
			var s = 'switch(mapping("switch"),('+obj.condition.funstat()+')){';
			for (var i=0; i<obj.clauses.length; ++i) {
				s += obj.clauses[i].funstat();
			}
			s += '}';
			return s;
		};

		obj.heatmap = function(){
			var s = 'switch('+Ast.getHeatString(obj)+',('+obj.condition.heatmap()+')){';
			for (var i=0; i<obj.clauses.length; ++i) {
				s += obj.clauses[i].heatmap();
			}
			s += '}';
			return s;
		};

		obj.branch = function(indent, state){
			var s = 'switch ('+obj.condition.branch(indent, state)+') {\n';
			++indent;
			for (var i=0; i<obj.clauses.length; ++i) {
				s += obj.clauses[i].branch(indent, state);
			}
			--indent;
			s += '\n'+indent.tabs()+'}';
			return s;
		};

		return obj;
	},
	CLAUSE: function(head, body){
		// a clause is a header (case/default) with a condition and zero or more statements

		var obj = {type:'CLAUSE', isCLAUSE:true, clauseType:head.sub == 'case' ? 'case' : 'default', firstToken:head[0][0], condition:null, statements:null};

		this.copyMeta(head, obj);

		if (obj.clauseType == 'case') {
			obj.condition = this.EXPRESSIONS(head[1][0]);
			obj.colon = head[2][0];
		} else {
			obj.colon = head[1][0];
		}

		if (body.length) obj.statements = this.SOURCE_ELS(body);

		obj.beautify = function(indent){
			var s = indent.tabs();
			if (obj.clauseType == 'case') s += 'case '+obj.condition.beautify(indent)+':\n';
			else s += 'default:\n';

			if (obj.statements) s += (++indent).tabs()+obj.statements.beautify(indent);

			return s;
		};

		obj.minify = function(indent){
			var s = '';
			if (obj.clauseType == 'case') s += 'case '+obj.condition.minify()+':';
			else s += 'default:';

			if (obj.statements) s += obj.statements.minify();

			return s;
		};

		obj.funstat = function(indent){
			var s = '';
			if (obj.clauseType == 'case') s += 'case '+obj.condition.funstat()+':';
			else s += 'default:';

			s += 'mapping("clause");';
			// its ok if this is a block, there's no scoping danger like with the if-statement statement
			if (obj.statements) s += obj.statements.funstat();

			return s;
		};

		obj.heatmap = function(indent){
			var s = '';
			if (obj.clauseType == 'case') s += 'case '+obj.condition.heatmap()+':';
			else s += 'default:';

			s += Ast.getHeatString(obj)+';';
			// its ok if this is a block, there's no scoping danger like with the if-statement statement
			if (obj.statements) s += obj.statements.heatmap();

			return s;
		};

		obj.branch = function(indent, state){
			var s = indent.tabs();
			if (obj.clauseType == 'case') s += 'case '+obj.condition.branch(indent, state)+':\n';
			else s += 'default:\n';

			if (obj.statements) s += (++indent).tabs()+obj.statements.branch(indent, state);

			return s;
		};

		return obj;
	},
	DO: function(stack){
		var obj = {type:'DO', isDO:true, firstToken: stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'statement-parent') obj.statement = this.STATEMENT(stack[i]);
			else if (stack[i].desc == 'expressions') obj.expression = this.EXPRESSIONS(stack[i]);
			else if (stack[i].desc == 'expression') obj.expression = this.EXPRESSION(stack[i]);
			else if (stack[i].value == 'while') obj.whileToken = stack[i];
		}

		obj.beautify = function(indent){
			 return 'do '+obj.statement.beautify(indent)+(obj.statement.isEXPRESSIONS?';':'')+' while ('+obj.expression.beautify(indent)+');';
		};

		obj.minify = function(){
			 return 'do '+obj.statement.minify()+(obj.statement.isEXPRESSIONS?';':'')+'while('+obj.expression.minify()+');';
		};

		obj.funstat = function(){
			 return 'do{mapping("do");'+obj.statement.funstat()+(obj.statement.isEXPRESSIONS?';':'')+'}while('+obj.expression.funstat()+');';
		};

		obj.heatmap = function(){
			 return 'do{'+Ast.getHeatString(obj)+';'+obj.statement.heatmap()+(obj.statement.isEXPRESSIONS?';':'')+'}while('+obj.expression.heatmap()+');';
		};

		obj.branch = function(indent, state){
			if (state.collect) {
				state[obj.firstToken.tokposw] = false;
				return 'do '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'')+' while ('+obj.expression.branch(indent, state)+');';
			}
			if (!state[obj.firstToken.tokposw]) {
				return 'do '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'')+' while ('+obj.expression.branch(indent, state)+');';
			}
			
			return obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
		};

		return obj;
	},
	RETURN: function(stack){
		var obj = {type:'RETURN', isRETURN: true, firstToken:stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'expressions') {
				obj.arg = this.EXPRESSIONS(stack[i]);
				break;
			}
		}

		obj.beautify = function(indent){
			return 'return'+(!obj.arg?'':' '+obj.arg.beautify(indent))+';';
		};

		obj.minify = function(){
			return 'return'+(!obj.arg?'':' '+obj.arg.minify())+';';
		};

		obj.funstat = function(){
			if (obj.arg) return 'return mapping("return"),('+obj.arg.funstat()+');';
			return 'return mapping("return"),undefined;'; // tofix: undefined should probably be safer. although it might be an edge case i dont care about because the fix will be ugly.
		};

		obj.heatmap = function(){
			if (obj.arg) return 'return '+Ast.getHeatString(obj)+',('+obj.arg.heatmap()+');';
			return 'return '+Ast.getHeatString(obj)+',undefined;'; // tofix: undefined should probably be safer. although it might be an edge case i dont care about because the fix will be ugly.
		};

		obj.branch = function(indent, state){
			return 'return'+(!obj.arg?'':' '+obj.arg.branch(indent, state))+';';
		};

		return obj;
	},
	BREAK: function(stack){
		var obj = {type:'BREAK', isBREAK: true, firstToken:stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'expressions') {
				obj.arg = this.IDENTIFIER(stack[i]);
				break;
			}
		}

		obj.beautify = function(indent){
			return 'break'+(!obj.arg?'':' '+obj.arg.beautify(indent))+';';
		};

		obj.minify = function(){
			return 'break'+(!obj.arg?'':' '+obj.arg.minify())+';';
		};

		obj.funstat = function(){
			return '{mapping("break");break'+(!obj.arg?'':' '+obj.arg.funstat())+';}';
		};

		obj.heatmap = function(){
			return '{'+Ast.getHeatString(obj)+';break'+(!obj.arg?'':' '+obj.arg.heatmap())+';}';
		};

		obj.branch = function(indent, state){
			return 'break'+(!obj.arg?'':' '+obj.arg.branch(indent, state))+';';
		};

		return obj;
	},
	CONTINUE: function(stack){
		var obj = {type:'CONTINUE', isCONTINUE: true, firstToken:stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'expressions') {
				obj.arg = this.IDENTIFIER(stack[i]);
				break;
			}
		}

		obj.beautify = function(indent){
			return 'continue'+(!obj.arg?'':' '+obj.arg.beautify(indent));
		};

		obj.minify = function(){
			return 'continue'+(!obj.arg?'':' '+obj.arg.minify());
		};

		obj.funstat = function(){
			return '{mapping("continue");continue'+(!obj.arg?'':' '+obj.arg.funstat())+';}'; // todo: semi is redundant
		};

		obj.heatmap = function(){
			return '{'+Ast.getHeatString(obj)+';continue'+(!obj.arg?'':' '+obj.arg.heatmap())+';}'; // todo: semi is redundant
		};

		obj.branch = function(indent, state){
			return 'continue'+(!obj.arg?'':' '+obj.arg.branch(indent, state));
		};

		return obj;
	},
	IDENTIFIER: function(stack){
		var obj = {
			type:'IDENTIFIER',
			isIDENTIFIER: true,
			firstToken: stack[0],
			beautify: function(){ return this.value; },
			minify: function(){ return this.value; },
			funstat: function(){ return this.value; },
			heatmap: function(){ return this.value; },
			branch: function(){ return this.value; }
		};

		obj.value = stack.filter(function(o){
			return o.desc == 'expression';
		})[0].filter(function(o){
			return o.desc == 'sub-expression';
		})[0].filter(function(o){
			return o.isLabel;
		})[0].value,


		this.copyMeta(stack, obj);

		return obj;
	},
	THROW: function(stack){
		var obj = {type:'THROW', isTHROW: true, firstToken:stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'expressions') {
				obj.arg = this.EXPRESSIONS(stack[i]);
				break;
			}
		}

		obj.beautify = function(indent){
			return 'throw'+' '+obj.arg.beautify(indent)+';';
		};

		obj.minify = function(){
			return 'throw'+' '+obj.arg.minify()+';';
		};

		obj.funstat = function(){
			return '{mapping("throw");throw'+' '+obj.arg.funstat()+';}';
		};

		obj.heatmap = function(){
			return '{'+Ast.getHeatString(obj)+';throw'+' '+obj.arg.heatmap()+';}';
		};

		obj.branch = function(indent, state){
			return 'throw'+' '+obj.arg.branch(indent, state)+';';
		};

		return obj;
	},
	WITH: function(stack){
		var obj = {type:'WITH', isWITH: true, firstToken:stack[0]};

		this.copyMeta(stack, obj);

		// looking for first, header, cond, statement

		for (var i=0; i<stack.length; ++i) {
			var s = stack[i];

			if (s.statementHeaderStart) obj.headerStart = s;
			else if (s.desc == 'expressions') obj.condition = this.EXPRESSIONS(s);
			else if (s.desc == 'statement-parent') {
				obj.statement = this.STATEMENT(s);
				break; // end
			}
		}

		obj.beautify = function(indent){
			return 'with ('+obj.condition.beautify(indent)+') '+obj.statement.beautify(indent)+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.minify = function(){
			return 'with('+obj.condition.minify()+')'+obj.statement.minify() + (obj.statement.isEXPRESSIONS?';':'');
		};

		obj.funstat = function(){
			return 'with(mapping("with"),('+obj.condition.funstat()+'))'+obj.statement.funstat()+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.heatmap = function(){
			return 'with('+Ast.getHeatString(obj)+',('+obj.condition.heatmap()+'))'+obj.statement.heatmap()+(obj.statement.isEXPRESSIONS?';':'');
		};

		obj.branch = function(indent, state){
			return 'with ('+obj.condition.branch(indent, state)+') '+obj.statement.branch(indent, state)+(obj.statement.isEXPRESSIONS?';':'');
		};

		return obj;
	},
	EXPRESSIONS: function(stack){
		var arr = [];
		arr.type = 'EXPRESSIONS';
		arr.isEXPRESSIONS = true;

		this.copyMeta(stack, arr);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'expression') arr.push(this.EXPRESSION(stack[i]));
		}

		arr.beautify = function(indent){
			return arr.map(function(o){ return o.beautify(indent); }).join(', ');
		};

		arr.minify = function(){
			return arr.map(function(o){ return o.minify(); }).join(',');
		};

		arr.funstat = function(){
			return arr.map(function(o){ return o.funstat(); }).join(',');
		};

		arr.heatmap = function(){
			return arr.map(function(o){ return o.heatmap(); }).join(',');
		};

		arr.branch = function(indent, state){
			return arr.map(function(o){ return o.branch(indent, state); }).join(', ');
		};

		return arr;
	},
	EXPRESSION: function(stack){
		var obj = {type:'EXPRESSION', isEXPRESSION:true, isTriple:false};

		this.copyMeta(stack, obj);

		obj.beautify = function(indent){
			return obj.lhs.beautify(indent)+(obj.isTriple?' '+obj.op+' '+obj.rhs.beautify(indent):'');
		};

		obj.minify = function(){
			return obj.lhs.minify()+(obj.isTriple?' '+obj.op+' '+obj.rhs.minify():'');
		};

		obj.funstat = function(){
			return obj.lhs.funstat()+(obj.isTriple?' '+obj.op+' '+obj.rhs.funstat():'');
		};

		obj.heatmap = function(){
			return obj.lhs.heatmap()+(obj.isTriple?' '+obj.op+' '+obj.rhs.heatmap():'');
		};

		obj.branch = function(indent, state){
			return obj.lhs.branch(indent, state)+(obj.isTriple?' '+obj.op+' '+obj.rhs.branch(indent, state):'');
		};

		if (stack.isEXPRESSION) obj.lhs = stack;
		else if (stack.desc == 'sub-expression') obj.lhs = this.SUBEXPRESSION(stack);
		else {
			var collects = [];
			for (var i=0; i<stack.length; ++i) {
				if (stack[i].isEXPRESSION || stack[i].desc == 'sub-expression' || stack[i].desc == 'operator-expression' || stack[i].desc == 'expression' || stack[i].desc == 'expressions') {
					collects.push(stack[i]);
				} else if (stack[i].value != ',') {
					console.log("should not encounter comma in single expression");
				} else if (!stack[i].isWhite) {
					throw console.log(['weird contents',stack, i, stack[i]]), "weiiiird, unexpected stack type";
				}
			}

			if (collects.length == 0) throw "empty? no way";

			if (collects.length == 1) {
				if (stack[0].desc == 'sub-expression') obj.lhs = this.SUBEXPRESSION(stack[0]);
				else if (stack[0].desc == 'expression') obj.lhs = this.EXPRESSION(stack[0]);
				else throw console.log(['no subexpr?', stack[0], stack]),"expected sub expr here";
			} else {
				// an expression has either 1 or 3 children, and 2 or 4 children if a postfix expression was used.
				// 1 if there are no infix operators at work
				// 3 if theres a binary/terary operator at work (normalize the ternary)

				// collects now contains all expression parts but no whitespace (at least not on the surface)
				if (collects.length % 2 != 1) throw "number of expression parts should be uneven, shouldnt it?";

				while (collects.length > 3) {
					var minTarget = 1;
					var minValue = this.precedence[collects[1].sub];
					var n = 3;
					while (n < collects.length-1) {
						var curValue = this.precedence[collects[n].sub];
						if (curValue < minValue || (curValue == minValue && (stack[n].isAssignment || stack[n].sub == '?' || stack[n].sub == ':'))) {
							minValue = curValue;
							minTarget = n;
						}
						n += 2;
					}

					// minTarget is now our next "cut"
					// take the token directly left and right of the operator

					var expr = this.EXPRESSION([collects[minTarget-1], collects[minTarget], collects[minTarget+1]]);
					collects.splice(minTarget-1, 3, expr);
				}

				// collects will now contain exactly three parts
				obj.lhs = this.EXPRESSION(collects[0]);
				obj.op = collects[1][0].value;
				obj.rhs = this.EXPRESSION(collects[2]);
				obj.isTriple = true;

			}
		}

		return obj;
	},
	SUBEXPRESSION: function(stack){
		if (stack.isDOT || stack.isDYNPROP || stack.isCALL) return stack;

		if (stack.sub == 'object literal') return this.OBJLIT(stack);
		if (stack.sub == 'array literal') return this.ARRLIT(stack);

		// skip to first non-white element
		var i=0;
		while (stack[i] && stack[i].isWhite) ++i;

		if (!stack[i]) return null;

		// filter remaining whitespace
		var arr = [];
		for (; i<stack.length; ++i) if (!stack[i].isWhite) arr.push(stack[i]);

		// functions
		if (arr[0].isFunction) var lead = this.FUNCEXPR(arr.shift());
		// groups and unary operators
		else if (arr[0].desc == 'grouped') var lead = this.GROUP(arr.shift());
		// unaries
		else if (arr[0].meta != 'lead value' && arr[0].meta != 'var name') return this.UNARY(arr);
		// something else ? :)
		else var lead = this.LEAD(arr.shift());

		var postfix = null;

		if (!arr.length) return lead;
		// combine while still something left to combine
		while (arr.length >= 1) {
			var infix = arr.shift();
			if (infix) {
				if (infix.value == '.') {
					lead = this.DOT(lead, infix, arr.shift());
				} else if (infix.value == '[') {
					lead = this.DYNPROP(lead, infix, arr.shift(), arr.shift());
				} else if (infix.value == '(') {
					if (arr[0].value == ')') lead = this.CALL(lead, infix, null, arr.shift());
					else lead = this.CALL(lead, infix, arr.shift(), arr.shift());
				} else if (infix.value == '++' || infix.value == '--') {
					// postfix...!
					postfix = infix;
				} else {
					console.log(["error token is", infix])
					throw "unknown infix/postfix";
				}
			} else {
				throw "wtf?";
			}
		}

		var obj = {type:'SUBEXPRESSION', lead:lead, postfix:postfix};

		this.copyMeta(stack, obj);

		obj.beautify = function(indent){
			return obj.lead.beautify(indent) + (obj.postfix ? obj.postfix.value : '');
		};
		obj.minify = function(){
			return obj.lead.minify() + (obj.postfix ? obj.postfix.value : '');
		};
		obj.funstat = function(){
			return obj.lead.funstat() + (obj.postfix ? obj.postfix.value : '');
		};
		obj.heatmap = function(){
			return obj.lead.heatmap() + (obj.postfix ? obj.postfix.value : '');
		};
		obj.branch = function(indent, state){
			return obj.lead.branch(indent, state) + (obj.postfix ? obj.postfix.value : '');
		};
		return obj;
	},
	LEAD: function(stack){
		var obj = {type:'LEAD', isLEAD:true, token:stack};

		this.copyMeta(stack, obj);

		obj.beautify = function(indent){
			return obj.token.value;
		};
		obj.minify = function(){
			return obj.token.value;
		};
		obj.funstat = function(){
			return obj.token.value;
		};
		obj.heatmap = function(){
			return obj.token.value;
		};
		obj.branch = function(indent, state){
			return obj.token.value;
		};
		return obj;
	},
	DOT: function(lhs, dot, rhs){
		var obj = {type:'DOT', isDOT:true, lhs:lhs, dot:dot, rhs:this.LEAD(rhs)};

		this.copyMeta(lhs, obj);

		obj.beautify = function(indent){
			return obj.lhs.beautify(indent)+'.'+obj.rhs.beautify(indent);
		};
		obj.minify = function(){
			return obj.lhs.minify()+'.'+obj.rhs.minify();
		};
		obj.funstat = function(){
			return obj.lhs.funstat()+'.'+obj.rhs.funstat();
		};
		obj.heatmap = function(){
			return obj.lhs.heatmap()+'.'+obj.rhs.heatmap();
		};
		obj.branch = function(indent, state){
			return obj.lhs.branch(indent, state)+'.'+obj.rhs.branch(indent, state);
		};

		return obj;
	},
	DYNPROP: function(lhs, leftBracket, exp, rightBracket){
		var obj = {type:'DYNPROP', isDYNPROP:true, lhs:lhs, leftBracket:leftBracket, expression:this.EXPRESSIONS(exp), rightBracket:rightBracket};

		this.copyMeta(lhs, obj);

		obj.beautify = function(indent){
			return lhs.beautify(indent)+'['+obj.expression.beautify(indent)+']';
		};
		obj.minify = function(){
			return lhs.minify()+'['+obj.expression.minify()+']';
		};
		obj.funstat = function(){
			return lhs.funstat()+'['+obj.expression.funstat()+']';
		};
		obj.heatmap = function(){
			return lhs.heatmap()+'['+obj.expression.heatmap()+']';
		};
		obj.branch = function(indent, state){
			return lhs.branch(indent, state)+'['+obj.expression.branch(indent, state)+']';
		};

		return obj;
	},
	CALL: function(lhs, leftParen, exp, rightParen){
		var obj = {type:'CALL', isCALL:true, lhs:lhs, leftParen:leftParen, expression:exp && this.EXPRESSIONS(exp), rightParen:rightParen};

		this.copyMeta(lhs, obj);

		obj.beautify = function(indent){
			return obj.lhs.beautify(indent)+'('+(obj.expression?obj.expression.beautify(indent):'')+')';
		};
		obj.minify = function(){
			return obj.lhs.minify()+'('+(obj.expression?obj.expression.minify():'')+')';
		};
		obj.funstat = function(){
			return obj.lhs.funstat()+'('+(obj.expression?obj.expression.funstat():'')+')';
		};
		obj.heatmap = function(){
			return obj.lhs.heatmap()+'('+(obj.expression?obj.expression.heatmap():'')+')';
		};
		obj.branch = function(indent, state){
			return obj.lhs.branch(indent, state)+'('+(obj.expression?obj.expression.branch(indent, state):'')+')';
		};

		return obj;
	},
	UNARY: function(stack){
		var i=0;
		while (stack[i] && stack[i].isWhite) ++i;
		var obj = {type:'UNARY', isUNARY:true, op:stack[i], rhs:this.SUBEXPRESSION(stack.slice(i+1)) };

		this.copyMeta(stack, obj);

		obj.beautify = function(indent){
			return obj.op.value+' '+obj.rhs.beautify(indent);
		};
		obj.minify = function(){
			return obj.op.value+' '+obj.rhs.minify();
		};
		obj.funstat = function(){
			return obj.op.value+' '+obj.rhs.funstat();
		};
		obj.heatmap = function(){
			return obj.op.value+' '+obj.rhs.heatmap();
		};
		obj.branch = function(indent, state){
			return obj.op.value+' '+obj.rhs.branch(indent, state);
		};

		return obj;
	},
	GROUP: function(stack){
		var obj = {type:'GROUP', isGROUP:true, leftParen:stack[0]};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].value == '(') obj.leftParen = stack[i];
			else if (stack[i].desc == 'expressions') obj.expressions = this.EXPRESSIONS(stack[i]);
			else if (stack[i].value == ')') {
				obj.rightParen = stack[i];
				break;
			} else if (!stack[i].isWhite) throw "unknown type";
		}

		obj.beautify = function(indent){
			return '('+obj.expressions.beautify(indent)+')';
		};
		obj.minify = function(){
			return '('+obj.expressions.minify()+')';
		};
		obj.funstat = function(){
			return '('+obj.expressions.funstat()+')';
		};
		obj.heatmap = function(){
			return '('+obj.expressions.heatmap()+')';
		};
		obj.branch = function(indent, state){
			return '('+obj.expressions.branch(indent, state)+')';
		};

		return obj;
	},
	OBJLIT: function(stack){
		var arr = [];
		var obj = {type:'OBJLIT', isOBJLIT:true, pairs:arr};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].isObjectLiteralPair) arr.push(this.OBJLITPAIR(stack[i]));
		}

		obj.beautify = function(indent){
			return '{'+arr.map(function(o){ return o.beautify(indent); }).join(', ')+'}';
		};

		obj.minify = function(){
			return '{'+arr.map(function(o){ return o.minify(); }).join(',')+'}';
		};

		obj.funstat = function(){
			return '{'+arr.map(function(o){ return o.funstat(); }).join(',')+'}';
		};

		obj.heatmap = function(){
			return '{'+arr.map(function(o){ return o.heatmap(); }).join(',')+'}';
		};

		obj.branch = function(indent, state){
			return '{'+arr.map(function(o){ return o.branch(indent, state); }).join(', ')+'}';
		};

		return obj;
	},
	OBJLITPAIR: function(stack){
		var obj = {type:'OBJLITPAIR', isOBJLITPAIR:true};

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].desc == 'objlit pair name') obj.name = stack[i][0];
			else if (stack[i].desc == 'expressions') obj.value = this.EXPRESSIONS(stack[i])[0];
		}

		obj.beautify = function(indent){
			return obj.name.value+':'+obj.value.beautify(indent);
		};

		obj.minify = function(){
			return obj.name.value+':'+obj.value.minify();
		};

		obj.funstat = function(){
			return obj.name.value+':'+obj.value.funstat();
		};

		obj.heatmap = function(){
			return obj.name.value+':'+obj.value.heatmap();
		};

		obj.branch = function(indent, state){
			return obj.name.value+':'+obj.value.branch(indent, state);
		};

		return obj;
	},
	ARRLIT: function(stack){
		var arr = [];
		var obj = {type:'ARRLIT', isARRLIT:true, elements:arr};
		var last;

		this.copyMeta(stack, obj);

		for (var i=0; i<stack.length; ++i) {
			if (stack[i].value == ',' && last && last.value == ',') arr.push(this.ELISION(stack[i]));
			if (stack[i].desc == 'expressions') arr.push(this.EXPRESSIONS(stack[i])[0]);
			last = stack[i];
		}

		obj.beautify = function(indent){
			return '['+arr.map(function(o){ return o.beautify(indent); }).join(', ')+']';
		};

		obj.minify = function(){
			return '['+arr.map(function(o){ return o.minify(); }).join(',')+']';
		};

		obj.funstat = function(){
			return '['+arr.map(function(o){ return o.funstat(); }).join(',')+']';
		};

		obj.heatmap = function(){
			return '['+arr.map(function(o){ return o.heatmap(); }).join(',')+']';
		};

		obj.branch = function(indent, state){
			return '['+arr.map(function(o){ return o.branch(indent, state); }).join(', ')+']';
		};

		return obj;
	},
	ELISION: function(stack){
		var obj = {
			type:'ELISION',
			isELISION:true,
			beautify:function(){ return ''; },
			minify:function(){ return ''; },
			heatmap:function(){ return ''; },
			funstat:function(){ return ''; },
			branch:function(){ return ''; }
		};

		this.copyMeta(stack, obj);

		return obj;
	},

0:0};