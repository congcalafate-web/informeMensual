import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Historial() {
  const [informes, setInformes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);

  const [mes, setMes] = useState('');
  const [horas, setHoras] = useState('');
  const [revisitas, setRevisitas] = useState('');
  const [cursos, setCursos] = useState('');
  const [publicaciones, setPublicaciones] = useState('');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    cargarInformes();
  }, []);

  async function cargarInformes() {
    setCargando(true);

    const { data, error } = await supabase
      .from('informes')
      .select('id, mes, horas, revisitas, cursos, publicaciones')
      .order('id', { ascending: false });

    setCargando(false);

    if (error) {
      console.error('Error al cargar informes:', error);
      Alert.alert('Error', 'No se pudieron cargar los informes.');
      return;
    }

    setInformes(data ?? []);
  }

  function abrirEdicion(informe) {
    setEditando(informe);
    setMes(informe.mes);
    setHoras(String(informe.horas));
    setRevisitas(String(informe.revisitas));
    setCursos(String(informe.cursos));
    setPublicaciones(String(informe.publicaciones));
    setObservacion(informe.observacion || '');
  }

  function cerrarEdicion() {
    setEditando(null);
  }

  async function guardarCambios() {
    const mesLimpio = mes.trim();

    if (!mesLimpio) {
      Alert.alert('Falta el mes', 'Escribí el mes del informe.');
      return;
    }

    const { error } = await supabase
      .from('informes')
      .update({
        mes: mesLimpio,
        horas: Number(horas) || 0,
        revisitas: Number(revisitas) || 0,
        cursos: Number(cursos) || 0,
        publicaciones: Number(publicaciones) || 0,
        observacion: observacion.trim() || null,
      })
      .eq('id', editando.id);

    if (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el informe.');
      return;
    }

    cerrarEdicion();
    await cargarInformes();
    Alert.alert('Informe actualizado', 'Los cambios se guardaron correctamente.');
  }

  function pedirConfirmacionEliminar(informe) {
    Alert.alert(
      'Eliminar informe',
      `¿Querés eliminar el informe de ${informe.mes}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarInforme(informe.id),
        },
      ]
    );
  }

  async function eliminarInforme(id) {
    const { error } = await supabase
      .from('informes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar:', error);
      Alert.alert('Error', 'No se pudo eliminar el informe.');
      return;
    }

    await cargarInformes();
    Alert.alert('Informe eliminado', 'El informe fue eliminado correctamente.');
  }

  function mostrarInforme({ item }) {
    return (
      <View style={styles.tarjeta}>
        <Text style={styles.mes}>{item.mes}</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Horas</Text>
          <Text style={styles.numero}>{item.horas}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Revisitas</Text>
          <Text style={styles.numero}>{item.revisitas}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Cursos bíblicos</Text>
          <Text style={styles.numero}>{item.cursos}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Publicaciones</Text>
          <Text style={styles.numero}>{item.publicaciones}</Text>
        </View>

        {item.observacion ? (
  <View style={styles.bloqueObservacion}>
    <Text style={styles.etiquetaObservacion}>Observación</Text>
    <Text style={styles.textoObservacion}>
      {item.observacion}
    </Text>
  </View>
) : null}

        <View style={styles.botones}>
          <Pressable
            style={[styles.botonAccion, styles.botonEditar]}
            onPress={() => abrirEdicion(item)}
          >
            <Text style={styles.textoBoton}>EDITAR</Text>
          </Pressable>

          <Pressable
            style={[styles.botonAccion, styles.botonEliminar]}
            onPress={() => pedirConfirmacionEliminar(item)}
          >
            <Text style={styles.textoBoton}>ELIMINAR</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#2166D1" />
        <Text style={styles.textoCargando}>Cargando informes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>HISTORIAL</Text>

      <FlatList
        data={informes}
        renderItem={mostrarInforme}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            Todavía no hay informes guardados.
          </Text>
        }
      />

      <Modal visible={editando !== null} transparent animationType="slide">
        <View style={styles.fondoModal}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>EDITAR INFORME</Text>

            <Text style={styles.etiquetaInput}>Mes</Text>
            <TextInput
              style={styles.input}
              value={mes}
              onChangeText={setMes}
              placeholder="Ejemplo: Octubre 2026"
            />

            <Text style={styles.etiquetaInput}>Horas</Text>
            <TextInput
              style={styles.input}
              value={horas}
              onChangeText={setHoras}
              keyboardType="numeric"
            />

            <Text style={styles.etiquetaInput}>Revisitas</Text>
            <TextInput
              style={styles.input}
              value={revisitas}
              onChangeText={setRevisitas}
              keyboardType="numeric"
            />

            <Text style={styles.etiquetaInput}>Cursos bíblicos</Text>
            <TextInput
              style={styles.input}
              value={cursos}
              onChangeText={setCursos}
              keyboardType="numeric"
            />

            <Text style={styles.etiquetaInput}>Publicaciones</Text>
            <TextInput
              style={styles.input}
              value={publicaciones}
              onChangeText={setPublicaciones}
              keyboardType="numeric"
            />

            <Text style={styles.etiquetaInput}>Observación</Text>

            <TextInput
              style={[styles.input, styles.inputObservacion]}
              value={observacion}
              onChangeText={setObservacion}
              placeholder="Escribí una observación opcional"
              multiline
              numberOfLines={4}
              />

            <Pressable style={styles.botonGuardar} onPress={guardarCambios}>
              <Text style={styles.textoBoton}>GUARDAR CAMBIOS</Text>
            </Pressable>

            <Pressable style={styles.botonCancelar} onPress={cerrarEdicion}>
              <Text style={styles.textoCancelar}>CANCELAR</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2166D1',
    textAlign: 'center',
    marginBottom: 25,
  },

  tarjeta: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },

  mes: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2166D1',
    marginBottom: 15,
  },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  etiqueta: {
    fontSize: 16,
    color: '#555',
  },

  numero: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  botones: {
    flexDirection: 'row',
    marginTop: 15,
  },

  botonAccion: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },

  botonEditar: {
    backgroundColor: '#2166D1',
    marginRight: 6,
  },

  botonEliminar: {
    backgroundColor: '#E64A4A',
    marginLeft: 6,
  },

  textoBoton: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCargando: {
    marginTop: 12,
    fontSize: 16,
  },

  vacio: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },

  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
  },

  tituloModal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2166D1',
    textAlign: 'center',
    marginBottom: 20,
  },

  etiquetaInput: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    backgroundColor: '#F6F8FA',
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  botonGuardar: {
    backgroundColor: '#28C76F',
    padding: 15,
    borderRadius: 8,
    marginTop: 22,
  },

  botonCancelar: {
    padding: 14,
    marginTop: 6,
  },

  textoCancelar: {
    textAlign: 'center',
    color: '#666',
    fontWeight: 'bold',
  },
  bloqueObservacion: {
  borderTopWidth: 1,
  borderTopColor: '#E5E5E5',
  marginTop: 10,
  paddingTop: 10,
},

etiquetaObservacion: {
  fontSize: 15,
  fontWeight: 'bold',
  marginBottom: 4,
},

textoObservacion: {
  fontSize: 15,
  color: '#555',
},

inputObservacion: {
  minHeight: 90,
  textAlignVertical: 'top',
},
});