/**
 * Formata uma data ISO 8601 para exibição amigável em pt-BR
 * Ex: "2024-01-15T14:30:00" → "15/01/2024 às 14:30"
 */
export function formatarData(dataIso: string): string {
  if (!dataIso) return '';

  try {
    const data = new Date(dataIso);

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  } catch {
    return dataIso;
  }
}

/**
 * Formata somente a data (sem hora)
 */
export function formatarSomenteData(dataIso: string): string {
  if (!dataIso) return '';

  try {
    const data = new Date(dataIso);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch {
    return dataIso;
  }
}

/**
 * Retorna tempo relativo: "há 2 dias", "há 5 horas", etc.
 */
export function tempoRelativo(dataIso: string): string {
  if (!dataIso) return '';

  try {
    const agora = Date.now();
    const data = new Date(dataIso).getTime();
    const diffMs = agora - data;

    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMs / 3600000);
    const dias = Math.floor(diffMs / 86400000);

    if (minutos < 1) return 'agora há pouco';
    if (minutos < 60) return `há ${minutos} min`;
    if (horas < 24) return `há ${horas}h`;
    if (dias === 1) return 'ontem';
    return `há ${dias} dias`;
  } catch {
    return '';
  }
}
