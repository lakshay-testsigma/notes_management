// A hash router: the part of the URL after "#" picks the view.
export function createRouter({ doc, win, root, views }) {
  let current = null;

  function render() {
    const name = win.location.hash.replace(/^#\/?/, "") || "home";
    const createView = views[name] ?? views.home;
    if (current) current.unmount();
    root.replaceChildren();
    current = createView({ doc, win });
    current.mount(root);
  }

  win.addEventListener("hashchange", render);
  render();

  return {
    render,
    stop() {
      win.removeEventListener("hashchange", render);
    },
  };
}
