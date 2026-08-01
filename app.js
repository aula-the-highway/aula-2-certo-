/* =========================================================================
   TECLA.EXE — jogo de digitação
   Persistência: IndexedDB (banco de dados local do navegador), com
   fallback automático para localStorage. Continua 100% offline.
   ========================================================================= */

/* ---------------------------------------------------------------------
   HASH simples (apenas para não guardar senha em texto puro; NÃO é
   criptografia real — este jogo roda 100% no navegador, sem servidor).
--------------------------------------------------------------------- */
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return String(hash);
}

/* ---------------------------------------------------------------------
   ESTADO EM MEMÓRIA (espelha o banco de dados, carregado no início)
--------------------------------------------------------------------- */
let DB = { users: {} };
let currentUsername = null;

const MASTER_USERNAME = "master";
const MASTER_PASSWORD = "master";

function currentUser() {
  return DB.users[currentUsername];
}
function persistCurrentUser() {
  if (!currentUsername) return;
  dbSaveUser(currentUsername, DB.users[currentUsername]);
}

function isMasterUser(username) {
  return String(username || "").trim().toLowerCase() === MASTER_USERNAME;
}

function isLevelUnlockedForUser(user, levelId, username = currentUsername) {
  if (!user) return false;
  if (user.isMaster || isMasterUser(username)) return true;
  return Boolean(user.levels?.[levelId]?.unlocked);
}

async function ensureMasterAccount() {
  if (DB.users[MASTER_USERNAME]) return;

  DB.users[MASTER_USERNAME] = {
    passwordHash: simpleHash(MASTER_PASSWORD),
    character: defaultCharacter(),
    targetPpm: 30,
    levels: defaultLevelsProgress(),
    bestPpmOverall: 0,
    bestAccOverall: 0,
    isMaster: true
  };

  Object.values(DB.users[MASTER_USERNAME].levels).forEach(prog => {
    prog.unlocked = true;
  });

  await dbSaveUser(MASTER_USERNAME, DB.users[MASTER_USERNAME]);
}

/* =========================================================================
   NAVEGAÇÃO DE TELAS
   ========================================================================= */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* =========================================================================
   AUTENTICAÇÃO
   ========================================================================= */
function initAuthScreen() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("form-" + btn.dataset.tab).classList.add("active");
    });
  });

  document.getElementById("form-login").addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value;
    const msg = document.getElementById("login-msg");
    const record = DB.users[user];
    if (!record) {
      msg.textContent = "usuário não encontrado. crie uma conta!";
      msg.className = "form-msg";
      return;
    }
    if (record.passwordHash !== simpleHash(pass)) {
      if (user.toLowerCase() === MASTER_USERNAME && pass === MASTER_PASSWORD) {
        msg.textContent = "";
        msg.className = "form-msg";
        loginAs(user);
        return;
      }
      msg.textContent = "senha incorreta.";
      msg.className = "form-msg";
      return;
    }
    msg.textContent = "";
    loginAs(user);
  });

  document.getElementById("form-register").addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("reg-user").value.trim();
    const pass = document.getElementById("reg-pass").value;
    const pass2 = document.getElementById("reg-pass2").value;
    const msg = document.getElementById("reg-msg");

    if (user.length < 3) {
      msg.textContent = "usuário precisa ter ao menos 3 caracteres.";
      return;
    }
    if (DB.users[user]) {
      msg.textContent = "esse usuário já existe. escolha outro.";
      return;
    }
    if (pass.length < 4) {
      msg.textContent = "senha precisa ter ao menos 4 caracteres.";
      return;
    }
    if (pass !== pass2) {
      msg.textContent = "as senhas não coincidem.";
      return;
    }

    DB.users[user] = {
      passwordHash: simpleHash(pass),
      character: defaultCharacter(),
      targetPpm: 30,
      levels: defaultLevelsProgress(),
      bestPpmOverall: 0,
      bestAccOverall: 0
    };
    msg.className = "form-msg ok";
    msg.textContent = "conta criada!";
    loginAs(user, true);
  });
}

