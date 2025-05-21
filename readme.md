# 🐾 Eppets – App para el Cuidado de Mascotas Exóticas

**Eppets** es una aplicación móvil desarrollada con React Native que ayuda a los propietarios de mascotas exóticas a gestionar su cuidado diario. Permite crear recordatorios para tus mascotas, establecer repeticiones, actualizaciones de peso, wiki completa con alimentos, eventos de comunidad, etc. Todo sincronizado en la nube.

---

## 🚀 Características Principales

- Registro diario de fotos guardadas en local
- Registro y seguimiento de peso
- Wiki integrada con información sobre especies exóticas y alimentos
- Autenticación segura mediante JWT
- Notificaciones push con recordatorios

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native (Expo)
- **Backend**: Firebase (FCM, Firestore y Cloud Functions)
- **Base de Datos**: Turso SQLite
- **Autenticación**: JWT personalizado
- **Navegación**: React Navigation (Stack y Tabs)

---

## ⚠ Requerimentos para usaa

**Para poder ejecutar correctamente la aplicación, asegurate de tener lo siguiente:**

1. **Clave API Google Maps**: Se necesita una clave api de google maps, pudiendo obtenerla desde Google Cloud Console. La clave es necesaria en app.json.
2. **Archivo de configuración de Firebase**: Se requiere el archivo de configuración de Firebase para poder acceder a las funciones de backend.
3. **Prebuild**: El proyecto requiere paquetes de código nativo, así que es necesario el uso de prebuild para su funcionamiento.