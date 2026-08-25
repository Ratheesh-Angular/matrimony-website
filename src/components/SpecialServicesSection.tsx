const SERVICES = [
  {
    num: "01",
    title: "ஆண்டுதோறும் வரன் தொகுப்பு மலர்",
    body: (
      <>
        ஆண்டுதோறும் தகுதியான வரன்களின் விவரங்களைத் தொகுத்து சிறப்பான{" "}
        <strong className="font-semibold text-[#9b1b2e]">வரன் தொகுப்பு மலர்</strong>{" "}
        வெளியிடுகிறோம்.
      </>
    ),
  },
  {
    num: "02",
    title: "பெற்றோர் & மங்கள சந்திப்புகள்",
    body: (
      <>
        வரன் தேடும் பெற்றோர்கள் ஒருவரையொருவர் சந்தித்து, திருமணத் தொடர்புகளை
        உருவாக்கும் வகையில்{" "}
        <strong className="font-semibold text-[#9b1b2e]">
          பெற்றோர் சந்திப்பு மற்றும் மங்கள சந்திப்பு நிகழ்ச்சிகளை
        </strong>{" "}
        முன்னெடுக்கிறோம்.
      </>
    ),
  },
  {
    num: "03",
    title: "மாவட்ட அளவிலான சேவை",
    body: (
      <>
        சென்னை, சேலம், திருநெல்வேலி, தூத்துக்குடி, புதுக்கோட்டை உள்ளிட்ட
        மாவட்டங்களில்{" "}
        <strong className="font-semibold text-[#9b1b2e]">
          வரன் அமைப்பாளர்கள் மூலமாக
        </strong>{" "}
        சிறப்பான திருமண சேவையை வழங்குகிறோம்.
      </>
    ),
  },
  {
    num: "04",
    title: "முதலியார் சமூகத்தின் குரல்",
    body: (
      <>
        முதலியார் சமூகத்தின் திருமணத் தேவைகளுக்காக தொடர்ந்து செயல்பட்டு வரும்{" "}
        <strong className="font-semibold text-[#9b1b2e]">
          நம்பகமான குரலாக சேக்கிழார் மணமாலை
        </strong>{" "}
        விளங்குகிறது.
      </>
    ),
  },
  {
    num: "05",
    title: "சமூக வலைத்தளங்கள் மூலமான சேவை",
    body: (
      <>
        பல்வேறு சமூக வலைத்தளங்களின் வாயிலாகவும் வரன் தகவல்களைப் பகிர்ந்து,{" "}
        <strong className="font-semibold text-[#9b1b2e]">
          பாதுகாப்பான மற்றும் எளிதான திருமணத் தேடல் அனுபவத்தை
        </strong>{" "}
        வழங்குகிறோம்.
      </>
    ),
  },
] as const;

export function SpecialServicesSection() {
  return (
    <section className="relative overflow-hidden border-y border-[#1a3a5c]/8 bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #d93025 0, transparent 45%), radial-gradient(circle at 80% 60%, #0056b3 0, transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-tamil text-xs font-semibold uppercase tracking-[0.2em] text-[#0056b3] animate-rise">
            சிறப்பு சேவைகள்
          </p>
          <h2 className="font-tamil mt-3 text-2xl font-bold text-[#d93025] sm:text-3xl animate-rise-delay">
            சேக்கிழார் மணமாலையின் சிறப்பு சேவைகள்
          </h2>
          <p className="font-tamil mt-4 text-base leading-relaxed text-[#1a3a5c]/85 sm:text-lg animate-rise-delay-2">
            உங்கள் திருமணத் தேடலை எளிமையாகவும், நம்பகமாகவும், சிறப்பாகவும்
            அமைக்க{" "}
            <strong className="font-semibold text-[#9b1b2e]">
              சேக்கிழார் மணமாலை
            </strong>{" "}
            வழங்கும் கூடுதல் சேவைகள்.
          </p>
        </div>

        <ul className="mt-10 grid gap-8 md:mt-12 md:grid-cols-2 md:gap-x-10 md:gap-y-12">
          {SERVICES.map((service, index) => (
            <li
              key={service.num}
              className={`border-l-2 border-[#9b1b2e]/40 pl-4 ${
                index === SERVICES.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <p className="font-display text-sm font-semibold tracking-wide text-[#9b1b2e]">
                {service.num}
              </p>
              <h3 className="font-tamil mt-2 text-lg font-bold text-[#1a3a5c] sm:text-xl">
                {service.title}
              </h3>
              <p className="font-tamil mt-2 text-base leading-relaxed text-[#1a3a5c]/80 sm:leading-7">
                {service.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
