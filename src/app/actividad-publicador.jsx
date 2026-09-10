import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ActividadPublicador() {
  const [mes, setMes] = useState('Septiembre 2026');
  const [actividad, setActividad] = useState(false);
  const [cursos, setCursos] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    verificarPublicador();
  }, []);

  async function verificarPublicador() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle();

    if (perfil?.rol !== 'publicador') {
      Alert.alert(
        'Acceso no permitido',
        'Esta pantalla es solo para publicadores.'
      );

      router.replace('/');
      return;
    }

    setCargando(false);
  }

  async function guardarActividad() {
    if (guardando) {
      return;
    }

    const mesLimpio = mes.trim();

    if (!mesLimpio) {
      Alert.alert('Falta el mes', 'Escribí el mes de la actividad.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from('actividades_publicador')
      .upsert(
        {
          usuario_id: user.id,
          mes: mesLimpio,
          actividad,
          cursos: Number(cursos) || 0,
        },
        {
          onConflict: 'usuario_id,mes',
        }
      );

    setGuardando(false);

    if (error) {
      console.error('Error al guardar actividad:', error);
      Alert.alert('Error', 'No se pudo guardar la actividad.');
      return;
    }

    Alert.alert(
      'Actividad guardada',
      'La actividad mensual se guardó correctamente.'
    );
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#2166D1" />
        <Text style={styles.textoCargando}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ACTIVIDAD MENSUAL</Text>
      <Text style={styles.subtitulo}>Informe de publicador</Text>

      <Text style={styles.etiqueta}>Mes</Text>
      <TextInput
        style={styles.input}
        value={mes}
        onChangeText={setMes}
        placeholder="Ejemplo: Octubre 2026"
      />

      <View style={styles.filaActividad}>
        <View>
          <Text style={styles.etiqueta}>¿Realizaste actividad?</Text>
          <Text style={styles.ayuda}>
            Marcá la casilla si realizaste actividad este mes.
          </Text>
        </View>

        <Switch
          value={actividad}
          onValueChange={setActividad}
          trackColor={{ false: '#B8B8B8', true: '#8AB5F8' }}
          thumbColor={actividad ? '#2166D1' : '#F4F4F4'}
        />
      </View>

      <Text style={styles.etiqueta}>Cursos bíblicos</Text>
      <TextInput
        style={styles.input}
        value={cursos}
        onChangeText={setCursos}
        keyboardType="numeric"
        placeholder="Escribí la cantidad de cursos"
      />

      <Pressable
        style={[styles.boton, guardando && styles.botonDeshabilitado]}
        onPress={guardarActividad}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.textoBoton}>GUARDAR ACTIVIDAD</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    padding: 25,
    paddingTop: 70,
  },

  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoCargando: {
    marginTop: 12,
    fontSize: 16,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#2166D1',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 17,
  },

  filaActividad: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ayuda: {
    color: '#666',
    fontSize: 13,
    maxWidth: 250,
  },

  boton: {
    backgroundColor: '#28C76F',
    padding: 18,
    borderRadius: 10,
    marginTop: 30,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});