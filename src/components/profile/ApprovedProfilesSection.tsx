import { getNameInitial } from "@/lib/name-initial";
import { getApprovedProfiles } from "@/lib/profiles";
import { siteConfig } from "@/site.config";

export async function ApprovedProfilesSection() {
  let profiles: Awaited<ReturnType<typeof getApprovedProfiles>> = [];
  try {
    profiles = await getApprovedProfiles(12);
  } catch {
    profiles = [];
  }

  const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "வணக்கம் சேக்கிழார் மாணாமலை! உங்கள் இணையதளத்தில் உள்ள அங்கீகரிக்கப்பட்ட வரனில் நான் ஆர்வம் கொண்டுள்ளேன். மேலும் விவரங்கள் தெரிந்துகொள்ள உதவுங்கள்.",
  )}`;

  return (
    <section
      id="approved-profiles"
      className="border-y border-black/5 bg-[linear-gradient(165deg,#fffef8_0%,#f8f1e4_50%,#e8f0fa_100%)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <h2 className="font-tamil text-2xl font-bold text-[#d93025] sm:text-3xl">
            அங்கீகரிக்கப்பட்ட வரன்கள்
          </h2>
          <p className="mt-2 text-sm text-[#0056b3] sm:text-base">
            Approved profiles · verified by our team
          </p>
        </header>

        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-[#0056b3]/15 bg-white/80 px-6 py-14 text-center shadow-sm">
            <p className="font-tamil text-lg text-[#0056b3]">
              விரைவில் அங்கீகரிக்கப்பட்ட வரன்கள் பதிவேற்றப்படும்
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Approved profiles will appear here once reviewed.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <li
                key={p._id}
                className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-[#0056b3]/10 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#e8f0fa] to-[#f8f1e4]">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center font-tamil text-4xl font-bold text-[#0056b3]/25"
                      suppressHydrationWarning
                    >
                      {getNameInitial(p.name)}
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-xs font-bold text-white ${
                      p.gender === "female" ? "bg-rose-500" : "bg-[#0056b3]"
                    }`}
                  >
                    {p.gender === "female" ? "பெண்" : "ஆண்"}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    Approved
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="font-tamil text-lg font-bold text-[#d93025]">{p.name}</p>
                  <p className="text-xs font-semibold text-[#0056b3]">
                    {p.registrationNumber} · {p.registrationDate}
                  </p>
                  {(p.nakshatram || p.rasi) && (
                    <p className="text-sm text-slate-700">
                      {[p.nakshatram, p.rasi].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {p.education ? (
                    <p className="text-sm text-slate-600">{p.education}</p>
                  ) : null}
                  {p.occupation ? (
                    <p className="line-clamp-2 text-sm text-slate-500">{p.occupation}</p>
                  ) : null}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Contact for details
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* {profiles.length > 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            For full biodata access,{" "}
            <Link href="/admin/login" className="font-semibold text-[#0056b3] hover:underline">
              sign in to profile details
            </Link>
            .
          </p>
        ) : null} */}
      </div>
    </section>
  );
}
