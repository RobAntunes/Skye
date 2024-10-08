import { type Context } from '../server.ts';
import { renderTemplate } from '../templates/render.ts'; // Adjust the import as needed
import { reactive } from '../services/reactive.ts';
import type { SkyeServer } from "../classes/SkyeServer.ts";

export default function (server: SkyeServer) {
  server.route('GET', '/welcome', async (ctx: Context) => {
    const data = reactive({ title: 'Welcome to Skye Framework', user: { isLoggedIn: true, name: 'Alice' } });
    const templatePath = './templates/welcome.html';

    const renderedContent = await renderTemplate(templatePath, data);

    ctx.response.headers.set('Content-Type', 'text/html');
    ctx.response.body = renderedContent;
  });
}