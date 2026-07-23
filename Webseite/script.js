"use strict";

const ALPHABET = `ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜabcdefghijklmnopqrstuvwxyzäöüß0123456789 .,!?;:-()'"`;
const alphabetCharacters = [...ALPHABET];
const alphabetIndex = new Map(alphabetCharacters.map((character, index) => [character, index]));

const elements = {
  textInput: document.querySelector("#text-input"),
  textLabel: document.querySelector("#text-label"),
  keyInput: document.querySelector("#key-input"),
  runButton: document.querySelector("#run-button"),
  error: document.querySelector("#error-message"),
  intermediateOutput: document.querySelector("#intermediate-output"),
  intermediateLabel: document.querySelector("#intermediate-label"),
  calculationHead: document.querySelector("#calculation-head"),
  calculationBody: document.querySelector("#calculation-body"),
  stepOneTitle: document.querySelector("#step-one-title"),
  stepOneDescription: document.querySelector("#step-one-description"),
  stepTwoTitle: document.querySelector("#step-two-title"),
  keyDisplay: document.querySelector("#key-display"),
  orderDisplay: document.querySelector("#order-display"),
  blocks: document.querySelector("#block-visualization"),
  finalTitle: document.querySelector("#final-title"),
  finalOutput: document.querySelector("#final-output"),
  summary: document.querySelector("#summary"),
  alphabetGrid: document.querySelector("#alphabet-grid"),
  results: document.querySelector("#results")
};

elements.calculationStepNumber = document.querySelector("#calculation-step-number");
elements.blockStepNumber = document.querySelector("#block-step-number");

let mode = "encrypt";

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function displayCharacter(character) {
  return character === " " ? "␠" : character;
}

function keyOrder(key) {
  return [...key]
    .map((character, index) => ({ character, index, value: alphabetIndex.get(character) }))
    .sort((left, right) => left.value - right.value || left.index - right.index)
    .map(item => item.index);
}

function validate(text, key) {
  if (!text.length) return "Bitte gib zuerst einen Text ein.";
  if (key.length < 6) return "Der Schlüssel muss mindestens 6 Zeichen lang sein.";

  const invalidText = [...text].find(character => !alphabetIndex.has(character));
  if (invalidText !== undefined) {
    return `Das Zeichen „${displayCharacter(invalidText)}“ ist nicht im vereinbarten Alphabet enthalten.`;
  }

  const invalidKey = [...key].find(character => !alphabetIndex.has(character));
  if (invalidKey !== undefined) {
    return `Das Schlüsselzeichen „${displayCharacter(invalidKey)}“ ist nicht erlaubt.`;
  }

  return "";
}

function calculateForward(text, key) {
  const keyCharacters = [...key];
  const rows = [...text].map((character, position) => {
    const inputNumber = alphabetIndex.get(character);
    const keyCharacter = keyCharacters[position % keyCharacters.length];
    const keyNumber = alphabetIndex.get(keyCharacter);
    const outputNumber = modulo(inputNumber + keyNumber + position, alphabetCharacters.length);
    return {
      position,
      inputCharacter: character,
      inputNumber,
      keyCharacter,
      keyNumber,
      operator: "+",
      outputNumber,
      outputCharacter: alphabetCharacters[outputNumber]
    };
  });

  return { rows, text: rows.map(row => row.outputCharacter).join("") };
}

function calculateBackward(intermediateText, key) {
  const keyCharacters = [...key];
  const rows = [...intermediateText].map((character, position) => {
    const inputNumber = alphabetIndex.get(character);
    const keyCharacter = keyCharacters[position % keyCharacters.length];
    const keyNumber = alphabetIndex.get(keyCharacter);
    const outputNumber = modulo(inputNumber - keyNumber - position, alphabetCharacters.length);
    return {
      position,
      inputCharacter: character,
      inputNumber,
      keyCharacter,
      keyNumber,
      operator: "−",
      outputNumber,
      outputCharacter: alphabetCharacters[outputNumber]
    };
  });

  return { rows, text: rows.map(row => row.outputCharacter).join("") };
}

function transposeForward(text, key) {
  const order = keyOrder(key);
  const size = [...key].length;
  const characters = [...text];
  const blocks = [];
  let output = "";

  for (let start = 0; start < characters.length; start += size) {
    const before = characters.slice(start, start + size);
    const after = order.filter(index => index < before.length).map(index => before[index]);
    blocks.push({ before, after });
    output += after.join("");
  }

  return { text: output, order, blocks };
}

function transposeBackward(text, key) {
  const order = keyOrder(key);
  const size = [...key].length;
  const characters = [...text];
  const blocks = [];
  let output = "";

  for (let start = 0; start < characters.length; start += size) {
    const before = characters.slice(start, start + size);
    const validOrder = order.filter(index => index < before.length);
    const after = Array(before.length);
    validOrder.forEach((originalIndex, cipherIndex) => {
      after[originalIndex] = before[cipherIndex];
    });
    blocks.push({ before, after });
    output += after.join("");
  }

  return { text: output, order, blocks };
}

