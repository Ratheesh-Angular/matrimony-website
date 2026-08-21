"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { emptyChart, formatRegistrationDate, PLANETS } from "@/lib/biodata";
import { siteConfig } from "@/site.config";
import {
  findChartDropTarget,
  placePlanetInChart,
  removePlanetFromChart,
  SouthIndianChart,
  type ChartDragPayload,
  type ChartDropTarget,
} from "./SouthIndianChart";

type FormState = {
  gender: "male" | "female";
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  nakshatram: string;
  rasi: string;
  lagnam: string;
  education: string;
  occupation: string;
  salary: string;
  height: string;
  complexion: string;
  fatherName: string;
  motherName: string;
  siblings: string;
  community: string;
  gothram: string;
  doorNo: string;
  street: string;
  village: string;
  taluk: string;
  district: string;
  pincode: string;
  contactNumber: string;
  expectations: string;
  photoUrl: string;
  rasiChart: string[][];
  amsamChart: string[][];
};

const initial: FormState = {
  gender: "male",
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  birthPlace: "",
  nakshatram: "",
  rasi: "",
  lagnam: "",
  education: "",
  occupation: "",
  salary: "",
  height: "",
  complexion: "",
  fatherName: "",
  motherName: "",
  siblings: "",
  community: "",
  gothram: "",
  doorNo: "",
  street: "",
  village: "",
  taluk: "",
  district: "",
  pincode: "",
  contactNumber: "",
  expectations: "",
  photoUrl: "",
  rasiChart: emptyChart(),
  amsamChart: emptyChart(),
};

const COACHMARK_KEY = "biodata-jathagam-drag-tip-dismissed";

const sheetVars = {
  "--biodata-blue": "#1a3a5c",
  "--biodata-red": "#9b1b2e",
  "--biodata-cream": "#fbf8f4",
  "--biodata-gold": "#b8954a",
  "--biodata-ink": "#2c1810",
} as React.CSSProperties;

const inputClass =
  "w-full min-h-11 bg-white px-3 py-2.5 text-sm text-[var(--biodata-ink)] outline-none placeholder:text-[var(--biodata-blue)]/40 transition focus:bg-[var(--biodata-cream)] focus:ring-2 focus:ring-[var(--biodata-gold)]/45 focus:ring-inset";

const cellInputClass =
  "w-full min-h-11 bg-transparent px-3 py-2.5 text-sm text-[var(--biodata-ink)] outline-none placeholder:text-[var(--biodata-blue)]/40 transition focus:bg-[var(--biodata-cream)] focus:ring-2 focus:ring-[var(--biodata-gold)]/45 focus:ring-inset";

const selectClass = `${cellInputClass} appearance-none cursor-pointer`;

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function daysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function parseDob(iso: string): { year: string; month: string; day: string } {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { year: "", month: "", day: "" };
  }
  const [year, month, day] = iso.split("-");
  return { year, month, day };
}

function joinParents(father: string, mother: string): string {
  return [father.trim(), mother.trim()].filter(Boolean).join(" - ");
}

