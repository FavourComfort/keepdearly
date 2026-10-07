import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth } from "./BrandMark-D4AhOfJ-.mjs";
import { _ as useKeepDearly, u as isReasonableEmail } from "./keepdearly-store-XbRJti1g.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { a as DataNotice, i as DataLoading, o as Icon, r as DataError, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PersonAvatar } from "./PersonAvatar-BzyVLKjW.mjs";
import { t as Route } from "./people._personId-D6GpJZLf.mjs";
import { n as MemoryNote } from "./MemoryCard-DAfs3JYd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people._personId-BiRJ8E2i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The person's email address (Phase 6B).
*
* Saved once on the person, so scheduling a message never asks for it again.
* Optional by design: plenty of people have no address the user knows, and
* leaving this blank is a perfectly good answer — it just means messages can't
* be queued for them yet.
*
* Nothing is sent or verified here. This only remembers where a message would
* go; whether it is reachable is the sender's problem, not this field's.
*/
function PersonEmailField({ personId, personName }) {
	const { personById, savePersonEmail, refresh } = useKeepDearly();
	const person = personById(personId);
	const [value, setValue] = (0, import_react.useState)(person?.email ?? "");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setValue(person?.email ?? "");
	}, [person?.email]);
	async function handleSave() {
		if (saving) return;
		const trimmed = value.trim();
		if (trimmed && !isReasonableEmail(trimmed)) {
			setError("That doesn't look like an email address.");
			return;
		}
		setSaving(true);
		setError(null);
		setSaved(false);
		const result = await savePersonEmail(personId, value);
		setSaving(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		await refresh();
		setSaved(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 text-title-md text-on-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "mail",
					className: "text-[16px] text-primary"
				}), "Email"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "-mt-1 text-body-sm text-on-surface-variant",
				children: [
					"Where a message for ",
					personName,
					" would go. Optional — and never shared."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "email",
					value,
					onChange: (event) => {
						setValue(event.target.value);
						setSaved(false);
						setError(null);
					},
					placeholder: "they@example.com",
					autoComplete: "off",
					className: "w-full flex-1 rounded-full bg-surface-container-low px-4 py-2 text-body-md text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void handleSave(),
					disabled: saving,
					className: "shrink-0 rounded-full bg-surface-container px-4 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed",
					children: saving ? "Saving…" : "Save"
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
				tone: "error",
				children: error
			}) : null,
			saved && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-label-sm text-on-surface-variant",
				children: "Saved."
			}) : null
		]
	});
}
/**
* The messages queued up for one person (Phase 6B).
*
* Reads as a short list, not a management system: the words, when it is due,
* and where it has got to. Only a `pending` message can be withdrawn, because
* anything already on its way is no longer the user's to pull back.
*
* It uses the same pieces the rest of the person screen uses — Icon, DataNotice,
* the rounded container cards and the pill buttons — so it reads as part of
* KeepDearly rather than a new surface bolted on.
*/
/** Plain words for each state. `sending` is what a claimed message looks like. */
var STATUS_WORDS = {
	pending: "waiting to go",
	sending: "on its way",
	sent: "sent",
	failed: "couldn't send",
	cancelled: "cancelled"
};
/** Longest preview shown before the body is cut with an ellipsis. */
var PREVIEW_LENGTH = 140;
function previewOf(body) {
	const flattened = body.replace(/\s+/g, " ").trim();
	return flattened.length > PREVIEW_LENGTH ? `${flattened.slice(0, PREVIEW_LENGTH).trimEnd()}…` : flattened;
}
function statusTone(status) {
	if (status === "sent") return "bg-primary-fixed text-on-primary-fixed-variant";
	if (status === "failed") return "bg-error-container text-on-error";
	return "bg-surface-container-high text-on-surface-variant";
}
function ScheduledMessages({ personId, personName }) {
	const { scheduledMessagesFor, cancelScheduledMessage, refresh } = useKeepDearly();
	const [error, setError] = (0, import_react.useState)(null);
	const [cancelling, setCancelling] = (0, import_react.useState)(null);
	const visible = scheduledMessagesFor(personId).filter((message) => message.status !== "cancelled");
	async function handleCancel(id) {
		if (cancelling) return;
		setCancelling(id);
		setError(null);
		const result = await cancelScheduledMessage(id);
		setCancelling(null);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		await refresh();
	}
	if (!visible.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "rounded-xl bg-surface-container-low p-6 text-body-md italic text-on-surface-variant",
		children: [
			"Nothing queued for ",
			personName,
			" yet."
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
			tone: "error",
			children: error
		}) : null, visible.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-body-md text-on-surface",
				children: previewOf(message.body)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-label-sm text-on-surface-variant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "schedule",
							className: "text-[14px]"
						}), message.timing]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `inline-flex items-center rounded-full px-3 py-1 text-label-sm ${statusTone(message.status)}`,
						children: STATUS_WORDS[message.status]
					}),
					message.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void handleCancel(message.id),
						disabled: cancelling === message.id,
						className: "ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "close",
							className: "text-[14px]"
						}), cancelling === message.id ? "Cancelling…" : "Cancel"]
					}) : null
				]
			})]
		}, message.id))]
	});
}
function PersonProfile() {
	const { personId } = Route.useParams();
	const { personById, memoriesFor, loading, error } = useKeepDearly();
	const { profile } = useAuth();
	const person = personById(personId);
	const isPlus = profile?.plus_active === true;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataLoading, {}) });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataError, {}) });
	if (!person) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 pt-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-headline-lg text-on-surface",
				children: "We couldn’t find them"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-body-md text-on-surface-variant",
				children: "This person isn’t kept here yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-label-md text-primary hover:underline",
				children: "Back home"
			})
		]
	}) });
	const personMemories = memoriesFor(person.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-10 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col items-center gap-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
						initial: person.initial,
						tone: person.tone,
						size: "lg",
						photoUrl: person.avatarUrl
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-headline-xl text-on-surface",
							children: person.name
						}), person.relationship ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-body-md italic text-on-surface-variant",
							children: person.relationship
						}) : null]
					}),
					person.birthday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-1 text-label-md text-on-surface-variant",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								name: "cake",
								className: "text-[16px] text-primary"
							}),
							person.birthday,
							person.birthdayIn ? ` · ${person.birthdayIn}` : ""
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/capture",
						search: { person: person.id },
						className: "mt-1 inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2.5 text-label-md text-on-primary-container shadow-sm transition-all hover:bg-primary hover:text-on-primary active:scale-95",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								name: "add",
								className: "text-[16px]"
							}),
							"Keep something about ",
							person.name
						]
					}),
					isPlus && person.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/people/$personId/message",
						params: { personId: person.id },
						className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-label-md text-on-primary shadow-sm transition-all hover:bg-tertiary active:scale-95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "schedule_send",
							className: "text-[16px]"
						}), "Send a message later"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 text-label-sm text-on-primary-fixed-variant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "workspace_premium",
							filled: true,
							className: "text-[14px]"
						}), "Send a message later — with Plus"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-title-md text-on-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "favorite",
							filled: true,
							className: "text-[16px] text-primary"
						}), "Loves"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: person.likes.length ? person.likes.map((like) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-primary-fixed px-3 py-1 text-label-sm text-on-primary-fixed-variant",
							children: like
						}, like)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-body-sm text-outline",
							children: "Nothing kept yet."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-title-md text-on-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "do_not_disturb_on",
							className: "text-[16px] text-on-surface-variant"
						}), "Rather not"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: person.dislikes.length ? person.dislikes.map((dislike) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface-container-high px-3 py-1 text-label-sm text-on-surface-variant",
							children: dislike
						}, dislike)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-body-sm text-outline",
							children: "Nothing kept yet."
						})
					})]
				})]
			}),
			person.giftIdeas.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-headline-sm text-on-surface",
					children: "Gift ideas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: person.giftIdeas.map((idea) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								name: idea.icon,
								className: "text-[22px] text-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 text-title-sm text-on-surface",
								children: idea.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-body-sm text-on-surface-variant",
								children: idea.note
							})
						]
					}, idea.title))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-headline-sm text-on-surface",
					children: "Little things you’ve kept"
				}), personMemories.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: personMemories.map((memory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryNote, { memory }, memory.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl bg-surface-container-low p-6 text-body-md italic text-on-surface-variant",
					children: [
						"Nothing kept about ",
						person.name,
						" yet — the next small thing they say can live here."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-headline-sm text-on-surface",
						children: "Send a message"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonEmailField, {
						personId: person.id,
						personName: person.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduledMessages, {
						personId: person.id,
						personName: person.name
					})
				]
			})
		]
	}) }) });
}
//#endregion
export { PersonProfile as component };
