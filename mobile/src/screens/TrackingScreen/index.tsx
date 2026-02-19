import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { EventCard } from '../../components/EventCard';
import { StatusBadge } from '../../components/StatusBadge';
import { rastrearEncomenda } from '../../services/api';
import { Rastreamento, RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { formatarSomenteData } from '../../utils/formatDate';

type RoutePropType = RouteProp<RootStackParamList, 'Rastreamento'>;

export function TrackingScreen() {
  const route = useRoute<RoutePropType>();
  const { codigo } = route.params;

  const [dados, setDados] = useState<Rastreamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setErro('');

    try {
      const resultado = await rastrearEncomenda(codigo);
      setDados(resultado);
    } catch (error: any) {
      setErro(error.message || 'Não foi possível rastrear a encomenda.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [codigo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleCompartilhar() {
    if (!dados) return;

    try {
      await Share.share({
        message:
          `📦 Rastreamento: ${dados.codigo}\n` +
          `Status: ${dados.ultimoStatus}\n` +
          `\nConsulte em: https://rastreamento.correios.com.br/app/index.php`,
        title: `Rastreamento ${dados.codigo}`,
      });
    } catch {
      // Cancelado pelo usuário
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centralizador}>
        <ActivityIndicator size="large" color={colors.azulCorreios} />
        <Text style={styles.textoCarregando}>Consultando Correios...</Text>
      </SafeAreaView>
    );
  }

  if (erro) {
    return (
      <SafeAreaView style={styles.centralizador}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.erro} />
        <Text style={styles.textoErro}>{erro}</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={() => carregar()}>
          <Text style={styles.textoBotaoTentar}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!dados) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregar(true)}
            colors={[colors.azulCorreios]}
            tintColor={colors.azulCorreios}
          />
        }
      >
        {/* Card de resumo */}
        <View style={styles.cardResumo}>
          <View style={styles.resumoHeader}>
            <View style={styles.resumoInfo}>
              <Text style={styles.codigoLabel}>Código de rastreamento</Text>
              <Text style={styles.codigo}>{dados.codigo}</Text>
              {dados.descricao ? (
                <Text style={styles.tipo}>{dados.descricao}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={handleCompartilhar} style={styles.botaoCompartilhar}>
              <Ionicons name="share-outline" size={22} color={colors.azulCorreios} />
            </TouchableOpacity>
          </View>

          <StatusBadge entregue={dados.entregue} isImportacao={dados.isImportacao} />

          {dados.prazoEntrega && (
            <View style={styles.prazo}>
              <Ionicons name="calendar-outline" size={14} color={colors.cinza} />
              <Text style={styles.prazotexto}>
                Prazo previsto: <Text style={styles.prazoData}>{formatarSomenteData(dados.prazoEntrega)}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Linha do tempo */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>
            Histórico de movimentação
            <Text style={styles.contagem}> ({dados.eventos.length})</Text>
          </Text>

          {dados.eventos.length === 0 ? (
            <View style={styles.semEventos}>
              <Ionicons name="time-outline" size={40} color={colors.cinzaClaro} />
              <Text style={styles.semEventosTexto}>
                Nenhuma movimentação registrada ainda.{'\n'}
                Verifique novamente em algumas horas.
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {dados.eventos.map((evento, index) => (
                <EventCard
                  key={`${evento.codigo}-${index}`}
                  evento={evento}
                  isPrimeiro={index === 0}
                  isUltimo={index === dados.eventos.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.fundo,
  },
  scroll: {
    flex: 1,
  },
  conteudo: {
    padding: 16,
    gap: 16,
  },
  centralizador: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.fundo,
  },
  textoCarregando: {
    fontSize: 15,
    color: colors.cinza,
  },
  textoErro: {
    fontSize: 15,
    color: colors.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
  },
  botaoTentar: {
    backgroundColor: colors.azulCorreios,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  textoBotaoTentar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  cardResumo: {
    backgroundColor: colors.fundoCard,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resumoInfo: {
    flex: 1,
    gap: 2,
  },
  codigoLabel: {
    fontSize: 12,
    color: colors.cinza,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codigo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textoPrimario,
    letterSpacing: 2,
  },
  tipo: {
    fontSize: 13,
    color: colors.textoSecundario,
  },
  botaoCompartilhar: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.fundo,
  },
  prazo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prazotexto: {
    fontSize: 13,
    color: colors.cinza,
  },
  prazoData: {
    fontWeight: '700',
    color: colors.textoSecundario,
  },
  secao: {
    gap: 12,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textoPrimario,
  },
  contagem: {
    fontWeight: '400',
    color: colors.cinza,
    fontSize: 14,
  },
  timeline: {
    backgroundColor: colors.fundoCard,
    borderRadius: 16,
    padding: 16,
    gap: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  semEventos: {
    alignItems: 'center',
    backgroundColor: colors.fundoCard,
    borderRadius: 16,
    padding: 32,
    gap: 12,
  },
  semEventosTexto: {
    fontSize: 14,
    color: colors.cinza,
    textAlign: 'center',
    lineHeight: 21,
  },
});
