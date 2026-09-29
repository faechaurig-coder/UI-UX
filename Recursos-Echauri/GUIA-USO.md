# Guía de uso — Echauri Asset Vault

## Qué hace el Vault
Centraliza la localización de recursos existentes sin modificar los proyectos originales.

## Búsqueda
Puedes buscar por:
- Nombre del archivo
- Categoría o subcategoría
- Proyecto/repositorio
- Rama
- Extensión
- Ruta original
- Etiqueta local: Usar de nuevo, Revisar o Archivar

## Favoritos y etiquetas
Los favoritos y etiquetas se guardan localmente en el navegador mediante localStorage. No modifican GitHub ni los proyectos.

## Señal de reutilización
La señal es técnica, no estética:

### Listo para usar
Archivo directo reutilizable localizado en rama principal/canónica, por ejemplo PNG, SVG, WEBP, GLB, audio o fuente.

### Requiere adaptación
Archivo directo encontrado en una rama histórica/experimental o recurso que conviene revisar antes de reutilizar.

### Referencia / código
UI, arte procedural, generadores, renderizadores o documentación cuyo valor está en la implementación y no en copiar un único archivo visual.

## Duplicados
El sistema agrupa archivos con el mismo SHA como duplicados exactos. Esto no significa que dos imágenes visualmente parecidas sean idénticas; sólo se marca cuando GitHub reporta exactamente el mismo contenido.

## Seguridad
- No se borran archivos originales.
- No se renombran.
- No se mueven.
- No se sobrescriben.
- La biblioteca trabaja por referencia.
