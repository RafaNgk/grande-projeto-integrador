const defaultLimits = {
  minTemp: 16,
  maxTemp: 32,
  minHumidity: 35,
  maxHumidity: 80,
};

let selectedRange = 24;
let readings = createInitialReadings();
let limits = loadLimits();

const elements = {
  deviceSync: document.querySelector("#deviceSync"),
  healthPill: document.querySelector("#healthPill"),
  healthTitle: document.querySelector("#healthTitle"),
  healthDescription: document.querySelector("#healthDescription"),
  temperatureValue: document.querySelector("#temperatureValue"),
  humidityValue: document.querySelector("#humidityValue"),
  temperatureTrend: document.querySelector("#temperatureTrend"),
  humidityTrend: document.querySelector("#humidityTrend"),
  latencyValue: document.querySelector("#latencyValue"),
  uptimeValue: document.querySelector("#uptimeValue"),
  chart: document.querySelector("#chart"),
  alertList: document.querySelector("#alertList"),
  alertCount: document.querySelector("#alertCount"),
  readingsTable: document.querySelector("#readingsTable"),
  refreshButton: document.querySelector("#refreshButton"),
  simulateButton: document.querySelector("#simulateButton"),
  limitsForm: document.querySelector("#limits"),
  settingsNote: document.querySelector("#settingsNote"),
  minTemp: document.querySelector("#minTemp"),
  maxTemp: document.querySelector("#maxTemp"),
  minHumidity: document.querySelector("#minHumidity"),
  maxHumidity: document.querySelector("#maxHumidity"),
  rangeButtons: document.querySelectorAll("[data-range]"),
};

hydrateLimitInputs();
render();

elements.refreshButton.addEventListener("click", () => {
  render();
  flashNote("Dashboard atualizado.");
});

elements.simulateButton.addEventListener("click", () => {
  readings.unshift(createReading(new Date()));
  readings = readings.slice(0, 80);
  render();
  flashNote("Nova leitura simulada.");
});

elements.limitsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  limits = {
    minTemp: Number(elements.minTemp.value),
    maxTemp: Number(elements.maxTemp.value),
    minHumidity: Number(elements.minHumidity.value),
    maxHumidity: Number(elements.maxHumidity.value),
  };
  localStorage.setItem("horta-monitorada-limits", JSON.stringify(limits));
  render();
  flashNote("Limites salvos no navegador.");
});

elements.rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedRange = Number(button.dataset.range);
    elements.rangeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderChart();
  });
});

function createInitialReadings() {
  const base = new Date();

  return Array.from({ length: 48 }, (_, index) => {
    const createdAt = new Date(base);
    createdAt.setHours(base.getHours() - index * 2);
    return createReading(createdAt, index);
  });
}

function createReading(date, index = 0) {
  const hour = date.getHours();
  const dayHeat = Math.sin((hour / 24) * Math.PI) * 5;
  const noise = Math.sin(index * 1.7 + Date.now() / 100000) * 2;
  const temperature = clamp(24 + dayHeat + noise + randomBetween(-1.2, 1.2), 12, 39);
  const humidity = clamp(61 - dayHeat * 2 + randomBetween(-8, 8), 20, 94);

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${date.getTime()}-${Math.random()}`,
    createdAt: date.toISOString(),
    temperature: Number(temperature.toFixed(1)),
    humidity: Number(humidity.toFixed(0)),
    latency: Number(randomBetween(0.42, 1.9).toFixed(2)),
  };
}

function render() {
  const latest = readings[0];
  const previous = readings[1] || latest;
  const status = classifyReading(latest);
  const alerts = getAlerts();

  elements.deviceSync.textContent = `Ultimo envio ${formatRelative(latest.createdAt)}`;
  elements.temperatureValue.textContent = `${latest.temperature.toFixed(1)}°C`;
  elements.humidityValue.textContent = `${latest.humidity}%`;
  elements.temperatureTrend.textContent = formatTrend(latest.temperature - previous.temperature, "°C");
  elements.humidityTrend.textContent = formatTrend(latest.humidity - previous.humidity, "%");
  elements.latencyValue.textContent = `${latest.latency.toFixed(2)}s`;
  elements.uptimeValue.textContent = `${calculateUptime()}%`;

  elements.healthPill.className = `health-pill ${status.level}`;
  elements.healthPill.textContent = status.label;
  elements.healthTitle.textContent = status.title;
  elements.healthDescription.textContent = status.description;

  renderChart();
  renderAlerts(alerts);
  renderTable();
}

function renderChart() {
  const visibleReadings = readings.slice(0, selectedRange === 24 ? 12 : selectedRange === 7 ? 24 : 36).reverse();
  elements.chart.innerHTML = "";

  visibleReadings.forEach((reading) => {
    const group = document.createElement("div");
    group.className = "bar-group";
    group.title = `${formatDate(reading.createdAt)} - ${reading.temperature}°C, ${reading.humidity}%`;

    const tempBar = document.createElement("span");
    tempBar.className = "bar temp";
    tempBar.style.height = `${clamp(reading.temperature * 2.3, 10, 100)}%`;

    const humidityBar = document.createElement("span");
    humidityBar.className = "bar humidity";
    humidityBar.style.height = `${clamp(reading.humidity, 10, 100)}%`;

    group.append(tempBar, humidityBar);
    elements.chart.appendChild(group);
  });
}

function renderAlerts(alerts) {
  elements.alertCount.textContent = alerts.length;
  elements.alertList.innerHTML = "";

  if (!alerts.length) {
    elements.alertList.innerHTML = `
      <div class="alert-item">
        <span class="alert-marker">✓</span>
        <div>
          <strong>Nenhuma ocorrencia ativa</strong>
          <p>As ultimas medicoes estao dentro dos limites configurados.</p>
        </div>
      </div>
    `;
    return;
  }

  alerts.slice(0, 5).forEach((alert) => {
    const item = document.createElement("article");
    item.className = `alert-item ${alert.level}`;
    item.innerHTML = `
      <span class="alert-marker">!</span>
      <div>
        <strong>${alert.title}</strong>
        <p>${alert.message}</p>
      </div>
    `;
    elements.alertList.appendChild(item);
  });
}

function renderTable() {
  elements.readingsTable.innerHTML = "";

  readings.slice(0, 8).forEach((reading) => {
    const status = classifyReading(reading);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(reading.createdAt)}</td>
      <td>${reading.temperature.toFixed(1)}°C</td>
      <td>${reading.humidity}%</td>
      <td><span class="status-label ${status.level}">${status.label}</span></td>
    `;
    elements.readingsTable.appendChild(row);
  });
}

