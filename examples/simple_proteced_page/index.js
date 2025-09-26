import * as decentauth from '../../index.js';
import { serve } from '@anderspitman/fetch-handler';


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

const handler = async (req) => {
  const url = new URL(req.url);

  console.log(url);

  const host = req.headers.get('X-Forwarded-Host');
  const proto = req.headers.get('X-Forwarded-Proto');

  if (url.pathname.startsWith(authPrefix)) {
    return authServer.handle(req);
  }

  const session = await authServer.getSession(req);

  if (!session) {
    const returnTarget = encodeURIComponent(`${url.pathname}${url.search}`);
    const redirUrl = `${proto}://${host}${authPrefix}?return_target=${returnTarget}`;
    console.log(redirUrl);
    return Response.redirect(redirUrl);
  }

  return new Response('<h1>Secret page</h1>',{
    headers: {
      'Content-Type': 'text/html',
    },
  });
};

serve({ handler, port: 3000 });
