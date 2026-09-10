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

export default function Login() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion() {
    if (!email.trim() || !contrasena) {
      Alert.alert('Faltan datos', 'Escribí tu correo y contraseña.');
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: contrasena,
    });

    setCargando(false);

    if (error) {
      Alert.alert('No se pudo iniciar sesión', error.message);
      return;
    }

    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>MI INFORME</Text>
      <Text style={styles.subtitulo}>Ingresá con tu cuenta</Text>

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
        placeholder="Escribí tu contraseña"
      />

      <Pressable
        style={styles.boton}
        onPress={iniciarSesion}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.textoBoton}>INICIAR SESIÓN</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/registro')}>
        <Text style={styles.enlace}>
          ¿No tenés cuenta? Creá una aquí
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
    paddingTop: 90,
  },

  titulo: {
    color: '#2166D1',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitulo: {
    color: '#666',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 35,
  },

  etiqueta: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
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
    backgroundColor: '#2166D1',
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