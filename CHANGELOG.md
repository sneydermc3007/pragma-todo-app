# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

## [0.1.0] - 2026-08-23

### Added

- Proyecto base Ionic + Angular 21 con plantilla `blank` e integración Cordova.
- Gestión de tareas: crear con título, descripción y prioridad, marcar como completada y eliminar.
- Persistencia local de las tareas: sobreviven al cierre de la app, con SQLite en dispositivo e IndexedDB en navegador.
- Validación del formulario de tareas: título obligatorio —rechaza los valores de solo espacios— y límites de longitud en título y descripción.
- Lista de tareas ordenada por fecha de creación descendente, con estado vacío y mensajes de error.

[Unreleased]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sneydermc3007/pragma-todo-app/releases/tag/v0.1.0