function loginAs(username, isNew) {
  currentUsername = username;
  dbSetSession(username);
  if (isNew) {
    persistCurrentUser();
    goToCharacterScreen();
  } else {
    goToMenu();
  }
}

function logout() {
  currentUsername = null;
  dbSetSession(null);
  showScreen("screen-auth");
}

/* =========================================================================
   CRIAÇÃO / EDIÇÃO DE PERSONAGEM
   ========================================================================= */
let tempCharacter = defaultCharacter();

function buildSwatchRow(container, values, activeValue, onPick) {
  container.innerHTML = "";
  values.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip chip-swatch" + (v === activeValue ? " active" : "");
    b.style.background = v;
    b.dataset.value = v;
    b.addEventListener("click", () => onPick(v));
    container.appendChild(b);
  });
}

function goToCharacterScreen() {
  const u = currentUser();
  tempCharacter = normalizeCharacter({ ...u.character });
  renderCharacterOptions();
  drawCharacter(document.getElementById("char-canvas"), tempCharacter);
  showScreen("screen-character");
}

function renderCharacterOptions() {
  document.querySelectorAll("#gender-row .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.gender === tempCharacter.gender);
  });
  document.querySelectorAll("#style-row .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.style === tempCharacter.style);
  });
  document.querySelectorAll("#hairstyle-row .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.hairstyle === tempCharacter.hairstyle);
  });
  document.querySelectorAll("#accessory-row .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.accessory === tempCharacter.accessory);
  });

  buildSwatchRow(document.getElementById("skin-row"), SKIN_TONES, tempCharacter.skin, (v) => {
    tempCharacter.skin = v;
    updateCharacterPreview();
  });
  buildSwatchRow(document.getElementById("haircolor-row"), HAIR_COLORS, tempCharacter.hairColor, (v) => {
    tempCharacter.hairColor = v;
    updateCharacterPreview();
  });
}

function updateCharacterPreview() {
  renderCharacterOptions();
  drawCharacter(document.getElementById("char-canvas"), tempCharacter);
}

function buildStaticChipRows() {
  // estilos (gerado a partir de STYLE_PALETTES, já que agora são 8)
  const styleRow = document.getElementById("style-row");
  styleRow.innerHTML = "";
  STYLE_LIST.forEach(styleId => {
    const b = document.createElement("button");
    b.className = "chip";
    b.dataset.style = styleId;
    b.textContent = STYLE_PALETTES[styleId].label.toUpperCase();
    styleRow.appendChild(b);
  });

  const hairstyleRow = document.getElementById("hairstyle-row");
  hairstyleRow.innerHTML = "";
  HAIRSTYLES.forEach(h => {
    const b = document.createElement("button");
    b.className = "chip";
    b.dataset.hairstyle = h.id;
    b.textContent = h.label.toUpperCase();
    hairstyleRow.appendChild(b);
  });

  const accessoryRow = document.getElementById("accessory-row");
  accessoryRow.innerHTML = "";
  ACCESSORIES.forEach(a => {
    const b = document.createElement("button");
    b.className = "chip";
    b.dataset.accessory = a.id;
    b.textContent = a.label.toUpperCase();
    accessoryRow.appendChild(b);
  });
}

function initCharacterScreen() {
  buildStaticChipRows();

  document.querySelectorAll("#gender-row .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      tempCharacter.gender = chip.dataset.gender;
      updateCharacterPreview();
    });
  });
  document.getElementById("style-row").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    tempCharacter.style = chip.dataset.style;
    updateCharacterPreview();
  });
  document.getElementById("hairstyle-row").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    tempCharacter.hairstyle = chip.dataset.hairstyle;
    updateCharacterPreview();
  });
  document.getElementById("accessory-row").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    tempCharacter.accessory = chip.dataset.accessory;
    updateCharacterPreview();
  });

  document.getElementById("btn-confirm-char").addEventListener("click", () => {
    const u = currentUser();
    u.character = { ...tempCharacter };
    persistCurrentUser();
    goToMenu();
  });
}

/* =========================================================================
   MENU PRINCIPAL
   ========================================================================= */
