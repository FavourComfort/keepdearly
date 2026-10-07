import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useKeepDearly, a as PHOTO_ACCEPT, f as isSupportedPhoto, g as todayDateInputValue, h as reminderTiming, l as isFutureMoment, m as reminderOptions, o as PHOTO_TOO_LARGE_MESSAGE, p as remindAtForChosenDate, s as PHOTO_WRONG_TYPE_MESSAGE } from "./keepdearly-store-XbRJti1g.mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./capture-Clr17-G-.mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as DataNotice, o as Icon, s as cn, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PersonAvatar } from "./PersonAvatar-BzyVLKjW.mjs";
import { t as PrimaryButton } from "./PrimaryButton-D1tbk-xH.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as TimePicker } from "./TimePicker-B_RCLLvN.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capture-dOaO7WWF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The composer's writing surface.
*
* The one attachment KeepDearly offers is a photo, chosen through a normal
* browser file input behind the button. Android, iOS and desktop therefore
* open the picker the user already knows — gallery, camera roll, files — with
* no bespoke upload screen, no desktop-only drag-and-drop, and nothing to
* install.
*
* There is deliberately no voice note here and no recording control: a button
* that recorded nothing was worse than no button at all. Whisper is gone rather
* than disabled.
*
* The preview is a local object URL at a fixed size, so a 12-megapixel original
* cannot shove the composer around while it loads, and the blob is revoked the
* moment it is replaced or the composer unmounts.
*/
function MemoryInput({ value, onChange, photo, onPhotoChange, placeholder }) {
	const fileInput = (0, import_react.useRef)(null);
	const areaRef = (0, import_react.useRef)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [problem, setProblem] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!photo) {
			setPreview(null);
			return;
		}
		const url = URL.createObjectURL(photo);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [photo]);
	(0, import_react.useEffect)(() => {
		const el = areaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, [value]);
	function openPicker() {
		if (fileInput.current) fileInput.current.value = "";
		fileInput.current?.click();
	}
	function accept(next) {
		setProblem(null);
		if (!next) return;
		if (!isSupportedPhoto(next)) {
			setProblem(PHOTO_WRONG_TYPE_MESSAGE);
			return;
		}
		if (next.size > 8388608) {
			setProblem(PHOTO_TOO_LARGE_MESSAGE);
			return;
		}
		onPhotoChange?.(next);
	}
	function clearPhoto() {
		setProblem(null);
		onPhotoChange?.(null);
	}
	const length = value.trim().length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-surface-container-lowest px-5 py-5 shadow-[0_2px_16px_rgba(72,47,35,0.06)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(72,47,35,0.1)] sm:px-6 sm:py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "sr-only",
				htmlFor: "memory-input",
				children: "Memory content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "memory-input",
				ref: areaRef,
				rows: 2,
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder: placeholder ?? "Sarah mentioned she loves vanilla perfume and can never find a miniature rollerball to carry in her bag…",
				className: "max-h-80 w-full resize-none overflow-y-auto bg-transparent text-quote-body leading-relaxed text-on-surface outline-none placeholder:font-normal placeholder:text-outline-variant/70"
			}),
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-3 rounded-2xl bg-surface-container-low p-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: preview,
						alt: "The photo picked for this memory",
						className: "h-16 w-16 shrink-0 rounded-xl object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 flex-1 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-label-md text-on-surface",
							children: "Photo attached"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-label-sm text-on-surface-variant",
							children: photo?.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: clearPhoto,
						"aria-label": "Remove the photo",
						title: "Remove the photo",
						className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "close",
							className: "text-[18px]"
						})
					})
				]
			}) : null,
			problem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-label-sm text-error",
				children: problem
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-3 text-on-surface-variant",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInput,
						type: "file",
						accept: PHOTO_ACCEPT,
						tabIndex: -1,
						"aria-hidden": "true",
						onChange: (event) => accept(event.target.files?.[0]),
						className: "sr-only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: openPicker,
						className: "flex items-center gap-1.5 rounded-full px-1 py-1 text-label-md text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "add_photo_alternate",
							className: "text-[18px]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: preview ? "Change photo" : "Add photo" })]
					}),
					length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-label-sm text-outline",
						"aria-live": "polite",
						children: [
							length,
							" character",
							length === 1 ? "" : "s"
						]
					}) : null
				]
			})
		]
	});
}
/**
* The nudge picker.
*
* "Choose date" is no longer a dead option: picking it reveals a plain date
* input and an optional time picker right here, in the same card language as
* the rest of the screen. No calendar, no month grid — just the two fields a
* person needs to name a moment.
*
* The time stays optional on purpose. Left unset it falls back to the app's
* existing 9:00 AM convention, which is what the relative options already use.
*
* The choices read as a light row of pills, not a settings grid — selected is
* obvious, everything else recedes.
*/
function ReminderSelector({ value, onChange, date, time, onDateChange, onTimeChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 pt-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: reminderOptions.map((option) => {
				const selected = value === option.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(option.id),
					"aria-pressed": selected,
					className: cn("flex items-center gap-2 rounded-full px-4 py-2 text-label-md transition-all", selected ? "bg-secondary-container text-on-secondary-container shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: option.icon,
							className: cn("text-[16px]", selected ? "" : "text-outline")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: option.label }),
						selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "check",
							className: "text-[16px]"
						}) : null
					]
				}, option.id);
			})
		}), value === "date" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 rounded-2xl bg-surface-container-low/70 p-4 sm:flex-row sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1.5 text-label-sm text-on-surface-variant",
					htmlFor: "reminder-date",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "calendar_month",
						className: "text-[16px]"
					}), "Which day?"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "reminder-date",
					type: "date",
					value: date ?? "",
					min: todayDateInputValue(),
					onChange: (e) => onDateChange?.(e.target.value),
					className: "rounded-lg bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1.5 text-label-sm text-on-surface-variant",
					htmlFor: "reminder-time",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "schedule",
						className: "text-[16px]"
					}), "What time? (optional)"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimePicker, {
					id: "reminder-time",
					value: time,
					onChange: (next) => onTimeChange?.(next),
					className: "text-body-md"
				})]
			})]
		}) : null]
	});
}
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
function Capture() {
	const { person: initialPerson } = Route.useSearch();
	const navigate = useNavigate();
	const { people, saveMemory } = useKeepDearly();
	const [text, setText] = (0, import_react.useState)("");
	const [personId, setPersonId] = (0, import_react.useState)(initialPerson);
	const [newName, setNewName] = (0, import_react.useState)("");
	const [picking, setPicking] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [reminder, setReminder] = (0, import_react.useState)("none");
	const [reminderDate, setReminderDate] = (0, import_react.useState)("");
	const [reminderTime, setReminderTime] = (0, import_react.useState)("");
	const [photo, setPhoto] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const chosenRemindAt = reminder === "date" ? remindAtForChosenDate(reminderDate, reminderTime) : null;
	const dateMissing = reminder === "date" && chosenRemindAt === null;
	const dateInPast = reminder === "date" && chosenRemindAt !== null && !isFutureMoment(chosenRemindAt);
	const reminderInvalid = dateMissing || dateInPast;
	const canSave = text.trim().length > 0 && !saving && !reminderInvalid;
	const featuredPeople = people.slice(0, 5);
	const chosenOutside = personId ? people.find((person) => person.id === personId) : void 0;
	const visiblePeople = chosenOutside && !featuredPeople.some((person) => person.id === chosenOutside.id) ? [chosenOutside, ...featuredPeople.slice(0, 4)] : featuredPeople;
	const trimmedQuery = query.trim().toLowerCase();
	const matchingPeople = trimmedQuery ? people.filter((person) => person.name.toLowerCase().includes(trimmedQuery)) : people;
	async function handleSave() {
		if (!canSave) return;
		setSaving(true);
		setError(null);
		const result = await saveMemory({
			content: text,
			personId,
			newPersonName: newName,
			reminderOption: reminder,
			reminderDate,
			reminderTime,
			photo
		});
		setSaving(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		await navigate({
			to: result.personId ? "/people/$personId" : "/",
			params: { personId: result.personId ?? "" }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-2xl flex-col gap-8 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm uppercase tracking-widest text-outline",
						children: "keep a memory"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-headline-lg text-on-surface",
						children: "What’s worth remembering?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-body-md italic text-on-surface-variant",
						children: "The little things are often the ones that matter."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryInput, {
				value: text,
				onChange: setText,
				photo,
				onPhotoChange: setPhoto
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-title-md text-on-surface",
							children: "Who is this about?"
						}), people.length > 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPicking(true),
							className: "shrink-0 text-label-md font-medium text-primary transition-colors hover:text-primary/80",
							children: "See all →"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "-mt-2 text-body-sm text-on-surface-variant",
						children: "Optional — leave it as a personal note."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPersonId(void 0),
							className: cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-label-md transition-all", !personId ? "bg-primary-container text-on-primary-container shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								name: "self_improvement",
								className: "text-[16px]"
							}), "Just me"]
						}), visiblePeople.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setPersonId(person.id);
								setNewName("");
							},
							className: cn("flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-label-md transition-all", personId === person.id ? "bg-primary-container text-on-primary-container shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								initial: person.initial,
								tone: person.tone,
								size: "sm",
								photoUrl: person.avatarUrl,
								className: "h-7 w-7 text-[12px]"
							}), person.name]
						}, person.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center gap-2.5 rounded-2xl border border-dashed border-outline-variant/60 px-4 py-2.5 transition-colors focus-within:border-primary/50 focus-within:bg-surface-container-lowest",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "person_add",
							className: "text-[18px] text-outline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: newName,
							onChange: (e) => {
								setNewName(e.target.value);
								if (e.target.value) setPersonId(void 0);
							},
							placeholder: "Add someone new…",
							"aria-label": "Add someone new",
							className: "w-full bg-transparent text-label-md text-on-surface outline-none placeholder:text-outline"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: picking,
				onOpenChange: setPicking,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "bottom",
					className: "max-h-[85vh] overflow-y-auto sm:mx-auto sm:max-w-lg sm:rounded-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
							className: "text-title-md text-on-surface",
							children: "Who is this about?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, {
							className: "text-body-sm text-on-surface-variant",
							children: "Your words stay exactly where you left them."
						})] }),
						people.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Search people…",
							"aria-label": "Search people",
							className: "mb-2 w-full rounded-full bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1 pb-6",
							children: matchingPeople.length ? matchingPeople.map((person) => {
								const selected = personId === person.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setPersonId(person.id);
										setNewName("");
										setPicking(false);
									},
									className: cn("flex items-center gap-3 rounded-full px-3 py-2 text-left text-body-md transition-colors", selected ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container-low"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
											initial: person.initial,
											tone: person.tone,
											size: "sm",
											photoUrl: person.avatarUrl
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: person.name
										}),
										selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											name: "check",
											className: "ml-auto text-[18px]"
										}) : null
									]
								}, person.id);
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-4 text-body-sm italic text-on-surface-variant",
								children: "Nobody by that name yet."
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-title-md text-on-surface",
						children: "Nudge me about it"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "-mt-1.5 text-body-sm italic text-on-surface-variant",
						children: "Only if you’d like a little reminder later."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderSelector, {
						value: reminder,
						onChange: setReminder,
						date: reminderDate,
						time: reminderTime,
						onDateChange: setReminderDate,
						onTimeChange: setReminderTime
					}),
					dateMissing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
						className: "mt-2",
						children: "Pick the day you’d like to be nudged — we’ll use 9:00 AM unless you choose a time."
					}) : dateInPast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
						tone: "error",
						className: "mt-2",
						children: "That moment has already passed. Pick a day or time that’s still ahead, or choose “No reminder”."
					}) : reminder === "date" && chosenRemindAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DataNotice, {
						className: "mt-2",
						children: [
							"Your nudge lands ",
							reminderTiming(chosenRemindAt.toISOString()),
							"."
						]
					}) : null
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
				tone: "error",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2.5 pb-6 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryButton, {
					onClick: handleSave,
					disabled: !canSave,
					className: cn("w-full sm:w-auto sm:px-12", !canSave && "opacity-50"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "favorite",
						filled: true,
						className: "text-[18px]"
					}), saving ? photo ? "Uploading photo…" : "Keeping…" : "Keep this memory"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-label-sm text-outline",
					children: "Kept privately in your account."
				})]
			})
		]
	}) }) });
}
//#endregion
export { Capture as component };
