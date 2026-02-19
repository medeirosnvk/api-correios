import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { TrackingInput } from '../../components/TrackingInput';
import { rastrearEncomenda } from '../../services/api';
import { salvarNoHistorico, obterHistorico, ItemHistorico } from '../../utils/storage';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { tempoRelativo } from '../../utils/formatDate';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);

  useFocusEffect(
    useCallback(() => {
      obterHistorico().then(setHistorico);
    }, [])
  );

  async function handleBuscar(codigo: string) {
    setLoading(true);
    try {
      const dados = await rastrearEncomenda(codigo);

      await salvarNoHistorico({
        codigo,
        descricao: dados.descricao || dados.tipo,
        ultimoStatus: dados.ultimoStatus,
        consultadoEm: new Date().toISOString(),
        isImportacao: dados.isImportacao,
      });

      navigation.navigate('Rastreamento', { codigo });
    } catch (error: any) {
      Alert.alert('Erro ao rastrear', error.message || 'Não foi possível obter o rastreamento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="cube" size={32} color={colors.laranja} />
          </View>
          <Text style={styles.titulo}>Rastreamento</Text>
          <Text style={styles.subtitulo}>
            Acompanhe seus pacotes nacionais e importações
          </Text>
        </View>

        {/* Input de busca */}
        <View style={styles.secao}>
          <TrackingInput onBuscar={handleBuscar} loading={loading} />
        </View>

        {/* Dica de formato */}
        <View style={styles.dica}>
          <Ionicons name="information-circle-outline" size={16} color={colors.cinza} />
          <Text style={styles.textoDica}>
            Insira o código no formato: <Text style={styles.destaque}>AA123456789BR</Text>
          </Text>
        </View>

        {/* Histórico */}
        {historico.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Consultas recentes</Text>
            {historico.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.codigo}
                style={styles.itemHistorico}
                onPress={() => navigation.navigate('Rastreamento', { codigo: item.codigo })}
                activeOpacity={0.7}
              >
                <View style={styles.itemIcone}>
                  <Ionicons
                    name={item.isImportacao ? 'globe-outline' : 'cube-outline'}
                    size={20}
                    color={item.isImportacao ? colors.roxo : colors.azulCorreios}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCodigo}>{item.codigo}</Text>
                  <Text style={styles.itemStatus} numberOfLines={1}>
                    {item.ultimoStatus}
                  </Text>
                </View>
                <Text style={styles.itemTempo}>{tempoRelativo(item.consultadoEm)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    padding: 20,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    gap: 8,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.azulCorreios,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: colors.azulCorreios,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textoPrimario,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.cinza,
    textAlign: 'center',
    lineHeight: 20,
  },
  secao: {
    gap: 12,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textoPrimario,
    marginBottom: 4,
  },
  dica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -12,
  },
  textoDica: {
    fontSize: 13,
    color: colors.cinza,
  },
  destaque: {
    fontWeight: '700',
    color: colors.textoSecundario,
    letterSpacing: 1,
  },
  itemHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fundoCard,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemCodigo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textoPrimario,
    letterSpacing: 0.5,
  },
  itemStatus: {
    fontSize: 12,
    color: colors.cinza,
  },
  itemTempo: {
    fontSize: 11,
    color: colors.cinzaClaro,
  },
});
