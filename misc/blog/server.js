import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { template } from '../../lib/micro-template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, 'posts');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');

function getPosts() {
	if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR);
	return fs.readdirSync(POSTS_DIR)
		.filter(f => f.endsWith('.json'))
		.map(f => {
			const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8'));
			post.id = path.basename(f, '.json');
			return post;
		})
		.sort((a, b) => b.datetime.localeCompare(a.datetime));
}

function getPost(id) {
	const file = path.join(POSTS_DIR, id + '.json');
	if (!fs.existsSync(file)) return null;
	const post = JSON.parse(fs.readFileSync(file, 'utf-8'));
	post.id = id;
	return post;
}

function savePost(title, body) {
	const date = new Date().toISOString().slice(0, 10);
	const datetime = new Date().toISOString();
	const id = `${date}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const post = { title, body, datetime };
	fs.writeFileSync(path.join(POSTS_DIR, id + '.json'), JSON.stringify(post, null, 2));
	return id;
}

function parseBody(req) {
	return new Promise((resolve) => {
		let data = '';
		req.on('data', chunk => { data += chunk; });
		req.on('end', () => {
			const params = {};
			data.split('&').forEach(pair => {
				const [k, v] = pair.split('=');
				if (k) params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
			});
			resolve(params);
		});
	});
}

const templateSource = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

const router = {
	_routes: [],
	add(method, path, handler) {
		this._routes.push({ method, path, handler });
	},
	match(req) {
		const url = new URL(req.url, 'http://localhost');
		for (const r of this._routes) {
			if (r.method !== req.method) continue;
			if (typeof r.path === 'string' && r.path === url.pathname) {
				return { handler: r.handler, params: {} };
			}
			if (r.path instanceof RegExp) {
				const m = url.pathname.match(r.path);
				if (m) {
					return { handler: r.handler, params: m.groups || m.slice(1) };
				}
			}
		}
		return null;
	}
};

router.add('GET', '/', (req, res) => {
	const posts = getPosts();
	const html = template(templateSource, { page: 'index', pageTitle: 'Simple Blog', posts });
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end(html);
});

router.add('GET', '/new', (req, res) => {
	const html = template(templateSource, { page: 'new', pageTitle: 'New Post' });
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end(html);
});

router.add('POST', '/create', async (req, res) => {
	const params = await parseBody(req);
	if (params.title && params.body) {
		const id = savePost(params.title, params.body);
		res.writeHead(302, { Location: '/post/' + id });
		res.end();
	} else {
		res.writeHead(400);
		res.end('Missing title or body');
	}
});

router.add('GET', /^\/post\/(.+)$/, (req, res, params) => {
	const id = Array.isArray(params) ? params[0] : params.id;
	const post = getPost(id);
	if (post) {
		const html = template(templateSource, { page: 'post', pageTitle: post.title, post });
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(html);
	} else {
		const html = template(templateSource, { page: 'notfound', pageTitle: 'Not Found' });
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end(html);
	}
});

const server = http.createServer(async (req, res) => {
	const match = router.match(req);
	if (match) {
		await match.handler(req, res, match.params);
	} else {
		const html = template(templateSource, { page: 'notfound', pageTitle: 'Not Found' });
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.end(html);
	}
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log('Blog server running at http://localhost:' + PORT);
});
