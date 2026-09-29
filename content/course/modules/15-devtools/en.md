# Browser DevTools for QA

The user interface shows you the outcome. DevTools shows you what actually happened. A button can look broken, be broken, or be fine while a request behind it failed — and the only way to tell those apart in seconds is the browser's built-in tools.

Open DevTools with F12 (or Cmd+Option+I on macOS). Everything below works in Chrome; Firefox has the same panels under slightly different names.

## Network: your daily workhorse

The Network tab lists every request the page makes. Keep it open while you test.

Basic loop:

1. Open the Network tab, refresh the page to capture the full load.
2. Perform one user action and watch which requests fire.
3. Read each row: method, URL, status code, size, time.
4. Click a row to inspect request headers, query parameters, payload, and response.

What this gives you:

- The real API calls behind a click, including ones the UI never mentions.
- Status codes: 200 is fine, 4xx is the client's request, 5xx is the server's problem.
- Redirects (3xx) and failed loads (red rows) the UI may swallow silently.
- Response bodies: the data the UI renders comes from here, so a wrong value on screen means either the response or the rendering is wrong.

Two filters matter most: the **Fetch/XHR** filter hides images and scripts, and the search inside a response finds where a displayed value came from.

For bug reports, right-click a failed request and use **Copy as cURL** — the developer can replay your exact failing request.

## Console: errors first

The Console shows JavaScript errors and messages from scripts. Rule of thumb: before filing a UI glitch, look here.

- Red entries are errors: unhandled exceptions, failed fetches, broken scripts.
- Each error points to a source file and line — paste that into the bug report.
- Script messages (`console.log`, warnings) explain what the code was doing.
- A UI that "does nothing" with a console error is a different bug than one without.

You don't need to read or fix code. You need to notice that the console is not empty and copy what it says.

## Elements: inspecting the DOM

The Elements panel shows the live DOM: what is really in the page right now.

- Right-click any element → Inspect to jump to it.
- Compare what you see with what is there: an element can be present but hidden, missing entirely, or filled with unexpected text.
- A crash or a missing section often leaves an empty container behind — visible here first.
- Copy a selector for your bug report so a developer can find the exact element.

## Responsive mode: layouts without devices

The device toolbar (the phone icon) switches DevTools into responsive mode.

- Test any viewport width: phones, tablets, narrow laptop windows.
- Rotate orientation and watch how the layout reacts.
- Common findings: content clipped at the edges, elements overlapping, horizontal scroll appearing, sticky bars eating content.
- Emulated touch is approximate. For layout and breakpoints it is enough; for hardware behavior (sensors, real touch precision) it is not — say so in the report and flag it as untested.

## Overriding responses: reproducing hidden states

Local Overrides let you replace a server response with your own and reload the page as if the server sent it. In Chrome: Network tab → right-click a request → **Override content**.

Use it to reproduce states the backend cannot easily produce on demand:

- an empty list, a huge list, or a list with strange values;
- an error response (400, 500) and how the UI handles it;
- an edge-case payload (a missing field, a very long name, a zero balance).

Rules that keep this honest:

- Overrides exist to **reproduce and document**, never to "prove the bug is fixed".
- Always record: which request you overrode, what you replaced it with, and what the UI did.
- Turn overrides off afterwards — a forgotten override turns the next hour of testing into false findings.
- In the bug report, separate clearly: what the real server returned and what you simulated.

## Junior habits worth keeping

- Attach request + status code to every API-related bug report.
- Check the Console before calling something a UI glitch.
- A "bug" that survives a hard refresh is real; one that disappears was probably a stale page.
- When the UI and the response disagree, say which one is wrong — that observation alone makes a report valuable.

Practice what you just read in the practice task for this module: a network hunt on a real site, ending with one documented override experiment.
