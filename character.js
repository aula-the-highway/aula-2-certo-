/* =========================================================================
   TECLA.EXE — SISTEMA DE PERSONAGEM (pixel art via canvas)
   Nada é buscado na internet: todo o visual é desenhado em código, então
   continua funcionando 100% offline. Em compensação, deixamos MUITAS
   opções combináveis: 8 estilos de roupa, 6 tons de pele, 6 cores de
   cabelo, 4 cortes de cabelo e 5 acessórios extras — mais de mil
   combinações possíveis de visual.
   ========================================================================= */

const GENDER_LABELS = { menino: "Menino", menina: "Menina", nb: "Livre" };

const SKIN_TONES = ["#ffdfc4", "#f0be93", "#d99a6c", "#ad7444", "#7a4b2a", "#4a2e1a"];
const HAIR_COLORS = ["#141414", "#6b4423", "#c9852f", "#f4d35e", "#ff6bb2", "#3ce7d1", "#e0e0e0", "#8c6bff"];

const HAIRSTYLES = [
  { id: "curto", label: "Curto" },
  { id: "longo", label: "Longo" },
  { id: "cacheado", label: "Cacheado" },
  { id: "moicano", label: "Moicano" }
];

const ACCESSORIES = [
  { id: "nenhum", label: "Nenhum" },
  { id: "oculos", label: "Óculos" },
  { id: "bone", label: "Boné" },
  { id: "colar", label: "Colar" },
  { id: "laco", label: "Laço" }
];

/* Cada estilo define as cores da roupa + como a "extra" é desenhada
   (peças, estampas, adereços que tornam cada estilo reconhecível). */
const STYLE_PALETTES = {
  sportlife:   { top: "#ff6b35", bottom: "#1c9b5e", shoe: "#ffffff", accent: "#ffffff", label: "Sportlife" },
  y2k:         { top: "#ff8fd8", bottom: "#c9c9ff", shoe: "#e7e7ff", accent: "#d7d7ff", label: "Y2K" },
  streetwear:  { top: "#2b2b2b", bottom: "#3d3d3d", shoe: "#ffd166", accent: "#ffd166", label: "Streetwear" },
  coquette:    { top: "#ffc2dd", bottom: "#ffe6f0", shoe: "#ffe6f0", accent: "#ff4fa3", label: "Coquette" },
  skatista:    { top: "#4c6fff", bottom: "#cbb69a", shoe: "#161616", accent: "#ff3d3d", label: "Skatista" },
  darkalt:     { top: "#1c1c24", bottom: "#2e2e38", shoe: "#4b0082", accent: "#b967ff", label: "Dark Alt" },
  retrogamer:  { top: "#00c2ff", bottom: "#ffffff", shoe: "#ff3355", accent: "#ffe600", label: "Retro Gamer" },
  kawaii:      { top: "#ffe1f0", bottom: "#d9f2ff", shoe: "#fff2b2", accent: "#ffb6e1", label: "Kawaii" }
};

const STYLE_LIST = Object.keys(STYLE_PALETTES);
const OUTLINE = "#000000";

function defaultCharacter() {
  return {
    gender: "menino",
    style: "sportlife",
    skin: SKIN_TONES[1],
    hairColor: HAIR_COLORS[1],
    hairstyle: "curto",
    accessory: "nenhum"
  };
}

/* garante que personagens salvos antes desta atualização ganhem valores
   padrão para os novos campos, sem quebrar o progresso salvo */
function normalizeCharacter(ch) {
  const d = defaultCharacter();
  return {
    gender: ch && ch.gender ? ch.gender : d.gender,
    style: ch && STYLE_PALETTES[ch.style] ? ch.style : d.style,
    skin: ch && ch.skin ? ch.skin : d.skin,
    hairColor: ch && ch.hairColor ? ch.hairColor : d.hairColor,
    hairstyle: ch && ch.hairstyle ? ch.hairstyle : d.hairstyle,
    accessory: ch && ch.accessory ? ch.accessory : d.accessory
  };
}

