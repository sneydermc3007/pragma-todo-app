# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

## [1.0.0] - 2026-08-25

### Added

- README con la descripción del proyecto, cómo instalarlo y correrlo en emulador y en dispositivo físico, la arquitectura, los feature flags configurados, cómo se midió el rendimiento y capturas de cada etapa.

### Fixed

- En los iPhone con isla dinámica o muesca, la hora y la batería vuelven a verse: la barra de estado se pinta según el tema, oscura sobre claro y clara sobre oscuro.
- El menú lateral ya no arranca debajo del reloj, y el botón de agregar dejó de quedar pegado al indicador de inicio.

## [0.8.0] - 2026-08-25

### Added

- Pruebas unitarias de los reducers, los selectores y los validadores de la app.

### Changed

- La app tiene una paleta propia de colores, espaciados y bordes, definida en un solo lugar y pensada para leerse bien tanto en tema claro como en oscuro.
- Las tarjetas de la lista ya no se tiñen enteras según la prioridad: la marcan con una barra de color a la izquierda y con la hora resaltada, sobre un fondo neutro que se lee mejor en listas largas.
- Los márgenes, los bordes redondeados, los tamaños de los botones y los mensajes de lista vacía son iguales en todas las pantallas.
- Los botones de la barra superior quedaron alineados con el contenido de la página, y los de ícono tienen todos la misma forma y tamaño.

## [0.7.0] - 2026-08-25

### Changed

- La lista de tareas ya no dibuja todas las tarjetas a la vez: solo las visibles, reciclándolas al hacer scroll. Con 1000 tareas pasa de 1033 tarjetas en pantalla a 47, y de 48 MB de memoria a 14 MB.
- Las tarjetas de la lista tienen todas la misma altura, con el título y la descripción recortados a una línea.
- Al hacer scroll muy rápido, los huecos que alcanzan a quedar sin dibujar muestran una silueta gris en lugar de espacio en blanco.

### Fixed

- Volver a la lista desde otra pantalla ya no salta al final de las tareas: conserva la posición donde estabas.
- La primera tarjeta de «Tareas de hoy» ya no queda pegada al borde: arranca alineada con el resto de la pantalla.

## [0.6.0] - 2026-08-25

### Added

- El formato de hora se adapta a la región: 24 horas en Europa y 12 horas en el resto, decidido desde Firebase sin publicar una versión nueva.
- Confirmación antes de eliminar una tarea, con el nombre de la tarea en el aviso.
- Avisos al crear, editar y eliminar una tarea.

### Changed

- Al crear una tarea, las horas vienen propuestas —la próxima hora en punto y una hora de duración— en lugar de quedar vacías.
- El selector de hora del formulario respeta el mismo formato que muestran las tarjetas.
- La última tarea de la lista ya no queda tapada por el botón de agregar.

## [0.5.0] - 2026-08-25

### Added

- La app se muestra en español o en inglés según el idioma configurado en el dispositivo, sin que haya que elegirlo a mano.
- Las fechas y los nombres de los días de la agenda siguen el formato del idioma detectado.

## [0.4.0] - 2026-08-25

### Added

- Modo oscuro como feature flag: se activa o desactiva desde Firebase Remote Config, sin publicar una versión nueva de la app.

### Changed

- El tema dejó de seguir la preferencia del sistema operativo y ahora lo controla el feature flag.

## [0.3.1] - 2026-08-25

### Fixed

- Los mensajes de lista vacía distinguen entre no tener tareas creadas y que el filtro no encuentre ninguna.
- El contador del encabezado usa el singular cuando hay una sola tarea.

## [0.3.0] - 2026-08-25

### Added

- Categorías con nombre y color: crear, editar y eliminar desde su propia pantalla.
- Asignación de una categoría a cada tarea, al crearla o al editarla, siempre opcional.
- Filtro de tareas por categoría, con un chip por cada una y su contador, combinable con el buscador.
- Filtro «Sin categoría», para encontrar las tareas que quedaron sueltas.
- Edición de una tarea ya creada.

### Changed

- Al eliminar una categoría, las tareas que la usaban quedan sin categoría en lugar de borrarse o romperse.
- Las tareas guardadas con la versión anterior quedan sin categoría, sin perder datos.

## [0.2.1] - 2026-08-24

### Fixed

- Los iconos de la interfaz ya no quedan en blanco: se registran al arrancar en lugar de intentar descargarse.

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

[Unreleased]: https://github.com/sneydermc3007/pragma-todo-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.8.0...v1.0.0
[0.8.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/sneydermc3007/pragma-todo-app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/sneydermc3007/pragma-todo-app/releases/tag/v0.1.0
