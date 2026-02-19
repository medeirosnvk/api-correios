import { Rastreamento } from '../types';

// Em produção, substitua pelo IP/host real do seu servidor.
// Para testar em dispositivo físico, use o IP da máquina na rede local: http://192.168.x.x:3000/api
const BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api-correios-jaxd.onrender.com/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    const json = await response.json();

    if (!response.ok) {
      const mensagem = json?.error || json?.detalhe || `Erro ${response.status}`;
      throw new Error(mensagem);
    }

    return json as T;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('A requisição demorou demais. Verifique sua conexão.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function rastrearEncomenda(codigo: string): Promise<Rastreamento> {
  return request<Rastreamento>(`/rastreamento/${codigo}`);
}

export async function rastrearLote(codigos: string[]): Promise<Rastreamento[]> {
  const data = await request<{ resultados: Rastreamento[] }>(
    '/rastreamento/lote',
    {
      method: 'POST',
      body: JSON.stringify({ codigos }),
    }
  );
  return data.resultados;
}
