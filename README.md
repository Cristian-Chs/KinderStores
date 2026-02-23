# KinderStore — E-commerce de Papelería

Bienvenido a **KinderStore**, una plataforma de comercio electrónico moderna y minimalista diseñada para papelerías y tiendas de útiles escolares. Construida con tecnologías de vanguardia para ofrecer una experiencia rápida, fluida y profesional.

## Características Principales

- **Diseño Glassmorphism**: Interfaz moderna con efectos de cristal, degradados elegantes (Púrpura a Rosa) y animaciones fluidas.
- **Catálogo Dinámico**: Visualización de productos con filtrado por categorías en tiempo real.
- **Autenticación Completa**: Registro e inicio de sesión seguro mediante Firebase (Correo/Contraseña y Google).
- **Panel Administrativo Inline**: Los administradores pueden gestionar productos (crear, editar, eliminar) directamente desde la tienda.
- **Carrito de Compras**: Sistema persistente para gestionar pedidos.
- **Checkout vía WhatsApp**: Finalización de compra optimizada enviando el resumen del pedido directamente al vendedor vía WhatsApp.
- **Imágenes Versátiles**: Soporte para imágenes locales y externas, evitando la necesidad de planes de pago adicionales.

## Tecnologías

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / DB**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **Lenguaje**: TypeScript

## Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1. **Clona el repositorio**:

   ```bash
   git clone [url-del-repo]
   cd Kinderpapeleria
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Firebase:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_bucket.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   NEXT_PUBLIC_WHATSAPP_NUMBER=+584246188448
   ```

4. **Inicia el servidor de desarrollo**:

   ```bash
   npm run dev
   ```
