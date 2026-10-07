import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useKeepDearly, d as isSupportedAvatar, n as AVATAR_TOO_LARGE_MESSAGE, r as AVATAR_WRONG_TYPE_MESSAGE, t as AVATAR_ACCEPT } from "./keepdearly-store-XbRJti1g.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { a as DataNotice, o as Icon, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PrimaryButton } from "./PrimaryButton-D1tbk-xH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people.new-PYaRL-c0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Add someone, on their own.
*
* This is the standalone way into the people collection — it used to be a tile
* that quietly opened "Keep a memory", which asked for words before it had even
* asked who the person was. A name is all that is required; a photo is a lovely
* extra and never a condition.
*
* It writes through the same `savePerson` the inline "or add someone new…" field
* inside the memory composer uses, so there is exactly one person model and one
* creation path however you arrive here.
*
* A plain browser file input sits behind the photo button, so Android, iOS and
* desktop all open the picker people already know. No `capture` attribute, which
* would skip the choices they expect.
*/
function NewPerson() {
	const navigate = useNavigate();
	const { savePerson } = useKeepDearly();
	const fileInput = (0, import_react.useRef)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [photo, setPhoto] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [problem, setProblem] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const trimmed = name.trim();
	const canSave = trimmed.length > 0 && !saving;
	function openPicker() {
		if (fileInput.current) fileInput.current.value = "";
		fileInput.current?.click();
	}
	function accept(next) {
		setProblem(null);
		if (!next) return;
		if (!isSupportedAvatar(next)) {
			setProblem(AVATAR_WRONG_TYPE_MESSAGE);
			return;
		}
		if (next.size > 5242880) {
			setProblem(AVATAR_TOO_LARGE_MESSAGE);
			return;
		}
		if (preview) URL.revokeObjectURL(preview);
		setPhoto(next);
		setPreview(URL.createObjectURL(next));
	}
	function clearPhoto() {
		if (preview) URL.revokeObjectURL(preview);
		setPreview(null);
		setPhoto(null);
		setProblem(null);
	}
	async function handleSave() {
		if (!canSave) return;
		setSaving(true);
		setError(null);
		const result = await savePerson({
			name: trimmed,
			photo
		});
		setSaving(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		if (result.personId) {
			await navigate({
				to: "/people/$personId",
				params: { personId: result.personId }
			});
			return;
		}
		await navigate({ to: "/people" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 pt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/people",
				className: "inline-flex w-fit items-center gap-1 text-label-md text-primary hover:underline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "arrow_back",
					className: "text-[16px]"
				}), "People you keep close"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-headline-lg text-on-surface",
					children: "Add someone"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-body-md text-on-surface-variant",
					children: "Keep the people who matter close."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-fixed text-headline-md text-primary shadow-sm",
						children: preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: preview,
							alt: "The photo you picked",
							className: "h-full w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "person",
							className: "text-[36px]"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-col items-start gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileInput,
								type: "file",
								accept: AVATAR_ACCEPT,
								tabIndex: -1,
								"aria-hidden": "true",
								onChange: (event) => accept(event.target.files?.[0]),
								className: "sr-only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: openPicker,
								className: "inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-label-md transition-all hover:bg-surface-container hover:text-on-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									name: "add_photo_alternate",
									className: "text-[16px]"
								}), preview ? "Change photo" : "Add photo"]
							}),
							preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: clearPhoto,
								className: "inline-flex items-center gap-1.5 px-1 text-label-sm text-on-surface-variant transition-colors hover:text-on-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									name: "close",
									className: "text-[14px]"
								}), "Remove photo"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-label-sm text-outline",
								children: "Optional"
							})
						]
					})]
				}),
				problem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-label-sm text-error",
					children: problem
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "person-name",
						className: "text-title-sm text-on-surface",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "person-name",
						value: name,
						onChange: (event) => setName(event.target.value),
						onKeyDown: (event) => {
							if (event.key === "Enter") handleSave();
						},
						placeholder: "Who is it?",
						autoComplete: "off",
						className: "w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-lg text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
					tone: "error",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryButton, {
					onClick: () => void handleSave(),
					disabled: !canSave,
					className: canSave ? void 0 : "opacity-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "person_add",
						className: "text-[18px]"
					}), saving ? "Adding…" : "Add person"]
				})
			]
		})]
	}) }) });
}
//#endregion
export { NewPerson as component };
