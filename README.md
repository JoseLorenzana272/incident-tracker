# 🛡️ Incident Tracker API

Sistema de reportes de incidentes de seguridad para ONGs, periodistas y activistas.  
Construido para la demo de la conferencia *"De localhost a producción seguro"*.

---

## Stack

- **Node.js 20** + **Express 4**
- **JWT** para autenticación
- **Roles**: `admin` / `reporter`
- **In-memory store** (sin base de datos externa — perfecto para demo)
- **Docker** con multi-stage build y non-root user
- **GitHub Actions** con TruffleHog + tests + push a GHCR

---

## Quickstart local

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/incident-tracker
cd incident-tracker

# 2. Variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 3. Instalar y correr
npm install
npm start
```

---

## Flujo de demo para clase (secreto hardcodeado)

El proyecto ya trae un toggle listo en [src/app.js](src/app.js):

1. Abre [src/app.js](src/app.js)
2. Busca esta linea comentada:

```js
// process.env.JWT_SECRET = 'sk_live_demo_hardcoded_secret_do_not_use';
```

3. Para provocar el fallo de seguridad en CI, descomenta la linea, haz commit y push
4. TruffleHog debe marcar el pipeline en rojo
5. Para arreglarlo, vuelve a comentar la linea y usa `JWT_SECRET` desde `.env` o GitHub Secrets
6. Haz push otra vez y verifica pipeline en verde

Este flujo esta disenado para mostrar DevSecOps de forma visual en vivo.

---

## 🚀 Despliegue a Producción (Render)

Para el paso final de la conferencia (Continuous Deployment completo), puedes conectar este repo a [Render.com](https://render.com) gratis:

1. Ve a Render.com y crea un nuevo **"Web Service"**.
2. Elige **"Deploy an existing image from a registry"**.
3. Pon la imagen URL: `ghcr.io/TU_USUARIO/incident-tracker:latest`.
4. En **Environment Variables**, añade:
   - `JWT_SECRET` (un valor seguro)
   - `ADMIN_SECRET` (un valor seguro)
   - `PORT` = `3000`
5. En la configuración del servicio, copia tu **Deploy Hook URL**.
6. Ve a Github \> *Settings \> Secrets and variables \> Actions \> New repository secret*. 
7. Nómbralo `RENDER_DEPLOY_HOOK` y pega tu URL de Render.

¡Listo! Cuando la demo avance y Github Actions haga el build, automáticamente le avisará a Render para que se actualice y quede viva con una URL pública para los asistentes.

---

## Quickstart con Docker

```bash
# Construir imagen
docker build -t incident-tracker:v1 .

# Correr con variables de entorno
docker run -p 3000:3000 --env-file .env incident-tracker:v1

# Ver logs
docker logs -f <container_id>
```

---

## Endpoints

| Método | Ruta                        | Auth     | Rol      |
|--------|-----------------------------|----------|----------|
| GET    | `/health`                   | No       | —        |
| POST   | `/auth/register`            | No       | —        |
| POST   | `/auth/login`               | No       | —        |
| GET    | `/incidents`                | Sí       | any      |
| GET    | `/incidents/:id`            | Sí       | any      |
| POST   | `/incidents`                | Sí       | any      |
| PUT    | `/incidents/:id/status`     | Sí       | admin    |
| GET    | `/admin/stats`              | Sí       | admin    |
| GET    | `/admin/users`              | Sí       | admin    |

---

## Usuarios seed (para la demo)

| Email             | Password      | Rol      |
|-------------------|---------------|----------|
| admin@ngo.org     | Admin@12345   | admin    |
| maria@ngo.org     | Reporter@1    | reporter |

---

## Ejemplo de flujo

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@ngo.org","password":"Reporter@1"}'

# Crear incidente (usa el token recibido)
curl -X POST http://localhost:3000/incidents \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Corte de internet","description":"Zona rural sin señal","location":"Municipio X","severity":"high"}'

# Ver estadísticas (admin)
curl http://localhost:3000/admin/stats \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

---

## Tests

```bash
npm test              # Correr tests
npm test -- --coverage  # Con reporte de cobertura
```

---

## Variables de entorno requeridas

| Variable       | Descripción                              |
|----------------|------------------------------------------|
| `JWT_SECRET`   | Secreto para firmar tokens JWT           |
| `ADMIN_SECRET` | Llave para registrar usuarios admin      |
| `PORT`         | Puerto del servidor (default: 3000)      |
| `NODE_ENV`     | `development` / `production` / `test`    |

> ⚠️ **NUNCA** pongas valores reales en el código. Usa siempre variables de entorno.
