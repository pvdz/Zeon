var fuzzZee = (function(){
	var getStatement = function(){
		var x = [
			"Block", 
			"VariableStatement", 
			"EmptyStatement",
			"IfStatement",
			"IterationStatement",
			"ContinueStatement",
			"BreakStatement",
			"ReturnStatement",
			"WithStatement",
			"LabelledStatement",
			"SwitchStatement",
			"ThrowStatement",
			"TryStatement",
			"DebuggerStatement",
			"ExpressionStatement"
		];
		
		var s = x[Math.floor(Math.random()*x.length)];
		
		switch (s) {
			case "Block":
				 return getBlock();
			case "VariableStatement":
				return getVar().concat(getSemi());
			case "EmptyStatement":
				return [";"];
			case "IfStatement":
				var n = 5;
				var s = [];
				while (--n) {
					if (s.length) s = s.concat('else', getWhitespace(true));
					s = s.concat("if","(",getExpression(),")",getStatement());
				}
				s = s.concat('else',getWhitespace(true),getStatement());
				return s;
			case "IterationStatement":
				switch(Math.floor(Math.random()*6)) {
					case 0: return [].concat("do",getWhitespace(true),getStatement(),"while","(",getExpression(),")",getSemi());
					case 1: return [].concat("while","(",getExpression(),")",getStatement());
					case 2: return [].concat("for","(",getExpression(),";",getExpression(),";",getExpression(),")",getStatement());
					case 3: return [].concat("for","(",getVar(),";",getExpression(),";",getExpression(),")",getStatement());
					case 4: return [].concat("for","(",getExpression(),getWhitespace(true),"in",getWhitespace(true),getExpression(),")",getStatement());
					case 5: return [].concat("for","(",getVar(),getWhitespace(true),"in",getWhitespace(true),getExpression(),")",getStatement());
				}
				return "<b>unknown-iteration</b>";
			case "ContinueStatement":
				return [].concat("continue",getWhitespace(true),getIdentifier(),getSemi());
			case "BreakStatement":
				return [].concat("break",getWhitespace(true),getIdentifier(),getSemi());
			case "ReturnStatement":
				return [].concat("return",getWhitespace(true),getIdentifier(),getSemi());
			case "WithStatement":
				return [].concat("with","(",getExpression(),")",getStatement());
			case "LabelledStatement":
				return [].concat(getIdentifier(),":",getStatement());
			case "SwitchStatement":
				var s = [].concat('switch','(',getExpression(),')','{');
				var n = 5;
				while (--n) {
					s.concat('case',getWhitespace(true),getExpression,':');
					var m = 3;
					while (--m) s.concat(getStatement());
				}
				s.concat('default',':',getStatement());
				var n = 5;
				while (--n) {
					s.concat('case',getWhitespace(true),getExpression,':');
					var m = 3;
					while (--m) s.concat(getStatement());
				}
				return s;
			case "ThrowStatement":
				return [].concat("throw","NORETURNS",getWhitespace(true,true),"NORETURNS",getExpression(),getSemi());
			case "TryStatement":
				switch (Math.floor(Math.random() * 3)) {
					case 0: return [].concat("try",getBlock(),"catch","(",getIdentifier(),")",getBlock());
					case 1: return [].concat("try",getBlock(),"finally",getBlock());
					case 2: return [].concat("try",getBlock(),"catch","(",getIdentifier(),")",getBlock(),"finally",getStatement());
				}
				return "<b>unknown-try</b>";
			case "DebuggerStatement":
				return [].concat("debugger",getSemi());
			case "ExpressionStatement":
				return getExpression().concat(getSemi());
			default:
				alert("unknown statement: "+s);
		}
		return "<b>unknown-statement</b>";
	};
	var getExpression = function(){
		var s = [];
		var sops = ['~','!','-','+'];
		var bops = ['%','^','&','*','||','&&','/'];
		var notFirst = false;
		do {
			if (notFirst) s.push(',');
			else notFirst = true;
			
			if (Math.random() > 0.2) s = s.concat(getIdentifier());
			else if (Math.random() > 0.5) s = s.concat(getExpression(),bops[Math.floor(Math.random()*bops.length)],getExpression());
			else s = s.concat(sops[Math.floor(Math.random()*sops.length)],getExpression());
			 
		} while (Math.random() < 0.2);
		
		if (Math.random() > 0.5) s = ["("].concat(s, ")");
		
		return s;
	};
	var getFunctionDeclaration = function(){
		return [].concat('function',getWhitespace(true),getIdentifier(),'(',')','{',getStmtOrDecl(),'}');
	};
	var getFunctionExpression = function(){
		return [].concat('function',getWhitespace(true),'a','(',')','{','}');
	};
	var getVar = function(){
		var s = ["var"];
		var n = 5;
		while (--n) {
			if (s.length>1) s = s.push(',');
			s = s.concat(getIdentifier(),getAssignmentExpression());
		}
		return s;
	};
	var getIdentifier = function(){
		switch (Math.floor(Math.random() * 4)) {
			case 0: return ["abc"];
			case 1: return ["a\\u3142c"];
			case 2: return ["a\u3142c"];
			case 3: return ["returns"];
		}
		return 'identifiererror';
	};
	var getSemi = function(){
		switch (Math.floor(Math.random() * 2)) {
			case 0: return [";"];
			case 1: return ["\n"];
		}
		return "<b>unknown-semi</b>";
	};
	var getAssignmentExpression = function(){
		return ["="].concat(getExpression());
	};
	var getBlock = function(){
		 var n = 5;
		 var s = ['{'];
		 while (--n) s.concat(getStatement());
		 s.push('}');
		 return s;
	};
	var getWhitespace = function(always,nobreak){
		var n = 0.25;
		var s = [];
		while (always || Math.random() < n) {
			always = false;
			n *= n;
			switch (Math.floor(Math.random()*3)) {
				case 0: s.push(' '); break;
				case 1: s.push(nobreak?' ':'\n'); break;
				case 2: s.push('\t'); break;
			}
		}
		return s;
	};
	var getStmtOrDecl = function(){
		if (Math.random() < 0.2) return getFunctionDeclaration();
		return getStatement();
	};
	
	return function getSnippet(){
		var stmt = getStmtOrDecl();
		var n = stmt.length+1;
		while (n--) stmt.splice(n, 0, getWhitespace().join(''));
		var pos;
		while ((pos = stmt.indexOf("NORETURNS")) != -1) stmt.splice(pos-1,3);
		return getWhitespace().join('')+stmt.join('');
	};
})();

