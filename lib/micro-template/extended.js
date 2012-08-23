var template = require('../micro-template').template;

function extended (id, data) {
	data.include = function (name) {
		template.context.ret += template(name, template.context.stash);
	};

	data.wrapper = function (name, fun) {
		var current = template.context.ret;
		template.context.ret = '';
		fun.apply(template.context);
		var content = template.context.ret;
		template.context.ret = current + template(name, { content : content });
	};

	return data ? template(id, data): function (data) { return template(id, data) };
}
template.get = function (id) { return (extended.get || template.get)(id) };

this.template = extended;
