import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  async function crearCuenta() {
    if (!nombre.trim() || !email.trim() || !contrasena) {
      Alert.alert('Faltan datos', 'Completá todos los campos.');
      return;
    }

    if (contrasena.length < 6) {
      Alert.alert(
        'Contraseña corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: contrasena,
      options: {
        data: {
          nombre: nombre.trim(),
        },
      },
    });

    setCargando(false);

    if (error) {
      Alert.alert('No se pudo crear la cuenta', error.message);
      return;
    }

    Alert.alert(
      'Cuenta creada',
      'Revisá tu correo electrónico y confirmá tu cuenta antes de iniciar sesión.',
      [
        {
          text: 'Entendido',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>CREAR CUENTA</Text>
      <Text style={styles.subtitulo}>Registro de precursor</Text>

      <Text style={styles.etiqueta}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ejemplo: Juan Pérez"
      />

      <Text style={styles.etiqueta}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="nombre@correo.com"
      />

      <Text style={styles.etiqueta}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        placeholder="Mínimo 6 caracteres"
      />

      <Pressable
        style={styles.boton}
        onPress={crearCuenta}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.textoBoton}>CREAR CUENTA</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.enlace}>
          Ya tengo una cuenta
        </Text>
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

  titulo: {
    color: '#2166D1',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitulo: {
    color: '#666',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 30,
  },

  etiqueta: {
    fontSize: 16,
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
    fontSize: 16,
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

  enlace: {
    color: '#2166D1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 22,
  },
});