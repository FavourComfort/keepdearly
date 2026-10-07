import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people._personId-D6GpJZLf.js
var $$splitComponentImporter = () => import("./people._personId-BiRJ8E2i.mjs");
var Route = createFileRoute("/people/$personId")({
	head: () => ({ meta: [
		{ title: "A person you keep close — keepdearly" },
		{
			name: "description",
			content: "Their likes, their dislikes, gift ideas and the little things they've told you."
		},
		{
			property: "og:title",
			content: "A person you keep close — keepdearly"
		},
		{
			property: "og:description",
			content: "Their likes, their dislikes, gift ideas and the little things they've told you."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
