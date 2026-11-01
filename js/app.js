import { mountDonkey, speakInto } from "./donkey.js";
import { askAI } from "./ai.js";

const STORAGE_KEY = "yumori-prototype-v1";

const defaults = {
  username: "my diary",
  country: "",
  avatar: "",
  colours: [],
  colourNote: "",
  style: {
    aesthetic: "",
    comfort: "",
    hairIdeas: "",
    accessoryIdeas: ""
  },
  clothes: [],
  checklist: []
};

let data = loadData();
let activeCategory = "All";
let pendingPhoto = "";

function loadData() {
  try {
    return {
      ...structuredClone(defaults),
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    };
  } catch {
    return structuredClone(defaults);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");

  setTimeout(() => el.classList.remove("show"), 2300);
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function showPage(name) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.toggle("active", p.id === `page-${name}`);
  });

  document.querySelectorAll("[data-page]").forEach(b => {
    b.classList.toggle("active", b.dataset.page === name);
  });

  document.querySelector(".desktop-nav").classList.remove("open");

  if (name === "wardrobe") renderWardrobe();
  if (name === "outfits") renderPlannerWardrobe();
  if (name === "profile") renderProfile();

  window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth"
  });
}

document.addEventListener("click", e => {
  const target = e.target.closest("[data-page]");
  if (target) showPage(target.dataset.page);
});

document.getElementById("mobileMenu").addEventListener("click", () => {
  document.querySelector(".desktop-nav").classList.toggle("open");
});

function renderChecklist() {
  const list = document.getElementById("checkList");
  list.innerHTML = "";

  document.getElementById("checkEmpty").hidden =
    data.checklist.length > 0;

  data.checklist.forEach(item => {
    const li = document.createElement("li");

    li.className = "check-item" + (item.done ? " done" : "");

    li.innerHTML = `
      <input
        type="checkbox"
        ${item.done ? "checked" : ""}
        aria-label="Mark ${safeText(item.text)} as brought"
      >
      <span>${safeText(item.text)}</span>
      <button class="remove-item" aria-label="Remove item">×</button>
    `;

    li.querySelector("input").addEventListener("change", e => {
      item.done = e.target.checked;

      data.checklist.sort(
        (a, b) => Number(a.done) - Number(b.done)
      );

      saveData();
      renderChecklist();
    });

    li.querySelector("button").addEventListener("click", () => {
      data.checklist = data.checklist.filter(
        x => x.id !== item.id
      );

      saveData();
      renderChecklist();
    });

    list.appendChild(li);
  });
}

document.getElementById("checkForm").addEventListener("submit", e => {
  e.preventDefault();

  const input = document.getElementById("checkInput");
  const text = input.value.trim();

  if (!text) return;

  if (!data.checklist.some(
    x => x.text.toLowerCase() === text.toLowerCase()
  )) {
    data.checklist.push({
      id: crypto.randomUUID(),
      text,
      done: false
    });
  }

  saveData();
  input.value = "";
  renderChecklist();
});

const swatchColours = {
  "Sage": "#a9bda5",
  "Dusty rose": "#d5a6a5",
  "Butter yellow": "#e8d99c",
  "Misty blue": "#a9bdc8",
  "Warm cocoa": "#9b7961",
  "Lavender": "#c4b5d4",
  "Cream": "#eee5d2",
  "Berry": "#a66f7b"
};

function renderColours() {
  document.querySelectorAll(".swatch").forEach(b => {
    b.classList.toggle(
      "selected",
      data.colours.includes(b.dataset.colour)
    );
  });

  document.getElementById("colourNote").value =
    data.colourNote || "";

  const holder = document.getElementById("savedPalette");

  holder.innerHTML = data.colours.length
    ? data.colours.map(c => `
        <span class="palette-chip">
          <i style="--chip:${swatchColours[c]}"></i>
          ${safeText(c)}
        </span>
      `).join("")
    : '<p class="empty-note">Your chosen shades will appear here.</p>';
}

