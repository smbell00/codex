const libraries = [
  "Chart.js",
  "D3.js",
  "ECharts",
  "Plotly.js",
  "Leaflet",
  "Three.js",
  "Matter.js",
  "Anime.js",
  "GSAP",
  "Swiper",
  "SortableJS",
  "Typed.js",
  "Fuse.js",
  "Lodash",
  "Day.js",
  "Luxon",
  "PapaParse",
  "Tabulator",
  "Marked + DOMPurify",
  "Prism.js",
  "Mermaid",
  "QRCode.js",
  "jsPDF",
  "Toastify",
  "Tippy.js",
  "Flatpickr",
  "FullCalendar",
  "noUiSlider",
  "Choices.js",
  "SweetAlert2",
];

const loaded = new Set();
const sampleRows = [
  { id: 1, library: "Chart.js", type: "visual", impact: 92, status: "Ready" },
  { id: 2, library: "Three.js", type: "3d", impact: 88, status: "Ready" },
  { id: 3, library: "Fuse.js", type: "search", impact: 76, status: "Ready" },
  { id: 4, library: "FullCalendar", type: "planning", impact: 81, status: "Ready" },
];

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];
const rand = (min, max) => Math.round(min + Math.random() * (max - min));

function mark(name) {
  loaded.add(name);
  const loadedCount = qs("#loadedCount");
  if (loadedCount) loadedCount.textContent = loaded.size;
}

function safe(name, fn) {
  try {
    fn();
    mark(name);
  } catch (error) {
    console.warn(`${name} demo skipped`, error);
  }
}

function randomSeries(length = 7, min = 20, max = 95) {
  return Array.from({ length }, () => rand(min, max));
}

function initIcons() {
  safe("Lucide", () => {
    if (!window.lucide) return;
    window.lucide.createIcons();
  });
}

function initShell() {
  const pills = qs("#libraryPills");
  const search = qs("#librarySearch");
  if (!pills || !search) return;

  pills.innerHTML = libraries
    .map((library) => `<button type="button" data-filter="${library.toLowerCase()}">${library}</button>`)
    .join("");

  pills.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    search.value = button.dataset.filter;
    filterCards(button.dataset.filter);
  });

  search.addEventListener("input", () => filterCards(search.value));

  qs("#themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    initIcons();
  });

  qs("#shuffleAll")?.addEventListener("click", () => {
    updateChart();
    drawD3();
    runAnime();
    runGsap();
    updateLodash();
    showToast("Studio shuffled");
  });

  qs("#exportSnapshot")?.addEventListener("click", () => makePdf());
}

function filterCards(value) {
  const query = value.trim().toLowerCase();
  let visible = 0;
  qsa(".feature-card").forEach((card) => {
    const name = card.dataset.library.toLowerCase();
    const show = !query || name.includes(query);
    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });
  qsa(".no-results").forEach((el) => el.remove());
  if (!visible) {
    const note = document.createElement("div");
    note.className = "no-results";
    note.textContent = "검색 결과가 없습니다.";
    qs("#visual .feature-grid")?.append(note);
  }
}

let chartInstance;
function initChart() {
  safe("Chart.js", () => {
    const canvas = qs("#chartJsCanvas");
    if (!canvas || !window.Chart) return;
    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Usage",
            data: randomSeries(),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, .14)",
            fill: true,
            tension: 0.38,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 100 } },
      },
    });
    qs(".refresh-chart")?.addEventListener("click", updateChart);
  });
}

function updateChart() {
  if (!chartInstance) return;
  chartInstance.data.datasets[0].data = randomSeries();
  chartInstance.update();
}

function drawD3() {
  safe("D3.js", () => {
    if (!window.d3) return;
    const svg = d3.select("#d3Bars");
    const width = svg.node().clientWidth || 320;
    const height = 190;
    const data = randomSeries(10, 18, 100);
    const x = d3.scaleBand().domain(data.map((_, index) => index)).range([0, width]).padding(0.22);
    const y = d3.scaleLinear().domain([0, 100]).range([height - 16, 12]);
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const bars = svg.selectAll("rect").data(data);
    bars
      .join("rect")
      .attr("x", (_, index) => x(index))
      .attr("width", x.bandwidth())
      .attr("rx", 6)
      .attr("fill", (_, index) => (index % 3 === 0 ? "#e25f4f" : index % 3 === 1 ? "#0f8f72" : "#2563eb"))
      .transition()
      .duration(550)
      .attr("y", (d) => y(d))
      .attr("height", (d) => height - 16 - y(d));
  });
}

