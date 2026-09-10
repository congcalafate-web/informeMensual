import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function NuevoInforme() {
  const [mes, setMes] = useState('Septiembre 2026');
  const [horas, setHoras] = useState('');
  const [revisitas, setRevisitas] = useState('');
  const [cursos, setCursos] = useState('');
  const [publicaciones, setPublicaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [observacion, setObservacion] = useState('');

async function enviarInforme() {
  if (enviando) {
    return;
  }

  const mesLimpio = mes.trim();

  if (!mesLimpio) {
    Alert.alert('Falta el mes', 'Escribí el mes del informe.');
    return;
  }

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    Alert.alert(
      'Sesión requerida',
      'Iniciá sesión antes de enviar un informe.'
    );

    router.replace('/login');
    return;
  }

  setEnviando(true);

  try {
    const { data: existentes, error: errorConsulta } = await supabase
      .from('informes')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('mes', mesLimpio)
      .limit(1);

    if (errorConsulta) {
      console.error('Error al comprobar el mes:', errorConsulta);
      setEnviando(false);
      Alert.alert('Error', 'No se pudo comprobar el informe.');
      return;
    }

    if (existentes.length > 0) {
      setEnviando(false);
      Alert.alert(
        'Informe existente',
        `Ya existe un informe para ${mesLimpio}. Podés editarlo desde Historial.`
      );
      return;
    }

    const { error } = await supabase
      .from('informes')
      .insert([
        {
          usuario_id: user.id,
          mes: mesLimpio,
          horas: Number(horas) || 0,
          revisitas: Number(revisitas) || 0,
          cursos: Number(cursos) || 0,
          publicaciones: Number(publicaciones) || 0,
          observacion: observacion.trim() || null,
        },
      ]);

    setEnviando(false);

    if (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar el informe.');
      return;
    }

    Alert.alert(
      'Informe guardado',
      'Tu informe se guardó correctamente.'
    );
  } catch (error) {
    setEnviando(false);
    console.error('Error inesperado:', error);
    Alert.alert('Error', 'Ocurrió un problema inesperado.');
  }
}

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        NUEVO INFORME
      </Text>

      <Text style={styles.subtitulo}>
      {mes || 'Nuevo informe'}
      </Text>

      <Text style={styles.etiqueta}>
  Mes
</Text>

<TextInput
  style={styles.input}
  value={mes}
  onChangeText={setMes}
  placeholder="Ejemplo: Octubre 2026"
/>
      <Text style={styles.etiqueta}>
        Horas
      </Text>

      <TextInput
        style={styles.input}
        value={horas}
        onChangeText={setHoras}
        keyboardType="numeric"
        placeholder="Escribí las horas"
      />

      <Text style={styles.etiqueta}>
        Revisitas
      </Text>

      <TextInput
        style={styles.input}
        value={revisitas}
        onChangeText={setRevisitas}
        keyboardType="numeric"
        placeholder="Escribí las revisitas"
      />

      <Text style={styles.etiqueta}>
        Cursos bíblicos
      </Text>

      <TextInput
        style={styles.input}
        value={cursos}
        onChangeText={setCursos}
        keyboardType="numeric"
        placeholder="Escribí los cursos"
      />

      <Text style={styles.etiqueta}>
        Publicaciones
      </Text>

      <TextInput
        style={styles.input}
        value={publicaciones}
        onChangeText={setPublicaciones}
        keyboardType="numeric"
        placeholder="Escribí las publicaciones"
      />
<Text style={styles.etiqueta}>
  Observación
</Text>

<TextInput
  style={[styles.input, styles.inputObservacion]}
  value={observacion}
  onChangeText={setObservacion}
  placeholder="Escribí una observación opcional"
  multiline
  numberOfLines={4}
/>

      <Pressable
  style={[styles.boton, enviando && styles.botonDeshabilitado]}
  onPress={enviarInforme}
  disabled={enviando}
>
  <Text style={styles.textoBoton}>
    {enviando ? 'GUARDANDO...' : 'ENVIAR INFORME'}
  </Text>
</Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  botonDeshabilitado: {
  opacity: 0.6,
},
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    padding: 25,
    paddingTop: 70,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#2166D1',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 17,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },

  etiqueta: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
  },

  inputObservacion: {
  minHeight: 100,
  textAlignVertical: 'top',
},

  boton: {
    backgroundColor: '#28C76F',
    padding: 18,
    borderRadius: 10,
    marginTop: 30,
  },

  textoBoton: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});