function renderRows(rows, decrypting = false) {
  elements.calculationHead.innerHTML = `
    <tr>
      <th>Pos.</th>
      <th>${decrypting ? "Zwischenzeichen" : "Klarzeichen"}</th>
      <th>Zahl</th>
      <th>Schlüssel</th>
      <th>Schlüsselzahl</th>
      <th>Rechnung modulo 81</th>
      <th>${decrypting ? "Klarzeichen" : "Ergebnis"}</th>
    </tr>`;

  elements.calculationBody.replaceChildren(...rows.map(row => {
    const tableRow = document.createElement("tr");
    const signedPosition = decrypting ? `− ${row.position}` : `+ ${row.position}`;
    tableRow.innerHTML = `
      <td>${row.position}</td>
      <td>${escapeHtml(displayCharacter(row.inputCharacter))}</td>
      <td>${row.inputNumber}</td>
      <td>${escapeHtml(displayCharacter(row.keyCharacter))}</td>
      <td>${row.keyNumber}</td>
      <td>${row.inputNumber} ${row.operator} ${row.keyNumber} ${signedPosition} = ${row.outputNumber}</td>
      <td>${escapeHtml(displayCharacter(row.outputCharacter))}</td>`;
    return tableRow;
  }));
}

function renderBlocks(blocks, decrypting = false) {
  elements.blocks.replaceChildren(...blocks.map((block, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "block";
    wrapper.innerHTML = `
      <span class="block__number">Block ${index + 1}</span>
      <div class="block__chars">${chips(block.before, false)}</div>
      <span class="block__arrow" aria-label="wird zu">→</span>
      <div class="block__chars">${chips(block.after, true)}</div>`;
    wrapper.title = decrypting ? "Geheimtextblock wird zurücksortiert" : "Zwischentextblock wird neu sortiert";
    return wrapper;
  }));
}

function chips(characters, output) {
  return characters.map(character => `<span class="char-chip${output ? " char-chip--out" : ""}">${escapeHtml(displayCharacter(character))}</span>`).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function run() {
  const text = elements.textInput.value;
  const key = elements.keyInput.value;
  const error = validate(text, key);

  elements.error.hidden = !error;
  elements.error.textContent = error;
  if (error) return;

  elements.keyDisplay.textContent = key;

  if (mode === "encrypt") {
    const shift = calculateForward(text, key);
    const transposition = transposeForward(shift.text, key);
    elements.intermediateOutput.textContent = shift.text;
    elements.finalOutput.textContent = transposition.text;
    elements.orderDisplay.textContent = transposition.order.map(index => index + 1).join(" → ");
    elements.summary.textContent = `${[...text].length} Zeichen wurden in Blöcken zu je ${[...key].length} Zeichen verarbeitet.`;
    renderRows(shift.rows, false);
    renderBlocks(transposition.blocks, false);
  } else {
    const transposition = transposeBackward(text, key);
    const shift = calculateBackward(transposition.text, key);
    elements.intermediateOutput.textContent = transposition.text;
    elements.finalOutput.textContent = shift.text;
    elements.orderDisplay.textContent = transposition.order.map(index => index + 1).join(" → ");
    elements.summary.textContent = `${[...text].length} Zeichen wurden zurücksortiert und anschließend zurückverschoben.`;
    renderRows(shift.rows, true);
    renderBlocks(transposition.blocks, true);
  }
}

function setMode(newMode) {
  mode = newMode;
  document.querySelectorAll(".mode-button").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  const decrypting = mode === "decrypt";
  elements.textLabel.textContent = decrypting ? "Geheimtext" : "Klartext";
  elements.runButton.firstChild.textContent = decrypting ? "Jetzt entschlüsseln " : "Jetzt verschlüsseln ";
  elements.stepOneTitle.textContent = decrypting ? "Verschiebung zurücknehmen" : "Zeichen verschieben";
  elements.stepOneDescription.textContent = decrypting
    ? "Nach dem Zurücksortieren werden Schlüsselzahl und Position modulo 81 abgezogen."
    : "Klartextzahl + Schlüsselzahl + Position, jeweils modulo 81.";
  elements.stepTwoTitle.textContent = decrypting ? "Blöcke zurücksortieren" : "Blöcke verwirbeln";
  elements.intermediateLabel.textContent = decrypting ? "Zurücksortierter Zwischentext" : "Zwischentext";
  elements.finalTitle.textContent = decrypting ? "Klartext" : "Geheimtext";
  elements.calculationStepNumber.textContent = decrypting ? "02" : "01";
  elements.blockStepNumber.textContent = decrypting ? "01" : "02";
  run();
}

function buildAlphabet() {
  elements.alphabetGrid.replaceChildren(...alphabetCharacters.map((character, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "alphabet-item";
    button.innerHTML = `<strong>${escapeHtml(displayCharacter(character))}</strong><small>${index}</small>`;
    button.title = `${displayCharacter(character)} hat den Wert ${index}`;
    button.addEventListener("click", () => {
      document.querySelectorAll(".alphabet-item").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
    return button;
  }));
}

document.querySelectorAll(".mode-button").forEach(button => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll(".copy-button").forEach(button => {
  button.addEventListener("click", async () => {
    const output = document.querySelector(`#${button.dataset.copy}`).textContent;
    try {
      await navigator.clipboard.writeText(output);
      const oldText = button.textContent;
      button.textContent = "Kopiert";
      setTimeout(() => { button.textContent = oldText; }, 1200);
    } catch {
      button.textContent = "Nicht möglich";
    }
  });
});

elements.runButton.addEventListener("click", run);
elements.textInput.addEventListener("input", run);
elements.keyInput.addEventListener("input", run);

buildAlphabet();
run();
