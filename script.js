const nominalYieldInput = document.getElementById("nominalYield");
const inflationRateInput = document.getElementById("inflationRate");
const calculationModeSelect = document.getElementById("calculationMode");
const countryLabelInput = document.getElementById("countryLabel");
const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const realYieldValueEl = document.getElementById("realYieldValue");
const realYieldStatusEl = document.getElementById("realYieldStatus");
const nominalDisplayEl = document.getElementById("nominalDisplay");
const inflationDisplayEl = document.getElementById("inflationDisplay");
const realDisplayEl = document.getElementById("realDisplay");
const interpretationTextEl = document.getElementById("interpretationText");
const scenarioTableBodyEl = document.getElementById("scenarioTableBody");

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function calculateApproxRealYield(nominal, inflation) {
  return nominal - inflation;
}

function calculateExactRealYield(nominal, inflation) {
  const nominalDecimal = nominal / 100;
  const inflationDecimal = inflation / 100;
  const realDecimal = ((1 + nominalDecimal) / (1 + inflationDecimal)) - 1;
  return realDecimal * 100;
}

function getRealYieldStatus(value) {
  if (value < 0) {
    return {
      label: "Negative",
      className: "status-negative",
      badgeClass: "badge-negative"
    };
  }

  if (value === 0) {
    return {
      label: "Zero",
      className: "status-zero",
      badgeClass: "badge-zero"
    };
  }

  if (value > 0 && value < 1) {
    return {
      label: "Low Positive",
      className: "status-low-positive",
      badgeClass: "badge-low"
    };
  }

  return {
    label: "Positive",
    className: "status-positive",
    badgeClass: "badge-positive"
  };
}

function buildInterpretation(realYield, mode, label) {
  const status = getRealYieldStatus(realYield).label;
  const methodText =
    mode === "exact"
      ? "using the exact inflation-adjusted formula"
      : "using the approximate nominal-minus-inflation method";

  const assetText = label && label.trim() ? ` for ${label.trim()}` : "";

  if (status === "Negative") {
    return `The estimated real yield${assetText} is negative ${methodText}, which means inflation is higher than the nominal bond yield. In purchasing-power terms, the bond is currently offering a negative real return.`;
  }

  if (status === "Zero") {
    return `The estimated real yield${assetText} is close to zero ${methodText}. This suggests that the nominal yield is roughly matching the inflation rate, leaving little inflation-adjusted return.`;
  }

  if (status === "Low Positive") {
    return `The estimated real yield${assetText} is slightly positive ${methodText}. This means the nominal bond yield is modestly above inflation, but the inflation-adjusted return remains limited.`;
  }

  return `The estimated real yield${assetText} is positive ${methodText}, which means the nominal bond yield is above the inflation rate. This implies a stronger inflation-adjusted return in real terms.`;
}

function calculateRealYield(nominal, inflation, mode) {
  if (mode === "exact") {
    return calculateExactRealYield(nominal, inflation);
  }
  return calculateApproxRealYield(nominal, inflation);
}

function buildScenarioTable(nominal, inflation, mode) {
  const scenarios = [
    inflation - 2,
    inflation - 1,
    inflation,
    inflation + 1,
    inflation + 2
  ];

  scenarioTableBodyEl.innerHTML = "";

  scenarios.forEach((scenarioInflation) => {
    const realYield = calculateRealYield(nominal, scenarioInflation, mode);
    const status = getRealYieldStatus(realYield);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatPercent(scenarioInflation)}</td>
      <td>${formatPercent(realYield)}</td>
      <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
    `;
    scenarioTableBodyEl.appendChild(row);
  });
}

function updateCalculator() {
  const nominal = Number(nominalYieldInput.value);
  const inflation = Number(inflationRateInput.value);
  const mode = calculationModeSelect.value;
  const label = countryLabelInput.value;

  if (Number.isNaN(nominal) || Number.isNaN(inflation)) {
    interpretationTextEl.textContent =
      "Please enter valid numeric values for both nominal yield and inflation.";
    return;
  }

  const realYield = calculateRealYield(nominal, inflation, mode);
  const status = getRealYieldStatus(realYield);

  realYieldValueEl.textContent = formatPercent(realYield);
  realYieldStatusEl.textContent = status.label;
  realYieldStatusEl.className = `status-value ${status.className}`;

  nominalDisplayEl.textContent = formatPercent(nominal);
  inflationDisplayEl.textContent = formatPercent(inflation);
  realDisplayEl.textContent = formatPercent(realYield);

  interpretationTextEl.textContent = buildInterpretation(realYield, mode, label);

  buildScenarioTable(nominal, inflation, mode);
}

function resetCalculator() {
  nominalYieldInput.value = "4.00";
  inflationRateInput.value = "3.00";
  calculationModeSelect.value = "approx";
  countryLabelInput.value = "";
  updateCalculator();
}

calculateBtn.addEventListener("click", updateCalculator);
resetBtn.addEventListener("click", resetCalculator);

nominalYieldInput.addEventListener("input", updateCalculator);
inflationRateInput.addEventListener("input", updateCalculator);
calculationModeSelect.addEventListener("change", updateCalculator);
countryLabelInput.addEventListener("input", updateCalculator);

document.addEventListener("DOMContentLoaded", updateCalculator);
