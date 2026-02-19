const { AxiosError } = require('axios');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  console.error(
    `[Erro] ${req.method} ${req.path}:`,
    err.message,
    err.response?.status ? `(HTTP ${err.response.status})` : ''
  );

  if (err instanceof AxiosError) {
    const status = err.response?.status || 502;

    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'RAPIDAPI_KEY inválida ou sem permissão. Verifique a chave no .env.',
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: 'Limite de requisições da API atingido. Tente novamente mais tarde.',
      });
    }

    if (status === 404) {
      return res.status(404).json({
        error: 'Objeto não encontrado.',
      });
    }

    return res.status(502).json({
      error: 'Erro ao comunicar com o serviço de rastreamento.',
      detalhe: err.response?.data?.message || err.message,
    });
  }

  if (err.message && err.message.includes('RAPIDAPI_KEY')) {
    return res.status(503).json({ error: err.message });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor.',
    ...(process.env.NODE_ENV !== 'production' && { detalhe: err.message }),
  });
}

module.exports = errorHandler;
