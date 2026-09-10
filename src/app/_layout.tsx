import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          title: 'Iniciar sesión',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="registro"
        options={{
          title: 'Crear cuenta',
        }}
      />

      <Stack.Screen
        name="nuevo-informe"
        options={{
          title: 'Nuevo informe',
        }}
      />

      <Stack.Screen
        name="historial"
        options={{
          title: 'Historial',
        }}
      />
      <Stack.Screen
  name="dashboard"
  options={{
    title: 'Dashboard administrador',
  }}
/>
<Stack.Screen
  name="actividad-publicador"
  options={{
    title: 'Actividad mensual',
  }}
/>

    </Stack>
  );
}