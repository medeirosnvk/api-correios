import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Evento } from '../../types';
import { formatarData } from '../../utils/formatDate';
import { colors } from '../../theme/colors';

interface Props {
  evento: Evento;
  isUltimo: boolean;
  isPrimeiro: boolean;
}

function getIconeEvento(tipo: string): { nome: string; cor: string } {
  const mapa: Record<string, { nome: string; cor: string }> = {
    BDE: { nome: 'checkmark-circle', cor: colors.sucesso },
    BDI: { nome: 'checkmark-circle', cor: colors.sucesso },
    BDR: { nome: 'checkmark-circle', cor: colors.sucesso },
    RO:  { nome: 'airplane', cor: colors.azulCorreios },
    DO:  { nome: 'cube', cor: colors.laranja },
    OEC: { nome: 'bicycle', cor: colors.azulCorreios },
    PO:  { nome: 'log-in', cor: colors.cinza },
    CO:  { nome: 'archive', cor: colors.cinza },
    FC:  { nome: 'alert-circle', cor: colors.erro },
    LDI: { nome: 'globe', cor: colors.roxo },
    IDC: { nome: 'globe', cor: colors.roxo },
  };

  return mapa[tipo] || { nome: 'ellipse-outline', cor: colors.cinza };
}

export function EventCard({ evento, isUltimo, isPrimeiro }: Props) {
  const { nome: iconeNome } = getIconeEvento(evento.tipo);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isPrimeiro) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isPrimeiro, pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Linha timeline */}
      <View style={styles.timeline}>
        {isPrimeiro ? (
          <View style={styles.bolinhaWrapper}>
            {/* Anel pulsante ao redor */}
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.5],
                  outputRange: [0.4, 0],
                }) },
              ]}
            />
            <View style={[styles.bolinha, styles.bolinhaAtiva]}>
              <Ionicons name="ellipse" size={12} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={[styles.bolinha, styles.bolinhaInativa]}>
            <Ionicons name={iconeNome as any} size={14} color={colors.cinzaClaro} />
          </View>
        )}
        {!isUltimo && <View style={[styles.linha, isPrimeiro && styles.linhaAtiva]} />}
      </View>

      {/* Conteúdo */}
      <View style={[styles.conteudo, !isUltimo && styles.conteudoComMargem]}>
        <Text style={[styles.status, isPrimeiro && styles.statusAtivo]}>
          {evento.status}
        </Text>

        {evento.detalhe ? (
          <Text style={styles.detalhe}>{evento.detalhe}</Text>
        ) : null}

        <View style={styles.rodape}>
          <View style={styles.localContainer}>
            <Ionicons name="location-outline" size={12} color={colors.cinza} />
            <Text style={styles.local}>{evento.local}</Text>
          </View>
          <Text style={styles.data}>{formatarData(evento.data)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  timeline: {
    alignItems: 'center',
    width: 32,
  },
  bolinhaWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sucesso,
  },
  bolinha: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinhaAtiva: {
    backgroundColor: colors.sucesso,
  },
  bolinhaInativa: {
    backgroundColor: colors.bordaLinha,
  },
  linha: {
    width: 2,
    flex: 1,
    backgroundColor: colors.bordaLinha,
    marginTop: 4,
    minHeight: 20,
  },
  linhaAtiva: {
    backgroundColor: colors.sucesso + '40',
  },
  conteudo: {
    flex: 1,
    paddingBottom: 4,
  },
  conteudoComMargem: {
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textoSecundario,
    marginBottom: 2,
  },
  statusAtivo: {
    fontWeight: '700',
    color: colors.textoPrimario,
    fontSize: 15,
  },
  detalhe: {
    fontSize: 13,
    color: colors.cinza,
    marginBottom: 4,
    lineHeight: 18,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  localContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  local: {
    fontSize: 12,
    color: colors.cinza,
  },
  data: {
    fontSize: 12,
    color: colors.cinzaClaro,
  },
});
