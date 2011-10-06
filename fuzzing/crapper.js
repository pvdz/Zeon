var crapFuzzer = function(){
	var set = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'var',
		'if',
		'else',
		'while',
		'return',
		'break',
		'continue',
		'throw',
		'do',
		'for',
		'switch',
		'case',
		'default',
		'try',
		'catch',
		'finally',
		'function',
		'true','false',
		'null','undefined',
		'void',
		'0x',
		'0','1','2','3','4','5','6','7','8','9',
		'.','[',']','{','}','(',')','+','-','*','/','&','^','%','$','!','~','in','instanceof','delete','new','void'
	];
	

	var s = 'function x(';
	if (Math.random()<0.5) s += 'h';
	var n = ~~(Math.random()*5);
	while (n--) s += ','+set[n];
	s += '){';
	
	var next;
	while (!next || s.length+next.length < 139) {
		if (next) s += next+' ';
		next = set[~~(Math.random()*set.length)];
	}
	s += '}';
	return s;
};
//var timer = setInterval(function(){ if (gui.zeon.hasError) gui.setValue(rnd()); }, 20);