function drawCharacter(canvas, character) {
  if (!canvas) return;
  const ch = normalizeCharacter(character);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const GRID = 32;
  const unit = canvas.width / GRID;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pal = STYLE_PALETTES[ch.style] || STYLE_PALETTES.sportlife;
  const SKIN = ch.skin;
  const HAIR = ch.hairColor;

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x * unit), Math.round(y * unit), Math.round(w * unit), Math.round(h * unit));
  }

  // sombra do chão
  rect(9, 29, 14, 2, "rgba(0,0,0,0.35)");

  // pernas
  rect(11, 23, 4, 5, pal.bottom);
  rect(17, 23, 4, 5, pal.bottom);
  // tênis / calçado
  rect(10, 27, 6, 2, pal.shoe);
  rect(16, 27, 6, 2, pal.shoe);
  rect(10, 28, 6, 1, OUTLINE);
  rect(16, 28, 6, 1, OUTLINE);

  // saia (coquette / kawaii) sobrepõe pernas
  if (ch.style === "coquette" || ch.style === "kawaii") {
    rect(9, 20, 14, 5, ch.style === "coquette" ? pal.accent : pal.bottom);
    rect(9, 20, 14, 1, OUTLINE);
  }

  // corpo / torso
  rect(9, 15, 14, 8, pal.top);
  rect(9, 15, 14, 1, OUTLINE);

  // mangas / braços
  rect(6, 16, 3, 6, pal.top);
  rect(23, 16, 3, 6, pal.top);
  rect(6, 21, 3, 2, SKIN);
  rect(23, 21, 3, 2, SKIN);

  // -------- extras de torso por estilo --------
  switch (ch.style) {
    case "sportlife":
      rect(9, 18, 14, 1, pal.accent); // listra esportiva
      break;
    case "y2k":
      rect(9, 19, 14, 1, "#ffffff"); // linha de "baby tee" curta
      break;
    case "streetwear":
      rect(14, 17, 4, 4, pal.accent); // corrente/pingente
      break;
    case "skatista":
      rect(11, 17, 10, 3, "#ffffff"); // estampa gráfica na camiseta
      rect(6, 22, 3, 1, pal.accent);  // pulseira
      break;
    case "darkalt":
      rect(13, 15, 6, 1, pal.accent); // gola / choker
      break;
    case "retrogamer":
      rect(9, 16, 14, 2, "#ffffff");  // faixa retrô diagonal (jaqueta)
      rect(13, 19, 6, 3, pal.accent); // patch/emblema no peito
      break;
    case "kawaii":
      rect(12, 18, 2, 2, pal.accent); // laçarote no peito
      rect(18, 18, 2, 2, pal.accent);
      break;
    // coquette já tem a saia como diferencial
  }

  // pescoço
  rect(14, 13, 4, 2, SKIN);

  // cabeça
  rect(10, 4, 12, 10, SKIN);
  rect(10, 4, 12, 1, OUTLINE);

  // orelhas
  rect(9, 8, 1, 2, SKIN);
  rect(22, 8, 1, 2, SKIN);

  // olhos
  rect(13, 9, 2, 2, OUTLINE);
  rect(18, 9, 2, 2, OUTLINE);

  // boca
  rect(14, 12, 4, 1, "#a5573f");

  // -------- cabelo, por corte (independente do gênero) --------
  switch (ch.hairstyle) {
    case "longo":
      rect(9, 2, 14, 4, HAIR);
      rect(8, 6, 3, 14, HAIR);
      rect(21, 6, 3, 14, HAIR);
      rect(9, 6, 2, 3, HAIR);
      rect(21, 6, 2, 3, HAIR);
      break;
    case "cacheado":
      rect(8, 2, 16, 5, HAIR);
      rect(7, 4, 2, 3, HAIR);
      rect(23, 4, 2, 3, HAIR);
      rect(9, 6, 2, 3, HAIR);
      rect(21, 6, 2, 3, HAIR);
      break;
    case "moicano":
      rect(14, 1, 4, 5, HAIR);
      rect(9, 5, 2, 2, HAIR);
      rect(21, 5, 2, 2, HAIR);
      break;
    case "curto":
    default:
      rect(9, 2, 14, 3, HAIR);
      rect(9, 5, 2, 2, HAIR);
      rect(21, 5, 2, 2, HAIR);
      break;
  }

  // -------- extras de cabeça por estilo (desenhados por cima do cabelo) --------
  switch (ch.style) {
    case "sportlife":
      rect(9, 5, 14, 2, pal.accent); // faixa de cabeça
      break;
    case "y2k":
      rect(12, 9, 8, 2, "#1a1a1a"); // óculos escuros
      rect(24, 3, 2, 2, pal.accent); // brilho decorativo
      break;
    case "streetwear":
      rect(8, 3, 16, 3, pal.accent); // boné
      rect(8, 6, 5, 2, pal.accent);  // aba do boné
      break;
    case "coquette":
      rect(19, 2, 3, 2, pal.accent);
      rect(16, 1, 3, 2, pal.accent);
      rect(22, 1, 3, 2, pal.accent);
      break;
    case "skatista":
      rect(9, 2, 14, 4, pal.accent); // gorro/beanie
      break;
    case "darkalt":
      rect(12, 9, 2, 1, pal.accent); // "delineado" roxo
      rect(18, 9, 2, 1, pal.accent);
      break;
    case "retrogamer":
      rect(10, 3, 12, 2, pal.accent); // viseira retrô
      break;
    case "kawaii":
      rect(20, 3, 3, 3, pal.accent); // presilha/laço no cabelo
      break;
  }

  // -------- acessório extra, independente do estilo --------
  switch (ch.accessory) {
    case "oculos":
      rect(12, 9, 9, 2, "#1a1a1a");
      rect(12, 9, 2, 2, "#ffffff");
      rect(19, 9, 2, 2, "#ffffff");
      break;
    case "bone":
      rect(8, 2, 16, 3, "#e63946");
      rect(8, 5, 5, 2, "#e63946");
      break;
    case "colar":
      rect(13, 14, 6, 1, "#ffd166");
      rect(15, 15, 2, 1, "#ffd166");
      break;
    case "laco":
      rect(19, 1, 3, 2, "#ff4fa3");
      rect(16, 0, 3, 2, "#ff4fa3");
      rect(22, 0, 3, 2, "#ff4fa3");
      break;
    default:
      break;
  }
}

function refreshAllCharacterCanvases() {
  const u = currentUser();
  if (!u) return;
  const preview = document.getElementById("char-canvas");
  const menuAvatar = document.getElementById("menu-avatar");
  if (preview) drawCharacter(preview, u.character);
  if (menuAvatar) drawCharacter(menuAvatar, u.character);
}
