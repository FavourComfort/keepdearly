import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capture-Clr17-G-.js
var $$splitComponentImporter = () => import("./capture-dOaO7WWF.mjs");
var Route = createFileRoute("/capture")({
	validateSearch: (search) => ({ person: typeof search["person"] === "string" ? search["person"] : void 0 }),
	head: () => ({ meta: [
		{ title: "Keep a memory — keepdearly" },
		{
			name: "description",
			content: "Write down the small thing someone told you, while it's still fresh."
		},
		{
			property: "og:title",
			content: "Keep a memory — keepdearly"
		},
		{
			property: "og:description",
			content: "Write down the small thing someone told you, while it's still fresh."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
