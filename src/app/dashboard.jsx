import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [anio, setAnio] = useState('2026');

  const [cantidadInformes, setCantidadInformes] = useState(0);
  const [totalHoras, setTotalHoras] = useState(0);
  const [promedioHoras, setPromedioHoras] = useState(0);

  const [totalCursosPrecursores, setTotalCursosPrecursores] = useState(0);
  const [promedioCursosPrecursores, setPromedioCursosPrecursores] = useState(0);

  const [publicadoresActivos, setPublicadoresActivos] = useState(0);
  const [totalCursosPublicadores, setTotalCursosPublicadores] = useState(0);
  const [promedioCursosPublicadores, setPromedioCursosPublicadores] = useState(0);

  const [totalCursosGeneral, setTotalCursosGeneral] = useState(0);

  useEffect(() => {
    verificarAdministrador();
  }, []);

  async function verificarAdministrador() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle();

    if (error || perfil?.rol !== 'administrador') {
      Alert.alert(
        'Acceso no permitido',
        'Esta pantalla es solo para administradores.'
      );

      router.replace('/');
      return;
    }

    setAutorizado(true);
    cargarResumen();
  }

  async function cargarResumen() {
    const anioLimpio = anio.trim();

    if (!anioLimpio) {
      Alert.alert('Falta el año', 'Escribí un año, por ejemplo 2026.');
      return;
    }

    setCargando(true);

    const [
      { data: informes, error: errorInformes },
      { data: actividades, error: errorActividades },
    ] = await Promise.all([
      supabase
        .from('informes')
        .select('horas, cursos, usuario_id')
        .not('usuario_id', 'is', null)
        .ilike('mes', `%${anioLimpio}%`),

      supabase
        .from('actividades_publicador')
        .select('actividad, cursos, usuario_id')
        .not('usuario_id', 'is', null)
        .ilike('mes', `%${anioLimpio}%`),
    ]);

    setCargando(false);

    if (errorInformes || errorActividades) {
      console.error('Error al cargar Dashboard:', {
        errorInformes,
        errorActividades,
      });

      Alert.alert('Error', 'No se pudo cargar el resumen.');
      return;
    }

    const informesPrecursores = informes ?? [];
    const informesPublicadores = actividades ?? [];

    const cantidadPrecursores = informesPrecursores.length;

    const horasPrecursores = informesPrecursores.reduce(
      (total, informe) => total + Number(informe.horas || 0),
      0
    );

    const cursosPrecursores = informesPrecursores.reduce(
      (total, informe) => total + Number(informe.cursos || 0),
      0
    );

    const cursosPublicadores = informesPublicadores.reduce(
      (total, actividad) => total + Number(actividad.cursos || 0),
      0
    );

    const usuariosActivos = new Set(
      informesPublicadores
        .filter((actividad) => actividad.actividad)
        .map((actividad) => actividad.usuario_id)
    );

    setCantidadInformes(cantidadPrecursores);
    setTotalHoras(horasPrecursores);
    setPromedioHoras(
      cantidadPrecursores ? horasPrecursores / cantidadPrecursores : 0
    );

    setTotalCursosPrecursores(cursosPrecursores);
    setPromedioCursosPrecursores(
      cantidadPrecursores ? cursosPrecursores / cantidadPrecursores : 0
    );

    setPublicadoresActivos(usuariosActivos.size);
    setTotalCursosPublicadores(cursosPublicadores);
    setPromedioCursosPublicadores(
      informesPublicadores.length
        ? cursosPublicadores / informesPublicadores.length
        : 0
    );

    setTotalCursosGeneral(cursosPrecursores + cursosPublicadores);
  }

  if (!autorizado || cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#2166D1" />
        <Text style={styles.textoCargando}>Cargando Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>DASHBOARD</Text>
      <Text style={styles.subtitulo}>Resumen general de precursores y publicadores</Text>

      <Text style={styles.etiqueta}>Año</Text>

      <View style={styles.filaAnio}>
        <TextInput
          style={styles.inputAnio}
          value={anio}
          onChangeText={setAnio}
          keyboardType="numeric"
          placeholder="2026"
        />

        <Pressable style={styles.botonBuscar} onPress={cargarResumen}>
          <Text style={styles.textoBoton}>VER</Text>
        </Pressable>
      </View>

      <Text style={styles.seccion}>PRECURSORES</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>INFORMES RECIBIDOS</Text>
        <Text style={styles.numero}>{cantidadInformes}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>TOTAL DE HORAS</Text>
        <Text style={styles.numero}>{totalHoras}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>PROMEDIO DE HORAS</Text>
        <Text style={styles.numero}>{promedioHoras.toFixed(1)}</Text>
        <Text style={styles.aclaracion}>por informe</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>TOTAL DE CURSOS BÍBLICOS</Text>
        <Text style={styles.numero}>{totalCursosPrecursores}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>PROMEDIO DE CURSOS BÍBLICOS</Text>
        <Text style={styles.numero}>
          {promedioCursosPrecursores.toFixed(1)}
        </Text>
        <Text style={styles.aclaracion}>por informe</Text>
      </View>

      <Text style={styles.seccion}>PUBLICADORES</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>PUBLICADORES CON ACTIVIDAD</Text>
        <Text style={styles.numero}>{publicadoresActivos}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>TOTAL DE CURSOS BÍBLICOS</Text>
        <Text style={styles.numero}>{totalCursosPublicadores}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>PROMEDIO DE CURSOS BÍBLICOS</Text>
        <Text style={styles.numero}>
          {promedioCursosPublicadores.toFixed(1)}
        </Text>
        <Text style={styles.aclaracion}>por informe mensual</Text>
      </View>

      <Text style={styles.seccion}>RESUMEN GENERAL</Text>

      <View style={[styles.tarjeta, styles.tarjetaGeneral]}>
        <Text style={styles.nombre}>TOTAL DE CURSOS BÍBLICOS</Text>
        <Text style={styles.numeroGeneral}>{totalCursosGeneral}</Text>
        <Text style={styles.aclaracion}>
          precursores + publicadores
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },

  contenido: {
    padding: 25,
    paddingTop: 55,
    paddingBottom: 40,
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
  },

  subtitulo: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 25,
  },

  etiqueta: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  filaAnio: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  inputAnio: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
  },

  botonBuscar: {
    backgroundColor: '#2166D1',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 10,
    marginLeft: 10,
  },

  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
  },

  seccion: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2166D1',
    marginTop: 15,
    marginBottom: 10,
  },

  tarjeta: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
  },

  tarjetaGeneral: {
    borderWidth: 2,
    borderColor: '#7A4BC2',
  },

  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },

  numero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2166D1',
    marginTop: 5,
  },

  numeroGeneral: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7A4BC2',
    marginTop: 5,
  },

  aclaracion: {
    color: '#777',
    fontSize: 13,
    marginTop: 2,
  },
});