import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_HISTORICO = '@correios:historico';
const MAX_HISTORICO = 20;

export interface ItemHistorico {
  codigo: string;
  descricao: string;
  ultimoStatus: string;
  consultadoEm: string;
  isImportacao: boolean;
}

export async function salvarNoHistorico(item: ItemHistorico): Promise<void> {
  try {
    const historico = await obterHistorico();
    const filtrado = historico.filter((h) => h.codigo !== item.codigo);
    const atualizado = [item, ...filtrado].slice(0, MAX_HISTORICO);
    await AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify(atualizado));
  } catch {
    // Falha silenciosa para não impactar UX
  }
}

export async function obterHistorico(): Promise<ItemHistorico[]> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_HISTORICO);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function removerDoHistorico(codigo: string): Promise<void> {
  try {
    const historico = await obterHistorico();
    const atualizado = historico.filter((h) => h.codigo !== codigo);
    await AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify(atualizado));
  } catch {
    // Falha silenciosa
  }
}

export async function limparHistorico(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_HISTORICO);
  } catch {
    // Falha silenciosa
  }
}