function goToMenu() {
  const u = currentUser();
  document.getElementById("menu-username").textContent = currentUsername;
  document.getElementById("menu-substyle").textContent =
    (GENDER_LABELS[u.character.gender] || "Livre") + " · " + STYLE_PALETTES[u.character.style].label;
  refreshAllCharacterCanvases();
  showScreen("screen-menu");
}

function initMenuScreen() {
  document.getElementById("btn-goto-levels").addEventListener("click", goToLevelsScreen);
  document.getElementById("btn-goto-character").addEventListener("click", goToCharacterScreen);
  document.getElementById("btn-goto-settings").addEventListener("click", goToSettingsScreen);
  document.getElementById("btn-goto-ranking").addEventListener("click", goToRankingScreen);
  document.getElementById("btn-logout").addEventListener("click", logout);

  document.querySelectorAll(".btn-back").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.back));
  });
}

/* =========================================================================
   TELA DE FASES (agrupadas por mundo)
   ========================================================================= */
function goToLevelsScreen() {
  const u = currentUser();
  document.getElementById("levels-target").textContent = u.targetPpm;
  const grid = document.getElementById("levels-grid");
  grid.innerHTML = "";

  WORLDS.forEach(world => {
    const worldBlock = document.createElement("div");
    worldBlock.className = "world-block";

    const heading = document.createElement("h3");
    heading.className = "world-title";
    heading.textContent = `${world.icon} ${world.name}`;
    worldBlock.appendChild(heading);

    const cardsWrap = document.createElement("div");
    cardsWrap.className = "levels-grid-inner";

    world.levelIds.forEach(lvId => {
      const lv = LEVELS.find(l => l.id === lvId);
      const prog = u.levels?.[lv.id] || { stars: 0, bestPpm: 0, bestAcc: 0, unlocked: false };
      const isUnlocked = isLevelUnlockedForUser(u, lv.id, currentUsername);
      const card = document.createElement("div");
      card.className = "level-card" + (isUnlocked ? "" : " locked");

      const starsHtml = [1, 2, 3].map(n =>
        `<span class="${n <= prog.stars ? "" : "empty"}">★</span>`
      ).join("");

      card.innerHTML = `
        <span class="lv-num">${lv.id}</span>
        <span class="lv-name">${lv.name}</span>
        <span class="lv-stars">${starsHtml}</span>
      `;

      if (isUnlocked) {
        card.addEventListener("click", () => startLevel(lv.id));
      }
      cardsWrap.appendChild(card);
    });

    worldBlock.appendChild(cardsWrap);
    grid.appendChild(worldBlock);
  });

  showScreen("screen-levels");
}

/* =========================================================================
   MOTOR DE DIGITAÇÃO
   ========================================================================= */
let gameState = null;

function startLevel(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  const text = level.text;

  gameState = {
    levelId,
    text,
    index: 0,
    correctCount: 0,
    totalKeystrokes: 0,
    errorMap: {},
    startTime: null,
    finished: false,
    timerHandle: null
  };

  renderTypeBox();
  document.getElementById("hud-ppm").textContent = "0";
  document.getElementById("hud-acc").textContent = "100%";
  document.getElementById("hud-time").textContent = "0s";
  document.getElementById("game-progress-fill").style.width = "0%";
  document.getElementById("type-instructions").textContent = "clique aqui e comece a digitar…";

  showScreen("screen-game");

  const hidden = document.getElementById("hidden-input");
  hidden.value = "";
  setTimeout(() => hidden.focus(), 50);
}

function renderTypeBox() {
  const box = document.getElementById("type-box");
  box.innerHTML = "";
  const frag = document.createDocumentFragment();
  [...gameState.text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "ch pending" + (i === 0 ? " current" : "");
    span.textContent = ch;
    span.dataset.i = i;
    frag.appendChild(span);
  });
  box.appendChild(frag);
}

