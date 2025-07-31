(() => {
  const name = "outbound-link-click";
  document.querySelectorAll("a").forEach((a) => {
    if (
      a.host !== window.location.host &&
      !a.getAttribute("data-umami-event")
    ) {
      a.setAttribute("data-umami-event", name);
      a.setAttribute("data-umami-event-url", a.href);
      a.setAttribute("data-umami-event-path", a.pathname);
    }
  });
})();
