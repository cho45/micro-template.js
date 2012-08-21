window.onload = function () {
	var t = template('tmpl1');
	console.log(t({
		isFoo : !!1,
		foobar : 'foo<b>ar',
		foobaz : 'foo<b>az',
		html : '<b>html</b>'
	}));
	console.log(t({
		isFoo : !!0,
		foobar : 'foo<b>ar',
		foobaz : 'foo<b>az',
		html : '<b>html</b>'
	}));
	console.log(t({
	}));
};