function getAlerts() {
  return readings
    .slice(0, 12)
    .flatMap((reading) => {
      const alerts = [];

      if (reading.temperature < limits.minTemp) {
        alerts.push({
          level: "warning",
          title: "Temperatura abaixo do limite",
          message: `${reading.temperature.toFixed(1)}°C em ${formatDate(reading.createdAt)}.`,
        });
      }

      if (reading.temperature > limits.maxTemp) {
        alerts.push({
          level: "critical",
          title: "Temperatura elevada",
          message: `${reading.temperature.toFixed(1)}°C em ${formatDate(reading.createdAt)}.`,
        });
      }

      if (reading.humidity < limits.minHumidity) {
        alerts.push({
          level: "critical",
          title: "Solo com baixa umidade",
          message: `${reading.humidity}% em ${formatDate(reading.createdAt)}.`,
        });
      }

      if (reading.humidity > limits.maxHumidity) {
        alerts.push({
          level: "warning",
          title: "Umidade acima do esperado",
          message: `${reading.humidity}% em ${formatDate(reading.createdAt)}.`,
        });
      }

      return alerts;
    });
}

function classifyReading(reading) {
  const critical = reading.temperature > limits.maxTemp || reading.humidity < limits.minHumidity;
  const warning = reading.temperature < limits.minTemp || reading.humidity > limits.maxHumidity;

  if (critical) {
    return {
      level: "critical",
      label: "Critico",
      title: "A horta precisa de atencao agora",
      description: "Existe leitura fora dos limites principais. Verifique irrigacao, exposicao solar e conexao do sensor.",
    };
  }

  if (warning) {
    return {
      level: "warning",
      label: "Atencao",
      title: "Condicoes proximas do limite",
      description: "Os dados ainda permitem acompanhamento, mas uma variavel saiu da faixa ideal configurada.",
    };
  }

  return {
    level: "normal",
    label: "Normal",
    title: "A horta esta dentro da faixa ideal",
    description: "Temperatura, umidade e tempo de envio estao adequados para acompanhamento remoto.",
  };
}

function loadLimits() {
  try {
    return {
      ...defaultLimits,
      ...JSON.parse(localStorage.getItem("horta-monitorada-limits")),
    };
  } catch {
    return defaultLimits;
  }
}

function hydrateLimitInputs() {
  elements.minTemp.value = limits.minTemp;
  elements.maxTemp.value = limits.maxTemp;
  elements.minHumidity.value = limits.minHumidity;
  elements.maxHumidity.value = limits.maxHumidity;
}

function calculateUptime() {
  const successful = readings.filter((reading) => reading.latency < 2).length;
  return ((successful / readings.length) * 100).toFixed(1);
}

function formatTrend(value, unit) {
  if (Math.abs(value) < 0.1) {
    return "Estavel desde a ultima leitura";
  }

  const direction = value > 0 ? "acima" : "abaixo";
  return `${Math.abs(value).toFixed(1)}${unit} ${direction} da anterior`;
}

function formatRelative(value) {
  const diff = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  return diff === 1 ? "ha 1 minuto" : `ha ${diff} minutos`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function flashNote(message) {
  elements.settingsNote.textContent = message;
  window.setTimeout(() => {
    elements.settingsNote.textContent = "Valores usados para classificar alertas simulados.";
  }, 2400);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
