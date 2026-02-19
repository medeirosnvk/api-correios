const correiosService = require('../services/correios.service');

const REGEX_CODIGO = /^[A-Z]{2}\d{9}[A-Z]{2}$/i;

/**
 * GET /api/rastreamento/:codigo
 * Rastreia um objeto pelo código
 */
async function rastrear(req, res, next) {
  try {
    const { codigo } = req.params;

    if (!codigo || !REGEX_CODIGO.test(codigo.toUpperCase())) {
      return res.status(400).json({
        error: 'Código de rastreamento inválido.',
        detalhe: 'O código deve ter o formato: 2 letras + 9 números + 2 letras (ex: AA123456789BR)',
      });
    }

    const codigoUpper = codigo.toUpperCase();
    const apiResponse = await correiosService.rastrearObjetos([codigoUpper]);
    const resultado = correiosService.normalizarRastreamento(apiResponse);

    if (!resultado) {
      return res.status(404).json({
        error: 'Objeto não encontrado.',
        detalhe: 'Verifique o código de rastreamento e tente novamente.',
      });
    }

    return res.json(resultado);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/rastreamento/lote
 * Rastreia múltiplos objetos (até 10)
 */
async function rastrearLote(req, res, next) {
  try {
    const { codigos } = req.body;

    if (!Array.isArray(codigos) || codigos.length === 0) {
      return res.status(400).json({
        error: 'Informe um array de códigos no body: { "codigos": ["AA123456789BR"] }',
      });
    }

    if (codigos.length > 10) {
      return res.status(400).json({
        error: 'Máximo de 10 códigos por requisição.',
      });
    }

    const invalidos = codigos.filter((c) => !REGEX_CODIGO.test(c?.toUpperCase?.()));
    if (invalidos.length > 0) {
      return res.status(400).json({
        error: 'Códigos inválidos encontrados.',
        codigos: invalidos,
      });
    }

    const codigosUpper = codigos.map((c) => c.toUpperCase());
    const apiResponse = await correiosService.rastrearObjetos(codigosUpper);

    const resultados = (apiResponse.objetos || []).map((obj) =>
      correiosService.normalizarRastreamento({ objetos: [obj] })
    );

    return res.json({ resultados });
  } catch (error) {
    next(error);
  }
}

module.exports = { rastrear, rastrearLote };
