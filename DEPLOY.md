# Guía de deploy — Arya Estética

Instrucciones para deployar en Railway desde cero.

---

## 1. Preparar el repositorio

```bash
# Asegurarse de que .env NO está commiteado
git status   # no debe aparecer .env

# Commitear todo lo demás
git add .
git commit -m "chore: preparar para deploy en Railway"
git push
```

---

## 2. Crear el proyecto en Railway

1. Ir a [railway.app](https://railway.app) → **New Project**
2. Elegir **Deploy from GitHub repo** → seleccionar este repositorio
3. Railway detecta Next.js automáticamente y usa `railway.toml`

---

## 3. Agregar el plugin de PostgreSQL

1. En el proyecto Railway → **+ New** → **Database** → **PostgreSQL**
2. Railway agrega `DATABASE_URL` automáticamente al servicio Next.js

---

## 4. Configurar variables de entorno

En el servicio Next.js → pestaña **Variables** → agregar:

| Variable | Valor |
|---|---|
| `AUTH_SECRET` | Resultado de `openssl rand -base64 32` |
| `AUTH_URL` | `https://TU-APP.up.railway.app` (URL del deploy) |
| `ADMIN_USERNAME` | `arya` |
| `ADMIN_PASSWORD` | Password elegido para el panel admin |
| `BUSINESS_WHATSAPP` | `5493764285491` |
| `PUBLIC_URL` | `https://TU-APP.up.railway.app` |
| `CRON_SECRET` | Resultado de `openssl rand -hex 32` |

> `DATABASE_URL` ya fue inyectada automáticamente en el paso 3.

---

## 5. Primer deploy

Railway dispara el build automáticamente al pushear o al guardar variables.

El build script hace:
```
prisma generate → prisma migrate deploy → next build
```

Verificar que el deploy termine sin errores en la pestaña **Deployments**.

---

## 6. Ejecutar el seed (una sola vez)

Desde la consola de Railway del servicio Next.js:

```bash
npm run seed
```

Esto carga:
- Los 63 servicios del catálogo
- El usuario admin (`arya` + password configurado)

> Si el seed falla con error de conexión, verificar que `DATABASE_URL` esté configurada correctamente.

---

## 7. Configurar el cron de recordatorios

El endpoint `POST /api/reminders/cron` debe llamarse **cada hora** para detectar turnos que necesitan recordatorio.

### Opción A — Cron interno de Railway (recomendada)

1. En el proyecto → **+ New** → **Cron Job**
2. Configurar:
   - **Schedule**: `0 * * * *` (cada hora en punto)
   - **Command**: 
     ```
     curl -s -X POST $PUBLIC_URL/api/reminders/cron \
       -H "x-cron-secret: $CRON_SECRET" \
       -H "Content-Type: application/json"
     ```
3. Agregar las variables `PUBLIC_URL` y `CRON_SECRET` al servicio Cron Job también

### Opción B — cron.job.io o similar (si no tenés plan con cron en Railway)

1. Crear cuenta en [cron-job.org](https://cron-job.org)
2. Crear un job con:
   - **URL**: `https://TU-APP.up.railway.app/api/reminders/cron`
   - **Método**: POST
   - **Header**: `x-cron-secret: TU_CRON_SECRET`
   - **Frecuencia**: cada 60 minutos

---

## 8. Verificar el deploy

Checklist final:

- [ ] `https://TU-APP.up.railway.app` carga la landing
- [ ] `/servicios` muestra el catálogo
- [ ] `/reservar` permite enviar un formulario
- [ ] `/admin/login` permite ingresar con `arya` + password
- [ ] `/admin/dashboard` muestra stats (aunque sean en 0)
- [ ] `/admin/gift-cards` lista vacía sin errores
- [ ] Descargar un PDF de gift card de prueba
- [ ] El endpoint del cron responde correctamente:
  ```bash
  curl -X POST https://TU-APP.up.railway.app/api/reminders/cron \
    -H "x-cron-secret: TU_CRON_SECRET"
  # Debe retornar: {"ok":true,"found":0,...}
  ```

---

## 9. Dominio personalizado (opcional)

En Railway → servicio Next.js → **Settings** → **Domains** → agregar dominio propio y configurar el DNS según las instrucciones de Railway.

Después de agregar el dominio, actualizar las variables:
- `AUTH_URL` → `https://tudominio.com`
- `PUBLIC_URL` → `https://tudominio.com`

Y volver a deployar.

---

## Comandos útiles post-deploy

```bash
# Ver logs en tiempo real
railway logs

# Ejecutar comando en el servidor
railway run npm run seed

# Abrir la DB con un cliente local
railway connect PostgreSQL
```
