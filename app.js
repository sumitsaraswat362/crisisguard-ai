/* CrisisGuard AI — App Controller v2 */

// ═══ PAGE NAVIGATION ═══
function showPage(id) {
    const current = document.querySelector('.page.active');
    const next = document.getElementById('page-' + id);
    if (!next || next === current) return;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.nav-tab[data-page="${id}"]`);
    if (tab) tab.classList.add('active');
    if (current) {
        current.classList.add('exit');
        setTimeout(() => { current.classList.remove('active','exit'); current.style.display='none'; next.style.display='block'; next.classList.add('active'); window.scrollTo({top:0}); }, 250);
    } else { next.style.display='block'; next.classList.add('active'); }
    if (id === 'dashboard' && !chartsInit) setTimeout(initCharts, 300);
}

// ═══ NEURAL NETWORK BACKGROUND ═══
let mouseX = -1000, mouseY = -1000;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
function initParticles() {
    const c = document.getElementById('particleCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, nodes = [], t = 0;
    function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const N = 80;
    for (let i = 0; i < N; i++) {
        nodes.push({ x: Math.random()*w, y: Math.random()*h, bx: Math.random()*w, by: Math.random()*h, r: Math.random()*2+1, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, pulse: Math.random()*Math.PI*2, hue: Math.random()>.5 ? 240 : 180 });
    }
    function draw() {
        t += .003;
        ctx.fillStyle = 'rgba(6,10,20,0.15)';
        ctx.fillRect(0,0,w,h);
        // Mesh gradient blobs
        const blobs = [{x:w*.3+Math.sin(t*.7)*100, y:h*.3+Math.cos(t*.5)*80, r:300, c:'rgba(99,102,241,.04)'},{x:w*.7+Math.cos(t*.6)*120, y:h*.6+Math.sin(t*.8)*90, r:250, c:'rgba(6,182,212,.04)'},{x:w*.5+Math.sin(t)*80, y:h*.8+Math.cos(t*.4)*60, r:200, c:'rgba(168,85,247,.03)'}];
        blobs.forEach(b => { const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r); g.addColorStop(0,b.c); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); });
        // Update & draw nodes
        nodes.forEach(n => {
            n.x += n.vx; n.y += n.vy; n.pulse += .02;
            if(n.x<0||n.x>w) n.vx*=-1;
            if(n.y<0||n.y>h) n.vy*=-1;
            // Mouse repulsion
            const mdx=n.x-mouseX, mdy=n.y-mouseY, md=Math.sqrt(mdx*mdx+mdy*mdy);
            if(md<150){ n.x+=mdx/md*1.5; n.y+=mdy/md*1.5; }
            const glow = .15 + Math.sin(n.pulse)*.1;
            const r = n.r + Math.sin(n.pulse)*.5;
            // Outer glow
            const grad = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4);
            grad.addColorStop(0, `hsla(${n.hue},80%,65%,${glow})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(n.x,n.y,r*4,0,Math.PI*2); ctx.fill();
            // Core
            ctx.fillStyle = `hsla(${n.hue},80%,70%,${glow+.15})`;
            ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2); ctx.fill();
        });
        // Connections
        for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
            const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y, d=Math.sqrt(dx*dx+dy*dy);
            if(d<140){
                const a=.12*(1-d/140);
                ctx.strokeStyle=`rgba(99,102,241,${a})`; ctx.lineWidth=.6;
                ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
                // Traveling pulse
                if(Math.random()<.002){ const px=nodes[i].x+(nodes[j].x-nodes[i].x)*((t*50)%1); const py=nodes[i].y+(nodes[j].y-nodes[i].y)*((t*50)%1);
                ctx.fillStyle='rgba(6,182,212,.5)'; ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2); ctx.fill(); }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// ═══ TYPED TEXT ═══
function typeText() {
    const el = document.getElementById('typedText');
    if (!el) return;
    const phrases = ['Intelligent Crisis Detection', 'AI-Powered Protection', 'Real-Time Intervention'];
    let pi = 0, ci = 0, deleting = false;
    function tick() {
        const phrase = phrases[pi];
        if (!deleting) {
            el.textContent = phrase.substring(0, ci + 1);
            ci++;
            if (ci === phrase.length) { setTimeout(() => { deleting = true; tick(); }, 2000); return; }
        } else {
            el.textContent = phrase.substring(0, ci - 1);
            ci--;
            if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        }
        setTimeout(tick, deleting ? 30 : 60);
    }
    tick();
}

