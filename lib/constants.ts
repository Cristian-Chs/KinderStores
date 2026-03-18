export const SITE_NAME = "KinderStorePF";
export const SITE_DESCRIPTION = "Tu tienda favorita con los mejores productos escolares y de oficina.";

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+1234567890";

export const ADMIN_EMAILS = [
  "adminkinder@gmail.com",
  "cristian.adrian.chirinos2@gmail.com",
];

export const DEFAULT_CATEGORIES = [
  "Cuadernos",
  "Lápices y Colores",
  "Mochilas",
  "Arte y Manualidades",
  "Oficina",
  "Tecnología",
  "Accesorios",
];

export const NAV_LINKS = [
  { name: "Inicio", href: "/" },
  { name: "Más Vendidos", href: "/mas-vendidos" },
  { name: "Recientes", href: "/recientes" },
  { name: "Contáctanos", href: "/contactanos" },
];
