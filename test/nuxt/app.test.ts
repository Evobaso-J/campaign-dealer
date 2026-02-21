import { expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import App from "~/app.vue";

it("can mount the app", async () => {
  const component = await mountSuspended(App);
  expect(component.html()).toBeTruthy();
});