document.querySelectorAll(".swatch").forEach(b => {
  b.addEventListener("click", () => {
    const c = b.dataset.colour;

    data.colours = data.colours.includes(c)
      ? data.colours.filter(x => x !== c)
      : [...data.colours, c];

    renderColours();
  });
});

document.getElementById("saveColours").addEventListener("click", () => {
  data.colourNote =
    document.getElementById("colourNote").value.trim();

  saveData();
  renderColours();

  document.getElementById("colourFeedback").textContent =
    "Your colour notes have been saved. ♡";
});

function renderStyle() {
  for (const key of [
    "aesthetic",
    "comfort",
    "hairIdeas",
    "accessoryIdeas"
  ]) {
    document.getElementById(key).value = data.style[key] || "";
  }
}

document.getElementById("saveStyle").addEventListener("click", () => {
  for (const key of [
    "aesthetic",
    "comfort",
    "hairIdeas",
    "accessoryIdeas"
  ]) {
    data.style[key] =
      document.getElementById(key).value.trim();
  }

  saveData();

  document.getElementById("styleFeedback").textContent =
    "Your style notes are tucked safely into this browser. ୨୧";
});

const dialog = document.getElementById("uploadDialog");

document.getElementById("openUpload").addEventListener("click", () => {
  document.getElementById("uploadForm").reset();

  document.getElementById("photoPreview").textContent =
    "Your photo preview will appear here.";

  pendingPhoto = "";
  dialog.showModal();
});

document.getElementById("closeUpload").addEventListener("click", () => {
  dialog.close();
});

document.getElementById("clothingPhoto").addEventListener("change", async e => {
  const file = e.target.files[0];

  if (!file) return;

  if (file.size > 1_500_000) {
    document.getElementById("uploadFeedback").textContent =
      "Please choose an image smaller than 1.5 MB for this browser demo.";

    e.target.value = "";
    return;
  }

  pendingPhoto = await fileToDataURL(file);

  document.getElementById("photoPreview").innerHTML =
    `<img src="${pendingPhoto}" alt="Clothing preview">`;
});

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

document.getElementById("uploadForm").addEventListener("submit", e => {
  e.preventDefault();

  if (!pendingPhoto) {
    document.getElementById("uploadFeedback").textContent =
      "Please choose a photo first.";
    return;
  }

  const name =
    document.getElementById("clothingName").value.trim() ||
    "Untitled piece";

  data.clothes.unshift({
    id: crypto.randomUUID(),
    name,
    category: document.getElementById("clothingCategory").value,
    photo: pendingPhoto
  });

  try {
    saveData();
  } catch {
    data.clothes.shift();

    document.getElementById("uploadFeedback").textContent =
      "Your browser storage is full. Try a smaller photo or remove older items.";

    return;
  }

  dialog.close();
  renderWardrobe();
  renderPlannerWardrobe();

  toast("Your clothing piece has been saved ♡");
});

document.getElementById("categoryFilters").addEventListener("click", e => {
  const b = e.target.closest("[data-category]");

  if (!b) return;

  activeCategory = b.dataset.category;

  document.querySelectorAll(".category-chip").forEach(x => {
    x.classList.toggle("active", x === b);
  });

  renderWardrobe();
});

