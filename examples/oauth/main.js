import * as decentauth from '../../index.js';
import { argv } from 'node:process';
import { serve } from '@anderspitman/fetch-handler';


const port = 3000;
const authPrefix = '/auth';

const authServer = new decentauth.Server({
  config: {
    admin_id: "admin@example.com",
    path_prefix: authPrefix,
    behind_proxy: true,
    login_methods: [
      {
        type: decentauth.LOGIN_METHOD_OIDC,
        name: "LastLogin",
        uri: "https://lastlogin.net",
      },
      {
        type: decentauth.LOGIN_METHOD_ADMIN_CODE,
      },
    ],
  },
});

serve({
  port,
  handler: async (req) => {

    const url = new URL(req.url);
    console.log(url);

    if (url.pathname === `${authPrefix}/oauth/authorize`) {

      const html = `
        <h1>OAuth2 Authorize</h1>

        <form method='POST' action='${authPrefix}/oauth/approve${url.search}'>
          <select name='custom_perm'>
           <option value='perm1'>Perm 1</option>
           <option value='perm2'>Perm 2</option>
           <option value='perm3'>Perm 3</option>
          </select>

          <button>Approve</button>
          <button formaction='/oauth/denied'>Deny</button>
        </form>
      `;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    else if (url.pathname.startsWith(authPrefix)) {
      return authServer.handle(req);
    }
    else {
      const session = await authServer.getSession(req);
      if (!session) {
        return authServer.handle(req);
      }

      console.log(session);

      return new Response(`<a href='${authPrefix}/logout'>Logout</a>`, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
  },
});
