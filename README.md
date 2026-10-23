# test-manager-library-3239137-tool

> **Prueba técnica · Ficha ADSO 3239137**
> Horario: **viernes 23 de octubre de 2026, de 7:00 a. m. a 11:00 a. m.** (hora Colombia). Entrega a las **11:00 a. m.**

Este repositorio guarda las **utilidades** de *Manager Library*: el sembrador de datos de demostración, que usa la API. **Empieza vacío a propósito**: se construye en el fork de cada aprendiz.

## Instrucciones

Cada aprendiz debe **crear el fork** de los seis repositorios del proyecto y **resolver el proyecto
con el spec planteado**.

1. Hacer fork, a su cuenta de GitHub, de cada repositorio de la tabla del final.
2. Leer el spec en [`test-manager-library-3239137-docs`](https://github.com/code-sena/test-manager-library-3239137-docs).
   Se entrega en dos versiones: `spec-python/` y `spec-.net/`.
3. Desarrollar en los forks.

## El reto se desarrolla con React y PHP (Laravel)

El spec está escrito para Python y para .NET, pero el reto **no** se hace en esos lenguajes:

| Capa | Tecnología del reto |
|---|---|
| Frontend | React |
| Backend | PHP con Laravel |

Lo que el spec define sobre el negocio —historias, criterios de aceptación, reglas, contrato de la
API, modelo de datos— se respeta. Lo que define sobre la tecnología se traduce a React y Laravel.

## La prueba no consiste en escribir el código

El propósito principal es ver la **capacidad de desempeño con SDD** (*Spec-Driven Development*,
desarrollo guiado por especificación): cómo se lee, se interpreta y se aplica una especificación
para llevarla a un stack distinto. El código es el medio, no el fin.

## Entrega

Cuenta lo que quede **subido a los forks antes de las 11:00 a. m.** Lo que llegue después no se revisa.
No hay prórroga: suban avances parciales con commits pequeños durante la prueba.

## Los seis repositorios

| Repositorio | Qué va ahí |
|---|---|
| [`test-manager-library-3239137-docs`](https://github.com/code-sena/test-manager-library-3239137-docs) | El spec: `spec-python/` y `spec-.net/` |
| [`test-manager-library-3239137-api`](https://github.com/code-sena/test-manager-library-3239137-api) | Backend en PHP (Laravel) |
| [`test-manager-library-3239137-app`](https://github.com/code-sena/test-manager-library-3239137-app) | Frontend en React |
| [`test-manager-library-3239137-page`](https://github.com/code-sena/test-manager-library-3239137-page) | Sitio público estático de presentación |
| [`test-manager-library-3239137-infra`](https://github.com/code-sena/test-manager-library-3239137-infra) | Contenedores, red, volúmenes y motor de base de datos vacío |
| [`test-manager-library-3239137-tool`](https://github.com/code-sena/test-manager-library-3239137-tool) | Utilidades: sembrador de datos de demostración |

## Sembrador implementado

Requiere Node 24 y la API local funcionando con APP_ENV=local.
Copiar .env.example a .env y configurar el mismo administrador del backend.
Ejecutar npm run seed. No tiene dependencias npm externas.

Crea por HTTP 40 libros, 10 socios y 15 préstamos. Tres préstamos
se crean con un reloj local controlado, quince días en el pasado:
la API sigue calculando due_at como loaned_at + 14 días.
El archivo temporal storage/app/demo-clock.txt está ignorado por Git,
no existe un endpoint para modificar el reloj y el adaptador solo
lee este archivo en APP_ENV=local. El sembrador lo elimina al terminar,
incluso ante un error. No usar el reloj de demostración en producción.
No ejecutar el sembrador a la vez que pruebas u operaciones reales.

Cada ejecución crea un lote nuevo con identificadores de demostración;
no borra datos y no es idempotente. Reporta los vencidos del lote propio.

## Pruebas complementarias
- node concurrency.mjs: dos solicitudes sobre el último ejemplar y dos
  devoluciones simultáneas. Requiere el administrador configurado en .env.
- node cover-check.mjs: subida PNG real, descarga, eliminación y rechazo
  de contenido falso o mayor a 2 MB. Requiere al menos un libro activo.
Ambas usan la API y no imprimen tokens ni credenciales.
