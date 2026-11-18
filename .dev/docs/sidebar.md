# Sidebar & menu

- `header.ut`: provides the empty `#sidebar` shell for `menu-shadcn.js`.
- `sidebar-shadcn.js`: state machine for theme (light/dark/device), sidebar collapse/expand, accordion, and mobile drawer — exposed as `window.ShadcnSidebar` after the `shadcn-sidebar-ready` event fires.
- `menu-shadcn.js`: builds the sidebar chrome and emits `shadcn-sidebar-ready` before waiting for the menu request, so the branding, theme toggle and drawer/collapse controls are immediately available. Its navigation listeners are delegated. It resolves the `admin` branch of `ui.menu.load()`, then renders a two-level sidebar; `ICON_MAP` maps a LuCI menu node's `name` to `/shadcn/icons/*.svg`; deeper levels render as `#tabmenu`. `syncRoute()` re-marks the active sidebar item, breadcrumb and tabs from `L.env` after a [router](router.md) swap without rebuilding the sidebar; `closeSurfaces()` closes palette/drawer/popover.

The theme captures no view transitions (`components/_view-transitions.css` sets `:root { view-transition-name: none }`); swapped and freshly loaded content fades in instead. On desktop, collapsing eases the rail's width (`_layout.css`) and `#main-wrapper`, a flex-1 sibling, follows it frame by frame: the content is pushed, never snapped and slid back. `sidebar-shadcn.js` sets `html[data-sidebar-anim]` on the first toggle so a page load never plays the transition.