function FieldRow({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid border-b border-[var(--biodata-blue)]/15 last:border-b-0 sm:grid-cols-[minmax(150px,36%)_1fr] ${className}`}
    >
      <div className="border-b border-[var(--biodata-blue)]/10 bg-[var(--biodata-blue)]/[0.04] px-3.5 py-2.5 font-tamil text-sm font-semibold text-[var(--biodata-blue)] sm:border-b-0 sm:border-r sm:border-[var(--biodata-blue)]/15">
        {label}
      </div>
      <div className="bg-white/80 p-1.5 sm:p-2">{children}</div>
    </div>
  );
}

function SplitFields({
  cols,
  children,
}: {
  cols: 2 | 3;
  children: React.ReactNode;
}) {
  const colClass =
    cols === 3
      ? "sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      : "sm:grid-cols-2 sm:divide-x sm:divide-y-0";

  return (
    <div
      className={`grid divide-y divide-[var(--biodata-blue)]/15 overflow-hidden rounded-lg border border-[var(--biodata-blue)]/20 bg-white ${colClass} sm:divide-[var(--biodata-blue)]/15`}
    >
      {children}
    </div>
  );
}

function BirthDateSelects({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= 1940; y--) list.push(y);
    return list;
  }, [currentYear]);

  const [partial, setPartial] = useState(() => parseDob(value));

  useEffect(() => {
    if (!value) return;
    setPartial(parseDob(value));
  }, [value]);

  function setPart(key: "year" | "month" | "day", val: string) {
    const next = { ...partial, [key]: val };
    if (next.year && next.month && next.day) {
      const max = daysInMonth(Number(next.year), Number(next.month));
      if (Number(next.day) > max) {
        next.day = String(max).padStart(2, "0");
      }
    }
    setPartial(next);
    if (next.year && next.month && next.day) {
      onChange(`${next.year}-${next.month}-${next.day}`);
    } else {
      onChange("");
    }
  }

  const dayOptions = Array.from(
    {
      length: daysInMonth(
        Number(partial.year) || 2000,
        Number(partial.month) || 1,
      ),
    },
    (_, i) => String(i + 1).padStart(2, "0"),
  );

  return (
    <div className="grid grid-cols-3 divide-x divide-[var(--biodata-blue)]/15">
      <select
        aria-label="Year of birth"
        value={partial.year}
        onChange={(e) => setPart("year", e.target.value)}
        className={selectClass}
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        aria-label="Month of birth"
        value={partial.month}
        onChange={(e) => setPart("month", e.target.value)}
        className={selectClass}
      >
        <option value="">Month</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Day of birth"
        value={partial.day}
        onChange={(e) => setPart("day", e.target.value)}
        className={selectClass}
      >
        <option value="">Day</option>
        {dayOptions.map((d) => (
          <option key={d} value={d}>
            {Number(d)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MarriageBiodataForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");
  const [regNo, setRegNo] = useState("");
  const [previewRegNo, setPreviewRegNo] = useState("SEKM01");
  const [uploading, setUploading] = useState(false);
  const [activeChart, setActiveChart] = useState<"rasi" | "amsam">("rasi");
  const [activeDrag, setActiveDrag] = useState<ChartDragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<ChartDropTarget | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [showCoachmark, setShowCoachmark] = useState(false);
  const dragMoved = useRef(false);

  const today = useMemo(() => formatRegistrationDate(), []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profiles/next-registration")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.registrationNumber) {
          setPreviewRegNo(json.registrationNumber);
        }
      })
      .catch(() => {
        /* keep SEKM01 fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(COACHMARK_KEY)) {
        setShowCoachmark(true);
      }
    } catch {
      setShowCoachmark(true);
    }
  }, []);

  useEffect(() => {
    if (!activeDrag) return;

    function onMove(e: PointerEvent) {
      dragMoved.current = true;
      setGhostPos({ x: e.clientX, y: e.clientY });
      setDropTarget(findChartDropTarget(e.clientX, e.clientY));
    }

    function onUp(e: PointerEvent) {
      const target = findChartDropTarget(e.clientX, e.clientY);
      const drag = activeDrag;

      if (drag && target) {
        // Move within the same chart; place (copy) when dropping from palette or the other chart
        const fromHouse =
          drag.chartId === target.chartId ? drag.fromHouse : undefined;
        if (target.chartId === "rasi") {
          setForm((prev) => ({
            ...prev,
            rasiChart: placePlanetInChart(
              prev.rasiChart,
              target.house,
              drag.code,
              fromHouse,
            ),
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            amsamChart: placePlanetInChart(
              prev.amsamChart,
              target.house,
              drag.code,
              fromHouse,
            ),
          }));
        }
      } else if (drag?.fromHouse != null && drag.chartId && dragMoved.current) {
        if (drag.chartId === "rasi") {
          setForm((prev) => ({
            ...prev,
            rasiChart: removePlanetFromChart(
              prev.rasiChart,
              drag.fromHouse!,
              drag.code,
            ),
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            amsamChart: removePlanetFromChart(
              prev.amsamChart,
              drag.fromHouse!,
              drag.code,
            ),
          }));
        }
      }

      setActiveDrag(null);
      setDropTarget(null);
      setGhostPos(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [activeDrag]);

  function startPlanetDrag(e: React.PointerEvent, payload: ChartDragPayload) {
    e.preventDefault();
    e.stopPropagation();
    dragMoved.current = false;
    setActiveDrag(payload);
    setGhostPos({ x: e.clientX, y: e.clientY });
  }

  function dismissCoachmark() {
    setShowCoachmark(false);
    try {
      localStorage.setItem(COACHMARK_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function onPhotoChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profiles/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      set("photoUrl", json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const payload = {
      gender: form.gender,
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      timeOfBirth: form.timeOfBirth,
      birthPlace: form.birthPlace.trim(),
      nakshatram: form.nakshatram.trim(),
      rasi: form.rasi.trim(),
      lagnam: form.lagnam.trim(),
      education: form.education.trim(),
      occupation: form.occupation.trim(),
      salary: form.salary.trim(),
      height: form.height.trim(),
      complexion: form.complexion.trim(),
      parents: joinParents(form.fatherName, form.motherName),
      siblings: form.siblings.trim(),
      community: form.community.trim(),
      gothram: form.gothram.trim(),
      address: {
        doorNo: form.doorNo.trim(),
        street: form.street.trim(),
        village: form.village.trim(),
        taluk: form.taluk.trim(),
        district: form.district.trim(),
        pincode: form.pincode.trim(),
      },
      contactNumber: form.contactNumber.trim(),
      expectations: form.expectations.trim(),
      photoUrl: form.photoUrl,
      horoscope: {
        rasi: form.rasiChart,
        amsam: form.amsamChart,
      },
    };

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setSavedId(json.id);
      setRegNo(json.registrationNumber);
      setStatus("success");
      setForm(initial);
      setActiveDrag(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  if (status === "success" && savedId) {
    return (
      <div
        className="biodata-sheet mx-auto max-w-3xl rounded-2xl px-6 py-12 text-center shadow-lg ring-1 ring-[var(--biodata-gold)]/25"
        style={sheetVars}
      >
        <p className="font-tamil text-2xl font-bold text-[var(--biodata-red)]">
          பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது!
        </p>
        <p className="mt-2 text-[var(--biodata-blue)]">
          Registration saved · {regNo}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/profile-details/${savedId}`}
            className="rounded-lg bg-[var(--biodata-red)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            View biodata
          </Link>
          <Link
            href="/profile-details"
            className="rounded-lg border border-[var(--biodata-blue)]/30 px-5 py-2.5 text-sm font-semibold text-[var(--biodata-blue)] transition hover:bg-white"
          >
            All profiles
          </Link>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setSavedId("");
              setRegNo("");
            }}
            className="rounded-lg bg-[var(--biodata-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="biodata-sheet font-tamil mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-[0_20px_50px_-24px_rgba(44,24,16,0.35)] ring-1 ring-[var(--biodata-gold)]/30"
      style={sheetVars}
    >
      {ghostPos && activeDrag ? (
        <div
          className="pointer-events-none fixed z-[100] rounded-lg border border-[var(--biodata-red)] bg-white px-2.5 py-1.5 text-sm font-bold text-[var(--biodata-red)] shadow-lg"
          style={{
            left: ghostPos.x + 12,
            top: ghostPos.y + 12,
          }}
        >
          {activeDrag.code}
        </div>
      ) : null}

      {/* Header */}
      <header className="relative overflow-hidden border-b border-[var(--biodata-gold)]/35 bg-gradient-to-br from-white via-[var(--biodata-cream)] to-[#f3ebe0] px-4 py-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--biodata-gold)] to-transparent"
          aria-hidden
        />
        <div className="flex items-center gap-3.5 sm:gap-5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-black shadow-md ring-2 ring-[var(--biodata-gold)]/50 sm:h-[4.5rem] sm:w-[4.5rem]">
            <Image
              src={siteConfig.logoPath}
              alt=""
              fill
              className="object-cover"
              sizes="72px"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-snug tracking-tight text-[var(--biodata-red)] sm:text-2xl md:text-3xl">
              {siteConfig.businessName}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[var(--biodata-blue)] sm:mt-1 sm:text-base">
              அதிவேக டிஜிட்டல் வரன் பதிவு சேவை
            </p>
            <p className="mt-1 text-[11px] text-[var(--biodata-blue)]/75 sm:text-sm">
              {siteConfig.contact.phone}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--biodata-gold)]/25 bg-white/70 p-3 backdrop-blur-sm sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4 sm:py-3">
          <p className="text-sm">
            <span className="font-semibold text-[var(--biodata-red)]">பதிவு தேதி</span>{" "}
            <span className="text-[var(--biodata-blue)]">{today}</span>
          </p>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Gender</legend>
            <span className="text-sm font-semibold text-[var(--biodata-blue)]">ஜாதக விவரம்</span>
            <div className="inline-flex overflow-hidden rounded-lg border border-[var(--biodata-blue)]/20 bg-[var(--biodata-cream)] p-0.5">
              <label
                className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${
                  form.gender === "male"
                    ? "bg-[var(--biodata-red)] text-white shadow-sm"
                    : "text-[var(--biodata-blue)] hover:bg-white/80"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  required
                  checked={form.gender === "male"}
                  onChange={() => set("gender", "male")}
                  className="sr-only"
                />
                ஆண்
              </label>
              <label
                className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${
                  form.gender === "female"
                    ? "bg-[var(--biodata-red)] text-white shadow-sm"
                    : "text-[var(--biodata-blue)] hover:bg-white/80"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === "female"}
                  onChange={() => set("gender", "female")}
                  className="sr-only"
                />
                பெண்
              </label>
            </div>
          </fieldset>
          <p className="text-sm">
            <span className="font-semibold text-[var(--biodata-red)]">பதிவு எண்</span>{" "}
            <span className="font-semibold tracking-wide text-[var(--biodata-blue)]">
              {previewRegNo}
            </span>
          </p>
        </div>
      </header>

      <div className="bg-[var(--biodata-cream)] px-3 py-4 sm:px-5 sm:py-5">
        {/* Photo + top fields: stacked on mobile, side-by-side from md */}
        <div className="mb-4 flex flex-col items-stretch gap-3 md:flex-row md:items-start md:gap-4">
          <div className="order-1 mx-auto w-36 shrink-0 sm:w-40 md:order-2 md:mx-0 md:w-36">
            <label className="flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--biodata-blue)]/35 bg-white shadow-sm transition hover:border-[var(--biodata-red)]/60 hover:shadow-md">
              {form.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-1.5 text-center text-xs leading-tight text-[var(--biodata-blue)]/70">
                  {uploading ? "…" : "புகைப்படம்"}
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => onPhotoChange(e.target.files?.[0] || null)}
              />
            </label>
            {form.photoUrl ? (
              <button
                type="button"
                className="mt-1.5 w-full text-xs text-[var(--biodata-red)] underline"
                onClick={() => set("photoUrl", "")}
              >
                Remove
              </button>
            ) : null}
          </div>

          <div className="order-2 min-w-0 w-full flex-1 overflow-hidden rounded-xl border border-[var(--biodata-blue)]/20 bg-white shadow-sm ring-1 ring-[var(--biodata-gold)]/10 md:order-1">
            <FieldRow label="செல்வி / செல்வன்">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Full name"
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="பிறந்த தேதி-நேரம்">
              <SplitFields cols={2}>
                <BirthDateSelects
                  value={form.dateOfBirth}
                  onChange={(iso) => set("dateOfBirth", iso)}
                />
                <input
                  type="time"
                  value={form.timeOfBirth}
                  onChange={(e) => set("timeOfBirth", e.target.value)}
                  className={cellInputClass}
                  aria-label="Time of birth"
                />
              </SplitFields>
            </FieldRow>
            <FieldRow label="பிறந்த ஊர்">
              <input
                value={form.birthPlace}
                onChange={(e) => set("birthPlace", e.target.value)}
                placeholder="Birth place"
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="நட்சத்திரம் - ராசி - லக்னம்">
              <SplitFields cols={3}>
                <input
                  value={form.nakshatram}
                  onChange={(e) => set("nakshatram", e.target.value)}
                  placeholder="Nakshatram"
                  className={cellInputClass}
                />
                <input
                  value={form.rasi}
                  onChange={(e) => set("rasi", e.target.value)}
                  placeholder="Rasi"
                  className={cellInputClass}
                />
                <input
                  value={form.lagnam}
                  onChange={(e) => set("lagnam", e.target.value)}
                  placeholder="Lagnam"
                  className={cellInputClass}
                />
              </SplitFields>
            </FieldRow>
            <FieldRow label="கல்வித் தகுதி">
              <input
                value={form.education}
                onChange={(e) => set("education", e.target.value)}
                placeholder="Education"
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="வேலை">
              <input
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                placeholder="Occupation"
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="சம்பளம்">
              <input
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="Salary (INR)"
                inputMode="numeric"
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="உயரம்-நிறம்">
              <SplitFields cols={2}>
                <input
                  value={form.height}
                  onChange={(e) => set("height", e.target.value)}
                  placeholder='Height e.g. 5.6"'
                  className={cellInputClass}
                />
                <input
                  value={form.complexion}
                  onChange={(e) => set("complexion", e.target.value)}
                  placeholder="Skin color"
                  className={cellInputClass}
                />
              </SplitFields>
            </FieldRow>
            <FieldRow label="பெற்றோர் விவரம்">
              <SplitFields cols={2}>
                <input
                  value={form.fatherName}
                  onChange={(e) => set("fatherName", e.target.value)}
                  placeholder="Father name"
                  className={cellInputClass}
                />
                <input
                  value={form.motherName}
                  onChange={(e) => set("motherName", e.target.value)}
                  placeholder="Mother name"
                  className={cellInputClass}
                />
              </SplitFields>
            </FieldRow>
            <FieldRow label="உடன்பிறப்பு">
              <input
                value={form.siblings}
                onChange={(e) => set("siblings", e.target.value)}
                placeholder="Brother / Sister / etc."
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="இனம் உட்பிரிவு / கோத்திரம்">
              <SplitFields cols={2}>
                <input
                  value={form.community}
                  onChange={(e) => set("community", e.target.value)}
                  placeholder="Community"
                  className={cellInputClass}
                />
                <input
                  value={form.gothram}
                  onChange={(e) => set("gothram", e.target.value)}
                  placeholder="Gothram"
                  className={cellInputClass}
                />
              </SplitFields>
            </FieldRow>
            <FieldRow label="முகவரி">
              <div className="grid overflow-hidden rounded-lg border border-[var(--biodata-blue)]/20 bg-white sm:grid-cols-2">
                <input
                  value={form.doorNo}
                  onChange={(e) => set("doorNo", e.target.value)}
                  placeholder="Door no"
                  className={`${cellInputClass} border-b border-[var(--biodata-blue)]/15 sm:border-r`}
                />
                <input
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                  placeholder="Street"
                  className={`${cellInputClass} border-b border-[var(--biodata-blue)]/15`}
                />
                <input
                  value={form.village}
                  onChange={(e) => set("village", e.target.value)}
                  placeholder="Village / Town"
                  className={`${cellInputClass} border-b border-[var(--biodata-blue)]/15 sm:border-r`}
                />
                <input
                  value={form.taluk}
                  onChange={(e) => set("taluk", e.target.value)}
                  placeholder="Taluk"
                  className={`${cellInputClass} border-b border-[var(--biodata-blue)]/15`}
                />
                <input
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  placeholder="District"
                  className={`${cellInputClass} border-b border-[var(--biodata-blue)]/15 sm:border-b-0 sm:border-r`}
                />
                <input
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  placeholder="Pincode"
                  className={`${cellInputClass} border-b-0`}
                />
              </div>
            </FieldRow>
            <FieldRow label="தொடர்பு எண்">
              <input
                required
                value={form.contactNumber}
                onChange={(e) => set("contactNumber", e.target.value)}
                placeholder="Mobile number"
                inputMode="tel"
                className={`${inputClass} rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
            <FieldRow label="எதிர்பார்ப்பு" className="border-b-0">
              <textarea
                rows={4}
                value={form.expectations}
                onChange={(e) => set("expectations", e.target.value)}
                placeholder="Expectations / partner preferences"
                className={`${inputClass} resize-y rounded-lg border border-[var(--biodata-blue)]/15`}
              />
            </FieldRow>
          </div>
        </div>

        {/* Charts */}
        <section className="relative mt-6 rounded-xl border border-[var(--biodata-gold)]/20 bg-white/60 px-3 py-5 sm:px-5 sm:py-6">
          <h3 className="mb-1 text-center text-lg font-bold tracking-tight text-[var(--biodata-red)]">
            ஜாதகம்
          </h3>
          <p className="mb-4 text-center text-xs text-[var(--biodata-blue)]/80">
            கிரகத்தை இழுத்து வீட்டில் விடவும் · Drag a planet onto a house
          </p>

          <div className="relative mb-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {PLANETS.map((p) => {
                const dragging =
                  activeDrag?.code === p.code && activeDrag.fromHouse == null;
                return (
                  <button
                    key={p.code}
                    type="button"
                    title={p.label}
                    onPointerDown={(e) => startPlanetDrag(e, { code: p.code })}
                    className={`min-h-10 min-w-10 touch-none rounded-lg border px-2 py-1.5 text-sm font-semibold transition ${
                      dragging
                        ? "border-[var(--biodata-red)] bg-[var(--biodata-red)] text-white opacity-50 shadow-sm"
                        : "border-[var(--biodata-blue)]/25 bg-white text-[var(--biodata-red)] hover:border-[var(--biodata-gold)]/50 hover:bg-[var(--biodata-cream)]"
                    }`}
                  >
                    {p.code}
                  </button>
                );
              })}
            </div>

            {showCoachmark ? (
              <div className="absolute left-1/2 top-full z-20 mt-2 w-[min(100%,280px)] -translate-x-1/2 rounded-xl border border-[var(--biodata-gold)]/40 bg-white p-3 shadow-lg ring-1 ring-[var(--biodata-blue)]/10">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--biodata-cream)] text-[var(--biodata-red)]"
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 12h8M12 8l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="3"
                        y="6"
                        width="6"
                        height="6"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <p className="text-xs font-semibold leading-snug text-[var(--biodata-blue)]">
                    Hold & drag a planet chip onto இராசி or அம்சம்
                  </p>
                </div>
                <p className="mb-3 text-[11px] leading-relaxed text-[var(--biodata-blue)]/70">
                  Tap a placed planet to remove it.
                </p>
                <button
                  type="button"
                  onClick={dismissCoachmark}
                  className="w-full rounded-lg bg-[var(--biodata-red)] px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                >
                  Got it
                </button>
              </div>
            ) : null}
          </div>

          <div className="mb-4 flex justify-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setActiveChart("rasi")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeChart === "rasi"
                  ? "bg-[var(--biodata-red)] text-white shadow-sm"
                  : "border border-[var(--biodata-blue)]/25 bg-white text-[var(--biodata-blue)]"
              }`}
            >
              இராசி
            </button>
            <button
              type="button"
              onClick={() => setActiveChart("amsam")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeChart === "amsam"
                  ? "bg-[var(--biodata-red)] text-white shadow-sm"
                  : "border border-[var(--biodata-blue)]/25 bg-white text-[var(--biodata-blue)]"
              }`}
            >
              அம்சம்
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className={activeChart === "rasi" ? "block" : "hidden sm:block"}>
              <SouthIndianChart
                label="இராசி"
                chartId="rasi"
                houses={form.rasiChart}
                editable
                showPalette={false}
                activeDrag={activeDrag}
                dropTarget={dropTarget}
                onPlanetPointerDown={startPlanetDrag}
                onPlanetTapRemove={(house, code) => {
                  if (dragMoved.current) return;
                  set("rasiChart", removePlanetFromChart(form.rasiChart, house, code));
                }}
              />
            </div>

            <div className="hidden max-w-[160px] flex-col justify-center text-center text-sm font-semibold leading-relaxed text-[var(--biodata-red)] lg:flex">
              <p>ஜாதகம் தருவது எங்கள் கடமை</p>
              <p className="mt-3">பேசி, உறுதி செய்வது பெற்றோர் கடமை</p>
            </div>

            <div className={activeChart === "amsam" ? "block" : "hidden sm:block"}>
              <SouthIndianChart
                label="அம்சம்"
                chartId="amsam"
                houses={form.amsamChart}
                editable
                showPalette={false}
                activeDrag={activeDrag}
                dropTarget={dropTarget}
                onPlanetPointerDown={startPlanetDrag}
                onPlanetTapRemove={(house, code) => {
                  if (dragMoved.current) return;
                  set(
                    "amsamChart",
                    removePlanetFromChart(form.amsamChart, house, code),
                  );
                }}
              />
            </div>
          </div>
        </section>

        {(status === "error" || error) && (
          <p className="mt-4 text-center text-sm font-medium text-[var(--biodata-red)]">
            {error}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-[var(--biodata-gold)]/25 bg-white/95 px-4 py-3.5 shadow-[0_-8px_24px_-12px_rgba(44,24,16,0.2)] backdrop-blur-md sm:static sm:bg-[var(--biodata-cream)] sm:shadow-none">
        <button
          type="submit"
          disabled={status === "loading" || uploading}
          className="w-full rounded-xl bg-[var(--biodata-red)] px-5 py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 sm:mx-auto sm:block sm:w-auto sm:min-w-[240px]"
        >
          {status === "loading" ? "Saving…" : "பதிவு செய் / Submit"}
        </button>
      </div>
    </form>
  );
}
