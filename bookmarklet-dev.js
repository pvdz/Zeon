new function(){
	var files = [
		'Tokenizer.js',
		'ZeParser.js',
		'Zeon.js',
		'Ast.js',
		'Gui.js',
		'Gui.Nav.js',
		'Gui.Config.js'
	];
	var current = 0;

	function next(){
		console.log("step "+(current+1)+"/"+files.length, files[current]);
		var s = document.createElement("script");
		s.src = "http://dl.dropbox.com/u/5060151/ztest/"+files[current], document.body.appendChild(s);
		s.onload = function(){
			++current;
			if (current == files.length) {
				console.log("done, starting zeon nao...");
				Gui.start();
			} else {
				next();
			}
		};
		document.body.appendChild(s);
	}
	next();
};

// new function(){function c(){console.log("step "+(b+1)+"/"+a.length,a[b]);var d=document.createElement("script");d.src="http://dl.dropbox.com/u/5060151/ztest/"+a[b],document.body.appendChild(d),d.onload=function(){++b,b==a.length?(console.log("done, starting zeon nao..."),Gui.start()):c()},document.body.appendChild(d)}var a=["Tokenizer.js","ZeParser.js","Zeon.js","Ast.js","Gui.js","Gui.Nav.js","Gui.Config.js"],b=0;c()}
