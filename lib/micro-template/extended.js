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
		var orig_content = template.context.stash.content;
		template.context.stash.content = content;
		template.context.ret = current + template(name, template.context.stash);
		template.context.stash.content = orig_content;
	};

	return data ? template(id, data): function (data) { return template(id, data) };
}
template.get = function (id) { return (extended.get || template.get)(id) };

this.template = extended;
