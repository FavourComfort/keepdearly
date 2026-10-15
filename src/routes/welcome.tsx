import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/keepdearly/BrandMark";
import { Icon } from "@/components/keepdearly/Icon";
import warmMemoriesSceneUrl from "./design/Warm Memories Scene.png";

/** The public, static landing page. The signed-in app remains at the root route. */
export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "KeepDearly — remember the little things" },
      {
        name: "description",
        content:
          "Keep the details that help you show up for the people you love, with gentle reminders when they matter.",
      },
      { property: "og:title", content: "KeepDearly — remember the little things" },
      {
        property: "og:description",
        content:
          "Keep the details that help you show up for the people you love, with gentle reminders when they matter.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://keepdearly.vercel.app/welcome" },
    ],
    links: [{ rel: "canonical", href: "https://keepdearly.vercel.app/welcome" }],
  }),
  component: Welcome,
});

const features = [
  {
    icon: "favorite",
    title: "Keep the details",
    body: "Save their favourite things, important dates, stories and little notes.",
    cardClassName: "bg-landing-lilac-soft",
    iconClassName: "text-landing-lilac-deep",
  },
  {
    icon: "notifications",
    title: "Timely reminders",
    body: "Get gentle reminders at the right time so you never miss what matters.",
    cardClassName: "bg-landing-peach-soft",
    iconClassName: "text-landing-peach-deep",
  },
  {
    icon: "redeem",
    title: "Show up thoughtfully",
    body: "Turn memories and details into meaningful moments they will remember.",
    cardClassName: "bg-landing-sage-soft",
    iconClassName: "text-secondary",
  },
];

const steps = [
  {
    title: "Keep a detail",
    body: "Write down the little thing they mention while it is still fresh.",
    icon: "edit_note",
  },
  {
    title: "Connect the person",
    body: "Keep it with the person it belongs to, so it is easy to find later.",
    icon: "group",
  },
  {
    title: "Choose the moment",
    body: "Set a gentle reminder for the date and time it will matter most.",
    icon: "event",
  },
  {
    title: "Show up with care",
    body: "KeepDearly brings it back at the right time, ready for you to act on.",
    icon: "favorite",
  },
];

/**
 * An editorial product glimpse built from the real product vocabulary rather
 * than a raster screenshot. It stays decorative, while the surrounding copy
 * explains the actual behaviours people can use in the app.
 */