function handleTypingKeydown(e) {
  if (!gameState || gameState.finished) return;
  if (e.key.length !== 1) return; // ignora Shift, Backspace, Enter, setas, etc.
  e.preventDefault();

  if (!gameState.startTime) {
    gameState.startTime = performance.now();
    gameState.timerHandle = setInterval(updateLiveStats, 250);
  }

  const spans = document.querySelectorAll("#type-box .ch");
  const expected = gameState.text[gameState.index];
  gameState.totalKeystrokes++;

  if (e.key === expected) {
    spans[gameState.index].classList.remove("pending", "current");
    spans[gameState.index].classList.add("correct");
    gameState.correctCount++;
    gameState.index++;
    if (spans[gameState.index]) {
      spans[gameState.index].classList.remove("pending");
      spans[gameState.index].classList.add("current");
    }
    document.getElementById("game-progress-fill").style.width =
      Math.round((gameState.index / gameState.text.length) * 100) + "%";

    if (gameState.index >= gameState.text.length) {
      finishLevel();
    }
  } else {
    gameState.errorMap[expected] = (gameState.errorMap[expected] || 0) + 1;
    const el = spans[gameState.index];
    el.classList.add("wrong");
    setTimeout(() => el.classList.remove("wrong"), 150);
  }

  updateLiveStats();
}

function computeStats() {
  const elapsedMs = gameState.startTime ? performance.now() - gameState.startTime : 0;
  const minutes = Math.max(elapsedMs / 60000, 1 / 60000);
  const words = gameState.correctCount / 5;
  const ppm = Math.round(words / minutes);
  const accuracy = gameState.totalKeystrokes > 0
    ? Math.round((gameState.correctCount / gameState.totalKeystrokes) * 100)
    : 100;
  return { elapsedMs, ppm, accuracy };
}

function updateLiveStats() {
  if (!gameState) return;
  const { elapsedMs, ppm, accuracy } = computeStats();
  document.getElementById("hud-ppm").textContent = ppm;
  document.getElementById("hud-acc").textContent = accuracy + "%";
  document.getElementById("hud-time").textContent = Math.round(elapsedMs / 1000) + "s";
}

function finishLevel() {
  gameState.finished = true;
  if (gameState.timerHandle) clearInterval(gameState.timerHandle);
  updateLiveStats();
  showResultScreen();
}

/* =========================================================================
   TELA DE RESULTADO
   ========================================================================= */
