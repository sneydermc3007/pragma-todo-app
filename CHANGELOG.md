# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

## [0.2.0] - 2026-08-24

### Added

- Agenda: cada tarea se agenda en un día concreto, con hora de inicio y de fin opcionales.
- Vista semanal con línea de tiempo: se navega día por día desde «Ver todas» y muestra las tareas ordenadas por hora.
- Buscador de tareas por título y descripción.
- Panel de avisos con las tareas vencidas y las próximas.
- Menú lateral para moverse entre tareas, agenda y avisos.
- Home rediseñado: saludo según la hora del día, cantidad de tareas del mes y carrusel con las tareas de hoy.

### Changed

- El formulario de alta pasó de estar fijo en la pantalla a un panel deslizable, con validación de que la hora de fin sea posterior a la de inicio.
- El color de cada tarjeta ahora representa la prioridad de la tarea.
- Las tareas guardadas con la versión anterior quedan agendadas automáticamente en su fecha de creación, sin perder datos.

## [0.1.0] - 2026-08-23

### Added

- Proyecto base Ionic + Angular 21 con plantilla `blank` e integración Cordova.
- Gestión de tareas: crear con título, descripción y prioridad, marcar como completada y eliminar.
- Persistencia local de las tareas: sobreviven al cierre de la app, con SQLite en dispositivo e IndexedDB en navegador.
- Validación del formulario de tareas: título obligatorio —rechaza los valores de solo espacios— y límites de longitud en título y descripción.
- Lista de tareas ordenada por fecha de creación descendente, con estado vacío y mensajes de error.

[Unreleased]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/sneydermc3007/pragma-todo-app/releases/tag/v0.2.0
[0.1.0]: https://github.com/sneydermc3007/pragma-todo-app/releases/tag/v0.1.0
