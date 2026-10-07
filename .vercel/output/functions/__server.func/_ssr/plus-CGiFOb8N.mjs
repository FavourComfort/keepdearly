import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth, i as getSupabase } from "./BrandMark-D4AhOfJ-.mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { a as DataNotice, o as Icon, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PrimaryButton } from "./PrimaryButton-D1tbk-xH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plus-CGiFOb8N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The Plus price, shown on the button.
*
* Display only. The server charges its own constant and migration 0011
* CHECK-constrains the stored amount to 2000, so editing this number could not
* change what anyone is charged — it would only make the screen lie.
*/
var PLUS_PRICE_LABEL = "UGX 2,000";
/**
* Phase 6D: buy KeepDearly Plus, once, for UGX 2,000.
*
* Mobile Money only — the payer enters their MTN or Airtel number, approves the
* prompt on their phone, and the screen waits.
*
* The one rule this screen follows: it never believes itself. Starting a payment
* does not mean it worked, and no redirect or "success" click grants anything.
* Plus appears only once the SERVER has confirmed with Nylon Pay that the
* transaction actually completed, which is why the screen polls /api/plus/status
* and shows the result the server sends back. If the user closes the tab mid
* payment, the server-recorded outcome still stands and the webhook applies it.
*
* Polling stops on a terminal state, on success, and when the screen unmounts.
*/
function BuyPlus() {
	const { profile, status, session, refreshProfile } = useAuth();
	const navigate = useNavigate();
	const [phone, setPhone] = (0, import_react.useState)("");
	const [step, setStep] = (0, import_react.useState)("ready");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [reference, setReference] = (0, import_react.useState)(null);
	const [retrying, setRetrying] = (0, import_react.useState)(false);
	const referenceRef = (0, import_react.useRef)(null);
	const mountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);
	const alreadyPlus = profile?.plus_active === true;
	/**
	* The bearer token for our own API routes.
	*
	* This is the browser's Supabase access token, so the server can verify who is
	* asking. It is sent to our own endpoints only and is never logged.
	*
	* The session is revalidated here, immediately before each Plus request: the
	* screen can still look signed in while the access token held in browser
	* storage is stale or expired, which is what made the server answer "Sign in
	* to buy Plus" for an apparently signed-in user.
	*/
	async function authHeaders() {
		const supabase = getSupabase();
		const { data: sessionData } = await supabase.auth.getSession();
		const storedSession = sessionData.session;
		if (!storedSession) return {};
		const { data: refreshedData } = await supabase.auth.refreshSession();
		return { Authorization: `Bearer ${refreshedData.session?.access_token ?? storedSession.access_token}` };
	}
	/**
	* Asks the server whether the payment completed.
	*
	* /api/plus/status re-checks Nylon Pay every time, so this is a real
	* confirmation rather than a local guess — and it is safe to call repeatedly.
	*/
	const checkStatus = (0, import_react.useCallback)(async (ref) => {
		if (referenceRef.current !== ref || !mountedRef.current) return;
		let view;
		try {
			const response = await fetch(`/api/plus/status?reference=${encodeURIComponent(ref)}`, { headers: await authHeaders() });
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error ?? "We couldn't check that payment just now.");
			view = payload;
		} catch (cause) {
			if (!mountedRef.current || referenceRef.current !== ref) return;
			setError(cause instanceof Error ? cause.message : "We couldn't check that payment.");
			return;
		}
		if (!mountedRef.current || referenceRef.current !== ref) return;
		if (view.status === "completed" && view.plusActive) {
			setStep("success");
			setError(null);
			refreshProfile();
			return;
		}
		if (view.status === "failed") {
			setStep("failed");
			return;
		}
		setStep("waiting");
	}, [refreshProfile]);
	(0, import_react.useEffect)(() => {
		if (step !== "waiting" || !reference) return;
		const timer = setInterval(() => {
			checkStatus(reference);
		}, 4e3);
		return () => clearInterval(timer);
	}, [
		step,
		reference,
		checkStatus
	]);
	async function handlePay() {
		if (busy || step === "waiting") return;
		setBusy(true);
		setError(null);
		try {
			const response = await fetch("/api/plus/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...await authHeaders()
				},
				body: JSON.stringify({ phoneNumber: phone })
			});
			const payload = await response.json();
			if (!response.ok) {
				setError(payload.error ?? "We couldn't start that payment.");
				return;
			}
			referenceRef.current = payload.reference;
			setReference(payload.reference);
			setStep("waiting");
			checkStatus(payload.reference);
		} catch {
			setError("We couldn't reach the payment service. Check your connection and try again.");
		} finally {
			setBusy(false);
		}
	}
	/**
	* Abandons an attempt the payer never got a prompt for, then returns the screen
	* to the form so a fresh one can start. The server re-checks Nylon Pay first
	* and never grants Plus here, so this cannot shortcut payment.
	*/
	async function handleRetry() {
		if (retrying || !reference) return;
		setRetrying(true);
		setError(null);
		try {
			const response = await fetch(`/api/plus/retry?reference=${encodeURIComponent(reference)}`, {
				method: "POST",
				headers: await authHeaders()
			});
			const payload = await response.json();
			if (!response.ok) {
				setError(payload.error ?? "We couldn't reset that payment just now.");
				return;
			}
			if (payload.status === "completed" && payload.plusActive) {
				setStep("success");
				refreshProfile();
				return;
			}
			if (payload.status === "failed") {
				referenceRef.current = null;
				setReference(null);
				setStep("ready");
				return;
			}
			setStep("waiting");
		} catch {
			setError("We couldn't reset that payment. Check your connection and try again.");
		} finally {
			setRetrying(false);
		}
	}
	if (alreadyPlus) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col items-center gap-4 pt-16 text-center",
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
				className: "max-w-xl text-headline-lg leading-tight text-on-surface",
				children: "Let the right words arrive at the right moment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-body-md text-on-surface-variant",
				children: "Write a message for someone you care about, choose when it should arrive, and KeepDearly sends it for you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
				variant: "soft",
				onClick: () => void navigate({ to: "/" }),
				className: "mt-2",
				children: "Back home"
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl pb-8 pt-8 sm:pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col items-start gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								name: "workspace_premium",
								filled: true,
								className: "text-[14px]"
							}), "KeepDearly Plus"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-headline-xl leading-tight text-on-surface",
							children: [
								"Remember it now.",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Let KeepDearly handle the moment later."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-body-md text-on-surface-variant",
							children: "Write a message for someone you care about, choose when it should arrive, and KeepDearly sends it for you automatically."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-label-md text-on-surface-variant",
							children: [PLUS_PRICE_LABEL, " · one time"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_2px_12px_rgba(72,47,35,0.04)] sm:p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": "true",
							className: "absolute bottom-5 left-0 top-5 w-1 rounded-r-full bg-primary-container"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										name: "cake",
										className: "text-[20px]"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-title-sm text-on-surface",
									children: "Bestie’s birthday"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-body-sm text-on-surface-variant",
									children: "October 18"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									name: "event",
									className: "text-[14px]"
								}), "A day to remember"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 whitespace-pre-line text-quote-body leading-relaxed text-on-surface",
							children: "Happy birthday dear, Bestie. I hope this year brings you everything you’re hoping for…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center gap-3 border-t border-outline-variant/30 pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										name: "schedule",
										className: "text-[18px]"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-label-md text-on-surface",
									children: "Scheduled to send"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-body-sm text-on-surface-variant",
									children: "October 18 · 9:00 AM"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto text-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										name: "check_circle",
										filled: true,
										className: "text-[20px]"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								name: "send",
								className: "text-[15px] text-secondary"
							}), "KeepDearly will send this automatically"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 sm:mt-16",
				"aria-labelledby": "how-it-works",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5 flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "how-it-works",
						className: "text-headline-sm text-on-surface",
						children: "Three small steps"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm text-on-surface-variant",
						children: "Then it’s taken care of"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 rounded-xl bg-surface-container-low p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm text-on-primary-fixed-variant",
								children: "1"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-title-sm text-on-surface",
								children: "Write it now"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-body-sm text-on-surface-variant",
								children: "Capture the message while you remember."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 rounded-xl bg-surface-container-low p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm text-on-primary-fixed-variant",
								children: "2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-title-sm text-on-surface",
								children: "Choose the moment"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-body-sm text-on-surface-variant",
								children: "Pick the date and time."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 rounded-xl bg-surface-container-low p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm text-on-primary-fixed-variant",
								children: "3"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-title-sm text-on-surface",
								children: "Let KeepDearly send it"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-body-sm text-on-surface-variant",
								children: "Your message arrives automatically."
							})] })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "payment",
				className: "mt-12 scroll-mt-24 sm:mt-16",
				"aria-labelledby": "payment-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-col items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-label-sm text-on-surface-variant",
								children: "A little more room for care"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "payment-title",
								className: "text-headline-md text-on-surface",
								children: "One payment. No subscription."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-body-md text-on-surface-variant",
								children: "Pay once. Nothing renews."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-headline-lg text-on-surface",
								children: [PLUS_PRICE_LABEL, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 align-middle text-body-sm text-on-surface-variant",
									children: "once"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 sm:p-5",
						children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
							tone: "error",
							children: error
						}) : null, step === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-start gap-4",
							role: "status",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
								tone: "info",
								children: "Plus is on. You can schedule a message for someone now."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
								variant: "soft",
								onClick: () => void navigate({ to: "/" }),
								disabled: status === "loading",
								children: "Back home"
							})]
						}) : step === "waiting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-start gap-4",
							role: "status",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
									tone: "info",
									children: "Approve the payment on your phone. This page updates on its own — you can leave it open while you do."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-body-sm text-on-surface-variant",
									children: "Checking your payment…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
										variant: "quiet",
										onClick: () => void navigate({ to: "/" }),
										children: "I’ll come back later"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
										variant: "quiet",
										onClick: () => void handleRetry(),
										disabled: retrying,
										children: retrying ? "Resetting…" : "No prompt? Start over"
									})]
								})
							]
						}) : step === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-start gap-4",
							role: "alert",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
								tone: "error",
								children: "That payment didn’t go through, so Plus isn’t switched on. You can try again."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
								variant: "soft",
								onClick: () => setStep("ready"),
								children: "Try again"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-label-md text-on-surface",
											children: "Mobile Money number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "tel",
											inputMode: "tel",
											autoComplete: "tel",
											placeholder: "07XX XXX XXX",
											value: phone,
											onChange: (event) => setPhone(event.target.value),
											className: "rounded-xl border border-outline bg-surface-container-lowest px-4 py-3.5 text-body-md text-on-surface outline-none focus:border-primary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-body-sm text-on-surface-variant",
											children: "MTN MoMo or Airtel Money. You’ll get a prompt to approve the payment."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
									variant: "primary",
									onClick: () => void handlePay(),
									disabled: busy || phone.trim().length === 0,
									children: busy ? "Starting…" : `Pay ${PLUS_PRICE_LABEL}`
								}),
								session ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
									tone: "error",
									children: "Sign in to buy Plus."
								})
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2 px-1 text-body-sm text-on-surface-variant sm:flex-row sm:gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "event_available",
							className: "shrink-0 text-[16px] text-secondary"
						}), "Your message stays scheduled until the moment you choose."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "favorite",
							className: "shrink-0 text-[16px] text-primary"
						}), "You can still send another message yourself that day."]
					})]
				})]
			})
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyPlus, {}) });
//#endregion
export { SplitComponent as component };
