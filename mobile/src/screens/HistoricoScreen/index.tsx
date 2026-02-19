import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import {
  ItemHistorico,
  obterHistorico,
  removerDoHistorico,
  limparHistorico,
} from '../../utils/storage';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { tempoRelativo } from '../../utils/formatDate';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Historico'>;

export function HistoricoScreen() {
  const navigation = useNavigation<NavProp>();
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);

  useFocusEffect(
    useCallback(() => {
      obterHistorico().then(setHistorico);
    }, [])
  );

  async function handleRemover(codigo: string) {
    await removerDoHistorico(codigo);
    setHistorico((prev) => prev.filter((h) => h.codigo !== codigo));
  }

  function handleLimparTudo() {
    Alert.alert(
      'Limpar histórico',
      'Deseja remover todos os itens do histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await limparHistorico();
            setHistorico([]);
          },
        },
      ]
    );
  }

  function renderAcaoRemover(item: ItemHistorico) {
    return (
      <TouchableOpacity
        style={styles.acaoRemover}
        onPress={() => handleRemover(item.codigo)}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={styles.textoAcaoRemover}>Remover</Text>
      </TouchableOpacity>
    );
  }

  function renderItem({ item }: { item: ItemHistorico }) {
    return (
      <Swipeable renderRightActions={() => renderAcaoRemover(item)}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Rastreamento', { codigo: item.codigo })}
          activeOpacity={0.8}
        >
          <View style={styles.itemIcone}>
            <Ionicons
              name={item.isImportacao ? 'globe-outline' : 'cube-outline'}
              size={22}
              color={item.isImportacao ? colors.roxo : colors.azulCorreios}
            />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemCodigo}>{item.codigo}</Text>
            <Text style={styles.itemDescricao}>{item.descricao}</Text>
            <Text style={styles.itemStatus} numberOfLines={1}>{item.ultimoStatus}</Text>
          </View>
          <View style={styles.itemDireita}>
            <Text style={styles.itemTempo}>{tempoRelativo(item.consultadoEm)}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.cinzaClaro} />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {historico.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="time-outline" size={72} color={colors.cinzaClaro} />
          <Text style={styles.vazioTitulo}>Nenhuma consulta recente</Text>
          <Text style={styles.vazioSubtitulo}>
            Seus rastreamentos consultados aparecerão aqui.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={historico}
            keyExtractor={(item) => item.codigo}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            ItemSeparatorComponent={() => <View style={styles.separador} />}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.rodape}>
            <TouchableOpacity style={styles.botaoLimpar} onPress={handleLimparTudo}>
              <Ionicons name="trash-outline" size={16} color={colors.erro} />
              <Text style={styles.textoBotaoLimpar}>Limpar histórico</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.fundo,
  },
  lista: {
    padding: 16,
    paddingBottom: 80,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fundoCard,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  itemDescricao: {
    fontSize: 12,
    color: colors.cinza,
  },
  itemStatus: {
    fontSize: 12,
    color: colors.textoSecundario,
    marginTop: 2,
  },
  itemDireita: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemTempo: {
    fontSize: 11,
    color: colors.cinzaClaro,
  },
  separador: {
    height: 8,
  },
  acaoRemover: {
    backgroundColor: colors.erro,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 14,
    marginLeft: 8,
    gap: 4,
  },
  textoAcaoRemover: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textoSecundario,
  },
  vazioSubtitulo: {
    fontSize: 14,
    color: colors.cinza,
    textAlign: 'center',
    lineHeight: 21,
  },
  rodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.fundo,
    borderTopWidth: 1,
    borderTopColor: colors.bordaLinha,
  },
  botaoLimpar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.erro,
  },
  textoBotaoLimpar: {
    color: colors.erro,
    fontWeight: '600',
    fontSize: 14,
  },
});
