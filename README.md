# Huella Digital - Portafolio

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

---

## Solución: error de política de ejecución en Windows (PowerShell)

Si al ejecutar `npx` en PowerShell aparece este error:

```
npx : File C:\Program Files\nodejs\npx.ps1 cannot be loaded because running
scripts is disabled on this system.
```

Tienes tres opciones:

### Opción 1 — Habilitar scripts para tu usuario (recomendada)

Abre PowerShell **como administrador** y ejecuta:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego vuelve a intentar el comando original.

### Opción 2 — Usar CMD en lugar de PowerShell

Abre **Símbolo del sistema** (`cmd.exe`) o usa el archivo `setup.bat` incluido:

```cmd
setup.bat
```

### Opción 3 — Usar Node directamente

```cmd
node node_modules/.bin/npx <comando>
```

---

> **¿Por qué ocurre esto?**  
> Windows PowerShell tiene por defecto la política `Restricted`, que impide
> ejecutar archivos `.ps1` (incluido `npx.ps1` que instala Node.js).
> `RemoteSigned` solo exige firma en scripts descargados de internet, no en los
> locales, por lo que es seguro para desarrollo.
