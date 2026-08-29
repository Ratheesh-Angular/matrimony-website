import Image from "next/image";
import { formatAddress, type ProfilePublic } from "@/lib/profiles";
import { siteConfig } from "@/site.config";
import { SouthIndianChart } from "./SouthIndianChart";

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="grid border-b border-[var(--biodata-blue)] sm:grid-cols-[minmax(140px,38%)_1fr]">
      <div className="border-b border-[var(--biodata-blue)] bg-[var(--biodata-blue)]/5 px-3 py-2 font-tamil text-sm font-semibold text-[var(--biodata-blue)] sm:border-b-0 sm:border-r">
        {label}
      </div>
      <div className="px-3 py-2 font-medium text-[var(--biodata-red)]">{value}</div>
    </div>
  );
}

function joinParts(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" - ");
}

export function BiodataSheet({ profile }: { profile: ProfilePublic }) {
  const birth = joinParts(
    profile.dateOfBirth,
    profile.timeOfBirth,
    profile.birthPlace,
  );
  const star = joinParts(profile.nakshatram, profile.rasi, profile.lagnam);
  const heightColor = joinParts(profile.height, profile.complexion);
  const community = joinParts(profile.community, profile.gothram);
  const address = formatAddress(profile.address);

  return (
    <article
      id="biodata-sheet-print"
      className="biodata-sheet font-tamil mx-auto max-w-4xl overflow-hidden rounded-lg shadow-xl ring-1 ring-black/10"
      style={
        {
          "--biodata-blue": "#0056b3",
          "--biodata-red": "#d93025",
          "--biodata-cream": "#fffef8",
        } as React.CSSProperties
      }
    >
      <header className="border-b-2 border-[var(--biodata-blue)] bg-gradient-to-b from-white to-[var(--biodata-cream)] px-4 py-5 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[var(--biodata-red)]/30 bg-white sm:h-20 sm:w-20">
            <Image
              src={siteConfig.logoPath}
              alt=""
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-snug text-[var(--biodata-red)] sm:text-2xl md:text-3xl">
              {siteConfig.businessName}
            </h1>
            <p className="mt-1 text-sm font-semibold text-[var(--biodata-blue)] sm:text-base">
              அதிவேக டிஜிட்டல் வரன் பதிவு சேவை
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-y border-[var(--biodata-red)] py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-[var(--biodata-red)]">பதிவு தேதி</span>{" "}
            <span className="text-[var(--biodata-blue)]">{profile.registrationDate}</span>
          </p>
          <p className="text-[var(--biodata-blue)]">
            <span className="font-semibold">ஜாதக விவரம் :</span>{" "}
            ஆண் [{profile.gender === "male" ? "✓" : " "}] பெண் [
            {profile.gender === "female" ? "✓" : " "}]
          </p>
          <p>
            <span className="font-semibold text-[var(--biodata-red)]">பதிவு எண்</span>{" "}
            <span className="text-[var(--biodata-blue)]">{profile.registrationNumber}</span>
          </p>
        </div>
      </header>

      <div className="bg-[var(--biodata-cream)] px-3 py-4 sm:px-5">
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          {profile.photoUrl ? (
            <div className="order-1 mx-auto w-full max-w-[180px] shrink-0 overflow-hidden rounded border-2 border-[var(--biodata-blue)] md:order-2 md:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="order-2 flex-1 overflow-hidden rounded border border-[var(--biodata-blue)] md:order-1">
            <Row label="செல்வி / செல்வன்" value={profile.name} />
            <Row label="பிறந்த தேதி-நேரம்-ஊர்" value={birth} />
            <Row label="நட்சத்திரம் - ராசி - லக்னம்" value={star} />
            <Row label="கல்வித் தகுதி" value={profile.education || "—"} />
            <Row label="வேலை" value={profile.occupation} />
            <Row label="சம்பளம்" value={profile.salary} />
            <Row label="உயரம்-நிறம்" value={heightColor} />
            <Row label="பெற்றோர் விவரம்" value={profile.parents} />
            <Row label="உடன்பிறப்பு" value={profile.siblings} />
            <Row label="இனம் உட்பிரிவு / கோத்திரம்" value={community} />
            <Row label="முகவரி" value={address} />
            <Row label="தொடர்பு எண்" value={profile.contactNumber} />
            <Row label="எதிர்பார்ப்பு" value={profile.expectations} />
          </div>
        </div>

        <section className="mt-6 border-t-2 border-[var(--biodata-red)]/30 pt-6">
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <SouthIndianChart
              label="இராசி"
              chartId="rasi"
              houses={profile.horoscope.rasi}
              editable={false}
              showPalette={false}
            />
            <div className="max-w-[180px] text-center text-sm font-semibold leading-relaxed text-[var(--biodata-red)]">
              <p>ஜாதகம் தருவது எங்கள் கடமை</p>
              <p className="mt-3">பேசி, உறுதி செய்வது பெற்றோர் கடமை</p>
            </div>
            <SouthIndianChart
              label="அம்சம்"
              chartId="amsam"
              houses={profile.horoscope.amsam}
              editable={false}
              showPalette={false}
            />
          </div>
        </section>
      </div>
    </article>
  );
}
