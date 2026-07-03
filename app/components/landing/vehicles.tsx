import Reveal from "./reveal";
import { CarIcon, FusoIcon, HiluxIcon, MotoIcon } from "../vehicle-icons";

const FLEET = [
  { Icon: MotoIcon, name: "Moto", use: "Beat the traffic", detail: "Fast, affordable single-rider trips across the city." },
  { Icon: CarIcon, name: "Cab", use: "Comfort & groups", detail: "Private car rides for up to four, day or night." },
  { Icon: HiluxIcon, name: "Hilux", use: "Loads & rough roads", detail: "Pickup capacity for goods, gear and upcountry trips." },
  { Icon: FusoIcon, name: "Fuso", use: "Heavy haulage", detail: "Truck transport for moving large or bulk cargo." },
];

export default function Vehicles() {
  return (
    <section id="fleet" className="rides-section" style={{ background: "var(--paper-2)" }}>
      <div className="rides-container">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="rides-num">02</span>
                <span className="rides-label">One app, every vehicle</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="rides-h2 mt-6 max-w-[16ch]">Whatever you&apos;re moving, there&apos;s a ride for it.</h2>
            </Reveal>
          </div>
          <Reveal delay={140} className="lg:col-span-4 lg:text-right">
            <p style={{ color: "var(--muted)" }}>Switch between vehicle types in a single tap — pricing adapts to each.</p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line)", background: "var(--line)" }}>
          {FLEET.map((v, i) => (
            <Reveal key={v.name} delay={i * 80} className="group" style={{ background: "var(--paper)" }}>
              <div className="flex h-full flex-col p-7 transition-colors" >
                <v.Icon className="h-9 w-9" />
                <div className="mt-10">
                  <span className="rides-label" style={{ fontSize: "0.66rem" }}>{v.use}</span>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: "var(--ink)" }}>{v.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{v.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
