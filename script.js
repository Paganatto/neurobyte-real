/* =========================
   NEUROBYTE - script.js
   Comentários em pt-BR explicando como alterar
   ========================= */

/* Inicializa AOS para animações on-scroll */
AOS.init({ duration: 750, once: true });

/* Atualiza ano do rodapé automaticamente */
document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile menu simples */
const mobileToggle = document.querySelector('.mobile-toggle');
const mainNav = document.querySelector('.main-nav');
mobileToggle?.addEventListener('click', () => {
  if (mainNav.style.display === 'flex') {
    mainNav.style.display = 'none';
  } else {
    mainNav.style.display = 'flex';
    mainNav.style.flexDirection = 'column';
    mainNav.style.position = 'absolute';
    mainNav.style.right = '18px';
    mainNav.style.top = '64px';
    mainNav.style.background = 'rgba(2,6,18,0.95)';
    mainNav.style.padding = '12px';
    mainNav.style.borderRadius = '8px';
  }
});

/* Smooth scroll para links internos (considera header fixo) */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerOffset = 84;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  });
});

/* =========================
   DASHBOARD - GRÁFICO HORIZONTAL (Chart.js)
   - indexAxis: 'y' para barras horizontais
   - container .chart-wrap controla altura (evita bug)
   ========================= */

/* Dados iniciais (horários) */
const labels = ["00:00","04:00","08:00","12:00","16:00","20:00"];
let tempData = [21.2, 20.8, 22.1, 23.5, 24.2, 22.5];
let avgTemp = tempData.reduce((s,v)=>s+v,0)/tempData.length;
let avgHum = 69;
let sensorsCount = 12;
let alertsCount = 3;

/* DOM nodes para indicadores */
const elAvgTemp = document.getElementById('avg-temp');
const elAvgHum = document.getElementById('avg-hum');
const elSensors = document.getElementById('sensors-online');
const elAlerts = document.getElementById('alerts-count');
const elBarTemp = document.getElementById('bar-temp');
const elBarHum = document.getElementById('bar-hum');

/* Atualiza indicadores na UI */
function updateIndicators() {
  elAvgTemp.textContent = avgTemp.toFixed(1) + '°C';
  elAvgHum.textContent = avgHum + '%';
  elSensors.textContent = sensorsCount;
  elAlerts.textContent = alertsCount;

  elBarTemp.style.width = Math.min(100, (avgTemp / 40) * 100) + '%';
  elBarHum.style.width = Math.min(100, avgHum) + '%';

  // pequenos cards
  document.getElementById('card-temp').textContent = avgTemp.toFixed(1) + '°C';
  document.getElementById('card-hum').textContent = avgHum + '%';
  document.getElementById('card-sensors').textContent = sensorsCount;
  document.getElementById('card-alerts').textContent = alertsCount;
}

/* Inicializa Chart.js com barras horizontais */
const ctx = document.getElementById('tempChart').getContext('2d');

/* Gradient para barras */
const grad = ctx.createLinearGradient(0, 0, 400, 0);
grad.addColorStop(0, '#00d2ff');
grad.addColorStop(0.6, '#7a00ff');

const tempChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: 'Temperatura (°C)',
      data: tempData,
      backgroundColor: grad,
      borderRadius: 20,
      barThickness: 18
    }]
  },
  options: {
    indexAxis: 'y',
    maintainAspectRatio: false, // respeita o container .chart-wrap
    responsive: true,
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: 'rgba(255,255,255,0.7)' }
      },
      y: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.85)', font: { weight: 600 } }
      }
    },
    plugins: { legend: { display: false } },
    animation: { duration: 700, easing: 'easeOutQuart' }
  }
});

/* =========================
   SIMULAÇÃO (dados dinâmicos)
   - Altera tempData periodicamente e atualiza o gráfico
   - Gera alertas aleatórios
   ========================= */

const alerts = [
  { title: "Temperatura acima do normal no Depósito", time: "Há 5 minutos", sev: "high" },
  { title: "Sensor ARD-005 conectado com sucesso", time: "Há 1 hora", sev: "info" },
  { title: "Temperatura normalizada na Câmara Fria 1", time: "Há 2 horas", sev: "low" }
];

function renderAlerts() {
  const ul = document.getElementById('alerts-list');
  ul.innerHTML = '';
  alerts.slice(0, 6).forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="width:8px;height:40px;border-radius:6px;background:${a.sev==='high'?'#ffb86b':a.sev==='info'?'#7ef2ff':'#8cf78f'}"></span>
        <div style="flex:1">
          <strong style="display:block;color:#dff7ff">${a.title}</strong>
          <small style="color:rgba(255,255,255,0.55)">${a.time}</small>
        </div>
      </div>
    `;
    ul.appendChild(li);
  });
}

function addAlert(obj) {
  alerts.unshift(obj);
  if (alerts.length > 8) alerts.pop();
}

/* Simulação de atualização */
function simulateUpdate() {
  const deltaTemp = (Math.random() * 1.2) - 0.6;
  const deltaHum = Math.round((Math.random() * 4) - 2);

  avgTemp = Math.max(0, avgTemp + deltaTemp);
  avgHum = Math.min(100, Math.max(0, avgHum + deltaHum));

  const newTemp = parseFloat((avgTemp + ((Math.random()*1.2)-0.6)).toFixed(1));
  tempData.shift();
  tempData.push(newTemp);

  tempChart.data.datasets[0].data = tempData;
  tempChart.update();

  if (Math.random() > 0.88) {
    addAlert({
      title: "Temperatura acima do normal no Depósito",
      time: "Há " + Math.floor(Math.random()*10+1) + " minutos",
      sev: "high"
    });
    alertsCount = Math.min(99, alertsCount + 1);
  }

  if (Math.random() > 0.98 && alertsCount > 0) alertsCount--;

  updateIndicators();
  renderAlerts();
}

/* Inicializa indicadores e alertas */
avgTemp = tempData.reduce((s,v)=>s+v,0)/tempData.length;
updateIndicators();
renderAlerts();

/* Start simulation (ajuste intervalo se quiser) */
setInterval(simulateUpdate, 3500);

/* =========================
   Observações rápidas:
   - Ajuste a altura do gráfico em .chart-wrap no style.css
   - Para trocar imagens do time/logo: troque os src nas tags <img> no index.html
   - Para usar dados reais: substitua simulateUpdate por fetch() ou WebSocket que retorne os dados
   ========================= */
