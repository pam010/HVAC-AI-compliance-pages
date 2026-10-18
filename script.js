const bookingUrl = "";

const scenarios = {
  full: {
    status: "CALL ANSWERED",
    messages: [
      { speaker: "AI AGENT", text: "Thanks for calling. How can I help with your HVAC system today?" },
      { speaker: "CALLER", text: "My AC is running, but it's blowing warm air." },
      { speaker: "AI AGENT", text: "When did you first notice that? Any unusual smell or water leaking?" },
      { speaker: "CALLER", text: "This afternoon. No smell or leak." },
      { speaker: "AI AGENT", text: "Got it. I'll note the issue for the team. What's the service ZIP and the best time to call you back?" },
      { speaker: "CALLER", text: "77084. This evening works." }
    ],
    outcome: `<div class="outcome-kicker">CONTACT RECORD · SAMPLE</div><h3>Ready for the owner</h3><p>The request is organized around the details gathered on the call.</p><dl class="outcome-list"><div><dt>Issue</dt><dd>AC blows warm air</dd></div><div><dt>Started</dt><dd>This afternoon</dd></div><div><dt>Service ZIP</dt><dd>77084</dd></div><div><dt>Callback</dt><dd>This evening</dd></div></dl><div class="outcome-end"><span class="outcome-dot" aria-hidden="true"></span> Review in LeadConnector</div>`
  },
  short: {
    status: "CALL ENDED EARLY",
    messages: [
      { speaker: "AI AGENT", text: "Thanks for calling. How can I help with your HVAC system today?" },
      { speaker: "CALLER", text: "My AC isn't cooling—sorry, I have to go." },
      { speaker: "SYSTEM", text: "Call ended before the team could collect the full request." },
      { speaker: "FOLLOW-UP PATH", text: "When messaging is approved and consent requirements are met, the caller can receive a link to the service form." },
      { speaker: "CUSTOMER FORM", text: "The caller adds the problem, callback window, and optional photos." }
    ],
    outcome: `<div class="outcome-kicker">RECOVERY PATH · SAMPLE</div><h3>A way to finish the request</h3><p>After an eligible follow-up, the customer can complete the existing GHL form. Submitted details and photos attach to the contact record.</p><dl class="outcome-list"><div><dt>Form</dt><dd>Customer service intake</dd></div><div><dt>Customer adds</dt><dd>Issue + callback window</dd></div><div><dt>Optional</dt><dd>Site photos</dd></div><div><dt>Owner reviews</dt><dd>LeadConnector contact</dd></div></dl><div class="outcome-end pending"><span class="outcome-dot" aria-hidden="true"></span> SMS activation depends on approval</div>`
  }
};

const messagesEl = document.getElementById("messages");
const outcomeEl = document.getElementById("outcome-body");
const statusEl = document.getElementById("call-status");
const handoffStatusEl = document.getElementById("handoff-status");
const countEl = document.getElementById("demo-count");
const playButton = document.getElementById("play-pause");
const playLabel = document.getElementById("play-label");
const playSymbol = document.getElementById("play-symbol");
const restartButton = document.getElementById("restart");
const tabs = [...document.querySelectorAll(".scenario-tab")];

let activeScenario = "full";
let shown = 0;
let timer = null;
let playing = false;

function stopPlayback() {
  if (timer) window.clearTimeout(timer);
  timer = null;
  playing = false;
  playLabel.textContent = shown === scenarios[activeScenario].messages.length ? "Play again" : "Play demo";
  playSymbol.textContent = "▶";
  playButton.setAttribute("aria-label", playLabel.textContent);
}

function showNextMessage() {
  const scenario = scenarios[activeScenario];
  if (shown >= scenario.messages.length) {
    statusEl.textContent = scenario.status;
    handoffStatusEl.textContent = activeScenario === "short" ? "CONDITIONAL" : "OWNER READY";
    outcomeEl.innerHTML = scenario.outcome;
    stopPlayback();
    return;
  }
  const item = scenario.messages[shown];
  const article = document.createElement("article");
  article.className = `message message-${item.speaker === "AI AGENT" ? "agent" : item.speaker === "CALLER" ? "caller" : "system"}`;
  const speaker = document.createElement("span");
  speaker.className = "message-speaker";
  speaker.textContent = item.speaker;
  const text = document.createElement("p");
  text.textContent = item.text;
  article.append(speaker, text);
  messagesEl.append(article);
  shown += 1;
  countEl.textContent = `${shown} / ${scenario.messages.length}`;
  messagesEl.scrollTop = messagesEl.scrollHeight;
  if (shown >= scenario.messages.length) timer = window.setTimeout(showNextMessage, 850);
  else if (playing) timer = window.setTimeout(showNextMessage, 1700);
}

function resetScenario(name) {
  stopPlayback();
  activeScenario = name;
  shown = 0;
  playLabel.textContent = "Play demo";
  playSymbol.textContent = "▶";
  playButton.setAttribute("aria-label", "Play demo");
  messagesEl.replaceChildren();
  countEl.textContent = `0 / ${scenarios[name].messages.length}`;
  statusEl.textContent = "READY TO PLAY";
  handoffStatusEl.textContent = "PREVIEW";
  outcomeEl.innerHTML = `<div class="outcome-idle"><span aria-hidden="true">↗</span><p>Play the conversation to see what the owner receives.</p></div>`;
  tabs.forEach((tab) => {
    const selected = tab.dataset.scenario === name;
    tab.classList.toggle("is-selected", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.getElementById("demo-panel").setAttribute("aria-labelledby", name === "full" ? "tab-full" : "tab-short");
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => resetScenario(tab.dataset.scenario));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    resetScenario(next.dataset.scenario);
    next.focus();
  });
});

playButton.addEventListener("click", () => {
  if (playing) return stopPlayback();
  if (shown === scenarios[activeScenario].messages.length) resetScenario(activeScenario);
  playing = true;
  playLabel.textContent = "Pause demo";
  playSymbol.textContent = "Ⅱ";
  playButton.setAttribute("aria-label", "Pause dialogue");
  statusEl.textContent = "PLAYING SAMPLE";
  showNextMessage();
});

restartButton.addEventListener("click", () => resetScenario(activeScenario));

document.getElementById("booking-button").addEventListener("click", () => {
  if (bookingUrl) {
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const status = document.getElementById("booking-status");
  status.hidden = false;
  status.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("year").textContent = new Date().getFullYear();
resetScenario("full");
