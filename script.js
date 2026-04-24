/**
 * CalcSuite — Multi-Tool Calculator App
 * Navigation + Basic Calculator + All Converters
 */
(function () {
  'use strict';

  /* ===========================================
     NAVIGATION
     =========================================== */
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebar-overlay');
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.panel');

  function switchPanel(panelId) {
    panels.forEach(p => { p.classList.remove('active'); });
    navItems.forEach(n => { n.classList.remove('active'); });
    // Also deactivate fav items
    document.querySelectorAll('.fav-item').forEach(f => f.classList.remove('active'));
    const target = document.getElementById('panel-' + panelId);
    const nav = document.querySelector(`.nav-item[data-panel="${panelId}"]`);
    if (target) { target.classList.remove('active'); void target.offsetWidth; target.classList.add('active'); }
    if (nav) nav.classList.add('active');
    // Also highlight matching fav item
    const favItem = document.querySelector(`.fav-item[data-panel="${panelId}"]`);
    if (favItem) favItem.classList.add('active');
    // Close mobile sidebar
    sidebar.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't switch panel if clicking the star
      if (e.target.closest('.nav-star')) return;
      switchPanel(item.dataset.panel);
    });
  });

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    hamburger.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
  });

  /* ===========================================
     FAVOURITES SYSTEM
     =========================================== */
  const favSection = document.getElementById('fav-section');
  const favToggle = document.getElementById('fav-toggle');
  const favList = document.getElementById('fav-list');
  const favEmpty = document.getElementById('fav-empty');
  const starButtons = document.querySelectorAll('.nav-star');

  // Map panel IDs to display names (read from sibling span)
  const panelNames = {};
  navItems.forEach(item => {
    const span = item.querySelector('span:not(.nav-star)');
    if (span) panelNames[item.dataset.panel] = span.textContent;
  });

  // Load from localStorage
  let favourites = JSON.parse(localStorage.getItem('calcsuite-favs') || '[]');

  function saveFavourites() {
    localStorage.setItem('calcsuite-favs', JSON.stringify(favourites));
  }

  function updateStarStates() {
    starButtons.forEach(star => {
      if (favourites.includes(star.dataset.fav)) {
        star.classList.add('starred');
        star.textContent = '★';
        star.title = 'Remove from favourites';
      } else {
        star.classList.remove('starred');
        star.textContent = '☆';
        star.title = 'Add to favourites';
      }
    });
  }

  function renderFavourites() {
    // Clear existing fav items (keep fav-empty)
    favList.querySelectorAll('.fav-item').forEach(el => el.remove());

    if (favourites.length === 0) {
      favEmpty.style.display = 'block';
    } else {
      favEmpty.style.display = 'none';
      favourites.forEach(panelId => {
        const btn = document.createElement('button');
        btn.className = 'fav-item';
        btn.dataset.panel = panelId;
        // Check if this panel is currently active
        const activePanel = document.querySelector('.panel.active');
        if (activePanel && activePanel.id === 'panel-' + panelId) {
          btn.classList.add('active');
        }
        btn.innerHTML = `<span class="fav-item-star">★</span><span>${panelNames[panelId] || panelId}</span>`;
        btn.addEventListener('click', () => switchPanel(panelId));
        favList.appendChild(btn);
      });
    }
  }

  function toggleFavourite(panelId) {
    const idx = favourites.indexOf(panelId);
    if (idx > -1) {
      favourites.splice(idx, 1);
    } else {
      favourites.push(panelId);
    }
    saveFavourites();
    updateStarStates();
    renderFavourites();
    // Auto-open favourites dropdown when adding first item
    if (favourites.length > 0 && !favSection.classList.contains('open')) {
      favSection.classList.add('open');
    }
  }

  // Star button click handlers
  starButtons.forEach(star => {
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavourite(star.dataset.fav);
    });
  });

  // Fav toggle dropdown
  favToggle.addEventListener('click', () => {
    favSection.classList.toggle('open');
  });

  // Initialize
  updateStarStates();
  renderFavourites();
  // Auto-open if there are favourites
  if (favourites.length > 0) favSection.classList.add('open');

  /* ===========================================
     SCIENTIFIC CALCULATOR (Replaced Basic)
     =========================================== */
  let basicExpression = '';
  const basicDisplayCurr = document.getElementById('display-current');
  const basicDisplayExpr = document.getElementById('display-expression');
  const basicButtons = document.querySelectorAll('#panel-basic .btn');

  const BASIC_MATH = {
    sin: function(x) { return Math.sin(x); },
    cos: function(x) { return Math.cos(x); },
    pi: Math.PI,
    log10: function(x) { return Math.log10(x); },
    log: function(x) { return Math.log(x); }, // ln
    log2: function(x) { return Math.log2(x); },
    square: function(x) { return Math.pow(x, 2); },
    sqrt: function(x) { return Math.sqrt(x); },
    e: Math.E
  };

  function parseBasicExpr(expr) {
    let s = expr;
    s = s.replace(/\^/g, '**');
    s = s.replace(/×/g, '*');
    s = s.replace(/÷/g, '/');
    s = s.replace(/−/g, '-');
    return s;
  }

  function updateBasicDisplay() {
    basicDisplayCurr.textContent = basicExpression || '0';
    if(basicExpression.length > 25) basicDisplayCurr.className = 'display-current shrink-more';
    else if(basicExpression.length > 15) basicDisplayCurr.className = 'display-current shrink';
    else basicDisplayCurr.className = 'display-current';

    // Live evaluation
    basicDisplayExpr.textContent = '';
    if (basicExpression) {
      try {
        let safeExpr = parseBasicExpr(basicExpression);
        const evalFunc = new Function('funcs', `with(funcs) { return ${safeExpr}; }`);
        let result = evalFunc(BASIC_MATH);
        let resStr = result.toString();
        if (typeof result === 'number' && !Number.isInteger(result)) {
           resStr = parseFloat(result.toPrecision(12)).toString();
        }
        
        if (resStr !== basicExpression && typeof result === 'number' && !isNaN(result)) {
          basicDisplayExpr.textContent = '= ' + resStr;
        }
      } catch (e) {
        // Silently fail if expression is incomplete
      }
    }
  }

  function evaluateBasic() {
    if(!basicExpression) return;
    try {
      let safeExpr = parseBasicExpr(basicExpression);
      const evalFunc = new Function('funcs', `with(funcs) { return ${safeExpr}; }`);
      let result = evalFunc(BASIC_MATH);
      
      let resStr = result.toString();
      if (typeof result === 'number' && !Number.isInteger(result)) {
         resStr = parseFloat(result.toPrecision(12)).toString();
      }
      basicExpression = resStr;
      updateBasicDisplay();
    } catch (e) {
      basicDisplayExpr.textContent = 'Error';
      basicDisplayCurr.textContent = 'Invalid Expr';
      basicExpression = '';
    }
  }

  basicButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Button pop animation
      btn.classList.remove('btn-pop');
      void btn.offsetWidth;
      btn.classList.add('btn-pop');
      
      const action = btn.dataset.action;
      const val = btn.dataset.value;
      
      if (action === 'basic-clear') {
        basicExpression = '';
        basicDisplayExpr.textContent = '';
        updateBasicDisplay();
      } else if (action === 'basic-del') {
        basicExpression = basicExpression.trimEnd().slice(0, -1);
        updateBasicDisplay();
      } else if (action === 'basic-equals') {
        evaluateBasic();
      } else if (action === 'basic-func') {
        basicExpression += val + '(';
        updateBasicDisplay();
      } else if (action === 'basic-op') {
        basicExpression += ' ' + val + ' ';
        updateBasicDisplay();
      } else if (action === 'basic-char') {
        basicExpression += val;
        updateBasicDisplay();
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (!document.getElementById('panel-basic').classList.contains('active')) return;
    const k = e.key;
    if(['0','1','2','3','4','5','6','7','8','9','.','/','+','-','*','%','Enter','Backspace','Escape','=','^','(',')'].includes(k)) e.preventDefault();
    
    if(k>='0'&&k<='9' || k==='.' || k==='(' || k===')'){
      basicExpression += k;
      updateBasicDisplay();
    }
    else if(['+','-','*','/','%','^'].includes(k)){
      let visualK = k;
      if(k === '*') visualK = '×';
      if(k === '/') visualK = '÷';
      if(k === '-') visualK = '−';
      basicExpression += ' ' + visualK + ' ';
      updateBasicDisplay();
    }
    else if(k==='Enter'||k==='='){ evaluateBasic(); }
    else if(k==='Backspace'){ basicExpression = basicExpression.trimEnd().slice(0, -1); updateBasicDisplay(); }
    else if(k==='Escape'){ basicExpression = ''; basicDisplayExpr.textContent = ''; updateBasicDisplay(); }
  });

  /* ===========================================
     UNIT CONVERTER HELPERS
     =========================================== */
  function setupConverter(prefix, units, convertFn, defaultResult) {
    const inp = document.getElementById(prefix + '-input');
    const from = document.getElementById(prefix + '-from');
    const to = document.getElementById(prefix + '-to');
    const swapBtn = document.getElementById(prefix + '-swap');
    const result = document.getElementById(prefix + '-result');

    function update() {
      const val = parseFloat(inp.value);
      if (isNaN(val)) { result.textContent = '—'; return; }
      const r = convertFn(val, from.value, to.value);
      const display = parseFloat(r.toPrecision(10));
      const unitLabel = to.options[to.selectedIndex].text.match(/\((.+)\)/);
      result.textContent = display + ' ' + (unitLabel ? unitLabel[1] : to.value);
    }

    inp.addEventListener('input', update);
    from.addEventListener('change', update);
    to.addEventListener('change', update);
    swapBtn.addEventListener('click', () => {
      const tmp = from.value;
      from.value = to.value;
      to.value = tmp;
      update();
    });
    update();
  }

  /* ===========================================
     TEMPERATURE
     =========================================== */
  function convertTemp(val, from, to) {
    // Convert to Celsius first
    let c;
    if (from === 'C') c = val;
    else if (from === 'F') c = (val - 32) * 5/9;
    else c = val - 273.15; // K
    // Convert from Celsius to target
    if (to === 'C') return c;
    if (to === 'F') return c * 9/5 + 32;
    return c + 273.15; // K
  }
  setupConverter('temp', null, convertTemp);

  /* ===========================================
     LENGTH
     =========================================== */
  const lengthToM = { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, ft:0.3048, in:0.0254 };
  function convertLength(val, from, to) { return val * lengthToM[from] / lengthToM[to]; }
  setupConverter('length', null, convertLength);

  /* ===========================================
     WEIGHT
     =========================================== */
  const weightToKg = { kg:1, g:0.001, lb:0.453592, oz:0.0283495, ton:1000 };
  function convertWeight(val, from, to) { return val * weightToKg[from] / weightToKg[to]; }
  setupConverter('weight', null, convertWeight);

  /* ===========================================
     SPEED
     =========================================== */
  const speedToMs = { kmh:1/3.6, mph:0.44704, ms:1, knots:0.514444 };
  function convertSpeed(val, from, to) { return val * speedToMs[from] / speedToMs[to]; }
  setupConverter('speed', null, convertSpeed);

  /* ===========================================
     AREA
     =========================================== */
  const areaToM2 = { m2:1, km2:1e6, ft2:0.092903, acre:4046.86, hectare:10000 };
  function convertArea(val, from, to) { return val * areaToM2[from] / areaToM2[to]; }
  setupConverter('area', null, convertArea);

  /* ===========================================
     BMI CALCULATOR
     =========================================== */
  const bmiH = document.getElementById('bmi-height');
  const bmiW = document.getElementById('bmi-weight');
  const bmiResult = document.getElementById('bmi-result');
  const bmiMarker = document.getElementById('bmi-marker');

  function updateBMI() {
    const h = parseFloat(bmiH.value) / 100; // cm to m
    const w = parseFloat(bmiW.value);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      bmiResult.innerHTML = '<span class="bmi-value">—</span>';
      return;
    }
    const bmi = w / (h * h);
    const bmiRound = Math.round(bmi * 10) / 10;

    let cat, cls;
    if (bmi < 18.5) { cat = 'Underweight'; cls = 'underweight'; }
    else if (bmi < 25) { cat = 'Normal weight'; cls = 'normal'; }
    else if (bmi < 30) { cat = 'Overweight'; cls = 'overweight'; }
    else { cat = 'Obese'; cls = 'obese'; }

    bmiResult.innerHTML = `<span class="bmi-value">${bmiRound}</span><span class="bmi-category ${cls}">${cat}</span>`;

    // Position marker (BMI 10-40 range mapped to 0-100%)
    const pct = Math.max(0, Math.min(100, ((bmi - 10) / 30) * 100));
    bmiMarker.style.left = pct + '%';
  }

  bmiH.addEventListener('input', updateBMI);
  bmiW.addEventListener('input', updateBMI);
  updateBMI();

  /* ===========================================
     DISCOUNT CALCULATOR
     =========================================== */
  const discPrice = document.getElementById('discount-price');
  const discPct = document.getElementById('discount-percent');
  const discSavings = document.getElementById('discount-savings');
  const discFinal = document.getElementById('discount-final');

  function updateDiscount() {
    const price = parseFloat(discPrice.value) || 0;
    const pct = parseFloat(discPct.value) || 0;
    const savings = price * pct / 100;
    const final = price - savings;
    discSavings.textContent = '$' + savings.toFixed(2);
    discFinal.textContent = '$' + final.toFixed(2);
  }

  discPrice.addEventListener('input', updateDiscount);
  discPct.addEventListener('input', updateDiscount);
  updateDiscount();

  /* ===========================================
     AGE CALCULATOR (DD/MM/YYYY)
     =========================================== */
  const ageDay = document.getElementById('age-day');
  const ageMonth = document.getElementById('age-month');
  const ageYear = document.getElementById('age-year');
  const ageYearsOut = document.getElementById('age-years');
  const ageMonthsOut = document.getElementById('age-months');
  const ageDaysOut = document.getElementById('age-days');

  function updateAge() {
    const d = parseInt(ageDay.value);
    const m = parseInt(ageMonth.value);
    const y = parseInt(ageYear.value);
    if (isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31) {
      ageYearsOut.textContent = '—';
      ageMonthsOut.textContent = '—';
      ageDaysOut.textContent = '—';
      return;
    }

    const birth = new Date(y, m - 1, d);
    const now = new Date();
    if (isNaN(birth.getTime()) || birth > now) {
      ageYearsOut.textContent = '—';
      ageMonthsOut.textContent = '—';
      ageDaysOut.textContent = '—';
      return;
    }

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prev = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prev.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    ageYearsOut.textContent = years;
    ageMonthsOut.textContent = months;
    ageDaysOut.textContent = days;
  }

  ageDay.addEventListener('input', updateAge);
  ageMonth.addEventListener('input', updateAge);
  ageYear.addEventListener('input', updateAge);
  updateAge();

  /* ===========================================
     FUEL COST CALCULATOR
     =========================================== */
  const fcDist = document.getElementById('fc-distance');
  const fcEff = document.getElementById('fc-efficiency');
  const fcPrice = document.getElementById('fc-price');
  const fcLitres = document.getElementById('fc-litres');
  const fcCost = document.getElementById('fc-cost');

  function updateFuelCost() {
    const dist = parseFloat(fcDist.value) || 0;
    const eff = parseFloat(fcEff.value) || 0;
    const price = parseFloat(fcPrice.value) || 0;
    if (eff <= 0) {
      fcLitres.textContent = '—';
      fcCost.textContent = '—';
      return;
    }
    const litres = dist / eff;
    const cost = litres * price;
    fcLitres.textContent = litres.toFixed(2) + ' L';
    fcCost.textContent = '$' + cost.toFixed(2);
  }

  fcDist.addEventListener('input', updateFuelCost);
  fcEff.addEventListener('input', updateFuelCost);
  fcPrice.addEventListener('input', updateFuelCost);
  updateFuelCost();

  /* ===========================================
     FUEL EFFICIENCY CALCULATOR
     =========================================== */
  const feDist = document.getElementById('fe-distance');
  const feFuel = document.getElementById('fe-fuel');
  const feKml = document.getElementById('fe-kml');
  const feL100 = document.getElementById('fe-l100');
  const feMpg = document.getElementById('fe-mpg');

  function updateFuelEff() {
    const dist = parseFloat(feDist.value) || 0;
    const fuel = parseFloat(feFuel.value) || 0;
    if (fuel <= 0 || dist <= 0) {
      feKml.textContent = '—';
      feL100.textContent = '—';
      feMpg.textContent = '—';
      return;
    }
    const kml = dist / fuel;
    const l100 = (fuel / dist) * 100;
    const mpg = kml * 2.35215; // km/L to mpg
    feKml.textContent = kml.toFixed(2);
    feL100.textContent = l100.toFixed(2);
    feMpg.textContent = mpg.toFixed(2);
  }

  feDist.addEventListener('input', updateFuelEff);
  feFuel.addEventListener('input', updateFuelEff);
  updateFuelEff();

  /* ===========================================
     GRADE AVERAGE (GPA) CALCULATOR
     =========================================== */
  const gradeRowsContainer = document.getElementById('grade-rows');
  const gradeAddBtn = document.getElementById('grade-add');
  const gradeAvg = document.getElementById('grade-avg');
  const gradeTotalCredits = document.getElementById('grade-total-credits');
  let gradeCounter = 1;

  function updateGrade() {
    const rows = gradeRowsContainer.querySelectorAll('.grade-row');
    let totalWeighted = 0;
    let totalCredits = 0;
    rows.forEach(row => {
      const credits = parseFloat(row.querySelector('.grade-credits').value) || 0;
      const gpa = parseFloat(row.querySelector('.grade-gpa').value) || 0;
      totalWeighted += credits * gpa;
      totalCredits += credits;
    });
    const avg = totalCredits > 0 ? totalWeighted / totalCredits : 0;
    gradeAvg.textContent = avg.toFixed(2);
    gradeTotalCredits.textContent = 'Total Credits: ' + totalCredits;
  }

  function addGradeRow() {
    gradeCounter++;
    const row = document.createElement('div');
    row.className = 'grade-row';
    row.innerHTML = `
      <input type="text" class="converter-input grade-subject" placeholder="Subject" value="Subject ${gradeCounter}" />
      <input type="number" class="converter-input grade-credits" placeholder="Cr" value="4" min="1" />
      <input type="number" class="converter-input grade-gpa" placeholder="GPA" value="7" min="1" max="10" step="0.1" />
      <button class="grade-remove" aria-label="Remove row">×</button>
    `;
    gradeRowsContainer.appendChild(row);
    attachGradeRowEvents(row);
    updateGrade();
  }

  function attachGradeRowEvents(row) {
    row.querySelector('.grade-credits').addEventListener('input', updateGrade);
    row.querySelector('.grade-gpa').addEventListener('input', updateGrade);
    row.querySelector('.grade-remove').addEventListener('click', () => {
      if (gradeRowsContainer.querySelectorAll('.grade-row').length > 1) {
        row.remove();
        updateGrade();
      }
    });
  }

  // Attach events to initial row
  gradeRowsContainer.querySelectorAll('.grade-row').forEach(attachGradeRowEvents);
  gradeAddBtn.addEventListener('click', addGradeRow);
  updateGrade();

  /* ===========================================
     CURRENCY CONVERTER (Frankfurter API, 10-min cache)
     =========================================== */
  const currAmount = document.getElementById('currency-amount');
  const currFrom = document.getElementById('currency-from');
  const currTo = document.getElementById('currency-to');
  const currSwap = document.getElementById('currency-swap');
  const currRateLabel = document.getElementById('currency-rate-label');
  const currRateVal = document.getElementById('currency-rate-val');
  const currConverted = document.getElementById('currency-converted');
  const currStatus = document.getElementById('currency-status');
  const currStatusText = document.getElementById('currency-status-text');

  const CURRENCY_NAMES = {
    USD:'US Dollar',EUR:'Euro',GBP:'British Pound',JPY:'Japanese Yen',
    AUD:'Australian Dollar',CAD:'Canadian Dollar',CHF:'Swiss Franc',
    CNY:'Chinese Yuan',INR:'Indian Rupee',MXN:'Mexican Peso',
    BRL:'Brazilian Real',KRW:'South Korean Won',SGD:'Singapore Dollar',
    HKD:'Hong Kong Dollar',NOK:'Norwegian Krone',SEK:'Swedish Krona',
    DKK:'Danish Krone',NZD:'New Zealand Dollar',ZAR:'South African Rand',
    RUB:'Russian Ruble',TRY:'Turkish Lira',THB:'Thai Baht',
    IDR:'Indonesian Rupiah',MYR:'Malaysian Ringgit',PHP:'Philippine Peso',
    PLN:'Polish Zloty',CZK:'Czech Koruna',HUF:'Hungarian Forint',
    ILS:'Israeli Shekel',BGN:'Bulgarian Lev',RON:'Romanian Leu',
    ISK:'Icelandic Krona',HRK:'Croatian Kuna'
  };

  let ratesCache = {};
  let ratesBase = 'USD';
  let ratesTimestamp = 0;
  const CACHE_MS = 10 * 60 * 1000; // 10 minutes

  // Populate currency selects
  function populateCurrencySelects() {
    const currencies = Object.keys(CURRENCY_NAMES);
    [currFrom, currTo].forEach(sel => {
      sel.innerHTML = '';
      currencies.forEach(code => {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = code + ' — ' + CURRENCY_NAMES[code];
        sel.appendChild(opt);
      });
    });
    currFrom.value = 'USD';
    currTo.value = 'EUR';
  }

  async function fetchRates(base) {
    const now = Date.now();
    if (ratesBase === base && ratesTimestamp && (now - ratesTimestamp) < CACHE_MS && Object.keys(ratesCache).length > 0) {
      return ratesCache;
    }
    currStatus.className = 'currency-status loading';
    currStatusText.textContent = 'Fetching live rates…';
    try {
      const resp = await fetch('https://api.frankfurter.dev/v1/latest?base=' + base);
      if (!resp.ok) throw new Error('API error');
      const data = await resp.json();
      ratesCache = data.rates;
      ratesCache[base] = 1;
      ratesBase = base;
      ratesTimestamp = now;
      const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      currStatus.className = 'currency-status';
      currStatusText.textContent = 'Live rates as of ' + time + ' (refreshes every 10 min)';
      return ratesCache;
    } catch (e) {
      currStatus.className = 'currency-status error';
      currStatusText.textContent = 'Failed to load rates. Check your connection.';
      return null;
    }
  }

  async function updateCurrency() {
    const base = currFrom.value;
    const target = currTo.value;
    const amount = parseFloat(currAmount.value);
    const rates = await fetchRates(base);
    if (!rates || isNaN(amount)) {
      currRateVal.textContent = '—';
      currConverted.textContent = '—';
      return;
    }
    const rate = rates[target];
    if (rate === undefined) {
      currRateVal.textContent = 'N/A';
      currConverted.textContent = 'N/A';
      return;
    }
    currRateLabel.textContent = '1 ' + base + ' =';
    currRateVal.textContent = rate.toFixed(4) + ' ' + target;
    const converted = amount * rate;
    currConverted.textContent = converted.toFixed(2) + ' ' + target;
  }

  populateCurrencySelects();
  currAmount.addEventListener('input', updateCurrency);
  currFrom.addEventListener('change', () => { ratesTimestamp = 0; updateCurrency(); });
  currTo.addEventListener('change', updateCurrency);
  currSwap.addEventListener('click', () => {
    const tmp = currFrom.value;
    currFrom.value = currTo.value;
    currTo.value = tmp;
    ratesTimestamp = 0;
    updateCurrency();
  });
  // Don't auto-fetch on load; fetch when panel is opened
  navItems.forEach(item => {
    if (item.dataset.panel === 'currency') {
      item.addEventListener('click', () => { if (!ratesTimestamp) updateCurrency(); });
    }
  });

  /* ===========================================
     WORLD CLOCK
     =========================================== */
  const wcSearch = document.getElementById('wc-search');
  const wcAddBtn = document.getElementById('wc-add');
  const wcClocks = document.getElementById('wc-clocks');

  const TIMEZONES = [
    {city:'New York',tz:'America/New_York',country:'USA'},
    {city:'Los Angeles',tz:'America/Los_Angeles',country:'USA'},
    {city:'Chicago',tz:'America/Chicago',country:'USA'},
    {city:'London',tz:'Europe/London',country:'UK'},
    {city:'Paris',tz:'Europe/Paris',country:'France'},
    {city:'Berlin',tz:'Europe/Berlin',country:'Germany'},
    {city:'Moscow',tz:'Europe/Moscow',country:'Russia'},
    {city:'Dubai',tz:'Asia/Dubai',country:'UAE'},
    {city:'Mumbai',tz:'Asia/Kolkata',country:'India'},
    {city:'Delhi',tz:'Asia/Kolkata',country:'India'},
    {city:'Kolkata',tz:'Asia/Kolkata',country:'India'},
    {city:'Shanghai',tz:'Asia/Shanghai',country:'China'},
    {city:'Beijing',tz:'Asia/Shanghai',country:'China'},
    {city:'Tokyo',tz:'Asia/Tokyo',country:'Japan'},
    {city:'Seoul',tz:'Asia/Seoul',country:'South Korea'},
    {city:'Singapore',tz:'Asia/Singapore',country:'Singapore'},
    {city:'Hong Kong',tz:'Asia/Hong_Kong',country:'China'},
    {city:'Sydney',tz:'Australia/Sydney',country:'Australia'},
    {city:'Melbourne',tz:'Australia/Melbourne',country:'Australia'},
    {city:'Auckland',tz:'Pacific/Auckland',country:'New Zealand'},
    {city:'Toronto',tz:'America/Toronto',country:'Canada'},
    {city:'Vancouver',tz:'America/Vancouver',country:'Canada'},
    {city:'São Paulo',tz:'America/Sao_Paulo',country:'Brazil'},
    {city:'Buenos Aires',tz:'America/Argentina/Buenos_Aires',country:'Argentina'},
    {city:'Mexico City',tz:'America/Mexico_City',country:'Mexico'},
    {city:'Cairo',tz:'Africa/Cairo',country:'Egypt'},
    {city:'Johannesburg',tz:'Africa/Johannesburg',country:'South Africa'},
    {city:'Lagos',tz:'Africa/Lagos',country:'Nigeria'},
    {city:'Istanbul',tz:'Europe/Istanbul',country:'Turkey'},
    {city:'Bangkok',tz:'Asia/Bangkok',country:'Thailand'},
    {city:'Jakarta',tz:'Asia/Jakarta',country:'Indonesia'},
    {city:'Kuala Lumpur',tz:'Asia/Kuala_Lumpur',country:'Malaysia'},
    {city:'Riyadh',tz:'Asia/Riyadh',country:'Saudi Arabia'},
    {city:'Taipei',tz:'Asia/Taipei',country:'Taiwan'},
    {city:'Rome',tz:'Europe/Rome',country:'Italy'},
    {city:'Madrid',tz:'Europe/Madrid',country:'Spain'},
    {city:'Amsterdam',tz:'Europe/Amsterdam',country:'Netherlands'},
    {city:'Stockholm',tz:'Europe/Stockholm',country:'Sweden'},
    {city:'Zurich',tz:'Europe/Zurich',country:'Switzerland'},
    {city:'Lisbon',tz:'Europe/Lisbon',country:'Portugal'},
    {city:'Warsaw',tz:'Europe/Warsaw',country:'Poland'},
    {city:'Athens',tz:'Europe/Athens',country:'Greece'},
    {city:'Honolulu',tz:'Pacific/Honolulu',country:'USA'},
    {city:'Anchorage',tz:'America/Anchorage',country:'USA'},
    {city:'Denver',tz:'America/Denver',country:'USA'},
  ];

  let activeClocks = [];
  let wcInterval = null;

  // Populate search dropdown
  function populateWcSearch() {
    TIMEZONES.forEach(tz => {
      const opt = document.createElement('option');
      opt.value = tz.tz + '|' + tz.city + '|' + tz.country;
      opt.textContent = tz.city + ', ' + tz.country;
      wcSearch.appendChild(opt);
    });
  }

  function formatWcTime(tz) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const day = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long' });
    const date = now.toLocaleDateString('en-US', {
      timeZone: tz, day: 'numeric', month: 'short', year: 'numeric'
    });
    return { time, day, date };
  }

  function renderClocks() {
    wcClocks.innerHTML = '';
    activeClocks.forEach((clock, idx) => {
      const info = formatWcTime(clock.tz);
      const card = document.createElement('div');
      card.className = 'wc-card';
      card.innerHTML = `
        <div class="wc-card-info">
          <span class="wc-city">${clock.city}, ${clock.country}</span>
          <span class="wc-date">${info.date}</span>
        </div>
        <div class="wc-card-time">
          <span class="wc-time" data-tz="${clock.tz}">${info.time}</span>
          <span class="wc-day">${info.day}</span>
        </div>
        <button class="wc-remove" data-idx="${idx}" aria-label="Remove">×</button>
      `;
      wcClocks.appendChild(card);
    });

    // Attach remove handlers
    wcClocks.querySelectorAll('.wc-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        activeClocks.splice(parseInt(btn.dataset.idx), 1);
        renderClocks();
      });
    });
  }

  function tickClocks() {
    const timeEls = wcClocks.querySelectorAll('.wc-time');
    timeEls.forEach(el => {
      const tz = el.dataset.tz;
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-US', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
    });
  }

  wcAddBtn.addEventListener('click', () => {
    const val = wcSearch.value;
    if (!val) return;
    const [tz, city, country] = val.split('|');
    // Prevent duplicates
    if (activeClocks.some(c => c.tz === tz && c.city === city)) return;
    activeClocks.push({ tz, city, country });
    renderClocks();
    wcSearch.value = '';
    // Start ticking if not already
    if (!wcInterval) {
      wcInterval = setInterval(tickClocks, 1000);
    }
  });

  populateWcSearch();
  // Add a default clock (user's local)
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localMatch = TIMEZONES.find(t => t.tz === localTz);
  if (localMatch) {
    activeClocks.push({ tz: localMatch.tz, city: localMatch.city, country: localMatch.country });
  } else {
    activeClocks.push({ tz: localTz, city: localTz.split('/').pop().replace(/_/g, ' '), country: 'Local' });
  }
  renderClocks();
  wcInterval = setInterval(tickClocks, 1000);

  /* ===========================================
     BASE CONVERTER (Decimal, Binary, Hexadecimal)
     =========================================== */
  const baseDec = document.getElementById('base-dec');
  const baseBin = document.getElementById('base-bin');
  const baseHex = document.getElementById('base-hex');

  function updateBaseConverter(source, value) {
    if (value === '') {
      if (source !== 'dec') baseDec.value = '';
      if (source !== 'bin') baseBin.value = '';
      if (source !== 'hex') baseHex.value = '';
      return;
    }

    let decimalValue = NaN;

    if (source === 'dec') {
      decimalValue = parseInt(value, 10);
    } else if (source === 'bin') {
      decimalValue = parseInt(value, 2);
    } else if (source === 'hex') {
      decimalValue = parseInt(value, 16);
    }

    if (isNaN(decimalValue)) {
      if (source !== 'dec') baseDec.value = 'Invalid input';
      if (source !== 'bin') baseBin.value = 'Invalid input';
      if (source !== 'hex') baseHex.value = 'Invalid input';
      return;
    }

    if (source !== 'dec') baseDec.value = decimalValue.toString(10);
    if (source !== 'bin') baseBin.value = decimalValue.toString(2);
    if (source !== 'hex') baseHex.value = decimalValue.toString(16).toUpperCase();
  }

  baseDec.addEventListener('input', (e) => {
    // Only allow digits
    e.target.value = e.target.value.replace(/[^0-9-]/g, '');
    updateBaseConverter('dec', e.target.value);
  });

  baseBin.addEventListener('input', (e) => {
    // Only allow 0 and 1
    e.target.value = e.target.value.replace(/[^01-]/g, '');
    updateBaseConverter('bin', e.target.value);
  });

  baseHex.addEventListener('input', (e) => {
    // Allow digits and A-F
    e.target.value = e.target.value.replace(/[^0-9a-fA-F-]/g, '').toUpperCase();
    updateBaseConverter('hex', e.target.value);
  });

  /* ===========================================
     COMPETITIVE PROGRAMMER CALCULATOR
     =========================================== */
  const cpDisplayExpr = document.getElementById('cp-display-expression');
  const cpDisplayCurr = document.getElementById('cp-display-current');
  const cpButtons = document.querySelectorAll('.cp-grid .btn');
  
  let cpExpression = '';
  
  const CP_MATH = {
    abs: (a) => (a < 0n ? -a : a),
    gcd: function(...args) {
      if(args.length === 0) return 0n;
      let res = CP_MATH.abs(args[0]);
      for(let i=1; i<args.length; i++) {
        let b = CP_MATH.abs(args[i]);
        while(b !== 0n) { let t = b; b = res % b; res = t; }
      }
      return res;
    },
    lcm: function(...args) {
      if(args.length === 0) return 0n;
      let res = CP_MATH.abs(args[0]);
      for(let i=1; i<args.length; i++) {
        let b = CP_MATH.abs(args[i]);
        if(res === 0n || b === 0n) return 0n;
        res = (res * b) / CP_MATH.gcd(res, b);
      }
      return res;
    },
    mex: function(...args) {
      let set = new Set(args.map(a => a.toString()));
      let i = 0n;
      while(set.has(i.toString())) i++;
      return i;
    },
    isprime: function(n) {
      if(n <= 1n) return 0n;
      if(n === 2n || n === 3n) return 1n;
      if(n % 2n === 0n || n % 3n === 0n) return 0n;
      for(let i = 5n; i * i <= n; i += 6n) {
        if(n % i === 0n || n % (i + 2n) === 0n) return 0n;
      }
      return 1n;
    },
    nextprime: function(n) {
      let i = n + 1n;
      while(CP_MATH.isprime(i) === 0n) i++;
      return i;
    },
    prevprime: function(n) {
      let i = n - 1n;
      while(i > 1n && CP_MATH.isprime(i) === 0n) i--;
      return i > 1n ? i : 0n;
    },
    divisors: function(n) {
      if(n <= 0n) return '[]';
      let divs = [];
      for(let i = 1n; i * i <= n; i++) {
        if(n % i === 0n) {
          divs.push(i);
          if(i * i !== n) divs.push(n / i);
        }
      }
      divs.sort((a,b) => (a < b ? -1 : a > b ? 1 : 0));
      return '[' + divs.join(', ') + ']';
    },
    primefactors: function(n) {
      if(n <= 1n) return '[]';
      let counts = new Map();
      let curr = n;
      for(let i = 2n; i * i <= curr; i++) {
        while(curr % i === 0n) {
          counts.set(i, (counts.get(i) || 0) + 1);
          curr /= i;
        }
      }
      if(curr > 1n) counts.set(curr, (counts.get(curr) || 0) + 1);
      
      const toSuperscript = (num) => {
        const supers = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
        return num.toString().split('').map(d => supers[d] || d).join('');
      };

      let factorsStr = [];
      counts.forEach((count, factor) => {
        if (count > 1) {
          factorsStr.push(factor.toString() + toSuperscript(count));
        } else {
          factorsStr.push(factor.toString());
        }
      });
      return '[' + factorsStr.join(', ') + ']';
    }
  };

  function updateCPDisplay() {
    cpDisplayCurr.textContent = cpExpression || '0';
    // Add visual shrinking if expression is long
    if(cpExpression.length > 25) cpDisplayCurr.className = 'display-current shrink-more';
    else if(cpExpression.length > 15) cpDisplayCurr.className = 'display-current shrink';
    else cpDisplayCurr.className = 'display-current';

    // Live evaluation
    cpDisplayExpr.textContent = '';
    if (cpExpression) {
      try {
        let safeExpr = cpExpression.replace(/\b(\d+)\b/g, '$1n');
        const evalFunc = new Function('funcs', `with(funcs) { return ${safeExpr}; }`);
        let result = evalFunc(CP_MATH);
        let resStr = result.toString();
        // Only show live result if it differs from the current expression
        if (resStr !== cpExpression && (typeof result === 'bigint' || typeof result === 'number' || typeof result === 'string')) {
          cpDisplayExpr.textContent = '= ' + resStr;
        }
      } catch (e) {
        // Silently fail if expression is incomplete
      }
    }
  }

  function evaluateCP() {
    if(!cpExpression) return;
    try {
      let safeExpr = cpExpression.replace(/\b(\d+)\b/g, '$1n');
      const evalFunc = new Function('funcs', `with(funcs) { return ${safeExpr}; }`);
      let result = evalFunc(CP_MATH);
      
      if (typeof result === 'bigint') {
        cpExpression = result.toString();
      } else {
        cpExpression = String(result);
      }
      updateCPDisplay();
    } catch (e) {
      cpDisplayExpr.textContent = 'Error';
      cpDisplayCurr.textContent = 'Invalid Expr';
      cpExpression = '';
    }
  }

  cpButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Button pop animation
      btn.classList.remove('btn-pop');
      void btn.offsetWidth;
      btn.classList.add('btn-pop');
      
      const action = btn.dataset.action;
      const val = btn.dataset.value;
      
      if (action === 'cp-ac') {
        cpExpression = '';
        cpDisplayExpr.textContent = '';
        updateCPDisplay();
      } else if (action === 'cp-del') {
        cpExpression = cpExpression.slice(0, -1);
        updateCPDisplay();
      } else if (action === 'cp-equals') {
        evaluateCP();
      } else if (action === 'cp-func') {
        cpExpression += val + '(';
        updateCPDisplay();
      } else if (action === 'cp-op') {
        cpExpression += ' ' + val + ' ';
        updateCPDisplay();
      } else if (action === 'cp-char') {
        cpExpression += val;
        updateCPDisplay();
      }
    });
  });

  /* ===========================================
     ALL UNITS CONVERTER
     =========================================== */
  const allUnitsFrom = document.getElementById('allunits-from');
  const allUnitsTo = document.getElementById('allunits-to');
  const allUnitsIn1 = document.getElementById('allunits-input1');
  const allUnitsIn2 = document.getElementById('allunits-input2');
  const allUnitsError = document.getElementById('allunits-error');

  const ALL_UNITS_DATA = {
    "Length": {
      "mm": { mul: 0.001 },
      "cm": { mul: 0.01 },
      "dm": { mul: 0.1 },
      "m": { mul: 1 },
      "km": { mul: 1000 },
      "in": { mul: 0.0254 },
      "ft": { mul: 0.3048 },
      "yd": { mul: 0.9144 },
      "mi": { mul: 1609.344 },
      "Nautical mile": { mul: 1852 }
    },
    "Mass": {
      "mg": { mul: 0.000001 },
      "g": { mul: 0.001 },
      "kg": { mul: 1 },
      "t (tonne)": { mul: 1000 },
      "gr (grain)": { mul: 0.00006479891 },
      "oz": { mul: 0.02834952 },
      "lb": { mul: 0.45359237 },
      "st (stone)": { mul: 6.35029318 },
      "US short ton": { mul: 907.1847 },
      "UK long ton": { mul: 1016.047 },
      "oz t (troy ounce)": { mul: 0.0311034768 },
      "ct (carat)": { mul: 0.0002 }
    },
    "Area": {
      "cm²": { mul: 0.0001 },
      "dm²": { mul: 0.01 },
      "m²": { mul: 1 },
      "a (are)": { mul: 100 },
      "ha (hectare)": { mul: 10000 },
      "km²": { mul: 1000000 },
      "in²": { mul: 0.00064516 },
      "ft²": { mul: 0.09290304 },
      "yd²": { mul: 0.83612736 },
      "mi²": { mul: 2589988.11 },
      "ac (acre)": { mul: 4046.85642 }
    },
    "Volume & Capacity": {
      "ml": { mul: 0.001 },
      "cl": { mul: 0.01 },
      "dl": { mul: 0.1 },
      "l": { mul: 1 },
      "hl": { mul: 100 },
      "kl": { mul: 1000 },
      "cm³ (cc)": { mul: 0.001 },
      "dm³": { mul: 1 },
      "m³": { mul: 1000 },
      "gal (UK)": { mul: 4.54609 },
      "qt (UK)": { mul: 1.1365225 },
      "pt (UK)": { mul: 0.56826125 },
      "fl oz (UK)": { mul: 0.02841306 },
      "gal (US)": { mul: 3.78541178 },
      "qt (US)": { mul: 0.946352946 },
      "pt (US)": { mul: 0.473176473 },
      "cup (US)": { mul: 0.236588236 },
      "fl oz (US)": { mul: 0.02957353 },
      "tbsp (US)": { mul: 0.01478676 },
      "tsp (US)": { mul: 0.00492892 },
      "200ml cup": { mul: 0.2 },
      "240ml cup": { mul: 0.24 },
      "250ml cup": { mul: 0.25 },
      "15ml tbsp": { mul: 0.015 },
      "5ml tsp": { mul: 0.005 },
      "bbl (barrel)": { mul: 158.987 }
    },
    "Time": {
      "ms": { mul: 0.001 },
      "s": { mul: 1 },
      "min": { mul: 60 },
      "h": { mul: 3600 },
      "day": { mul: 86400 },
      "week": { mul: 604800 },
      "month": { mul: 2592000 },
      "year": { mul: 31536000 }
    },
    "Temperature": {
      "Celsius (°C)": { toBase: v=>v, fromBase: v=>v },
      "Fahrenheit (°F)": { toBase: v=>(v-32)*5/9, fromBase: v=>(v*9/5)+32 },
      "Kelvin (K)": { toBase: v=>v-273.15, fromBase: v=>v+273.15 },
      "Rankine (°R)": { toBase: v=>(v-491.67)*5/9, fromBase: v=>(v*9/5)+491.67 }
    },
    "Force": {
      "N": { mul: 1 },
      "kN": { mul: 1000 },
      "dyn": { mul: 0.00001 },
      "gf": { mul: 0.00980665 },
      "kgf": { mul: 9.80665 },
      "lbf": { mul: 4.4482216 },
      "pdl": { mul: 0.13825495 }
    },
    "Energy": {
      "J": { mul: 1 },
      "kJ": { mul: 1000 },
      "MJ": { mul: 1000000 },
      "GJ": { mul: 1000000000 },
      "cal": { mul: 4.184 },
      "kcal": { mul: 4184 },
      "Ws": { mul: 1 },
      "Wh": { mul: 3600 },
      "kWh": { mul: 3600000 },
      "MWh": { mul: 3600000000 },
      "GWh": { mul: 3600000000000 },
      "BTU": { mul: 1055.06 },
      "N·m": { mul: 1 },
      "kgf-m": { mul: 9.80665 },
      "lbf-in": { mul: 0.1129848 },
      "lbf-ft": { mul: 1.355818 }
    },
    "Power": {
      "mW": { mul: 0.001 },
      "W": { mul: 1 },
      "kW": { mul: 1000 },
      "MW": { mul: 1000000 },
      "HP": { mul: 745.699872 },
      "PS": { mul: 735.49875 },
      "dBm": { toBase: v=>Math.pow(10, v/10)/1000, fromBase: v=>10*Math.log10(v*1000) },
      "dBW": { toBase: v=>Math.pow(10, v/10), fromBase: v=>10*Math.log10(v) },
      "BTU/h": { mul: 0.293071 },
      "kcal/h": { mul: 1.16222 },
      "Mcal/h": { mul: 1162.22 },
      "Gcal/h": { mul: 1162220 }
    },
    "Pressure": {
      "atm": { mul: 101325 },
      "torr": { mul: 133.322 },
      "Pa": { mul: 1 },
      "hPa": { mul: 100 },
      "kPa": { mul: 1000 },
      "MPa": { mul: 1000000 },
      "dyne/cm²": { mul: 0.1 },
      "mb": { mul: 100 },
      "bar": { mul: 100000 },
      "kN/m²": { mul: 1000 },
      "kgf/cm²": { mul: 98066.5 },
      "psi": { mul: 6894.76 },
      "mmHg": { mul: 133.322 },
      "inchHg": { mul: 3386.39 },
      "mmH₂O": { mul: 9.80665 },
      "inchH₂O": { mul: 249.082 }
    },
    "Speed": {
      "m/s": { mul: 1 },
      "m/h": { mul: 0.000277778 },
      "km/s": { mul: 1000 },
      "km/h": { mul: 0.277777778 },
      "in/s": { mul: 0.0254 },
      "in/h": { mul: 0.00000705556 },
      "ft/s": { mul: 0.3048 },
      "ft/h": { mul: 0.00008466667 },
      "mi/s": { mul: 1609.344 },
      "mi/h": { mul: 0.44704 },
      "Knot (kn)": { mul: 0.514444 },
      "Mach": { mul: 340.3 }
    },
    "Fuel Efficiency": {
      "km/l": { mul: 1 },
      "mi/l": { mul: 1.609344 },
      "l/100km": { toBase: v=>100/v, fromBase: v=>100/v },
      "km/gal (UK)": { mul: 0.219969 },
      "km/gal (US)": { mul: 0.264172 },
      "mi/gal (UK)": { mul: 0.354006 },
      "mi/gal (US)": { mul: 0.425144 },
      "gal/100mi (UK)": { toBase: v=>282.481/v, fromBase: v=>282.481/v },
      "gal/100mi (US)": { toBase: v=>235.215/v, fromBase: v=>235.215/v }
    },
    "Data Size": {
      "bit": { mul: 0.125 },
      "Byte": { mul: 1 },
      "KB": { mul: 1024 },
      "MB": { mul: 1048576 },
      "GB": { mul: 1073741824 },
      "TB": { mul: 1099511627776 },
      "PB": { mul: 1125899906842624 }
    }
  };

  // Build a flat dictionary mapping unit name to category for quick lookup
  const unitToCategory = {};
  for (const [cat, unitsObj] of Object.entries(ALL_UNITS_DATA)) {
    for (const unit of Object.keys(unitsObj)) {
      unitToCategory[unit] = cat;
    }
  }

  // Populate dropdowns with optgroups
  let optgroupHTML = '';
  for (const [cat, unitsObj] of Object.entries(ALL_UNITS_DATA)) {
    optgroupHTML += `<optgroup label="${cat}">`;
    for (const unit of Object.keys(unitsObj)) {
      optgroupHTML += `<option value="${unit}">${unit}</option>`;
    }
    optgroupHTML += `</optgroup>`;
  }
  if(allUnitsFrom) allUnitsFrom.innerHTML = optgroupHTML;
  if(allUnitsTo) allUnitsTo.innerHTML = optgroupHTML;
  
  if(allUnitsFrom && allUnitsTo) {
    allUnitsFrom.value = 'm';
    allUnitsTo.value = 'ft';
  }

  function doAllUnitsConversion(source) {
    const unit1 = allUnitsFrom.value;
    const unit2 = allUnitsTo.value;
    
    // Check if categories match
    const cat1 = unitToCategory[unit1];
    const cat2 = unitToCategory[unit2];
    
    if (cat1 !== cat2) {
      allUnitsError.style.display = 'block';
      if (source === 'in1') allUnitsIn2.value = '';
      if (source === 'in2') allUnitsIn1.value = '';
      return;
    } else {
      allUnitsError.style.display = 'none';
    }

    const unitsDef = ALL_UNITS_DATA[cat1];
    const def1 = unitsDef[unit1];
    const def2 = unitsDef[unit2];

    const toBase = (val, def) => def.mul ? val * def.mul : def.toBase(val);
    const fromBase = (val, def) => def.mul ? val / def.mul : def.fromBase(val);

    if (source === 'in1') {
      const v = parseFloat(allUnitsIn1.value);
      if (isNaN(v)) { allUnitsIn2.value = ''; return; }
      const baseVal = toBase(v, def1);
      const res = fromBase(baseVal, def2);
      allUnitsIn2.value = parseFloat(res.toPrecision(10));
    } else if (source === 'in2') {
      const v = parseFloat(allUnitsIn2.value);
      if (isNaN(v)) { allUnitsIn1.value = ''; return; }
      const baseVal = toBase(v, def2);
      const res = fromBase(baseVal, def1);
      allUnitsIn1.value = parseFloat(res.toPrecision(10));
    }
  }

  if(allUnitsFrom) allUnitsFrom.addEventListener('change', () => doAllUnitsConversion('in1'));
  if(allUnitsTo) allUnitsTo.addEventListener('change', () => doAllUnitsConversion('in1'));
  if(allUnitsIn1) allUnitsIn1.addEventListener('input', () => doAllUnitsConversion('in1'));
  if(allUnitsIn2) allUnitsIn2.addEventListener('input', () => doAllUnitsConversion('in2'));

})();