function renderWardrobe() {
  const grid = document.getElementById("wardrobeGrid");

  const items = data.clothes.filter(x =>
    activeCategory === "All" || x.category === activeCategory
  );

  if (!items.length) {
    grid.innerHTML =
      '<p class="empty-note">No pieces here yet. Add a photo to start your collection. ୨୧</p>';

    return;
  }

  grid.innerHTML = items.map(x => `
    <article class="clothing-card">
      <img src="${x.photo}" alt="${safeText(x.name)}">

      <button
        class="delete-clothing"
        data-delete="${x.id}"
        aria-label="Delete ${safeText(x.name)}"
      >×</button>

      <div class="clothing-info">
        <strong>${safeText(x.name)}</strong>
        <small>${safeText(x.category)}</small>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-delete]").forEach(b => {
    b.addEventListener("click", () => {
      if (!confirm(
        "Remove this clothing photo from your local wardrobe?"
      )) return;

      data.clothes = data.clothes.filter(
        x => x.id !== b.dataset.delete
      );

      saveData();
      renderWardrobe();
      renderPlannerWardrobe();
    });
  });
}

function renderPlannerWardrobe() {
  const box = document.getElementById("plannerWardrobe");

  box.innerHTML = data.clothes.length
    ? data.clothes.slice(0, 12).map(x => `
        <div class="planner-item">
          <img src="${x.photo}" alt="">
          <span>
            ${safeText(x.name)}
            <br>
            <small>${safeText(x.category)}</small>
          </span>
        </div>
      `).join("")
    : '<p class="empty-note">Add clothing to your wardrobe to see it here.</p>';
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  if (type === "assistant") {
    const mascot = document.createElement("span");
    mascot.className = "chat-mascot";

    mountDonkey(mascot, "idle", 32);

    const words = document.createElement("span");
    words.className = "chat-message-text";

    div.append(mascot, words);

    speakInto(words, String(text), { speed: 12 });
  } else {
    div.textContent = String(text);
  }

  const box = document.getElementById("chatMessages");

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

document.getElementById("chatForm").addEventListener("submit", e => {
  e.preventDefault();

  const input = document.getElementById("chatInput");
  const text = input.value.trim();

  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  askAI({
    message: text,
    clothes: data.clothes,
    profile: {
      colours: data.colours,
      style: data.style
    }
  })
    .then(reply => addMessage(reply, "assistant"))
    .catch(() => addMessage(
      "I couldn't reach the styling service just now. Please try again in a moment.",
      "assistant"
    ));
});

function renderProfile() {
  document.getElementById("username").value =
    data.username === "my diary" ? "" : data.username;

  document.getElementById("country").value = data.country || "";

  document.getElementById("navUsername").textContent =
    data.username || "my diary";

  const avatar = document.getElementById("avatarPreview");

  avatar.innerHTML = data.avatar
    ? `<img src="${data.avatar}" alt="Your profile picture">`
    : "୨୧";
}

document.getElementById("avatarUpload").addEventListener("change", async e => {
  const file = e.target.files[0];

  if (!file) return;

  if (file.size > 1_000_000) {
    document.getElementById("profileFeedback").textContent =
      "Please choose an image smaller than 1 MB.";

    e.target.value = "";
    return;
  }

  data.avatar = await fileToDataURL(file);
  renderProfile();
});

document.getElementById("saveProfile").addEventListener("click", () => {
  data.username =
    document.getElementById("username").value.trim() || "my diary";

  data.country =
    document.getElementById("country").value.trim();

  try {
    saveData();
    renderProfile();

    document.getElementById("profileFeedback").textContent =
      "Your profile has been saved on this device. ♡";
  } catch {
    document.getElementById("profileFeedback").textContent =
      "Storage is full. Try a smaller profile picture.";
  }
});

document.getElementById("resetData").addEventListener("click", () => {
  if (!confirm(
    "This will permanently clear Yumori data saved in this browser. Continue?"
  )) return;

  localStorage.removeItem(STORAGE_KEY);
  data = structuredClone(defaults);

  renderAll();
  toast("Local Yumori data has been reset.");
});

function renderAll() {
  renderChecklist();
  renderColours();
  renderStyle();
  renderWardrobe();
  renderPlannerWardrobe();
  renderProfile();
}

renderAll();

// Reusable donkey placement in the existing Yumori interface.
mountDonkey(
  document.getElementById("heroMascot"),
  "cheer",
  150
);
