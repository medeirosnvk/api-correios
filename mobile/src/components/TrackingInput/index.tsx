import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Props {
  onBuscar: (codigo: string) => void;
  loading: boolean;
}

const REGEX_CODIGO = /^[A-Za-z]{2}\d{9}[A-Za-z]{2}$/;

export function TrackingInput({ onBuscar, loading }: Props) {
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');

  function handleBuscar() {
    const codigoLimpo = valor.trim().toUpperCase().replace(/\s/g, '');

    if (!codigoLimpo) {
      setErro('Informe o código de rastreamento.');
      return;
    }

    if (!REGEX_CODIGO.test(codigoLimpo)) {
      setErro('Código inválido. Ex: AA123456789BR');
      return;
    }

    setErro('');
    onBuscar(codigoLimpo);
  }

  function handleChange(texto: string) {
    setValor(texto.toUpperCase());
    if (erro) setErro('');
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, erro ? styles.inputErro : null]}>
        <Ionicons name="search-outline" size={20} color={colors.cinza} style={styles.icone} />
        <TextInput
          style={styles.input}
          placeholder="Ex: AA123456789BR"
          placeholderTextColor={colors.cinzaClaro}
          value={valor}
          onChangeText={handleChange}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={13}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
          editable={!loading}
        />
        {valor.length > 0 && (
          <TouchableOpacity onPress={() => { setValor(''); setErro(''); }}>
            <Ionicons name="close-circle" size={20} color={colors.cinza} />
          </TouchableOpacity>
        )}
      </View>

      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}

      <TouchableOpacity
        style={[styles.botao, loading && styles.botaoDesabilitado]}
        onPress={handleBuscar}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.textoBotao}>Rastrear</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.bordaInput,
    paddingHorizontal: 12,
    height: 52,
  },
  inputErro: {
    borderColor: colors.erro,
  },
  icone: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textoPrimario,
    letterSpacing: 1,
  },
  textoErro: {
    color: colors.erro,
    fontSize: 13,
    marginLeft: 4,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.azulCorreios,
    borderRadius: 12,
    height: 52,
    gap: 8,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
