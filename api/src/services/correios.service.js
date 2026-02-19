const axios = require('axios');
const config = require('../config');

/**
 * Rastreia um objeto pelo código usando a API PacoteVício (via RapidAPI)
 * Documentação: https://rapidapi.com/pacotevicio-pacotevicio-default/api/correios-rastreamento-de-encomendas
 * @param {string[]} codigos - Array com os códigos de rastreamento
 * @returns {Promise<Object>} - Resposta no formato { objetos: [...] }
 */
async function rastrearObjetos(codigos) {
  const { rapidApiKey, rapidApiHost, baseUrl } = config.pacoteVicio;

  if (!rapidApiKey) {
    throw new Error(
      'RAPIDAPI_KEY não configurada. Cadastre-se em rapidapi.com e adicione a chave no .env'
    );
  }

  // PacoteVício aceita apenas um código por vez; fazemos as chamadas em paralelo
  const requisicoes = codigos.map((codigo) =>
    axios.get(`${baseUrl}/correios`, {
      params: { tracking_code: codigo },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
      },
      timeout: 20000,
    })
  );

  const respostas = await Promise.all(requisicoes);

  // Retorna no mesmo formato que o serviço original esperava: { objetos: [...] }
  return {
    objetos: respostas.map((r) => r.data),
  };
}

/**
 * Normaliza a resposta da API para o formato interno da aplicação.
 * O PacoteVício retorna os dados no mesmo schema do SRO dos Correios.
 * @param {Object} apiResponse - { objetos: [ { codObjeto, tipoPostal, eventos, ... } ] }
 * @returns {Object|null}
 */
function normalizarRastreamento(apiResponse) {
  if (!apiResponse || !apiResponse.objetos || !apiResponse.objetos.length) {
    return null;
  }

  const objeto = apiResponse.objetos[0];

  if (!objeto.eventos || !objeto.eventos.length) {
    return {
      codigo: objeto.codObjeto,
      tipo: objeto.tipoPostal?.categoria || 'Desconhecido',
      descricao: objeto.tipoPostal?.descricao || '',
      ultimoStatus: 'Sem eventos registrados',
      entregue: false,
      prazoEntrega: null,
      eventos: [],
      isImportacao: isCodigoImportacao(objeto.codObjeto),
    };
  }

  const eventos = objeto.eventos.map((evento) => ({
    data: normalizarData(evento.dtHrCriado),
    status: evento.descricao,
    detalhe: evento.detalhe || evento.descricaoFrontEnd || '',
    local: formatarLocal(evento),
    codigo: evento.codigo,
    tipo: evento.tipo,
  }));

  return {
    codigo: objeto.codObjeto,
    tipo: objeto.tipoPostal?.categoria || 'Desconhecido',
    descricao: objeto.tipoPostal?.descricao || '',
    ultimoStatus: eventos[0]?.status || '',
    entregue: isEntregue(objeto.eventos[0]),
    prazoEntrega: normalizarDtPrevista(objeto.dtPrevista || objeto.prazoEntrega),
    eventos,
    isImportacao: isCodigoImportacao(objeto.codObjeto),
  };
}

/**
 * PacoteVício retorna dtHrCriado como objeto PHP:
 * { date: "2026-02-19 11:22:32.000000", timezone_type: 3, timezone: "America/Sao_Paulo" }
 * Converte para string ISO compatível com new Date(): "2026-02-19T11:22:32"
 */
function normalizarData(dtHrCriado) {
  if (!dtHrCriado) return '';
  if (typeof dtHrCriado === 'object' && dtHrCriado.date) {
    return dtHrCriado.date.replace(' ', 'T').replace(/\.\d+$/, '');
  }
  return String(dtHrCriado);
}

/**
 * PacoteVício retorna dtPrevista no formato "DD/MM/YYYY".
 * Converte para "YYYY-MM-DD" que new Date() parseia corretamente.
 */
function normalizarDtPrevista(dtPrevista) {
  if (!dtPrevista) return null;
  const match = String(dtPrevista).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return dtPrevista;
}

function formatarLocal(evento) {
  const partes = [];
  if (evento.unidade?.endereco) {
    const { cidade, uf, pais } = evento.unidade.endereco;
    if (cidade) partes.push(cidade);
    if (uf) partes.push(uf);
    if (pais && pais !== 'Brasil') partes.push(pais);
  }
  return partes.join(' / ') || 'Não informado';
}

function isEntregue(ultimoEvento) {
  if (!ultimoEvento) return false;
  const codigosEntrega = ['BDE', 'BDI', 'BDR'];
  return codigosEntrega.includes(ultimoEvento.tipo);
}

/**
 * Código internacional: 2 letras + 9 dígitos + 2 letras, não terminando em BR
 */
function isCodigoImportacao(codigo) {
  if (!codigo) return false;
  const match = codigo.match(/^[A-Z]{2}\d{9}[A-Z]{2}$/);
  if (!match) return false;
  return codigo.slice(-2) !== 'BR';
}

module.exports = {
  rastrearObjetos,
  normalizarRastreamento,
};
