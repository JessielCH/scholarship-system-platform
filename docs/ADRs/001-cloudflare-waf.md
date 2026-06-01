# ADR-001: Integración de Cloudflare WAF para el API Gateway

## Contexto
El sistema requiere protección contra ataques distribuidos de denegación de servicio (DDoS), filtrado de bots y protección contra el OWASP Top 10. Al desplegar nuestra infraestructura en el AWS Academy Learner Lab (con presupuesto limitado y sin acceso a ciertas herramientas premium de AWS), se requiere una capa externa de seguridad.

Adicionalmente, el dominio institucional o DNS aún no ha sido provisto al equipo de desarrollo, por lo que la configuración real no puede realizarse de forma inmediata.

## Decisión
Se decidió utilizar **Cloudflare WAF** en su capa gratuita/pro como escudo de seguridad externo al clúster de AWS, el cual actuará como proxy inverso y DNS global. 
- Todo el tráfico de los usuarios apuntará a los servidores DNS de Cloudflare.
- Cloudflare inspeccionará las solicitudes y detendrá ataques antes de que lleguen al Application Load Balancer (ALB) o instancias EC2 de Amazon.
- No se incluirá código Terraform para Cloudflare en el repositorio actual, ya que su configuración se realizará de manera manual desde el panel de control de Cloudflare cuando se nos provea el dominio final.
- El API Gateway validará internamente los tokens JWT, asumiendo que Cloudflare solo filtra peticiones HTTP/S maliciosas pero no maneja lógica de negocio o tokens asimétricos.

## Consecuencias
- **Positivo:** Protección a nivel global sin incurrir en costos de AWS Shield Advanced o AWS WAF que superarían los límites del Learner Lab.
- **Positivo:** Ahorro de recursos computacionales en la instancia EC2 del API Gateway al descartar tráfico basura en el borde (Edge).
- **Negativo:** Requiere configuración manual externa a la infraestructura GitOps (Terraform), lo cual disminuye ligeramente la automatización completa, pero se mitiga documentándolo en este ADR.
