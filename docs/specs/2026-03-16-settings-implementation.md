# Spec: EPI-4 — Implementación de UI: Settings

## Metadata
- **Tipo:** feature
- **Complejidad:** S
- **Fecha:** 2026-03-16
- **Estado:** DONE

## Historia
**Como** usuario autenticado,  
**Quiero** acceder a una página de configuraciones,  
**Para** poder actualizar mis datos personales (nombre, teléfono), cambiar mi contraseña, y modificar mi foto de perfil.

## Contexto
El backend ya disponía de rutas protegidas para estas operaciones (`/api/users/profile`, `/api/auth/change-password`, `/api/users/upload-profile-image`).
El frontend ya disponía del hook `useAuth()` exponiendo los métodos `updateProfile`, `updatePassword` y `uploadAvatar`.
Sin embargo, el componente `/settings` era un cascarón vacío (`Settings.jsx`) sin interfaz de usuario.

## Diseño y Arquitectura
- **Componente Único / Pestañas Client-Side:** Se implementó todo en `Settings.jsx` usando estados locales (`activeTab`) para simular navegación por pestañas ("Datos Personales", "Seguridad", "Preferencias") en lugar de crear rutas anidadas en React Router. Esto mantiene el componente autónomo.
- **Formularios Separados:** Cada pestaña mantiene su propio form, su propio botón de submit y su propio estado de carga (`profileStatus`, `passwordStatus`), evitando que la página entera se bloquee o que un error en el cambio de contraseña impida guardar el nombre.
- **Reutilización de Context:** En lugar de llamar a Axios directamente desde el componente, todas las mutaciones se delegaron de vuelta al `AuthContext.jsx` para asegurar que el objeto `user` global y `localStorage` se mantengan sincronizados en toda la app.

## Criterios de Aceptación
- [x] CA-1: UI dividida en pestañas/secciones lógicas.
- [x] CA-2: `updateProfile` consumido con éxito para actualizar nombre, apellidos y teléfono.
- [x] CA-3: `updatePassword` consumido validando coincidencias de la nueva contraseña en frontend.
- [x] CA-4: `uploadAvatar` funcional.
- [x] CA-5: Inputs bloqueados (email) son visualmente de solo-lectura y no envían mutaciones.

## Consideraciones de Seguridad
- Se añadió validación en el cliente para la longitud mínima de contraseña (6 caracteres) y confirmación de igualdad para prevenir errores de tipeo accidentales antes de mandar los payloads al backend.
- Modificar correo (`email`) fue bloqueado desde frontend (disabled) en consistencia con el backend que usa el correo como identificador primario en estrategias JWT.

## Pendientes Abiertos y Gaps Detectados
- **Funcionalidades faltantes:** La pestaña de "Preferencias" (Modo Oscuro, Notificaciones) quedó como un esqueleto visual sin lógica funcional subyacente.
- **Comportamientos inconsistentes:** El avatar se sube correctamente y genera URL, pero no se aplica una validación de peso máximo en el cliente antes de la subida, delegando todo al servidor.
- **Trabajo fuera de alcance:** Implementación de persistencia de "Preferencias" en el modelo de Usuario.
- **Items para backlog:** Desarrollar el sistema de preferencias del usuario y añadir validación de imagen en el cliente (resizing).

## Resultados (se completa al cerrar)
- **Fecha de cierre:** 2026-03-16
- **CAs cumplidos:** 5/5
- **CAs no cumplidos:** 0
- **Deuda técnica generada:** Componente Settings.jsx algo extenso; podría modularizarse en sub-componentes por pestaña en una futura iteración.
- **Lecciones aprendidas:** Mantener la lógica de mutación en el AuthContext facilitó la sincronización inmediata del avatar en el Header sin llamadas extra.
- **Backlog derivado creado:** SI (en `task.md` -> F-303 parcial).

## Matriz de cierre
| Item detectado | Estado | Acción |
|---|---|---|
| Perfil (Nombre/Tel) | Confirmado | Cerrar |
| Password Change | Confirmado | Cerrar |
| Upload Avatar | Confirmado | Cerrar |
| Preferencias UI | Parcial | Crear backlog |
| Validación Imagen | Fuera de alcance | Crear backlog |
