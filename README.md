Javascript Goodies
==================

## Namespaces

Create nested objects like `mkdir -p` do with directories.

Example:

        app.goodies.registerNs('some.long.complicated.namespace.name');

        /*
         * app = {
         *   some: {
         *       long: {
         *           complicated: {
         *               namespace: {
         *                   name: {
         *                   }
         *               }
         *           }
         *       }
         *   }
         * }
         */

## Observer

Simple but powerful observer.