function PhonePreview() {
  return (
    <div aria-hidden="true" className="relative h-[26rem] w-full overflow-hidden sm:h-[32rem] lg:h-[43rem]">
      <div className="absolute -left-[18%] top-[12%] h-[68%] w-[68%] rounded-[46%_54%_42%_58%/54%_42%_58%_46%] bg-landing-lilac opacity-95 shadow-[inset_-12px_-20px_32px_rgba(70,43,103,0.16)]" />
      <div className="absolute -right-[17%] top-[3%] h-[43%] w-[47%] rounded-[57%_43%_51%_49%/45%_57%_43%_55%] bg-landing-peach opacity-90" />
      <div className="absolute bottom-[3%] right-[-12%] h-[51%] w-[61%] rounded-[52%_48%_59%_41%/43%_58%_42%_57%] bg-landing-peach opacity-80" />
      <div className="absolute -bottom-[2%] left-[1%] h-[38%] w-[54%] rounded-[54%_46%_42%_58%/42%_56%_44%_58%] bg-landing-lilac-soft/80" />

      <div className="absolute left-[9%] top-[11%] flex h-20 w-20 rotate-[-12deg] items-center justify-center rounded-full bg-landing-lilac-soft shadow-[0_16px_26px_rgba(57,39,81,0.22)] sm:h-28 sm:w-28">
        <span className="flex h-[64%] w-[64%] items-center justify-center rounded-full bg-landing-lilac shadow-[inset_0_4px_8px_rgba(255,255,255,0.45)]">
          <Icon name="favorite" filled className="text-[1.8rem] text-white sm:text-[2.4rem]" />
        </span>
      </div>

      <div className="absolute right-[7%] top-[14%] flex h-24 w-24 rotate-[15deg] items-center justify-center rounded-full bg-landing-peach-soft shadow-[0_16px_24px_rgba(123,68,35,0.19)] sm:h-32 sm:w-32">
        <Icon name="spa" className="text-[2.6rem] text-secondary sm:text-[3.5rem]" />
      </div>

      <div className="absolute bottom-[4%] left-[17%] z-10 w-[59%] min-w-[15rem] -rotate-[20deg] rounded-[2.4rem] border-[5px] border-[#202019] bg-[#fdf9f3] p-2 shadow-[-16px_20px_22px_rgba(37,33,23,0.26),12px_0_0_#949083] sm:border-[7px] sm:p-3">
        <div className="overflow-hidden rounded-[1.9rem] border border-black/5 bg-[#fdf9f3] px-3 pb-4 pt-2 text-[#27271e] sm:px-4 sm:pb-6 sm:pt-3">
          <div className="mx-auto mb-2 h-4 w-20 rounded-full bg-black sm:mb-4 sm:h-5 sm:w-28" />
          <div className="flex items-center justify-between text-[7px] font-semibold sm:text-[9px]">
            <span className="font-display text-[12px] sm:text-[17px]">KeepDearly</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-landing-peach text-[8px] sm:h-7 sm:w-7 sm:text-[10px]">
              F
            </span>
          </div>
          <div className="mt-4 sm:mt-6">
            <p className="text-[8px] font-semibold sm:text-[12px]">Good morning, Favour</p>
            <p className="mt-0.5 text-[6px] text-black/55 sm:text-[8px]">You have 3 reminders today</p>
          </div>
          <div className="mt-4 rounded-xl border border-black/5 bg-white/65 p-2 shadow-sm sm:mt-5 sm:rounded-2xl sm:p-3">
            <p className="text-[6px] font-medium sm:text-[9px]">Upcoming reminders</p>
            <div className="mt-2 flex items-center gap-2 sm:mt-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-landing-peach-soft text-[12px] sm:h-8 sm:w-8 sm:text-[16px]">
                <Icon name="cake" className="text-[inherit]" />
              </span>
              <span>
                <span className="block text-[7px] font-semibold sm:text-[10px]">Mum&apos;s birthday</span>
                <span className="block text-[5px] text-black/50 sm:text-[7px]">Tomorrow at 9:00 AM</span>
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between sm:mt-6">
            {["M", "B", "J", "D"].map((initial, index) => (
              <span
                key={initial}
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full text-[7px] font-semibold text-white sm:h-10 sm:w-10 sm:text-[10px] " +
                  (index % 2 === 0 ? "bg-secondary" : "bg-landing-lilac-deep")
                }
              >
                {initial}
              </span>
            ))}
          </div>
          <div className="mt-4 border-t border-black/10 pt-3 sm:mt-6 sm:pt-4">
            <div className="flex justify-between text-[6px] text-black/60 sm:text-[8px]">
              <span>Home</span>
              <span>People</span>
              <span>Reminders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[15%] right-[5%] z-20 -rotate-[9deg] rounded-[2rem] border border-landing-lilac-deep/25 bg-landing-lilac px-5 py-3 text-center font-display text-[1.05rem] leading-tight text-landing-ink shadow-[0_10px_0_rgba(107,78,145,0.36)] sm:px-8 sm:py-4 sm:text-[1.6rem]">
        Small details
        <br />
        Big impact ♡
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <main className="overflow-hidden bg-landing-paper text-landing-ink">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(circle at 4% 8%, rgba(224, 203, 246, .95) 0, rgba(224, 203, 246, .42) 20%, transparent 46%), radial-gradient(circle at 91% 39%, rgba(255, 208, 166, .70) 0, transparent 31%), linear-gradient(112deg, #fff9f5 13%, #fbf2f0 49%, #fff9f1 100%)",
          }}
        />

        <div className="mx-auto max-w-[90rem] px-5 pb-7 sm:px-10 lg:px-16">
          <nav aria-label="Primary navigation" className="flex items-center justify-between py-6 sm:py-8">
            <Link
              to="/welcome"
              aria-label="KeepDearly home"
              className="group flex items-center gap-2 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-landing-ink"
            >
              <BrandMark className="h-8 w-8 sm:h-11 sm:w-11" />
              <span className="hidden font-display text-[1.65rem] leading-none tracking-[-0.05em] sm:inline sm:text-[2rem]">
                KeepDearly
              </span>
            </Link>

            <div className="flex items-center gap-1 text-[0.78rem] font-medium sm:gap-6 sm:text-[0.95rem] lg:gap-10">
              <a
                href="#how-it-works"
                className="rounded-full px-2 py-2 transition-colors hover:text-landing-lilac-deep focus-visible:outline-2 focus-visible:outline-landing-ink sm:px-0"
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="rounded-full px-2 py-2 transition-colors hover:text-landing-lilac-deep focus-visible:outline-2 focus-visible:outline-landing-ink sm:px-0"
              >
                Pricing
              </a>
              <Link
                to="/login"
                className="rounded-full bg-landing-ink px-4 py-2.5 text-white shadow-[0_8px_18px_rgba(30,42,20,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-[#314023] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-ink sm:px-6 sm:py-3"
              >
                Sign in
              </Link>
            </div>
          </nav>

          <div className="mx-auto flex max-w-5xl flex-col items-center pt-8 text-center sm:pt-12 lg:pt-16">
            <h1 className="max-w-4xl font-display text-[clamp(3.55rem,7.25vw,7.5rem)] leading-[0.86] tracking-[-0.064em] text-landing-ink">
              Remember the
              <br />
              little things.
            </h1>
            <p className="mt-6 max-w-xl text-[1.1rem] leading-7 text-landing-ink/85 sm:mt-8 sm:text-[1.35rem] sm:leading-8">
              Keep the details that help you show up
              <br className="hidden sm:block" /> for the people you love.
            </p>
            <Link
              to="/signup"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-landing-ink px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_12px_20px_rgba(30,42,20,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-[#314023] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-ink sm:mt-9 sm:px-11 sm:py-5 sm:text-[1.15rem]"
            >
              Get started <span aria-hidden="true" className="text-[1.2em]">↗</span>
            </Link>
          </div>

          <div className="mx-auto -mt-5 max-w-6xl sm:-mt-7 lg:-mt-12">
            <PhonePreview />
          </div>

          <section aria-label="KeepDearly highlights" className="mx-auto mt-1 max-w-6xl pb-8 sm:mt-3 sm:pb-12">
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className={
                    "min-h-[14.5rem] rounded-[2rem] p-6 shadow-[0_16px_35px_rgba(65,44,41,0.08)] sm:min-h-[18rem] sm:rounded-[2.25rem] sm:p-8 " +
                    feature.cardClassName
                  }
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-[0_8px_18px_rgba(60,44,42,0.14)] sm:h-16 sm:w-16">
                    <Icon name={feature.icon} filled className={"text-[1.75rem] " + feature.iconClassName} />
                  </span>
                  <h2 className="mt-6 font-display text-[1.85rem] leading-none tracking-[-0.035em] sm:mt-8 sm:text-[2.05rem]">
                    {feature.title}
                  </h2>
                  <p className="mt-4 max-w-xs text-[0.96rem] leading-6 text-landing-ink/82 sm:text-[1.05rem] sm:leading-7">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="bg-surface px-5 py-20 sm:px-10 sm:py-28 lg:px-16" aria-labelledby="details-title">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-label-sm uppercase tracking-[0.18em] text-landing-lilac-deep">Made for care</p>
            <h2 id="details-title" className="mt-4 max-w-md font-display text-[clamp(2.75rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.055em]">
              The details are the love.
            </h2>
            <p className="mt-6 max-w-md text-body-lg text-on-surface-variant">
              A favourite drink. A name that matters. A promise made in passing. KeepDearly holds
              the small things close, so the people you care about feel truly known.
            </p>
          </div>
          <div
            role="img"
            aria-label="A warm, candid moment between people who care for each other"
            className="min-h-[19rem] overflow-hidden rounded-[2.5rem] shadow-[0_20px_45px_rgba(65,44,41,0.09)] sm:min-h-[25rem]"
          >
            <img
              src={warmMemoriesSceneUrl}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="h-full min-h-[19rem] w-full object-cover sm:min-h-[25rem]"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-5 bg-landing-paper px-5 py-20 sm:px-10 sm:py-28 lg:px-16" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-label-sm uppercase tracking-[0.18em] text-landing-lilac-deep">How it works</p>
            <h2 id="how-title" className="mt-4 font-display text-[clamp(2.75rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.055em]">
              Thoughtfulness, made easier.
            </h2>
            <p className="mt-5 text-body-lg text-on-surface-variant">
              A little place for the things you do not want to lose in the rush of life.
            </p>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-[1.75rem] border border-landing-lilac/45 bg-white/75 p-6 shadow-[0_12px_28px_rgba(65,44,41,0.05)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-landing-lilac text-label-md text-landing-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon name={step.icon} className="mt-8 text-[1.65rem] text-landing-lilac-deep" />
                <h3 className="mt-3 font-display text-[1.65rem] leading-none tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-5 bg-surface px-5 py-20 sm:px-10 sm:py-28 lg:px-16" aria-labelledby="pricing-title">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-landing-ink p-7 text-white shadow-[0_24px_60px_rgba(30,42,20,0.23)] sm:p-12 lg:grid lg:grid-cols-[1fr_0.85fr] lg:gap-16 lg:p-16">
          <div>
            <p className="text-label-sm uppercase tracking-[0.18em] text-landing-peach">KeepDearly Plus</p>
            <h2 id="pricing-title" className="mt-4 max-w-md font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.055em]">
              One payment. No subscription.
            </h2>
            <p className="mt-6 max-w-md text-body-lg text-white/75">
              Write a message now, choose when it should arrive, and let KeepDearly send it at the moment that matters.
            </p>
          </div>
          <div className="mt-10 rounded-[2rem] bg-white p-6 text-landing-ink sm:p-8 lg:mt-0">
            <p className="text-label-sm uppercase tracking-[0.14em] text-on-surface-variant">KeepDearly Plus</p>
            <p className="mt-4 font-display text-[3.25rem] leading-none tracking-[-0.055em]">UGX 2,000</p>
            <p className="mt-2 text-body-md text-on-surface-variant">One time. Nothing renews.</p>
            <ul className="mt-7 space-y-3 text-body-md text-on-surface-variant">
              <li className="flex gap-3"><Icon name="check" className="mt-1 text-[1rem] text-secondary" />Schedule a message for a future moment</li>
              <li className="flex gap-3"><Icon name="check" className="mt-1 text-[1rem] text-secondary" />Choose the date and time it should arrive</li>
              <li className="flex gap-3"><Icon name="check" className="mt-1 text-[1rem] text-secondary" />Pay by MTN MoMo or Airtel Money</li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-landing-ink px-6 py-4 text-title-sm text-white transition-transform hover:-translate-y-0.5 hover:bg-[#314023] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-ink"
            >
              Get started
            </Link>
            <p className="mt-4 text-center text-body-sm text-on-surface-variant">
              Already have an account? <Link to="/login" className="font-semibold text-landing-ink underline underline-offset-4">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
