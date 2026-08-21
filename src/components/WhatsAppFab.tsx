import Link from "next/link";
import { siteConfig } from "@/site.config";
import { buildWhatsappUrl } from "@/lib/site-data";

export function WhatsAppFab({ number }: { number: string }) {
  if (!siteConfig.features.whatsapp || !number) return null;

  const href = buildWhatsappUrl(number);

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:brightness-110"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M20.5 3.5A11.9 11.9 0 0 0 12.05 0C5.5 0 .2 5.3.2 11.85c0 2.1.55 4.1 1.6 5.9L0 24l6.4-1.68a11.8 11.8 0 0 0 5.65 1.44h.01c6.55 0 11.85-5.3 11.85-11.85 0-3.17-1.23-6.15-3.46-8.41ZM12.05 21.3h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.8 1 1.01-3.7-.24-.38a9.8 9.8 0 0 1-1.5-5.25c0-5.4 4.4-9.8 9.85-9.8a9.75 9.75 0 0 1 9.8 9.8c0 5.4-4.4 9.8-9.75 9.8Zm5.4-7.35c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </Link>
  );
}
