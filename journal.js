/* Yumori journal — entries stay in this browser only. */

const JOURNAL_KEY = "yumori-journal-v1";

const form = document.getElementById("journalForm");
const entriesBox = document.getElementById("journalEntries");
const countLabel = document.getElementById("entryCount");

let entries = readEntries();

/* Read saved entries */

function readEntries() {
  try {
    const value = JSON.parse(
      localStorage.getItem(JOURNAL_KEY) || "[]"
    );

    return Array.isArray(value) ? value : [];

  } catch {
    return [];
  }
}

/* Save entries */

function saveEntries() {
  try {
    localStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify(entries)
    );

    return true;

  } catch {
    return false;
  }
}

/* Prevent HTML from being inserted through journal text */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

/* Display journal entries */

function renderEntries() {

  countLabel.textContent =
    `${entries.length} ${
      entries.length === 1 ? "entry" : "entries"
    }`;

  if (!entries.length) {

    entriesBox.innerHTML =
      '<p class="empty-note">Your journal is waiting for its first little note. ୨୧</p>';

    return;
  }

  entriesBox.innerHTML = entries.map(entry => `
    <article class="journal-entry">

      <div class="entry-meta">
        <span class="tag">${escapeHTML(entry.category)}</span>
        <time>${escapeHTML(entry.date)}</time>
      </div>

      <h3>${escapeHTML(entry.title)}</h3>

      <p>${escapeHTML(entry.text).replace(/\n/g, "<br>")}</p>

      <button
        class="text-button danger"
        data-remove="${entry.id}"
      >
        Delete entry
      </button>

    </article>
  `).join("");

  /* Delete buttons */

  entriesBox.querySelectorAll("[data-remove]").forEach(button => {

    button.addEventListener("click", () => {

      if (!confirm("Delete this journal entry?")) {
        return;
      }

      entries = entries.filter(
        entry => entry.id !== button.dataset.remove
      );

      saveEntries();
      renderEntries();

    });

  });

}

/* Create a new journal entry */

form.addEventListener("submit", event => {

  event.preventDefault();

  const entry = {

    id:
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7),

    title:
      document.getElementById("entryTitle").value.trim(),

    category:
      document.getElementById("entryMood").value,

    text:
      document.getElementById("entryText").value.trim(),

    date:
      new Date().toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
      })

  };

  if (!entry.title || !entry.text) {
    return;
  }

  entries.unshift(entry);

  if (!saveEntries()) {

    entries.shift();

    document.getElementById("journalFeedback").textContent =
      "Browser storage is full. Try a shorter entry.";

    return;
  }

  form.reset();

  document.getElementById("journalFeedback").textContent =
    "Your little note has been saved. ♡";

  renderEntries();

});

/* Load saved entries when the page opens */

renderEntries();
