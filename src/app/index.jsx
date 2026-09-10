import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Inicio() {
  const [usuario, setUsuario] = useState(null);
  const [ultimoInforme, setUltimoInforme] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esAdministrador, setEsAdministrador] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setCargando(false);
      router.replace('/login');
      return;
    }

    setUsuario(session.user);

    const { data: perfil } = await supabase
  .from('perfiles')
  .select('rol')
  .eq('id', session.user.id)
  .maybeSingle();

  setEsAdministrador(perfil?.rol === 'administrador');

  if (perfil?.rol === 'publicador') {
  setCargando(false);
  router.replace('/actividad-publicador');
  return;
}
    const { data, error } = await supabase
      .from('informes')
      .select('mes, horas, revisitas, cursos')
      .eq('usuario_id', session.user.id)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error al cargar el informe:', error);
    } else {
      setUltimoInforme(data);
    }

    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error al cerrar sesión:', error);
      return;
    }

    router.replace('/login');
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
      <Text style={styles.titulo}>MI INFORME</Text>

      <Text style={styles.saludo}>
        ¡Hola, {usuario?.user_metadata?.nombre || usuario?.email}!
      </Text>

      <Text style={styles.subtitulo}>
        {ultimoInforme
          ? `Resumen: ${ultimoInforme.mes}`
          : 'Todavía no guardaste informes'}
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>HORAS</Text>
        <Text style={styles.numero}>{ultimoInforme?.horas ?? 0}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>REVISITAS</Text>
        <Text style={styles.numero}>{ultimoInforme?.revisitas ?? 0}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>CURSOS</Text>
        <Text style={styles.numero}>{ultimoInforme?.cursos ?? 0}</Text>
      </View>

      <Pressable
        style={styles.boton}
        onPress={() => router.push('/nuevo-informe')}
      >
        <Text style={styles.textoBoton}>NUEVO INFORME</Text>
      </Pressable>

      <Pressable
        style={[styles.boton, styles.botonHistorial]}
        onPress={() => router.push('/historial')}
      >
        <Text style={styles.textoBoton}>VER HISTORIAL</Text>
      </Pressable>

      {esAdministrador ? (
  <Pressable
    style={[styles.boton, styles.botonDashboard]}
    onPress={() => router.push('/dashboard')}
  >
    <Text style={styles.textoBoton}>DASHBOARD ADMINISTRADOR</Text>
  </Pressable>
) : null}

      <Pressable style={styles.botonSalir} onPress={cerrarSesion}>
        <Text style={styles.textoSalir}>CERRAR SESIÓN</Text>
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

  botonDashboard: {
  backgroundColor: '#7A4BC2',
  marginTop: 12,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2166D1',
    textAlign: 'center',
    marginBottom: 30,
  },

  saludo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },

  tarjeta: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  numero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2166D1',
  },

  boton: {
    backgroundColor: '#2166D1',
    padding: 18,
    borderRadius: 10,
    marginTop: 15,
  },

  botonHistorial: {
    backgroundColor: '#5B6770',
    marginTop: 12,
  },

  botonSalir: {
    padding: 16,
    marginTop: 12,
  },

  textoBoton: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  textoSalir: {
    color: '#E64A4A',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
});