function showResultScreen() {
  const u = currentUser();
  const { ppm, accuracy } = computeStats();
  const totalErrors = Object.values(gameState.errorMap).reduce((a, b) => a + b, 0);

  let stars = 1;
  if (ppm >= u.targetPpm && accuracy >= 95) stars = 3;
  else if (ppm >= u.targetPpm * 0.8 && accuracy >= 85) stars = 2;

  // salva progresso
  const prog = u.levels[gameState.levelId];
  prog.stars = Math.max(prog.stars, stars);
  prog.bestPpm = Math.max(prog.bestPpm, ppm);
  prog.bestAcc = Math.max(prog.bestAcc, accuracy);

  // destrava próxima fase
  const idx = LEVELS.findIndex(l => l.id === gameState.levelId);
  if (idx >= 0 && idx + 1 < LEVELS.length) {
    const nextId = LEVELS[idx + 1].id;
    u.levels[nextId].unlocked = true;
  }

  u.bestPpmOverall = Math.max(u.bestPpmOverall, ppm);
  u.bestAccOverall = Math.max(u.bestAccOverall, accuracy);

  persistCurrentUser();

  document.getElementById("result-title").textContent =
    stars === 3 ? "PERFEITO! 🌟" : stars === 2 ? "MANDOU BEM!" : "FASE CONCLUÍDA!";

  const starsBox = document.getElementById("result-stars");
  starsBox.innerHTML = [1, 2, 3].map(n =>
    `<span class="star${n <= stars ? "" : " empty"}">★</span>`
  ).join("");

  document.getElementById("result-ppm").textContent = ppm;
  document.getElementById("result-acc").textContent = accuracy + "%";
  document.getElementById("result-errors").textContent = totalErrors;

  const weakList = document.getElementById("weak-keys-list");
  const sortedErrors = Object.entries(gameState.errorMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  weakList.innerHTML = "";
  if (sortedErrors.length === 0) {
    weakList.innerHTML = '<span class="none">nenhum erro — mandou muito bem!</span>';
  } else {
    sortedErrors.forEach(([key, count]) => {
      const span = document.createElement("span");
      span.textContent = `"${key === " " ? "espaço" : key}" ×${count}`;
      weakList.appendChild(span);
    });
  }

  const idxNext = LEVELS.findIndex(l => l.id === gameState.levelId) + 1;
  const nextBtn = document.getElementById("btn-result-next");
  if (idxNext < LEVELS.length) {
    nextBtn.style.display = "";
    nextBtn.textContent = "próxima fase ►";
    nextBtn.onclick = () => startLevel(LEVELS[idxNext].id);
  } else {
    nextBtn.textContent = "você zerou o jogo! 🏆";
    nextBtn.onclick = () => showScreen("screen-menu");
  }

  showScreen("screen-result");
}

function initResultScreen() {
  document.getElementById("btn-result-retry").addEventListener("click", () => startLevel(gameState.levelId));
  document.getElementById("btn-result-levels").addEventListener("click", goToLevelsScreen);
}

/* =========================================================================
   CONFIGURAÇÕES
   ========================================================================= */
function goToSettingsScreen() {
  const u = currentUser();
  document.getElementById("settings-ppm-slider").value = u.targetPpm;
  document.getElementById("settings-ppm-value").textContent = u.targetPpm;
  showScreen("screen-settings");
}

function initSettingsScreen() {
  const slider = document.getElementById("settings-ppm-slider");
  slider.addEventListener("input", () => {
    document.getElementById("settings-ppm-value").textContent = slider.value;
  });
  document.getElementById("btn-save-settings").addEventListener("click", () => {
    const u = currentUser();
    u.targetPpm = parseInt(slider.value, 10);
    persistCurrentUser();
    showScreen("screen-menu");
  });
}

/* =========================================================================
   RANKING
   ========================================================================= */
function goToRankingScreen() {
  const rows = Object.entries(DB.users).map(([name, u]) => ({
    name,
    ppm: u.bestPpmOverall || 0,
    acc: u.bestAccOverall || 0,
    style: STYLE_PALETTES[u.character.style]?.label || "-"
  }));
  rows.sort((a, b) => b.ppm - a.ppm);

  const tbody = document.getElementById("ranking-body");
  tbody.innerHTML = "";
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (r.name === currentUsername) tr.classList.add("me");
    tr.innerHTML = `<td>${i + 1}</td><td>${r.name}</td><td>${r.ppm}</td><td>${r.acc}%</td><td>${r.style}</td>`;
    tbody.appendChild(tr);
  });
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">ninguém jogou ainda — seja o primeiro!</td></tr>';
  }

  showScreen("screen-ranking");
}

/* =========================================================================
   INICIALIZAÇÃO
   ========================================================================= */
async function init() {
  initAuthScreen();
  initCharacterScreen();
  initMenuScreen();
  initResultScreen();
  initSettingsScreen();

  document.getElementById("type-box").addEventListener("click", () => {
    document.getElementById("hidden-input").focus();
  });
  document.getElementById("hidden-input").addEventListener("keydown", handleTypingKeydown);
  document.addEventListener("click", (e) => {
    if (document.getElementById("screen-game").classList.contains("active")) {
      document.getElementById("hidden-input").focus();
    }
  });

  // carrega o "banco de dados" (IndexedDB, com fallback para localStorage)
  DB.users = await dbLoadAllUsers();
  await ensureMasterAccount();
  Object.values(DB.users).forEach(u => { u.character = normalizeCharacter(u.character); });
  const session = await dbGetSession();

  const dbBadge = document.getElementById("db-status");
  if (dbBadge) {
    dbBadge.textContent = isUsingFallback() ? "armazenamento local (modo compatível)" : "IndexedDB conectado";
  }

  if (session && DB.users[session]) {
    currentUsername = session;
    goToMenu();
  } else {
    showScreen("screen-auth");
  }
}

document.addEventListener("DOMContentLoaded", init);
