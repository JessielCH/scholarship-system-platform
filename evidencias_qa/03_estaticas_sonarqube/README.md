# 📊 Pruebas Estáticas de Código, Deuda Técnica y Cobertura (SonarQube Cloud)

Este directorio almacena las evidencias del análisis electro-estático de la calidad de nuestro código en TypeScript, midiendo vulnerabilidades latentes, errores de diseño, *Code Smells* y la cobertura del código con pruebas unitarias en la nube.

## 🏛️ Justificación y Configuración con SonarQube Cloud (antes SonarCloud)
**Por qué elegimos SonarQube Cloud en la nube:** 
- Nos evitamos la sobrecarga en memoria del uso de contenedores locales, aprovechando la infraestructura oficial en la nube asociada a nuestra organización en GitHub (`Key: jessielch`).
- Ya poseemos pre-configurado en la raíz del proyecto nuestro archivo [sonar-project.properties](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/sonar-project.properties) con las directivas oficiales de nube:
  ```properties
  sonar.organization=jessielch
  sonar.host.url=https://sonarcloud.io
  sonar.projectKey=g4-uce-scholarship-system
  ```
- Se integra en automático con nuestros motores de pruebas unitarias en TypeScript (Jest y Vitest) interceptando reportes en formato LCOV (`sonar.javascript.lcov.reportPaths=**/coverage/lcov.info`) y computando milimétricamente qué porcentaje del código está testeado.
- Nos suministra el **Quality Gate (Semáforo de Calidad)** oficial por grados desde A (Excelente) hasta E, y estima la Deuda Técnica indicando en horas reales y minutos cuánto tiempo nos costará refactorizar código defectuoso.

---

## 🛠️ ¿Qué vamos a hacer y cómo generar tu análisis en SonarQube Cloud?

### Paso 1: Conectar el Proyecto en SonarQube Cloud
1. Desde tu panel principal en `https://sonarcloud.io` (u organización `jessielch`), haz clic en el botón azul **"Analyze a new project" (Analizar un nuevo proyecto)**.
2. Si tienes sincronizado tu GitHub, marca la casilla del repositorio **`scholarship-system-platform`** (o impórto en modo "Setup manually").
3. Verifica que la clave de tu proyecto sea coincidente con la que tenemos (o si SonarQube Cloud te genera una clave ligeramente distinta como `JessielCH_scholarship-system-platform`, copia y pégala en nuestro [sonar-project.properties](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/sonar-project.properties)).
4. En Método de Análisis ("Choose your analysis method"), selecciona la opción **"Locally" / "With SonarQube Scanner"**.
5. Presiona **Generate Token (Generar Token)** (por ejemplo con el nombre `qa-scan-token`) y **copia y guarda tu token largo** en el portapapeles.

### Paso 2: Generar Pruebas de Cobertura y Ejecutar el Escaneo de Nube en PowerShell
En tu terminal de Windows posicionado en la raíz de la plataforma (`C:\Users\jjcha\Desktop\Proyectos\Distribuida`), ejecuta los siguientes dos comandos:

1. **Generar archivos de Cobertura (LCOV) de nuestras pruebas:**
   ```powershell
   npm run test -- --coverage
   ```

2. **Ejecutar el analizador conectado directamente a la nube oficial de Sonar:**
   ```powershell
   npx -y sonarqube-scanner -Dsonar.login="TU_TOKEN_DE_NUBE_COPIADO"
   ```
   *(Reemplaza `TU_TOKEN_DE_NUBE_COPIADO` por la cadena secreta que te generó la web de Sonar).*
   
   Al cabo de unos segundos en la consola verás la confirmación final: **`INFO: EXECUTION SUCCESS`**.

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

En cuanto finalice y veas el éxito en tu terminal, regresa a la pestaña de tu navegador en **SonarQube Cloud**, abre el proyecto de la plataforma y toma de forma obligatoria las 4 fotografías estandarizadas que documentan nuestra excelencia técnica en la carpeta [capturas](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/evidencias_qa/03_estaticas_sonarqube/capturas):

1. **`01_overview_quality_gate.png`** ➔ En la cabecera principal de tu proyecto en el portal en la nube, haz una captura grande y clara donde conste en un banner verde el mensaje triunfal **"Quality Gate: Passed"** (Aprobado), exponiendo tu puntuación en Grado "A" en Confiabilidad, Seguridad y Mantenibilidad sin bugs fatales.
2. **`02_coverage_porcentaje.png`** ➔ Presiona en la tarjeta circular de **Coverage (% de Cobertura / Unit Tests)** en el menú. Toma fotografía al panel donde se aprecie el porcentaje real del código en TypeScript testeado y los archivos evaluados.
3. **`03_deuda_tecnica_smells.png`** ➔ Abre el menú de **Maintainability (Mantenibilidad)** y saca foto al recuadro resumen de **Code Smells** y al medidor con el cálculo formal de **Technical Debt (Deuda Técnica)** estipulando el tiempo de refactorización mínima prevista.
4. **`04_seguridad_hotspots.png`** ➔ Accede a la pestaña **Security Hotspots (Puntos Críticos de Seguridad)** o **Vulnerabilities**. Toma la foto probando que nuestras funciones criptográficas y el código en el backend de Node/Postgres fueron verificados limpios por el motor en la nube.
