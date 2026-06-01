# Flujo de Trabajo GitOps (dev -> qa -> main)

Este proyecto utiliza un modelo de ramificación y CI/CD estructurado para asegurar la calidad antes de llegar a Producción.

## 1. Desarrollo Local (Rama `develop`)
Todas las nuevas características deben partir y unirse a la rama `develop`.
NUNCA trabajes directamente en `main` o `QA`.

```bash
# Cambiar a develop y actualizar
git checkout develop
git pull origin develop

# Crear una rama para tu feature
git checkout -b feat/mi-nueva-caracteristica

# ... hacer cambios, commits convencionales ...
git add .
git commit -m "feat(api): agregar nuevo endpoint de consulta"

# Subir la rama
git push origin feat/mi-nueva-caracteristica
```
Al crear el Pull Request hacia `develop`, GitHub Actions (`ci.yml`) ejecutará automáticamente las pruebas unitarias y validará el estilo del código. Si todo pasa, haces el merge a `develop`.

## 2. Pruebas y Despliegue en QA (Rama `QA`)
Cuando `develop` está estable y listo para ser probado en un ambiente cloud, creamos un PR desde `develop` hacia `QA`.
1. Ve a GitHub y abre un Pull Request.
2. Base: `QA` <- Compare: `develop`.
3. Al hacer merge en QA, GitHub Actions (`cd-apps.yml`) hará lo siguiente:
   - Construirá las imágenes Docker de los microservicios.
   - Las subirá al GitHub Container Registry (GHCR).
   - Simulará el despliegue en la infraestructura AWS.
   - Correrá pruebas de carga (Load Testing) con `k6` de manera automática.

## 3. Producción (Rama `main`)
Si las pruebas en `QA` son exitosas y el equipo da el visto bueno, se prepara la entrega final.
1. Ve a GitHub y abre un Pull Request.
2. Base: `main` <- Compare: `QA`.
3. El profesor o líder técnico revisará este PR.
4. Al aprobarse y hacer merge, se repite el despliegue automático, pero esta vez bajando las imágenes Docker estables hacia Producción.
