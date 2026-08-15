export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "officialmobronix@gmail.com";
export const WHATSAPP_CONTACT_MODE = process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_MODE || "whatsapp";

export function isWhatsAppMailtoMode() {
  return ["whatsapp-mailto", "whataap-maito", "mailto"].includes(WHATSAPP_CONTACT_MODE);
}

export function getContactHref(message = "Hi Mobronix, I need help with selling my device.") {
  const configuredNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const number = /^\d{10,15}$/.test(configuredNumber) ? configuredNumber : "917700902077";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getCustomerContactHref(phone: string, message: string) {
  if (isWhatsAppMailtoMode()) {
    const subject = encodeURIComponent("Mobronix customer update");
    const body = encodeURIComponent(message);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(message)}` : "#";
}

export function openContact(message?: string) {
  const href = getContactHref(message);
  if (href.startsWith("mailto:")) {
    window.location.href = href;
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}
