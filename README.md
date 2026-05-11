# Proyecto Carteras Front

Este es un proyecto de Next.js 15 para una tienda de comercio electrónico y su panel de administración.

## Requisitos Previos

- Node.js (versión 18 o superior recomendada)
- `pnpm` (gestor de paquetes)
- Base de datos (PostgreSQL, MySQL, etc. según la configuración de Prisma)

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/arcanight-dev/ProyectoCarterasFront.git
   cd ProyectoCarterasFront
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar las variables de entorno:**
   Copia el archivo `.env.example` a `.env` (si existe) o crea un archivo `.env` en la raíz del proyecto y configura tus variables, en especial la URL de la base de datos:
   ```env
   DATABASE_URL="tu_url_de_base_de_datos"
   ```

4. **Configurar la base de datos con Prisma:**
   Sincroniza el esquema de Prisma con tu base de datos y genera el cliente:
   ```bash
   pnpm run db:push
   npx prisma generate
   ```

## Ejecutar el Proyecto

Para iniciar el servidor de desarrollo, ejecuta:
```bash
pnpm run dev
```

El proyecto estará disponible en:
- **Tienda Pública:** [http://localhost:3000](http://localhost:3000)
- **Panel de Administración:** [http://localhost:3000/admin](http://localhost:3000/admin)

## Comandos Útiles

- `pnpm run dev`: Inicia el servidor de desarrollo.
- `pnpm run build`: Construye la aplicación para producción.
- `pnpm run start`: Inicia el servidor de producción.
- `pnpm run db:studio`: Abre Prisma Studio para explorar la base de datos visualmente.
