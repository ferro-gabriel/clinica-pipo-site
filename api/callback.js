// Segunda etapa do login: o GitHub volta pra cá com um "code". Trocamos esse
// code por um token de acesso e devolvemos pro painel (/admin) via postMessage,
// seguindo o protocolo que o Decap CMS espera do backend "github".
module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const code = req.query.code;

  if (!clientId || !clientSecret) {
    res.status(500).send('OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET não configurados nas variáveis de ambiente do Vercel.');
    return;
  }
  if (!code) {
    res.status(400).send('Código de autorização ausente.');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      res.status(400).send(renderPopup('error', tokenData.error_description || 'Falha ao autenticar com o GitHub.'));
      return;
    }

    res.status(200).send(renderPopup('success', JSON.stringify({ token: tokenData.access_token, provider: 'github' })));
  } catch (err) {
    res.status(500).send(renderPopup('error', 'Erro inesperado ao autenticar.'));
  }
};

function renderPopup(status, content) {
  const safeContent = content.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `<!doctype html>
<html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:${status}:${safeContent}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;
}
