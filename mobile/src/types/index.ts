export interface Evento {
  data: string;
  status: string;
  detalhe: string;
  local: string;
  codigo: string;
  tipo: string;
}

export interface Rastreamento {
  codigo: string;
  tipo: string;
  descricao: string;
  ultimoStatus: string;
  entregue: boolean;
  prazoEntrega: string | null;
  eventos: Evento[];
  isImportacao: boolean;
}

export interface RastreamentoState {
  dados: Rastreamento | null;
  loading: boolean;
  erro: string | null;
}

export type RootStackParamList = {
  Home: undefined;
  Rastreamento: { codigo: string };
  Historico: undefined;
};
