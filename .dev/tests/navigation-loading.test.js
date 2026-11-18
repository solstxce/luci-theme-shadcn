import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const footer = readFileSync(
  new URL("../../ucode/template/themes/shadcn/footer.ut", import.meta.url),
  "utf8",
);
const boot = [...footer.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((script) => script.includes("L.require('menu-shadcn')"));

for (const navigation of [undefined, {}]) {
  test(`theme modules start without waiting for menu resolution (Navigation API: ${!!navigation})`, () => {
    const requested = [];
    const L = {
      require(name) {
        requested.push(name);
        return new Promise(() => {});
      },
    };
    new Function("L", "window", boot)(L, { navigation });
    assert.ok(requested.includes("menu-shadcn"));
    assert.equal(requested.includes("router-shadcn"), !!navigation);
  });
}

const menuSource = readFileSync(
  new URL("../src/resource/menu-shadcn.js", import.meta.url),
  "utf8",
);

test("sidebar chrome and controls are ready while the menu request is pending", async () => {
  const calls = [];
  let resolveMenu;
  const pendingMenu = new Promise((resolve) => {
    resolveMenu = resolve;
  });
  const menu = new Function(
    "baseclass",
    "ui",
    "document",
    "window",
    menuSource,
  )(
    { extend: (value) => value },
    { menu: { load: () => pendingMenu } },
    { dispatchEvent: (event) => calls.push(event.type) },
    { addEventListener: (event) => calls.push(event) },
  );
  menu.renderSidebarChrome = () => calls.push("chrome");
  menu.initUciIndicator = () => calls.push("indicator");
  menu.render = (tree) => calls.push(tree);
  menu.__init__();
  assert.deepEqual(calls, ["chrome", "indicator", "shadcn-sidebar-ready"]);
  const tree = { children: {} };
  resolveMenu(tree);
  await pendingMenu;
  assert.deepEqual(calls, [
    "chrome",
    "indicator",
    "shadcn-sidebar-ready",
    tree,
  ]);
});

const header = readFileSync(
  new URL("../../ucode/template/themes/shadcn/header.ut", import.meta.url),
  "utf8",
);
test("sidebar rendering keeps the authentication session out of browser storage", () => {
  assert.doesNotMatch(header, /data-nav-stamp|cache\.html/);
  assert.doesNotMatch(menuSource, /navStamp|sessionStorage\.setItem/);
  assert.match(
    header,
    /sessionStorage\.removeItem\('shadcn\.sidebar\.cache'\)/,
  );
});
