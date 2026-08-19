// Primeira etapa do login do painel (/admin): manda o navegador para a tela
// de autorização do GitHub. Depois disso o GitHub redireciona para /api/callback.
module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('OAUTH_CLIENT_ID não configurado nas variáveis de ambiente do Vercel.');
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${host}/api/callback`;
  const state = Math.random().toString(36).slice(2);

  const url =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent('repo,user')}` +
    `&state=${state}`;

  res.writeHead(302, { Location: url });
  res.end();
};