// ═══ COUNTER ANIMATION ═══
function animateCounters() {
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const dur = 2000, start = performance.now();
        function update(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString();
            if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

// ═══ CHARTS ═══
let chartsInit = false, trendChart, sevChart;
function initCharts() {
    chartsInit = true;
    // Trend
    const ctx1 = document.getElementById('trendChart')?.getContext('2d');
    if (ctx1) {
        const hrs = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
        trendChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: hrs,
                datasets: [
                    { label: 'Detected', data: [2,1,1,0,0,1,3,5,8,12,10,7,6,8,11,9,7,5,6,8,4,3,2,1], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)', fill: true, tension: .4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2 },
                    { label: 'Resolved', data: [2,1,1,0,0,0,2,4,7,10,9,7,6,7,9,8,7,5,5,7,4,3,2,1], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', fill: true, tension: .4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
                scales: { x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#475569', font: { size: 10 }, maxTicksLimit: 12 } },
                    y: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#475569', font: { size: 10 } }, beginAtZero: true } }
            }
        });
    }
    // Severity
    const ctx2 = document.getElementById('severityChart')?.getContext('2d');
    if (ctx2) {
        sevChart = new Chart(ctx2, {
            type: 'doughnut',
            data: { labels: ['Critical','High','Moderate','Low','None'], datasets: [{ data: [8,15,24,31,22], backgroundColor: ['#ef4444','#f97316','#eab308','#6366f1','#10b981'], borderColor: '#060a14', borderWidth: 3, hoverOffset: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 14, usePointStyle: true } } } }
        });
    }
    initFeed();
    initHeatmap();
}

function switchChartRange(btn) {
    btn.parentElement.querySelectorAll('.ct').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function initFeed() {
    const el = document.getElementById('feedList');
    if (!el) return;
    const items = [
        { cls: 'fi-crit', txt: 'Critical alert: Suicidal ideation detected in #support', meta: 'System · 2m ago' },
        { cls: 'fi-ok', txt: 'Case #1247 resolved — connected with counselor', meta: 'Dr. Martinez · 5m ago' },
        { cls: 'fi-high', txt: 'High severity: Self-harm indicators in anonymous form', meta: 'System · 12m ago' },
        { cls: 'fi-mod', txt: 'Moderate distress — scheduled follow-up', meta: 'Sarah K. · 18m ago' },
        { cls: 'fi-ok', txt: 'Case #1245 resolved — referred to outpatient', meta: 'Dr. Chen · 25m ago' },
        { cls: 'fi-info', txt: 'Daily wellness survey: 247 responses analyzed', meta: 'System · 30m ago' },
        { cls: 'fi-mod', txt: 'Low distress pattern in dorm Block C', meta: 'System · 45m ago' },
        { cls: 'fi-ok', txt: 'Case #1243 closed — ongoing monitoring set', meta: 'Dr. Park · 1h ago' }
    ];
    el.innerHTML = items.map(i => `<div class="feed-item ${i.cls}"><div class="fi-dot"></div><div><div class="fi-txt">${i.txt}</div><div class="fi-meta">${i.meta}</div></div></div>`).join('');
}

function initHeatmap() {
    const el = document.getElementById('heatmap');
    if (!el) return;
    const cats = ['Suicidal','Self-Harm','Distress','Hopeless','Isolation','Substance'];
    const times = ['Morning','Afternoon','Evening','Night'];
    const data = [[.3,.5,.7,.9],[.2,.4,.6,.5],[.4,.6,.8,.7],[.5,.3,.6,.8],[.6,.4,.7,.9],[.1,.3,.7,.8]];
    let h = `<div class="hm-row hm-hdr"><div class="hm-lbl"></div>${times.map(t => `<div class="hm-cell">${t}</div>`).join('')}</div>`;
    data.forEach((row, i) => {
        h += `<div class="hm-row"><div class="hm-lbl">${cats[i]}</div>`;
        row.forEach(v => {
            const r = Math.round(239*v+16*(1-v)), g = Math.round(68*v+185*(1-v)), b = Math.round(68*v+129*(1-v));
            h += `<div class="hm-cell" style="background:rgba(${r},${g},${b},${(.3+v*.7).toFixed(2)})">${(v*100)|0}%</div>`;
        });
        h += '</div>';
    });
    el.innerHTML = h;
}

// ═══ ANALYZER ═══
const inputEl = document.getElementById('inputText');
const charCt = document.getElementById('charCt');
inputEl?.addEventListener('input', () => { charCt.textContent = inputEl.value.length + ' chars'; });

function loadSample(lvl) { inputEl.value = CrisisNLP.SAMPLES[lvl]; charCt.textContent = inputEl.value.length + ' chars'; }

function runAnalysis() {
    const text = inputEl?.value.trim();
    if (!text) return;
    const btn = document.getElementById('analyzeBtn');
    btn.textContent = '⏳ Analyzing...'; btn.disabled = true;
    setTimeout(() => {
        const r = CrisisNLP.analyze(text);
        renderResults(r);
        btn.textContent = '🔬 Analyze Text'; btn.disabled = false;
    }, 600);
}

function renderResults(r) {
    const panel = document.getElementById('resultsPanel');
    panel.classList.add('show');
    document.getElementById('resTime').textContent = `${r.metadata.analysisTime}ms · ${r.metadata.tokenCount} tokens`;

    // Gauge
    const ring = document.getElementById('gaugeRing');
    const score = r.severity.score;
    const color = r.severity.color;
    ring.style.background = `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,.04) ${score * 3.6}deg)`;
    document.getElementById('gaugeNum').textContent = score;
    document.getElementById('gaugeNum').style.color = color;
    document.getElementById('gaugeLbl').textContent = r.severity.level.toUpperCase();
    document.getElementById('gaugeLbl').style.color = color;

    // Detections
    const db = document.getElementById('detectionsBody');
    if (Object.keys(r.categorySummary).length === 0) {
        db.innerHTML = '<div class="no-det">✅ No crisis indicators detected</div>';
    } else {
        db.innerHTML = Object.entries(r.categorySummary).map(([, d]) => `
            <div class="det-item"><div class="det-hdr"><div class="det-dot" style="background:${d.color}"></div><span class="det-lbl">${d.label}</span><span class="det-hits">${d.totalHits} hit${d.totalHits>1?'s':''}</span></div>
            <div class="det-bar-bg"><div class="det-bar" style="background:${d.color}" data-w="${d.weight*100}%"></div></div></div>`).join('');
        setTimeout(() => db.querySelectorAll('.det-bar').forEach(b => b.style.width = b.dataset.w), 50);
    }

    // Keywords
    const kwCard = document.getElementById('keywordsCard');
    const kwTags = document.getElementById('kwTags');
    if (r.detections.length > 0) {
        kwCard.style.display = 'block';
        kwTags.innerHTML = r.detections.map(d => `<span class="kw-tag" style="border-color:${d.color};color:${d.color}">${d.term}</span>`).join('');
    } else { kwCard.style.display = 'none'; }

    // Actions
    document.getElementById('actionsBody').innerHTML = r.actions.map(a =>
        `<div class="act-item act-${a.priority}"><span class="act-ic">${a.icon}</span><span class="act-txt">${a.text}</span><span class="act-pri pri-${a.priority}">${a.priority}</span></div>`
    ).join('');

    // Confidence
    const metrics = [
        { l: 'Overall Confidence', v: r.confidence.overall },
        { l: 'Text Adequacy', v: r.confidence.textLength },
        { l: 'Cross-Category', v: r.confidence.consistency },
        { l: 'Sentiment Alignment', v: r.confidence.alignment }
    ];
    document.getElementById('confBody').innerHTML = metrics.map(m => {
        const c = m.v >= 70 ? '#10b981' : m.v >= 40 ? '#eab308' : '#ef4444';
        return `<div class="conf-m"><div class="conf-top"><span>${m.l}</span><span style="color:${c}">${m.v}%</span></div><div class="conf-bg"><div class="conf-fill" style="background:${c}" data-w="${m.v}%"></div></div></div>`;
    }).join('');
    setTimeout(() => document.querySelectorAll('.conf-fill').forEach(b => b.style.width = b.dataset.w), 100);

    // AI Advice
    const advCard = document.getElementById('adviceCard');
    const advBody = document.getElementById('adviceBody');
    if (r.advice && r.advice.length > 0) {
        advCard.style.display = 'block';
        advBody.innerHTML = r.advice.map((a, i) => `<div class="adv-item adv-${a.type}" style="animation:slideIn .3s ease ${i * .1}s both"><div class="adv-head"><span>${a.icon}</span><strong>${a.title}</strong></div><p class="adv-txt">${a.text}</p></div>`).join('');
    } else { advCard.style.display = 'none'; }

    // Counselor Finder — auto-trigger on moderate+
    const counselorCard = document.getElementById('counselorCard');
    if (r.severity.score >= 25) {
        counselorCard.style.display = 'block';
        renderVirtualCounseling();
    } else { counselorCard.style.display = 'none'; }

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ═══ COUNSELOR FINDER ═══
const CRISIS_DB = {
    'US':{country:'United States',helplines:[{name:'988 Suicide & Crisis Lifeline',phone:'988',text:'988',desc:'Free 24/7 confidential support for people in distress',web:'https://988lifeline.org',icon:'🆘'},{name:'Crisis Text Line',phone:null,text:'741741',desc:'Text HOME to 741741 for free crisis counseling',web:'https://www.crisistextline.org',icon:'💬'},{name:'NAMI Helpline',phone:'1-800-950-6264',text:null,desc:'Mental health information, referrals, and support',web:'https://www.nami.org',icon:'🧠'}]},
    'GB':{country:'United Kingdom',helplines:[{name:'Samaritans',phone:'116 123',text:null,desc:'24/7 emotional support for anyone in distress',web:'https://www.samaritans.org',icon:'📞'},{name:'SHOUT Crisis Text',phone:null,text:'85258',desc:'Text SHOUT to 85258 for free crisis support',web:'https://giveusashout.org',icon:'💬'},{name:'Mind',phone:'0300 123 3393',text:null,desc:'Mental health support and information',web:'https://www.mind.org.uk',icon:'🧠'}]},
    'IN':{country:'India',helplines:[{name:'iCall (TISS)',phone:'9152987821',text:null,desc:'Professional psychosocial helpline by TISS Mumbai',web:'https://icallhelpline.org',icon:'📞'},{name:'Vandrevala Foundation',phone:'1860-2662-345',text:null,desc:'24/7 free mental health support in multiple languages',web:'https://www.vandrevalafoundation.com',icon:'🆘'},{name:'NIMHANS Helpline',phone:'080-46110007',text:null,desc:'National Institute of Mental Health and Neurosciences',web:'https://nimhans.ac.in',icon:'🧠'},{name:'Snehi',phone:'044-24640050',text:null,desc:'Emotional support and suicide prevention',web:'http://www.snehaindia.org',icon:'💚'}]},
    'CA':{country:'Canada',helplines:[{name:'Crisis Services Canada',phone:'1-833-456-4566',text:'45645',desc:'24/7 crisis support across Canada',web:'https://www.crisisservicescanada.ca',icon:'🆘'},{name:'Kids Help Phone',phone:'1-800-668-6868',text:'686868',desc:'24/7 support for youth under 20',web:'https://kidshelpphone.ca',icon:'👶'}]},
    'AU':{country:'Australia',helplines:[{name:'Lifeline Australia',phone:'13 11 14',text:'0477 13 11 14',desc:'24/7 crisis support and suicide prevention',web:'https://www.lifeline.org.au',icon:'🆘'},{name:'Beyond Blue',phone:'1300 22 4636',text:null,desc:'Mental health support and information',web:'https://www.beyondblue.org.au',icon:'🧠'}]},
    'DE':{country:'Germany',helplines:[{name:'Telefonseelsorge',phone:'0800 111 0 111',text:null,desc:'24/7 free emotional support',web:'https://www.telefonseelsorge.de',icon:'📞'}]},
    'FR':{country:'France',helplines:[{name:'SOS Amitié',phone:'09 72 39 40 50',text:null,desc:'24/7 emotional support and listening',web:'https://www.sos-amitie.com',icon:'📞'}]},
    'JP':{country:'Japan',helplines:[{name:'TELL Lifeline',phone:'03-5774-0992',text:null,desc:'English-language crisis support in Japan',web:'https://telljp.com',icon:'📞'}]},
    'BR':{country:'Brazil',helplines:[{name:'CVV',phone:'188',text:null,desc:'24/7 emotional support and suicide prevention',web:'https://www.cvv.org.br',icon:'📞'}]},
    'ZA':{country:'South Africa',helplines:[{name:'SADAG',phone:'0800 567 567',text:null,desc:'South African Depression and Anxiety Group',web:'https://www.sadag.org',icon:'📞'}]},
    'PH':{country:'Philippines',helplines:[{name:'Natasha Goulbourn Foundation',phone:'(02) 804-4673',text:null,desc:'24/7 crisis support',web:'https://www.ngf-lifeline.org',icon:'📞'}]},
    'NZ':{country:'New Zealand',helplines:[{name:'Lifeline NZ',phone:'0800 543 354',text:'4357',desc:'24/7 counselling and support',web:'https://www.lifeline.org.nz',icon:'📞'}]},
    'SG':{country:'Singapore',helplines:[{name:'Samaritans of Singapore',phone:'1800-221-4444',text:null,desc:'24/7 crisis support',web:'https://www.sos.org.sg',icon:'📞'}]},
    'DEFAULT':{country:'International',helplines:[{name:'International Association for Suicide Prevention',phone:null,text:null,desc:'Find a crisis center in your country',web:'https://www.iasp.info/resources/Crisis_Centres/',icon:'🌍'},{name:'Befrienders Worldwide',phone:null,text:null,desc:'Emotional support in your language',web:'https://www.befrienders.org',icon:'🤝'}]}
};

const VIRTUAL_COUNSELING = [
    { name:'BetterHelp', desc:'Licensed therapists online. Chat, video, or phone.', icon:'🧑‍⚕️', url:'https://www.betterhelp.com' },
    { name:'7 Cups', desc:'Free emotional support from trained listeners 24/7.', icon:'☕', url:'https://www.7cups.com' },
    { name:'Talkspace', desc:'Online therapy with licensed professionals.', icon:'💬', url:'https://www.talkspace.com' },
    { name:'Crisis Text Line', desc:'Text HOME to 741741 from anywhere.', icon:'📱', url:'https://www.crisistextline.org' }
];

function detectLocation() {
    const btn = document.getElementById('locateBtn');
    const results = document.getElementById('counselorResults');
    btn.classList.add('loading');
    btn.textContent = '⏳ Detecting...';

    if (!navigator.geolocation) {
        renderHelplines('DEFAULT', null);
        btn.classList.remove('loading');
        btn.textContent = '📍 Detect My Location';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`)
            .then(r => r.json())
            .then(data => {
                const code = data.countryCode || 'DEFAULT';
                const city = data.city || data.locality || '';
                const country = data.countryName || '';
                results.innerHTML = `<div class="location-detected">📍 Location detected: <strong>${city}${city && country ? ', ' : ''}${country}</strong></div>`;
                renderHelplines(code, city);
                btn.classList.remove('loading');
                btn.textContent = '✅ Location Found';
            })
            .catch(() => { renderHelplines('DEFAULT', null); btn.classList.remove('loading'); btn.textContent = '📍 Try Again'; });
        },
        () => {
            results.innerHTML = `<div class="location-detected" style="color:var(--yellow);border-color:rgba(234,179,8,.15);background:rgba(234,179,8,.06)">⚠️ Location access denied — showing international resources</div>`;
            renderHelplines('DEFAULT', null);
            btn.classList.remove('loading');
            btn.textContent = '📍 Try Again';
        },
        { timeout: 8000 }
    );
}

function renderHelplines(countryCode, city) {
    const results = document.getElementById('counselorResults');
    const db = CRISIS_DB[countryCode] || CRISIS_DB['DEFAULT'];
    let html = '<div class="helpline-grid">';
    db.helplines.forEach((h, i) => {
        html += `<div class="helpline-card" style="animation-delay:${i*.1}s">
            <div class="hl-head"><span class="hl-icon">${h.icon}</span><span class="hl-name">${h.name}</span><span class="hl-type">${db.country}</span></div>
            <p class="hl-desc">${h.desc}</p>
            <div class="hl-actions">
                ${h.phone ? `<a href="tel:${h.phone.replace(/\s/g,'')}" class="hl-btn hl-btn-call">📞 Call ${h.phone}</a>` : ''}
                ${h.text ? `<a href="sms:${h.text}" class="hl-btn hl-btn-text">💬 Text ${h.text}</a>` : ''}
                ${h.web ? `<a href="${h.web}" target="_blank" class="hl-btn hl-btn-web">🌐 Website</a>` : ''}
            </div>
        </div>`;
    });
    html += '</div>';
    results.innerHTML += html;
}

function renderVirtualCounseling() {
    const grid = document.getElementById('virtualGrid');
    grid.innerHTML = VIRTUAL_COUNSELING.map(v =>
        `<div class="virtual-card"><span class="vc-icon">${v.icon}</span><div class="vc-name">${v.name}</div><p class="vc-desc">${v.desc}</p><a href="${v.url}" target="_blank" class="vc-link">Connect Now →</a></div>`
    ).join('');
}

// ═══ LIVE MONITOR ═══
let monInterval = null, monitoring = false, monStats = { s: 0, f: 0, c: 0 };
const MON_MSGS = [
    "Just had a great day at work! Feeling accomplished.",
    "The weather has been beautiful, went for a nice walk.",
    "Struggling with assignments but study group helped.",
    "I feel so overwhelmed and exhausted. Nothing helps anymore.",
    "Made dinner for family tonight, everyone loved it!",
    "I can't stop crying. Everything feels pointless.",
    "Started a new book today, really enjoying it.",
    "Nobody understands. Feeling completely isolated and alone.",
    "Had a good therapy session. Feeling hopeful.",
    "I can't take it anymore. I'm a burden. I want the pain to stop.",
    "Got exam results — passed everything!",
    "Another sleepless night. Anxiety won't stop. Falling apart.",
    "Going to try that new coffee shop with friends.",
    "I've been cutting again. The pain is the only thing that feels real.",
    "Productive meeting today. New project is exciting!",
    "I want to die. I've been thinking about it every day. No other way out.",
    "Weekend plans: hiking with family!",
    "Feeling grateful for my support system. Recovery is tough but I'm getting there.",
    "Drinking every night now. Can't stop. Everything spiraling.",
    "Volunteered at the shelter today. Really rewarding."
];

function toggleMonitor() {
    const btn = document.getElementById('monBtn');
    if (monitoring) {
        clearInterval(monInterval); monitoring = false;
        btn.textContent = '▶ Start Monitoring'; btn.classList.remove('btn-danger');
    } else {
        monitoring = true;
        btn.textContent = '⏸ Stop Monitoring'; btn.classList.add('btn-danger');
        const feed = document.getElementById('monFeed');
        if (feed.querySelector('.mon-empty')) feed.innerHTML = '';
        processMsg(); monInterval = setInterval(processMsg, 2200);
    }
}

function processMsg() {
    const msg = MON_MSGS[Math.floor(Math.random() * MON_MSGS.length)];
    const r = CrisisNLP.analyze(msg);
    monStats.s++; if (r.severity.score > 0) monStats.f++; if (r.severity.level === 'critical') monStats.c++;
    document.getElementById('monScanned').textContent = monStats.s;
    document.getElementById('monFlagged').textContent = monStats.f;
    document.getElementById('monCritical').textContent = monStats.c;

    const feed = document.getElementById('monFeed');
    const el = document.createElement('div');
    el.className = `mon-item ml-${r.severity.level}`;
    const uid = `User_${(Math.random()*9000+1000)|0}`;
    const time = new Date().toLocaleTimeString();
    el.innerHTML = `<div class="mi-hdr"><span class="mi-badge mb-${r.severity.level}">${r.severity.level}</span><span class="mi-user">${uid}</span><span class="mi-time">${time}</span><span class="mi-score">Score: ${r.severity.score}/100</span></div>
    <p class="mi-txt">${msg.length > 120 ? msg.substring(0,120)+'...' : msg}</p>
    ${r.detections.length ? `<div class="mi-tags">${r.detections.slice(0,3).map(d=>`<span class="mi-tag" style="color:${d.color}">${d.term}</span>`).join('')}</div>` : ''}`;
    feed.insertBefore(el, feed.firstChild);
    while (feed.children.length > 40) feed.removeChild(feed.lastChild);
}

// ═══ INIT ═══
window.addEventListener('DOMContentLoaded', () => {
    // Hide loader
    setTimeout(() => { document.getElementById('loader')?.classList.add('hide'); }, 1200);
    // Hide non-active pages
    document.querySelectorAll('.page:not(.active)').forEach(p => p.style.display='none');
    initParticles();
    typeText();
    setTimeout(animateCounters, 1500);
    // Card mouse glow tracking
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
            card.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
        });
    });
});