function initD3() {
  drawD3();
  qs("#d3Pulse")?.addEventListener("click", drawD3);
}

function initECharts() {
  safe("ECharts", () => {
    const el = qs("#echartsRadar");
    if (!el || !window.echarts) return;
    const chart = echarts.init(el);
    chart.setOption({
      color: ["#0f8f72"],
      radar: {
        indicator: [
          { name: "Speed", max: 100 },
          { name: "DX", max: 100 },
          { name: "UI", max: 100 },
          { name: "Data", max: 100 },
          { name: "Docs", max: 100 },
        ],
      },
      series: [{ type: "radar", areaStyle: {}, data: [{ value: [88, 82, 76, 91, 70] }] }],
    });
    window.addEventListener("resize", () => chart.resize());
  });
}

function initPlotly() {
  safe("Plotly.js", () => {
    const el = qs("#plotlyScatter");
    if (!el || !window.Plotly) return;
    Plotly.newPlot(
      el,
      [
        {
          x: randomSeries(18, 1, 90),
          y: randomSeries(18, 1, 90),
          mode: "markers",
          type: "scatter",
          marker: { size: randomSeries(18, 8, 22), color: "#e4a11b", opacity: 0.76 },
        },
      ],
      {
        margin: { t: 10, r: 8, b: 32, l: 34 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        displayModeBar: false,
      },
      { responsive: true, displayModeBar: false }
    );
  });
}

function initLeaflet() {
  safe("Leaflet", () => {
    const el = qs("#leafletMap");
    if (!el || !window.L) return;
    const map = L.map(el, { zoomControl: false, scrollWheelZoom: false }).setView([37.5665, 126.978], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.marker([37.5665, 126.978]).addTo(map).bindPopup("Seoul").openPopup();
    setTimeout(() => map.invalidateSize(), 250);
  });
}

function initThree() {
  safe("Three.js", () => {
    const stage = qs("#threeStage");
    if (!stage || !window.THREE) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, stage.clientWidth / stage.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    stage.appendChild(renderer.domElement);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 1.35, 1.35),
      new THREE.MeshNormalMaterial({ flatShading: true })
    );
    scene.add(cube);
    camera.position.z = 3;

    function animate() {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.014;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", () => {
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
    });
  });
}

let matterEngine;
function initMatter() {
  safe("Matter.js", () => {
    const stage = qs("#matterStage");
    if (!stage || !window.Matter) return;
    const { Engine, Render, Runner, Bodies, Composite } = Matter;
    matterEngine = Engine.create();
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const render = Render.create({
      element: stage,
      engine: matterEngine,
      options: { width, height, wireframes: false, background: "transparent" },
    });
    Composite.add(matterEngine.world, [
      Bodies.rectangle(width / 2, height + 8, width, 16, { isStatic: true }),
      Bodies.rectangle(-8, height / 2, 16, height, { isStatic: true }),
      Bodies.rectangle(width + 8, height / 2, 16, height, { isStatic: true }),
    ]);
    for (let i = 0; i < 8; i += 1) addMatterBall();
    Render.run(render);
    Runner.run(Runner.create(), matterEngine);
    qs("#matterDrop")?.addEventListener("click", addMatterBall);
  });
}

function addMatterBall() {
  if (!matterEngine || !window.Matter) return;
  const stage = qs("#matterStage");
  const colors = ["#2563eb", "#0f8f72", "#e25f4f", "#e4a11b"];
  Matter.Composite.add(
    matterEngine.world,
    Matter.Bodies.circle(rand(32, stage.clientWidth - 32), rand(6, 40), rand(12, 22), {
      restitution: 0.72,
      render: { fillStyle: colors[rand(0, colors.length - 1)] },
    })
  );
}

function runAnime() {
  if (!window.anime) return;
  anime({
    targets: "#animeOrbit span",
    translateX: () => rand(-54, 54),
    translateY: () => rand(-42, 42),
    scale: () => Math.random() * 0.8 + 0.72,
    delay: anime.stagger(70),
    direction: "alternate",
    easing: "easeInOutSine",
    duration: 900,
  });
}

function initAnime() {
  safe("Anime.js", () => {
    if (!window.anime) return;
    qs("#animeRun")?.addEventListener("click", runAnime);
    runAnime();
  });
}

