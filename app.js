const distanceSelect = document.getElementById("distanceSelect");
const customDistanceField = document.getElementById("customDistanceField");
const customDistanceInput = document.getElementById("customDistanceInput");
const timeInput = document.getElementById("timeInput");
const goalResults = document.getElementById("goalResults");
const calcBtn = document.getElementById("calcBtn");
const resetBtn = document.getElementById("resetBtn");
const splitInput = document.getElementById("splitInput");
const splitBtn = document.getElementById("splitBtn");
const splitResults = document.getElementById("splitResults");

const METERS_PER_MILE = 1609.344;
const METERS_PER_200 = 200;
const METERS_PER_1K = 1000;

function parseTimeToSeconds(value) {
  const cleaned = value.trim();
  if (!cleaned) return null;
  const parts = cleaned.split(":").map((part) => part.trim());
  if (parts.some((p) => p === "" || Number.isNaN(Number(p)))) {
    return null;
  }
  const nums = parts.map(Number);
  if (nums.length === 1) {
    return nums[0];
  }
  if (nums.length === 2) {
    return nums[0] * 60 + nums[1];
  }
  if (nums.length === 3) {
    return nums[0] * 3600 + nums[1] * 60 + nums[2];
  }
  return null;
}

function formatSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "--";
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatTimeHMS(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "--";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getDistanceMeters() {
  if (distanceSelect.value === "custom") {
    const custom = Number(customDistanceInput.value);
    if (!Number.isFinite(custom) || custom <= 0) return null;
    return custom;
  }
  return Number(distanceSelect.value);
}

function renderGoalResults({ pacePerMile, pacePerKm, split200, split400 }) {
  const split1k = split200 * 5;
  const rows = Array.from({ length: 5 }, (_, index) => {
    const rep = index + 1;
    return `
      <tr>
        <td>${rep * 200}m</td>
        <td>${formatSeconds(split200 * rep)}</td>
      </tr>
    `;
  }).join("");

  goalResults.innerHTML = `
    <div class="cards">
      <div class="card">
        <div class="label">Pace per mile</div>
        <div class="value">${formatSeconds(pacePerMile)}</div>
      </div>
      <div class="card">
        <div class="label">Pace per km</div>
        <div class="value">${formatSeconds(pacePerKm)}</div>
      </div>
      <div class="card">
        <div class="label">200m split</div>
        <div class="value">${formatSeconds(split200)}</div>
      </div>
      <div class="card">
        <div class="label">400m split</div>
        <div class="value">${formatSeconds(split400)}</div>
      </div>
      <div class="card">
        <div class="label">1k time</div>
        <div class="value">${formatSeconds(split1k)}</div>
      </div>
    </div>
    <div>
      <h3>1k breakdown (200m splits)</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Distance</th>
            <th>Cumulative split</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderSplitResults({ split200, pacePerMile, pacePerKm }) {
  splitResults.innerHTML = `
    <div class="cards">
      <div class="card">
        <div class="label">200m split</div>
        <div class="value">${formatSeconds(split200)}</div>
      </div>
      <div class="card">
        <div class="label">Pace per mile</div>
        <div class="value">${formatSeconds(pacePerMile)}</div>
      </div>
      <div class="card">
        <div class="label">Pace per km</div>
        <div class="value">${formatSeconds(pacePerKm)}</div>
      </div>
    </div>
  `;
}

function handleCalculate() {
  const distanceMeters = getDistanceMeters();
  const totalSeconds = parseTimeToSeconds(timeInput.value);

  if (!distanceMeters || !totalSeconds || totalSeconds <= 0) {
    goalResults.innerHTML =
      "<p>Please enter a valid distance and time (e.g. 00:22:30).</p>";
    return;
  }

  const secondsPerMeter = totalSeconds / distanceMeters;
  const pacePerMile = secondsPerMeter * METERS_PER_MILE;
  const pacePerKm = secondsPerMeter * 1000;
  const split200 = secondsPerMeter * METERS_PER_200;
  const split400 = secondsPerMeter * 400;

  renderGoalResults({ pacePerMile, pacePerKm, split200, split400 });
}

function handleSplitConvert() {
  const splitSeconds = Number(splitInput.value);
  if (!Number.isFinite(splitSeconds) || splitSeconds <= 0) {
    splitResults.innerHTML = "<p>Please enter a valid 200m split in seconds.</p>";
    return;
  }

  const pacePerMile = (splitSeconds / METERS_PER_200) * METERS_PER_MILE;
  const pacePerKm = (splitSeconds / METERS_PER_200) * 1000;

  renderSplitResults({ split200: splitSeconds, pacePerMile, pacePerKm });
}

function handleReset() {
  distanceSelect.value = "5000";
  timeInput.value = "00:22:00";
  customDistanceInput.value = "";
  customDistanceField.hidden = true;
  goalResults.innerHTML = "";
  splitInput.value = "";
  splitResults.innerHTML = "";
}

distanceSelect.addEventListener("change", () => {
  const isCustom = distanceSelect.value === "custom";
  customDistanceField.hidden = !isCustom;
  if (!isCustom) {
    customDistanceInput.value = "";
  }
});

calcBtn.addEventListener("click", handleCalculate);
resetBtn.addEventListener("click", handleReset);
splitBtn.addEventListener("click", handleSplitConvert);

handleCalculate();
