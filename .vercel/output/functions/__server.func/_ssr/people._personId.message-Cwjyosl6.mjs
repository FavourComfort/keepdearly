import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth } from "./BrandMark-D4AhOfJ-.mjs";
import { _ as useKeepDearly, g as todayDateInputValue, l as isFutureMoment, p as remindAtForChosenDate } from "./keepdearly-store-XbRJti1g.mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { a as DataNotice, i as DataLoading, o as Icon, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PrimaryButton } from "./PrimaryButton-D1tbk-xH.mjs";
import { t as TimePicker } from "./TimePicker-B_RCLLvN.mjs";
import { t as Route } from "./people._personId.message-CA4Q_kVV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people._personId.message-Cwjyosl6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Prepare one message for one person, to be sent at a chosen moment (Phase 6B).
*
* The flow is person → message → date/time → save. The recipient is fixed by
* the route, so there is nothing to pick here: the name and their saved address
* are shown, and the user only writes the words and chooses the moment.
*
* Nothing is sent by this screen. Saving leaves a row that a later server job
* will deliver; the status simply reads "waiting to go" until then.
*/
function ScheduleMessage() {
	const { personId } = Route.useParams();
	const navigate = useNavigate();
	const { profile } = useAuth();
	const { personById, saveScheduledMessage } = useKeepDearly();
	const person = personById(personId);
	const isPlus = profile?.plus_active === true;
	const [body, setBody] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const chosenSendAt = date ? remindAtForChosenDate(date, time || void 0) : null;
	const dateMissing = !chosenSendAt;
	const dateInPast = !!chosenSendAt && !isFutureMoment(chosenSendAt);
	const momentInvalid = dateMissing || dateInPast;
	const canSave = body.trim().length > 0 && !momentInvalid && !saving && !!person?.email;
	async function handleSave() {
		if (!canSave || !chosenSendAt) return;
		setSaving(true);
		setError(null);
		const result = await saveScheduledMessage({
			personId,
			body,
			sendAt: chosenSendAt
		});
		setSaving(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		await navigate({
			to: "/people/$personId",
			params: { personId }
		});
	}
	if (!person) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataLoading, {}) }) });
	if (!isPlus) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 pt-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "workspace_premium",
					filled: true,
					className: "text-[14px]"
				}), "KeepDearly Plus"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-headline-lg text-on-surface",
				children: "Send a message later is a Plus thing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-body-md text-on-surface-variant",
				children: "Write the message now and let it arrive on the day, without having to remember. That comes with Plus."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
				variant: "primary",
				onClick: () => void navigate({ to: "/plus" }),
				className: "mt-2",
				children: "Get Plus — UGX 2,000"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void navigate({
					to: "/people/$personId",
					params: { personId }
				}),
				className: "inline-flex items-center gap-2 rounded-full bg-surface-container px-6 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-high",
				children: ["Back to ", person.name]
			})
		]
	}) }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm uppercase tracking-widest text-outline",
						children: "send a message later"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-headline-lg text-on-surface",
						children: "Say it when the moment comes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-body-md text-on-surface-variant",
						children: [
							"Write it now. KeepDearly sends it to ",
							person.name,
							" at the time you choose."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2 rounded-xl bg-surface-container-low p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm uppercase tracking-widest text-outline",
						children: "To"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-title-md text-on-surface",
						children: person.name
					}),
					person.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-body-sm text-on-surface-variant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "mail",
							className: "text-[14px]"
						}), person.email]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-body-sm italic text-on-surface-variant",
						children: [
							"No email saved for ",
							person.name,
							" yet — add one on their page first."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "message-body",
					className: "text-title-md text-on-surface",
					children: "Your message"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "message-body",
					value: body,
					onChange: (event) => setBody(event.target.value),
					rows: 7,
					placeholder: "Happy birthday Sarah ❤️ I hope you have the most beautiful day…",
					className: "w-full resize-y rounded-xl bg-surface-container-lowest p-4 text-body-lg text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-title-md text-on-surface",
						children: "When should it arrive?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "send-date",
								className: "text-label-sm text-on-surface-variant",
								children: "Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "send-date",
								type: "date",
								value: date,
								min: todayDateInputValue(),
								onChange: (event) => setDate(event.target.value),
								className: "rounded-full bg-surface-container-low px-4 py-2 text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/40"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "send-time",
								className: "text-label-sm text-on-surface-variant",
								children: "Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimePicker, {
								id: "send-time",
								value: time,
								onChange: setTime,
								className: "rounded-full bg-surface-container-low px-4 py-2 text-body-md"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-body-sm text-on-surface-variant",
						children: "Leave the time empty and it goes out at 9:00 that morning."
					}),
					dateMissing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, { children: "Pick the day it should arrive." }) : null,
					dateInPast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
						tone: "error",
						children: "Pick a moment that hasn’t happened yet."
					}) : null
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
				tone: "error",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
				onClick: () => void handleSave(),
				disabled: !canSave,
				children: saving ? "Scheduling…" : "Schedule it"
			})
		]
	}) }) });
}
//#endregion
export { ScheduleMessage as component };