function runGsap() {
  if (!window.gsap) return;
  gsap.fromTo(
    ".gsap-track span",
    { x: 0, opacity: 0.74 },
    { x: "calc(100vw / 8)", opacity: 1, duration: 0.75, stagger: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" }
  );
}

function initGsap() {
  safe("GSAP", () => {
    if (!window.gsap) return;
    qs("#gsapRun")?.addEventListener("click", runGsap);
    runGsap();
  });
}

function initSwiper() {
  safe("Swiper", () => {
    if (!window.Swiper) return;
    new Swiper("#imageSwiper", {
      loop: true,
      pagination: { el: ".swiper-pagination" },
      autoplay: { delay: 2300 },
    });
  });
}

function initSortable() {
  safe("SortableJS", () => {
    const el = qs("#sortableBoard");
    if (!el || !window.Sortable) return;
    Sortable.create(el, { animation: 160, ghostClass: "sortable-ghost" });
  });
}

function initTyped() {
  safe("Typed.js", () => {
    if (!window.Typed) return;
    new Typed("#typedLine", {
      strings: ["npm install idea", "import library", "compose demo", "ship studio"],
      typeSpeed: 35,
      backSpeed: 18,
      loop: true,
    });
  });
}

function initFuse() {
  safe("Fuse.js", () => {
    if (!window.Fuse) return;
    const input = qs("#fuseInput");
    const list = qs("#fuseResults");
    const fuse = new Fuse(libraries.map((name) => ({ name })), { keys: ["name"], threshold: 0.35 });
    function render() {
      const items = fuse.search(input.value || "js").slice(0, 5);
      list.innerHTML = items.map((item) => `<li>${item.item.name}</li>`).join("");
    }
    input.addEventListener("input", render);
    render();
  });
}

function updateLodash() {
  if (!window._) return;
  const values = randomSeries(9, 12, 99);
  qs("#lodashStats").innerHTML = [
    `min ${_.min(values)}`,
    `max ${_.max(values)}`,
    `sum ${_.sum(values)}`,
    `avg ${Math.round(_.mean(values))}`,
  ]
    .map((item) => `<span>${item}</span>`)
    .join("");
}

function initLodash() {
  safe("Lodash", () => {
    if (!window._) return;
    qs("#lodashRoll")?.addEventListener("click", updateLodash);
    updateLodash();
  });
}

function initDayjs() {
  safe("Day.js", () => {
    if (!window.dayjs) return;
    const now = dayjs();
    qs("#dayTimeline").innerHTML = [
      ["Now", now.format("HH:mm:ss")],
      ["Tomorrow", now.add(1, "day").format("MMM D")],
      ["Sprint", now.add(2, "week").format("MMM D")],
    ]
      .map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`)
      .join("");
  });
}

function initLuxon() {
  safe("Luxon", () => {
    if (!window.luxon) return;
    const zones = ["Asia/Seoul", "America/New_York", "Europe/Paris"];
    qs("#luxonZones").innerHTML = zones
      .map((zone) => {
        const time = luxon.DateTime.now().setZone(zone).toFormat("HH:mm");
        return `<div><strong>${zone.split("/").pop()}</strong><span>${time}</span></div>`;
      })
      .join("");
  });
}

function parseCsv() {
  if (!window.Papa) return;
  const csv = "Library,Score,Use\nChart.js,92,Data\nThree.js,88,3D\nFuse.js,76,Search";
  const parsed = Papa.parse(csv, { header: true });
  const headers = Object.keys(parsed.data[0]);
  qs("#csvTable").innerHTML = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${parsed.data
    .map((row) => `<tr>${headers.map((h) => `<td>${row[h]}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
}

function initPapa() {
  safe("PapaParse", () => {
    if (!window.Papa) return;
    qs("#parseCsv")?.addEventListener("click", parseCsv);
    parseCsv();
  });
}

function initTabulator() {
  safe("Tabulator", () => {
    const el = qs("#tabulatorTable");
    if (!el || !window.Tabulator) return;
    new Tabulator(el, {
      data: sampleRows,
      layout: "fitColumns",
      height: 255,
      columns: [
        { title: "Library", field: "library" },
        { title: "Type", field: "type" },
        { title: "Impact", field: "impact", sorter: "number" },
        { title: "Status", field: "status" },
      ],
    });
  });
}

function renderMarkdown() {
  if (!window.marked || !window.DOMPurify) return;
  const html = marked.parse(qs("#markdownInput").value);
  qs("#markdownPreview").innerHTML = DOMPurify.sanitize(html);
}

function initMarkdown() {
  safe("Marked + DOMPurify", () => {
    if (!window.marked || !window.DOMPurify) return;
    qs("#markdownInput")?.addEventListener("input", renderMarkdown);
    renderMarkdown();
  });
}

function initPrism() {
  safe("Prism.js", () => {
    if (!window.Prism) return;
    Prism.highlightAll();
  });
}

function initMermaid() {
  safe("Mermaid", () => {
    if (!window.mermaid) return;
    mermaid.initialize({ startOnLoad: true, theme: document.body.classList.contains("dark") ? "dark" : "default" });
  });
}

function makeQr() {
  if (!window.QRCode) return;
  const box = qs("#qrBox");
  box.innerHTML = "";
  new QRCode(box, { text: qs("#qrText").value, width: 126, height: 126, colorDark: "#1f2933", colorLight: "#ffffff" });
}

function initQr() {
  safe("QRCode.js", () => {
    if (!window.QRCode) return;
    qs("#makeQr")?.addEventListener("click", makeQr);
    makeQr();
  });
}

function makePdf() {
  if (!window.jspdf) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
    doc.text("JS Library Studio", 20, 24);
  doc.setFontSize(11);
  doc.text("30 browser demos generated with HTML, CSS, and JavaScript.", 20, 36);
  libraries.slice(0, 30).forEach((library, index) => doc.text(`${index + 1}. ${library}`, 20, 50 + index * 7));
  doc.save("js-library-studio.pdf");
}

function initPdf() {
  safe("jsPDF", () => {
    if (!window.jspdf) return;
    qs("#makePdf")?.addEventListener("click", makePdf);
  });
}

function showToast(text = "Library action complete") {
  if (!window.Toastify) return;
  Toastify({
    text,
    duration: 2200,
    gravity: "bottom",
    position: "right",
    style: { background: "linear-gradient(90deg, #2563eb, #0f8f72)" },
  }).showToast();
}

function initToast() {
  safe("Toastify", () => {
    if (!window.Toastify) return;
    qs("#showToast")?.addEventListener("click", () => showToast());
  });
}

function initTippy() {
  safe("Tippy.js", () => {
    if (!window.tippy) return;
    tippy("[data-tippy-content]", { animation: "shift-away", delay: [120, 0] });
  });
}

function initFlatpickr() {
  safe("Flatpickr", () => {
    if (!window.flatpickr) return;
    flatpickr("#datePicker", { defaultDate: new Date(), mode: "range" });
  });
}

function initCalendar() {
  safe("FullCalendar", () => {
    const el = qs("#calendarBox");
    if (!el || !window.FullCalendar) return;
    const calendar = new FullCalendar.Calendar(el, {
      initialView: "dayGridMonth",
      height: 315,
      headerToolbar: { left: "prev,next", center: "title", right: "today" },
      events: [
        { title: "Prototype", start: new Date().toISOString().slice(0, 10) },
        {
          title: "Demo day",
          start: window.dayjs ? window.dayjs().add(3, "day").format("YYYY-MM-DD") : new Date().toISOString().slice(0, 10),
        },
      ],
    });
    calendar.render();
  });
}

function initSlider() {
  safe("noUiSlider", () => {
    const slider = qs("#rangeSlider");
    if (!slider || !window.noUiSlider) return;
    noUiSlider.create(slider, {
      start: [40, 75],
      connect: true,
      range: { min: 0, max: 100 },
      step: 1,
    });
    slider.noUiSlider.on("update", (values) => {
      qs("#sliderValue").textContent = values.map((v) => Math.round(v)).join(" - ");
    });
  });
}

function initChoices() {
  safe("Choices.js", () => {
    const el = qs("#choicesSelect");
    if (!el || !window.Choices) return;
    new Choices(el, { removeItemButton: true, shouldSort: false });
  });
}

function initSweetAlert() {
  safe("SweetAlert2", () => {
    if (!window.Swal) return;
    qs("#showModal")?.addEventListener("click", () => {
      Swal.fire({
        title: "SweetAlert2",
        text: "Modal component is running.",
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initShell();
  initIcons();
  initChart();
  initD3();
  initECharts();
  initPlotly();
  initLeaflet();
  initThree();
  initMatter();
  initAnime();
  initGsap();
  initSwiper();
  initSortable();
  initTyped();
  initFuse();
  initLodash();
  initDayjs();
  initLuxon();
  initPapa();
  initTabulator();
  initMarkdown();
  initPrism();
  initMermaid();
  initQr();
  initPdf();
  initToast();
  initTippy();
  initFlatpickr();
  initCalendar();
  initSlider();
  initChoices();
  initSweetAlert();
});
