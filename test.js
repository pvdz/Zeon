var test = function(title, input, callback){
	try {
		var zeon = new Zeon(input, Zeon.getNewConfig());
		zeon.parse();
		zeon.startProcess();
		callback(zeon);
		//out('<b style="color:green;">PASS</b>: '+window.testgroup+': '+title)
	} catch(e){
		var msg = typeof e == 'string' ? e : 'js error thrown';
		out('<b style="color:red;">FAIL</b>: '+window.testgroup+': '+title+': '+msg, typeof e != 'string' ? e : '');
	}
};
var assert = function(desc, shouldBeTrue){
	if (!shouldBeTrue) throw desc;
};
var reject = function(desc, shouldBeFalse){
	if (shouldBeFalse) throw desc;
};
var get = function(zeon,arr){
	if (!arr) console.log("missing zeon?");
	reject('Has parse error', zeon.hasError);
	if (typeof arr == 'string') arr = [arr];
	// if arr is a function, it's actually the filter to apply...
	return zeon.btree.filter(typeof arr == 'function' ? arr : function(t){ return arr.indexOf(t.value) >= 0; });
};
var out = function(s){
	var e = document.createElement('div');
	e.innerHTML = s;
	document.getElementById('out').appendChild(e);
};

new function(){ testgroup = 'Simple assignments';
	test('string',
		'var x = \'\';\ny = \'\';\no.z = \'\';',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type string', vt[0] == 'string');
				});
			});
		}
	);
	test('number',
		'var x = 5;\ny = 5;\no.z = 5;',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type number', vt[0] == 'number');
				});
			});
		}
	);
	test('null',
		'var x = null;\ny = null;\no.z = null;',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type null', vt[0] == 'null');
				});
			});
		}
	);
	test('undefined',
		'var x = undefined;\ny = undefined;\no.z = undefined;',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type undefined', vt[0] == 'undefined');
				});
			});
		}
	);
	test('boolean true',
		'var x = true;\ny = true;\no.z = true;',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type boolean', vt[0] == 'boolean');
				});
			});
		}
	);
	test('boolean false',
		'var x = false;\ny = false;\no.z = false;',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type boolean', vt[0] == 'boolean');
				});
			});
		}
	);
	test('object',
		'var x = {};\ny = {};\no.z = {};',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type Object', vt[0] == 'Object');
				});
			});
		}
	);
	test('Array',
		'var x = [];\ny = [];\no.z = [];',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type Array', vt[0] == 'Array');
				});
			});
		}
	);
	test('Function',
		'var x = function(){};\ny = function(){};\no.z = function(){};',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// checks regular var assignment, var declaration initializer and property assignment. objlit is a different case
			var vars = get(zeon,['x','y','z']);
			assert('Expecting exactly two tokens here', vars.length == 3);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Should be of type Function', vt[0] == 'Function');
				});
			});
		}
	);
};
new function(){ testgroup = 'Called tokens';
	test('Any kind',
		'aaa();\nbbb().ccc;\nddd.eee();\nfff.ggg().hhh;\niii().jjj();\nkkk[x]();\nlll[x].mmm();\nnnn.ooo()[x];',
		function(zeon){
			var vars = zeon.btree.filter(function(t){ return t.value.length == 3; }); // all var names in input are 3 letters...
			assert('expecting aaa ~ ooo', vars.length == 15);
			vars.forEach(function(token){
				switch (token.value) {
					case 'aaa':
						assert('Token is called', token.tokenIsCalled);
						assert('Has called target token', token.calledTargetToken);
						assert('Called target token is itself', token.calledTargetToken == token);
						break;
					case 'bbb':
					case 'eee': // overflows, == same
					case 'ggg': // overflows, == same
					case 'mmm': // overflows, == same
					case 'ooo': // overflows, == same
						assert('Token is called', token.tokenIsCalled);
						reject('Has no called target token', token.calledTargetToken);
						break;
					case 'ccc':
					case 'fff': // overflows, == same
					case 'hhh': // overflows, == same
					case 'kkk': // overflows, == same
					case 'nnn': // overflows, == same
						reject('Token is not called', token.tokenIsCalled);
						reject('Has no called target token', token.calledTargetToken);
						break;
					case 'ddd':
						reject('Token is not called', token.tokenIsCalled);
						assert('Has called target token', token.calledTargetToken);
						assert('Called target token is eee property', token.calledTargetToken.value == 'eee');
						break;
					case 'iii':
						assert('Token is called', token.tokenIsCalled);
						assert('Has called target token', token.calledTargetToken);
						assert('Called target token is jjj property', token.calledTargetToken.value == 'jjj');
						break;
					case 'lll':
						reject('Token is not called', token.tokenIsCalled);
						assert('Has called target token', token.calledTargetToken);
						assert('Called target token is mmm property', token.calledTargetToken.value == 'mmm');
						break;
				}
			},this);
		}
	);
}
new function(){ testgroup = 'Warnings';

	var hasWarning = function(zeon, tokenValue, title, okBefore){
		var arr = get(zeon, tokenValue);
		assert('query has items', arr.length);
		arr.forEach(function(o,i){
			// okBefore default is undefined, so >= will return false in that case, causing the assert to be the default
			if (i >= okBefore) reject('has not '+(i||''), (o.warnings||[]).indexOf(title) >= 0);
			else assert('has '+(i||''), (o.warnings||[]).indexOf(title) >= 0);
		});
	};
	var noWarning = function(zeon, tokenValue, title, failBefore){
		var arr = get(zeon, tokenValue);
		assert('query has items', arr.length);
		arr.forEach(function(o,i){
			if (i >= failBefore) assert('has not '+(i||''), (o.warnings||[]).indexOf(title) >= 0);
			else reject('has '+(i||''), (o.warnings||[]).indexOf(title) >= 0);
		});
	};

	test('weak comparison',
		'5 == "string";',
		function(zeon){
			hasWarning(zeon, '==', 'weak comparison');
		}
	);
	test('weak comparison',
		'5 === "string";',
		function(zeon){
			noWarning(zeon, '===', 'weak comparison');
		}
	);
	test('typeof always string',
		'typeof 5 == "string";',
		function(zeon){
			noWarning(zeon, '==', 'typeof always string');
		}
	);
	test('typeof strong comparison',
		'typeof 5 === "string";',
		function(zeon){
			hasWarning(zeon, '===', 'typeof always string');
		}
	);
	test('missing block good',
		'if (x) y;',
		function(zeon){
			hasWarning(zeon, ')', 'missing block good');
		}
	);
	test('missing block bad',
		'if (x)\n\ty;',
		function(zeon){
			hasWarning(zeon, ')', 'missing block bad');
		}
	);
	test('assignment in header',
		'if (x=5) y;',
		function(zeon){
			hasWarning(zeon, '=', 'assignment in header');
		}
	);
	test('weak comparison',
		'foo == bar',
		function(zeon){
			hasWarning(zeon, '==', 'weak comparison');
		}
	);
	test('dangling underscore',
		'foo_;',
		function(zeon){
			hasWarning(zeon, 'foo_', 'dangling underscore');
		}
	);
	test('dot and not can be confusing',
		'var r = /foo./;\nvar s = /foo[^x]/;\nvar t = /foo[.]/;\nvar u = /fo\\^oo/;\nvar w = /foo[b^r]/;',
		function(zeon){
			hasWarning(zeon, function(t){ return t.name == 1/*regex*/; }, 'dot and not can be confusing', 3);
		}
	);
	test('inc dec operator',
		'a++;++b;--c;d--;',
		function(zeon){
			hasWarning(zeon, ['++','--'], 'inc dec operator');
		}
	);
	test('comma in group makes inc/dec fail',
		'++(a,b); --(c,d); (e,f)++; (g,h)--;',
		function(zeon){
			hasWarning(zeon, ['++', '--'], 'comma in group makes inc/dec fail');
		}
	);
	test('binary operator',
		'~a|b&c^d<<e>>>f>>g',
		function(zeon){
			hasWarning(zeon, ['~','|','&','^','<<','<<<','>>'], 'binary operator');
		}
	);
	test('use dot access',
		'x["foo"];',
		function(zeon){
			hasWarning(zeon, '[', 'use dot access');
		}
	);
	test('continue only in loops',
		'a;continue;b; while(x) continue;',
		function(zeon){
			hasWarning(zeon, 'continue', 'continue only in loops', 1);
		}
	);
	test('break needs loop or label',
		'a;break;b; while(x) break; foo: break foo;',
		function(zeon){
			hasWarning(zeon, 'break', 'break needs loop or label', 1);
		}
	);
	test('return only in function',
		'foo;return;bar;function f(){ return; }',
		function(zeon){
			hasWarning(zeon, 'return', 'return only in function', 1);
		}
	);
	test('trailing decimal',
		'5.;',
		function(zeon){
			hasWarning(zeon, '5.', 'trailing decimal');
		}
	);
	test('leading decimal',
		'.50;',
		function(zeon){
			hasWarning(zeon, '.50', 'leading decimal');
		}
	);
	test('regex confusion',
		'a /= b;',
		function(zeon){
			hasWarning(zeon, '/=', 'regex confusion');
		}
	);
	test('number dot',
		'3..foo; 3 .foo;',
		function(zeon){
			hasWarning(zeon, '.', 'number dot');
		}
	);
	test('assignment this',
		'this = 5;',
		function(zeon){
			hasWarning(zeon, '=', 'assignment this');
		}
	);
	test('bad string escapement',
		'"foo\\qbar";', // also add and test for proper escapements
		function(zeon){
			hasWarning(zeon, function(t){ return t.isString; }, 'bad string escapement');
		}
	);
	test('unlikely regex escapement',
		'/fo\\o/;',
		function(zeon){ // also add and test for proper escapements
			hasWarning(zeon, function(t){ return t.name == 1/*regex*/; }, 'unlikely regex escapement');
		}
	);
	test('avoid hex',
		'0xf00;500;',
		function(zeon){
			hasWarning(zeon, function(t){ return t.isNumber; }, 'avoid hex', 1);
		}
	);
	test('caller callee',
		'foo.caller; foo.callee;',
		function(zeon){
			hasWarning(zeon, ['caller', 'callee'], 'caller callee');
		}
	);
/*
	test('octal escape',
		'09900;',
		function(zeon){
			hasWarning(zeon, '09900', 'octal escape');
		}
	);
*/
/*
	test('00',
		'00;0000;0000900;9000;',
		function(zeon){
			zeon.btree.filter(function(o){ return o.isNumber; }).forEach(function(o,i){
				if (i < 3) assert('has '+i, (o.warnings||[]).indexOf('00') >= 0);
				else reject('has '+i, (o.warnings||[]).indexOf('0') >= 0);
			});
		}
	);
*/
	test('regexp call',
		'/foo/(bar);',
		function(zeon){
			hasWarning(zeon, '(', 'regexp call');
		}
	);
	test('confusing plusses',
		'a++ +b; c+ ++d; e+ +f; g++ + ++h;',
		function(zeon){
			get(zeon,['++', '+']).forEach(function(o,i){
				if (i == 1 || i == 3 || i == 5 || i == 7 || i == 8) assert('has '+i, (o.warnings||[]).indexOf('confusing plusses') >= 0);
				else reject('has not '+i, (o.warnings||[]).indexOf('confusing plusses') >= 0);
			});
		}
	);
	test('confusing minusses',
		'a-- -b; c- --c; e- -f; g-- - --h;',
		function(zeon){
			get(zeon,['--', '-']).forEach(function(o,i){
				if (i == 1 || i == 3 || i == 5 || i == 7 || i == 8) assert('has '+i, (o.warnings||[]).indexOf('confusing minusses') >= 0);
				else reject('has not '+i, (o.warnings||[]).indexOf('confusing minusses') >= 0);
			});
		}
	);
	/*
	test('double bang',
		'!!x',
		function(zeon){
			get(zeon,['!']).forEach(function(o,i){
				console.log(i, o)
				if (i > 0) assert('has '+i, (o.warnings||[]).indexOf('double bang') >= 0);
				else reject('has not '+i, (o.warnings||[]).indexOf('double bang') >= 0);
			});
		}
	);
	*/
	test('unsafe char',
		'"foo\u0001bar";/foo\u0604bar/;',
		function(zeon){
			hasWarning(zeon, function(t){ return t.value != ';'; }, 'unsafe char');
		}
	);
	test('control char',
		'"foo\u0001bar";/foo\u0001bar/;',
		function(zeon){
			hasWarning(zeon, function(t){ return t.value != ';'; }, 'control char');
		}
	);
	test('invalid unicode escape in string',
		'"foo\\ubar";"foo\\uabar";',
		function(zeon){
			hasWarning(zeon, function(t){ return t.value != ';'; }, 'invalid unicode escape in string');
		}
	);
	test('invalid unicode escape in regex',
		'/foo\\ubar/;/foo\\ubara/;',
		function(zeon){
			hasWarning(zeon, function(t){ return t.value != ';'; }, 'invalid unicode escape in regex');
		}
	);
	test('invalid hex escape in string',
		'"foo\\xbr";"foo\\xrally";',
		function(zeon){
			hasWarning(zeon, function(t){ return t.isString; }, 'invalid hex escape in string');
		}
	);
	test('invalid hex escape in regex',
		'/foo\\xbr/;/foo\\xrally/;',
		function(zeon){
			hasWarning(zeon,function(t){ return t.name == 1/*regex*/; }, 'invalid hex escape in regex');
		}
	);
	test('catch var assignment',
		'try { } catch (e) { e=5; }',
		function(zeon){
			hasWarning(zeon, '=', 'catch var assignment');
		}
	);
	test('bad constructor',
		'new String();',
		function(zeon){
			hasWarning(zeon, 'String', 'bad constructor');
		}
	);
	test('array constructor',
		'new Array(); new Array(5); new Array("5");',
		function(zeon){
			hasWarning(zeon, 'Array', 'array constructor');
		}
	);
	test('error constructor',
		'new Error();',
		function(zeon){
			hasWarning(zeon, 'Error', 'error constructor');
		}
	);
	test('very bad constructor',
		'new Math();',
		function(zeon){
			hasWarning(zeon, 'Math', 'very bad constructor');
		}
	);
	test('function is eval',
		'new Function();',
		function(zeon){
			hasWarning(zeon, 'Function', 'Function is eval');
		}
	);
	test('function wrapped',
		'var x = (function(){}); (function(){}); (function(){}());',
		function(zeon){
			hasWarning(zeon, function(t){ return t.isGroupStart; }, 'function wrapped', 2);
		}
	);
	test('document.write',
		'document.write("evil");',
		function(zeon){
			hasWarning(zeon, 'write', 'document.write');
		}
	);
	test('iteration function',
		'while(x) x=function(){ foo; }; for(var i=0; i<5; ++i) alert(function(){});', // todo: maybe add more than just this version?
		function(zeon){
			hasWarning(zeon, 'function', 'iteration function');
		}
	);
	test('empty block',
		'{}; if(x){};',
		function(zeon){
			hasWarning(zeon, '{', 'empty block');
		}
	);
	test('eval',
		'eval("devil");',
		function(zeon){
			hasWarning(zeon, 'eval', 'eval');
		}
	);
	test('extra comma',
		'[a,,b]; [a,,,b]; [a,,,];',
		function(zeon){
			var i = 0;
			hasWarning(zeon, function(o){ if (o.value == ',') ++i; return i==1 || i==3 || i==4 || i==6 || i==7; }, 'extra comma');
		}
	);
	test('double new',
		'new new Foo;',
		function(zeon){
			noWarning(zeon, 'new', 'double new', 1);
		}
	);
	test('double delete',
		'delete delete foo;',
		function(zeon){
			noWarning(zeon, 'delete', 'double delete', 1);
		}
	);
	test('undefined',
		'var x = undefined;',
		function(zeon){
			hasWarning(zeon, 'undefined', 'undefined');
		}
	);
	test('duplicate objlit prop',
		'x={a:1,a:1};',
		function(zeon){
			noWarning(zeon, 'a', 'duplicate objlit prop', 1);
		}
	);
	test('timer eval',
		'setTimeout("foo", 1); var x = "foo"; setTimeout(x, 1);',
		function(zeon){
			hasWarning(zeon, 'setTimeout', 'timer eval');
		}
	);
	test('group vars',
		'var a; var b;',
		function(zeon){
			noWarning(zeon, 'var', 'group vars', 1);
		}
	);
	test('func decl at top',
		'x; function f(){}',
		function(zeon){
			hasWarning(zeon, 'function', 'func decl at top');
		}
	);
	test('is label',
		'foo: bar;',
		function(zeon){
			hasWarning(zeon, 'foo', 'is label');
		}
	);
	test('math call',
		'Math();',
		function(zeon){
			hasWarning(zeon, '(', 'math call');
		}
	);
	test('new wants parens',
		'new Foo; new Bar();',
		function(zeon){
			hasWarning(zeon, 'new', 'new wants parens', 1);
		}
	);
	test('missing radix',
		'parseInt("foo"); parseInt("foo", 5);',
		function(zeon){
			hasWarning(zeon, 'parseInt', 'missing radix', 1);
		}
	);
	test('nested comment',
		'/* /* */\n// /*\n// */\n// /* */\n/* */',
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length);
			comments.some(function(t,i){ 
				if (i < 4) return reject('has not '+i, !t.warnings || t.warnings.indexOf('nested comment') < 0);
				return assert('has '+i, !t.warnings || t.warnings.indexOf('nested comment') < 0); 
			});
		}
	);
	test('new statement',
		'new Foo;',
		function(zeon){
			hasWarning(zeon, 'new', 'new statement');
		}
	);
	test('dont use __proto__',
		'foo.__proto__; __proto__ = 5;',
		function(zeon){
			hasWarning(zeon, '__proTo__', 'dont use __proto__');
		}
	);
	test('empty switch',
		'switch (e){}',
		function(zeon){
			hasWarning(zeon, 'switch', 'empty switch');
		}
	);
	test('quasi empty switch',
		'switch (x){ default: break; }',
		function(zeon){
			hasWarning(zeon, 'switch', 'quasi empty switch');
		}
	);
	test('empty clause',
		'switch(x){ case x: }',
		function(zeon){
			hasWarning(zeon, 'case', 'empty clause');
		}
	);
	test('clause should break',
		'switch(x){ case foo: alert(); case bar: fail; } switch(y){ default: foo; case x: bar; } switch(n){ case x: x; default: y; }',
		function(zeon){
			hasWarning(zeon, ['default','case'], 'clause should break');
		}
	);
	test('clause should break (2)',
		'function a() {\n\tswitch (x) {\n\t\tcase y:\n\t\t\tif (data) return;\n\t\t\telse break;\n\t\tcase y:\n\t\t\toops;\n\t\tcase z:\n\t\t\tnope;\n\n\t}\n}\n',
		function(zeon){
			noWarning(zeon, ['case'], 'clause should break', 1);
		}
	);
	test('switch is an if',
		'switch (x) { case foo: y; }',
		function(zeon){
			hasWarning(zeon, 'switch', 'switch is an if');
		}
	);
	test('unwrapped for-in (1)',
		'for (key in obj) alert(f);',
		function(zeon){
			hasWarning(zeon, 'for', 'unwrapped for-in');
		}
	);
	test('unwrapped for-in (2)',
		'for (x in y) { more; }',
		function(zeon){
			hasWarning(zeon, 'for', 'unwrapped for-in');
		}
	);
	test('unwrapped for-in (3)',
		'for (a in b) if (b.hasOwnProperty(a)) { stuff; }',
		function(zeon){
			noWarning(zeon, 'for', 'unwrapped for-in');
		}
	);
	test('unwrapped for-in (4)',
		'for (c in d) { if (b.hasOwnProperty(a)) stuff; fail; }',
		function(zeon){
			noWarning(zeon, 'for', 'unwrapped for-in');
		}
	);
	test('in out of for',
		'x in y;',
		function(zeon){
			hasWarning(zeon, 'in', 'in out of for');
		}
	);
	test('use {}',
		'new Object();',
		function(zeon){
			hasWarning(zeon, 'Object', 'use {}');
		}
	);
	test('use []',
		'new Array();',
		function(zeon){
			hasWarning(zeon, 'Array', 'use []');
		}
	);
	test('double block',
		'{{ i; think; }}',
		function(zeon){
			hasWarning(zeon, '{', 'double block', 1);
		}
	);
	test('useless block',
		'function f(){{}} {}',
		function(zeon){
			noWarning(zeon, '{', 'useless block', 1);
		}
	);
	test('use capital namespacing',
		'new foo; new Bar;',
		function(zeon){
			hasWarning(zeon, ['foo', 'Bar'], 'use capital namespacing', 1);
		}
	);
	test('constructor called as a function (1)',
		'function f(){} f.prototype = 5; f();',
		function(zeon){
			noWarning(zeon, 'f', 'constructor called as function', 2);
		}
	);
	test('constructor called as a function (2)',
		'function g(){}; new g;  g();',
		function(zeon){
			noWarning(zeon, 'g', 'constructor called as function', 2);
		}
	);
	test('cannot inc/dec on call expression',
		'++a(); --b(); c()++; d()--;',
		function(zeon){
			hasWarning(zeon, ['++','--'], 'cannot inc/dec on call expression');
		}
	);
	test('inc/dec only valid on vars',
		'++"foo"; --"foo"; "foo"++; "foo"--; ++5; --5; 5--; 5++; ++true; --true; true++; true--; ++false; --false; false++; false--; ++null; --null; null++; null--; ++/foo/; --/foo/; /foo/++; /foo/--;',
		function(zeon){
			hasWarning(zeon, ['++','--'], 'inc/dec only valid on vars');
		}
	);
	test('bad asi pattern',
		'x\n/* foo */(function(){}); a\n(b);',
		function(zeon){
			hasWarning(zeon, function(t){ return t.isCallExpressionStart; }, 'bad asi pattern');
		}
	);
	test('unlikely typeof result',
		'typeof x == "crap"; typeof x == "string"',
		function(zeon){
			hasWarning(zeon, function(t){ return t.isString; }, 'unlikely typeof result', 1);
		}
	);
	test('weird typeof op',
		'typeof x % "foo"; typeof x in y; typeof x == y;',
		function(zeon){
			hasWarning(zeon, ['%','in','=='], 'weird typeof op', 2);
		}
	);
	test('typeof always string',
		'typeof x === "string"; typeof x !== "string"; typeof x == "string";',
		function(zeon){
			hasWarning(zeon, ['===','!==','=='], 'typeof always string', 2);
		}
	);
	test('static expression',
		'5+5; 5-"5"; "x"=="y"; true%/t/; / / / / /; (2^1)-(3>>4);(5&8)*x;',
		function(zeon){
			hasWarning(zeon, ['+','-','==','%','/','*','&','^','>>'], 'static expression', 9);
		}
	);
	test('static condition',
		'if (5) y; if(5+5)y;',
		function(zeon){
			hasWarning(zeon, '(', 'static condition');
		}
	);
	test('pragma requires name parameter',
		'//#define\n//#ifdef\n', // tofix: others
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length);
			comments.some(function(t,i){
				return assert('has '+i, t.warnings && t.warnings.indexOf('pragma requires name parameter') >= 0); 
			});
		}
	);
	test('pragma requires value parameter',
		'//#macro foo ',
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length);
			comments.forEach(function(t,i){
				assert('has '+i, t.warnings && t.warnings.indexOf('pragma requires value parameter') >= 0); 
			});
		}
	);
	test('missing ifdef',
		'//#endif\n', // tofix: need to add way more
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length);
			comments.forEach(function(t,i){
				assert('has '+i, t.warnings && t.warnings.indexOf('missing ifdef') >= 0); 
			});
		}
	);
	test('missing inline',
		'//#endline',
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length);
			comments.forEach(function(t,i){
				assert('has '+i, t.warnings && t.warnings.indexOf('missing inline') >= 0); 
			});
		}
	);
	test('pragma start missing end',
		'//#ifdef foo\n//#inline foo',
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length == 2);
			comments.forEach(function(t,i){
				assert('has '+i, t.warnings && t.warnings.indexOf('pragma start missing end') >= 0);
			});
		}
	);
	test('macro name should be identifier',
		'//#macro fail-ing 4\n//#macro ok 6\n//#macro also.ok 7',
		function(zeon){
			// we must do it the hard way because we need to target wtree, not btree
			var comments = zeon.wtree.filter(function(t){ return t.isComment; });
			assert('has items', comments.length);
			comments.forEach(function(t,i){
				if (i == 0) assert('has '+i, t.warnings && t.warnings.indexOf('macro name should be identifier') >= 0);
				else reject('has not '+i, t.warnings && t.warnings.indexOf('macro name should be identifier') >= 0);
			});
		}
	);
	test('is dev relic',
		'foo; bar; baz; tmp; log; console; test; alert; temp;',
		function(zeon){
			hasWarning(zeon, function(t){ return t.name == 2/*identifier*/; }, 'is dev relic');
		}
	);
	test('multiple operators on same level',
		'5+5*5; 5*5+5; 5+5+5; (5+5)*5; 5+(5*5);',
		function(zeon){
			hasWarning(zeon, ['+','*'], 'multiple operators on same level', 6);
		}
	);
	test('useless multiple throw args',
		'throw foo,bar;',
		function(zeon){
			hasWarning(zeon, 'throw', 'useless multiple throw args');
		}
	);
	test('unnecessary parentheses',
		'typeof(x); throw(x); return(x); delete(x); new(x); void(x);',
		function(zeon){
			hasWarning(zeon, '(', 'unnecessary parentheses');
		}
	);
	test('uninitialized value in loop (1)',
		'var x; while (x) x = 5;',
		function(zeon){
			noWarning(zeon, 'x', 'uninitialized value in loop', 1);
		}
	);
	test('uninitialized value in loop (2)',
		'var y; for (;5;) alert(y);',
		function(zeon){
			noWarning(zeon, 'y', 'uninitialized value in loop', 1);
		}
	);
	test('uninitialized value in loop (3)',
		'var z; while (5) z();',
		function(zeon){
			noWarning(zeon, 'z', 'uninitialized value in loop');
		}
	);
	test('uninitialized value in loop (4)',
		'var a = 5; while (a) a = 5;',
		function(zeon){
			noWarning(zeon, 'a', 'uninitialized value in loop', 2);
		}
	);
	test('uninitialized value in loop (5)',
		'var b = 5; while (5) alert(b);',
		function(zeon){
			noWarning(zeon, '(', 'uninitialized value in loop', 1);
		}
	);
	test('uninitialized value in loop (6)',
		'var c = 5; while (5) c();',
		function(zeon){
			noWarning(zeon, 'c', 'uninitialized value in loop',1);
		}
	);
	test('jsdoc mismatch',
		'/** @param {number} foo **/function f(foo){ foo="str"; }',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('prop not declared on proto',
		'FIXME todo',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('trailing comma',
		'[a,];x={a:1,};',
		function(zeon){
			hasWarning(zeon, ',', 'trailing comma');
		}
	);
	test('asi',
		'foo\n{bar}baz',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('empty statement',
		';if(x);',
		function(zeon){
			hasWarning(zeon, ';', 'empty statement');
		}
	);
	test('premature usage',
		'x; var x;',
		function(zeon){
			hasWarning(zeon, ',', 'trailing comma');
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('unused',
		'var x;',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('dead code',
		'function f(){ x; return; y; } a: { b; break a; c; } for (x in y) { d; break; e; } for (x in y) { f; continue; g; } throw h; i;',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('useless parens',
		'(a); x = (t+z); (5 + 5) * 5;',
		function(zeon){
			hasWarning(zeon, '(', 'useless parens', 2);
		}
	);
	test('known implicit global',
		'window; document; foo; var x;',
		function(zeon){
			hasWarning(zeon, ['window','document','foo'], 'known implicit global');
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('unknown implicit global',
		'foo; bar; window; var x;',
		function(zeon){
			hasWarning(zeon, ['foo','bar'], 'unknown implicit global');
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('duplicate label',
		'foo: foo: bar; foo: { bar; foo: baz; }',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('label not found',
		'foo: break foo; bar: break fail;',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('silly delete construct',
		'TOFIX todo',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
	test('delete not a function',
		'delete(foo);',
		function(zeon){
			hasWarning(zeon, 'delete', 'delete not a function');
		}
	);
	test('weird delete operand',
		'var foo, bar; delete foo; function f(){ var x; delete bar; delete o.x; delete x; }',
		function(zeon){
			hasWarning(zeon, 'delete', 'weird delete operand', 3);
		}
	);
	test('cannot call/apply that',
		'"foo".call(); and more?',
		function(zeon){
			hasWarning(zeon, '"foo"', 'cannot call/apply that');
		}
	);
	test('func expr name is read-only',
		'var f = function g(){ g = 5; };',
		function(zeon){
			assert('has', (zeon.btree.filter(function(t){ return t.value == '==='; })[0].warnings||[]).indexOf('typeof always string') >= 0);
		}
	);
};
new function(){ testgroup = 'Function call assignment';
	test('Simple assignment',
		'function f(){ return 5; };\nvar x = f();\ny = f();',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether the two assignments caused types set to a number
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Var should be of type number', vt[0] == 'number');
				});
			});
		}
	);
	test('Complex assignment &&',
		'function f(){ return 5; };\nfunction g(){ return "foo"; };\nvar x = f() && g();\ny = f() && g();',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether the two assignments caused types set to a number and string
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly two types', vt.length == 2);
					assert('Var should be of type number', vt.indexOf('number') >= 0);
					assert('Var should be of type number', vt.indexOf('string') >= 0);
				});
			});
		}
	);
	test('Complex assignment ||',
		'function f(){ return 5; };\nfunction g(){ return "foo"; };\nvar x = f() || g();\ny = f() || g();',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether the two assignments caused types set to a number and string
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly two types', vt.length == 2);
					assert('Var should be of type number', vt.indexOf('number') >= 0);
					assert('Var should be of type number', vt.indexOf('string') >= 0);
				});
			});
		}
	);
	test('Complex assignment ?:',
		'function f(){ return 5; };\nfunction g(){ return "foo"; };\nvar x = foo ? f() : g();\ny = foo ? f() : g();',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether the two assignments caused types set to a number and string
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly two types', vt.length == 2);
					assert('Var should be of type number', vt.indexOf('number') >= 0);
					assert('Var should be of type number', vt.indexOf('string') >= 0);
				});
			});
		}
	);
	test('Complex assignment ()',
		'function f(){ return 5; };\nfunction g(){ return "foo"; };\nvar x = (f() || g());\ny = (f() || g());',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether the two assignments caused types set to a number and string
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly two types', vt.length == 2);
					assert('Var should be of type number', vt.indexOf('number') >= 0);
					assert('Var should be of type number', vt.indexOf('string') >= 0);
				});
			});
		}
	);
	test('Simple assignment multiple return values',
		'function f(){ if (true) return 5; return ""; };\nvar x = f();\ny = f();',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether assigning the function call with multiple return types is handled properly
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly two types', vt.length == 2);
					assert('Var should be of type number', vt.indexOf('number') >= 0);
					assert('Var should be of type number', vt.indexOf('string') >= 0);
				});
			});
		}
	);
	test('Complex assignment multiple return values',
		'function f(){ if (true) return 5; return ""; };\nvar x = f() || null;\ny = f() || null;',
		function(zeon){
			reject('A parse error', zeon.hasError);
			// basically we want to check whether assigning the function call with multiple return types is handled properly
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			assert('Expecting exactly two tokens here', vars.length == 2);
			// testing both regular variable assignment and variable declaration initialization
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly three types', vt.length == 3);
					assert('Var should be of type number', vt.indexOf('number') >= 0);
					assert('Var should be of type number', vt.indexOf('string') >= 0);
					assert('Var should be of type number', vt.indexOf('null') >= 0);
				});
			});
		}
	);
	test('Simple assignment method call',
		'o.f = function(){ return ""; };\nx = o.f(); var y = o.f();',
		function(zeon){
			reject('A parse error', zeon.hasError);
			var vars = zeon.btree.filter(function(t){ return t.value == 'x' || t.value == 'y'; });
			vars.forEach(function(v){
				assert('Should have var type array', v.varType);
				assert('Should have tracking object', v.trackingObject);
				assert('Should have tracking object vartype', v.trackingObject.varType);
				[v.varType, v.trackingObject.varType].forEach(function(vt){
					assert('Expecting exactly one type', vt.length == 1);
					assert('Var should be of type string', vt[0] == 'string');
				});
			});
		}
	);
	test('Inherited simple method call assignment',
		'Zeon.prototype = {\n\tearly: function(){ return \'wtf\'; },\n\ttest: function(){ return this.early(); },\n\tstuff: function(){ var x = this.test(); }\n};',
		function(zeon){
			reject('A parse error', zeon.hasError);
			var vars = zeon.btree.filter(function(t){ return t.value == 'x'; });
			var v = vars[0];
			assert('Should have var type array', v.varType);
			assert('Should have tracking object', v.trackingObject);
			assert('Should have tracking object vartype', v.trackingObject.varType);
			[v.varType, v.trackingObject.varType].forEach(function(vt){
				assert('Expecting exactly one type', vt.length == 1);
				assert('Var should be of type string', vt[0] == 'string');
			});
		}
	);
	test('Inherited complex method call (1)',
		'Zeon.prototype = {\n\tnum: function(){ return 5; },\n\tstrnum: function(){ return \'wtf\' || this.num(); }\n};',
		function(zeon){
			// check if second method returns two types...
			
		}
	);
	test('Inherited complex method call (2)',
		'Zeon.prototype = {\n\tnum: function(){ return 5; },\n\tstrnum: function(){ return \'wtf\' || this.num(); },\n\ttest: function(){ return this.strnum(); }\n};',
		function(zeon){
			// check if second method returns two types...
		}
	);
	test('Inherited complex function call assignment',
		'function num(){ return 5; }\nfunction strnum(){ return \'wtf\' || num(); }\nfunction test(){ return strnum(); }\nfunction stuff(){ var x = test(); }',
		function(zeon){
			// check if x has two types
			reject('A parse error', zeon.hasError);
			var vars = zeon.btree.filter(function(t){ return t.value == 'x'; });
			var v = vars[0];
			assert('Should have var type array', v.varType);
			assert('Should have tracking object', v.trackingObject);
			assert('Should have tracking object vartype', v.trackingObject.varType);
			[v.varType, v.trackingObject.varType].forEach(function(vt){
				assert('Expecting exactly two types', vt.length == 2);
				assert('Var should be of type string', vt.indexOf('string') >= 0);
				assert('Var should be of type number', vt.indexOf('number') >= 0);
			});
		}
	);
	test('Inherited complex method call assignment',
		'Zeon.prototype = {\n\tnum: function(){ return 5; },\n\tstrnum: function(){ return \'wtf\' || this.num(); },\n\ttest: function(){ return this.strnum(); },\n\tstuff: function(){ var x = this.test(); }\n};',
		function(zeon){
			// check if x has two types
			reject('A parse error', zeon.hasError);
			var vars = zeon.btree.filter(function(t){ return t.value == 'x'; });
			var v = vars[0];
			assert('Should have var type array', v.varType);
			assert('Should have tracking object', v.trackingObject);
			assert('Should have tracking object vartype', v.trackingObject.varType);
			[v.varType, v.trackingObject.varType].forEach(function(vt){
				assert('Expecting exactly two types', vt.length == 2);
				assert('Var should be of type string', vt.indexOf('string') >= 0);
				assert('Var should be of type number', vt.indexOf('number') >= 0);
			});
		}
	);
	test('Unable to determine type',
		'function x(){ return foo; }\ny = x();',
		function(zeon){
			// check if y has spanish question mark (\u00BF)
			reject('A parse error', zeon.hasError);
			var vars = zeon.btree.filter(function(t){ return t.value == 'y'; });
			var v = vars[0];
			assert('Should have var type array', v.varType);
			assert('Should have tracking object', v.trackingObject);
			assert('Should have tracking object vartype', v.trackingObject.varType);
			[v.varType, v.trackingObject.varType].forEach(function(vt){
				assert('Expecting exactly one type', vt.length == 1);
				assert('Var should be of type unknown', vt.indexOf('\u00BF') >= 0);
			});
		}
	);
};
new function(){ testgroup = 'Functional tests';
	test('getTypeRefs:expressions', 'a,b,c;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0]); assert('should return last expression (c)', r && r.length == 1 && r[0].value == 'c'); });
	test('getTypeRefs:expressions', 'a;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return that expression (a)', r && r.length == 1 && r[0].value == 'a'); });
	test('getTypeRefs:||', 'a||b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return a and b', r && r.length == 2 && r[0].value == 'a' && r[1].value == 'b'); });
	test('getTypeRefs:&&', 'a&&b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return a and b', r && r.length == 2 && r[0].value == 'a' && r[1].value == 'b'); });
	test('getTypeRefs:ternary', 'a?b:c;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return a and b', r && r.length == 2 && r[0].value == 'b' && r[1].value == 'c'); });
	test('getTypeRefs:()', '(a&&b);', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return a and b', r && r.length == 2 && r[0].value == 'a' && r[1].value == 'b'); });
	test('getTypeRefs:+', 'a+b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return string and number', r && r.length == 2 && r[0] == 'string' && r[1] == 'number'); });
	test('getTypeRefs:+=', 'x+=b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return string and number', r && r.length == 2 && r[0] == 'string' && r[1] == 'number'); });
	test('getTypeRefs:==', 'a==b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return boolean', r && r.length == 1 && r[0] == 'boolean'); });
	test('getTypeRefs:in', 'a in b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return boolean', r && r.length == 1 && r[0] == 'boolean'); });
	test('getTypeRefs:*', 'a * b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:%', 'a % b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:/', 'a / b;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:foo', 'fooo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return fooo', r && r.length == 1 && r[0].value == 'fooo'); });
	test('getTypeRefs:sub-expression:function', '(function(){ xxx; });', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return Function', r && r.length == 1 && r[0] == 'Function'); });
	test('getTypeRefs:sub-expression:++', 'fooo++;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:--', 'fooo--;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:[]', 'fooo[x];', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); reject('should return false', r); });
	test('getTypeRefs:sub-expression:[]', 'o.fooo[x];', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); reject('should return false', r); });
	test('getTypeRefs:sub-expression:new', 'new Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return Object', r && r.length == 1 && r[0] == 'Object'); });
	test('getTypeRefs:sub-expression:delete', 'delete Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return boolean', r && r.length == 1 && r[0] == 'boolean'); });
	test('getTypeRefs:sub-expression:!', '! Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return boolean', r && r.length == 1 && r[0] == 'boolean'); });
	test('getTypeRefs:sub-expression:typeof', 'typeof Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return string', r && r.length == 1 && r[0] == 'string'); });
	test('getTypeRefs:sub-expression:++', '++ Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:--', '-- Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:~', '~ Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:+', '+ Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:-', '- Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return number', r && r.length == 1 && r[0] == 'number'); });
	test('getTypeRefs:sub-expression:void', 'void Foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return undefined', r && r.length == 1 && r[0] == 'undefined'); });
	test('getTypeRefs:sub-expression:func calls', 'foo();', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return foo', r && r.length == 1 && r[0].value == 'foo'); });
	test('getTypeRefs:sub-expression:method calls', 'o.foo();', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return foo', r && r.length == 1 && r[0].value == 'foo'); });
	test('getTypeRefs:sub-expression:prop', 'o.foo;', function(zeon){ var r = zeon.getTypeRefs(zeon.tree[0][0][0][0]); assert('should return foo', r && r.length == 1 && r[0].value == 'foo'); });
};
new function(){ testgroup = 'Types';
	test('Property is Array[string]',
		'var arr = {arr:[]}; 	arr.arr[1] = "meh";',
		function(zeon){
			console.log("implement me"); // arr.arr should be of type Array[string]
		}
	);
};
new function(){ testgroup = 'General systems';
	test('label breaking',
		'\ttarget: break target;\n\t\n\tlabel: break fail;\n\t\n\tpas: {\n\t\tfaux;\n\t\tbreak pas;\n\t}\n\t\n\tbreak target;\n',
		function(zeon){ throw 'fixme'; }
	)
};

new function(){ testgroup = 'Error cases';
	// in general, these tests should make sure that regardless of parse errors, the handling and output should still be proper and consistent
	
	test('bogus switch body',
		'switch (x){ dsasadsadsadsadsa }', // used to hide the body identifier in an error, and it shouldnt.
		function(zeon){
			reject('tofix', true);
		}
	
	);
};
