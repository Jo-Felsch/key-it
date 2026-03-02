document.addEventListener('DOMContentLoaded', () => {

    // --- Intersection Observer for Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible to run animation only once
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate');
    animatedElements.forEach(el => observer.observe(el));

    // --- Header Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            mobileToggle.innerHTML = isOpen
                ? '<i class="ph ph-x"></i>'
                : '<i class="ph ph-list"></i>';
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('.mobile-menu-link, .mobile-menu-cta').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                mobileMenu.classList.remove('open');
                mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
            }
        });
    }

    // --- ROI Calculator (Simple Logic) ---
    // If we had input fields, we would listen for changes here.
    // Since the prompt text was static examples, we'll keep it static for now
    // unless the HTML structure includes inputs.

    // --- Active Navigation (Scroll Spy) ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const navObserverOptions = {
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: "-100px 0px -200px 0px" // Adjust active area to be more central
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get the id of the section
                const id = entry.target.getAttribute('id');

                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));

                // Add active class to corresponding link
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        if (section.getAttribute('id')) { // Only observe sections with IDs
            navObserver.observe(section);
        }
    });

    // --- Animated Stat Counters ---
    const counterElements = document.querySelectorAll('[data-counter-min]');
    const counterIntervals = new Map();

    function startCounter(el) {
        if (counterIntervals.has(el)) return;
        const min = parseInt(el.dataset.counterMin);
        const max = parseInt(el.dataset.counterMax);
        const suffix = el.dataset.counterSuffix || '';
        const prefix = el.dataset.counterPrefix || '';
        let current = min + Math.floor(Math.random() * (max - min));
        let direction = 1;

        const interval = setInterval(() => {
            current += direction;
            if (current >= max) { current = max; direction = -1; }
            if (current <= min) { current = min; direction = 1; }
            el.textContent = prefix + current + suffix;
        }, 400 + Math.random() * 300);

        counterIntervals.set(el, interval);
    }

    function stopCounter(el) {
        const interval = counterIntervals.get(el);
        if (interval) {
            clearInterval(interval);
            counterIntervals.delete(el);
        }
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
            } else {
                stopCounter(entry.target);
            }
        });
    }, { threshold: 0.1 });

    counterElements.forEach(el => counterObserver.observe(el));

    // --- Dashboard Wave Chart Animation ---
    const dashWave1 = document.getElementById('dashWave1');
    const dashWave2 = document.getElementById('dashWave2');

    if (dashWave1 && dashWave2) {
        const waveShapes = [
            { w1: "M0,60 C40,30 80,70 120,50 C160,30 200,70 240,40 C270,20 290,50 300,45",
              w2: "M0,70 C40,50 80,80 120,65 C160,50 200,80 240,55 C270,40 290,60 300,55" },
            { w1: "M0,50 C40,70 80,35 120,55 C160,70 200,30 240,50 C270,60 290,35 300,40",
              w2: "M0,65 C40,80 80,50 120,70 C160,85 200,45 240,60 C270,70 290,50 300,55" },
            { w1: "M0,40 C40,55 80,25 120,45 C160,60 200,35 240,55 C270,45 290,60 300,35",
              w2: "M0,55 C40,70 80,40 120,60 C160,75 200,50 240,70 C270,55 290,70 300,50" },
            { w1: "M0,55 C40,40 80,65 120,35 C160,45 200,60 240,30 C270,40 290,25 300,50",
              w2: "M0,75 C40,55 80,70 120,50 C160,60 200,75 240,45 C270,55 290,40 300,60" },
        ];

        let waveIndex = 0;
        let waveProgress = 0;
        let waveAnimating = false;

        function parsePathPoints(d) {
            return d.match(/-?\d+\.?\d*/g).map(Number);
        }

        function buildFromPoints(pts) {
            return `M${pts[0]},${pts[1]} C${pts[2]},${pts[3]} ${pts[4]},${pts[5]} ${pts[6]},${pts[7]} C${pts[8]},${pts[9]} ${pts[10]},${pts[11]} ${pts[12]},${pts[13]} C${pts[14]},${pts[15]} ${pts[16]},${pts[17]} ${pts[18]},${pts[19]}`;
        }

        function lerpPoints(a, b, t) {
            return a.map((v, i) => v + (b[i] - v) * t);
        }

        function animateWaves() {
            if (!waveAnimating) return;
            waveProgress += 0.004;
            if (waveProgress >= 1) {
                waveProgress = 0;
                waveIndex = (waveIndex + 1) % waveShapes.length;
            }
            const from = waveShapes[waveIndex];
            const to = waveShapes[(waveIndex + 1) % waveShapes.length];
            const eased = (1 - Math.cos(waveProgress * Math.PI)) / 2;

            const pts1 = lerpPoints(parsePathPoints(from.w1), parsePathPoints(to.w1), eased);
            const pts2 = lerpPoints(parsePathPoints(from.w2), parsePathPoints(to.w2), eased);
            dashWave1.setAttribute('d', buildFromPoints(pts1));
            dashWave2.setAttribute('d', buildFromPoints(pts2));
            requestAnimationFrame(animateWaves);
        }

        const dashChartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    waveAnimating = true;
                    animateWaves();
                } else {
                    waveAnimating = false;
                }
            });
        }, { threshold: 0.1 });

        dashChartObserver.observe(dashWave1.closest('.dashboard-mockup'));
    }

    // --- Dashboard Mini Chart Line Animations ---
    const dashChartPaths = document.querySelectorAll('.dash-chart-path');
    if (dashChartPaths.length) {
        const miniShapes = [
            ["M0,20 Q15,18 25,15 T50,18 T75,8 T100,12", "M0,22 Q10,20 20,12 T45,15 T70,5 T100,10", "M0,25 Q20,22 30,18 T60,15 T80,10 T100,8"],
            ["M0,15 Q15,25 25,10 T50,20 T75,12 T100,18", "M0,18 Q10,8 20,22 T45,10 T70,15 T100,5",  "M0,12 Q20,18 30,8 T60,22 T80,15 T100,20"],
            ["M0,22 Q15,10 25,20 T50,8 T75,18 T100,6",   "M0,12 Q10,22 20,8 T45,20 T70,10 T100,15", "M0,20 Q20,8 30,22 T60,10 T80,20 T100,12"],
        ];

        let miniIndex = 0;
        let miniProgress = 0;
        let miniAnimating = false;

        function parseMiniPoints(d) {
            return d.match(/-?\d+\.?\d*/g).map(Number);
        }

        function buildMiniPath(pts) {
            return `M${pts[0]},${pts[1]} Q${pts[2]},${pts[3]} ${pts[4]},${pts[5]} T${pts[6]},${pts[7]} T${pts[8]},${pts[9]} T${pts[10]},${pts[11]}`;
        }

        function animateMiniCharts() {
            if (!miniAnimating) return;
            miniProgress += 0.003;
            if (miniProgress >= 1) {
                miniProgress = 0;
                miniIndex = (miniIndex + 1) % miniShapes.length;
            }
            const eased = (1 - Math.cos(miniProgress * Math.PI)) / 2;
            const fromSet = miniShapes[miniIndex];
            const toSet = miniShapes[(miniIndex + 1) % miniShapes.length];

            dashChartPaths.forEach((path, i) => {
                const from = parseMiniPoints(fromSet[i]);
                const to = parseMiniPoints(toSet[i]);
                const current = from.map((v, j) => v + (to[j] - v) * eased);
                path.setAttribute('d', buildMiniPath(current));
            });
            requestAnimationFrame(animateMiniCharts);
        }

        const miniChartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    miniAnimating = true;
                    animateMiniCharts();
                } else {
                    miniAnimating = false;
                }
            });
        }, { threshold: 0.1 });

        const dashMockup = document.querySelector('.dashboard-mockup');
        if (dashMockup) miniChartObserver.observe(dashMockup);
    }

    // --- Morphing Line Chart ---
    const morphLine = document.getElementById('morphLine');
    const morphArea = document.getElementById('morphArea');

    if (morphLine && morphArea) {
        const curves = [
            { p1y: 60, c1y: 55, c2y: 45, p2y: 50, c3y: 55, c4y: 25, p3y: 30, c5y: 33, c6y: 15, p4y: 10 },
            { p1y: 45, c1y: 40, c2y: 55, p2y: 35, c3y: 15, c4y: 45, p3y: 55, c5y: 60, c6y: 30, p4y: 20 },
            { p1y: 55, c1y: 65, c2y: 30, p2y: 20, c3y: 10, c4y: 50, p3y: 45, c5y: 40, c6y: 55, p4y: 35 },
            { p1y: 35, c1y: 25, c2y: 60, p2y: 55, c3y: 50, c4y: 15, p3y: 20, c5y: 25, c6y: 40, p4y: 15 },
        ];

        let curveIndex = 0;
        let progress = 0;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function buildPath(c, close) {
            const d = `M0,${c.p1y} C30,${c.c1y} 50,${c.c2y} 80,${c.p2y} C110,${c.c3y} 130,${c.c4y} 160,${c.p3y} C180,${c.c5y} 195,${c.c6y} 200,${c.p4y}`;
            return close ? d + ' L200,80 L0,80 Z' : d;
        }

        function interpolateCurves(a, b, t) {
            const result = {};
            for (const key in a) { result[key] = lerp(a[key], b[key], t); }
            return result;
        }

        let chartAnimating = false;

        function animateChart() {
            if (!chartAnimating) return;
            progress += 0.005;
            if (progress >= 1) {
                progress = 0;
                curveIndex = (curveIndex + 1) % curves.length;
            }
            const from = curves[curveIndex];
            const to = curves[(curveIndex + 1) % curves.length];
            const eased = (1 - Math.cos(progress * Math.PI)) / 2;
            const current = interpolateCurves(from, to, eased);
            morphLine.setAttribute('d', buildPath(current, false));
            morphArea.setAttribute('d', buildPath(current, true));
            requestAnimationFrame(animateChart);
        }

        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    chartAnimating = true;
                    animateChart();
                } else {
                    chartAnimating = false;
                }
            });
        }, { threshold: 0.1 });

        chartObserver.observe(morphLine.closest('.capability-card'));
    }

    // --- Solution Section: Animated Lines ---
    function animateSolLine(lineId, areaId, parentSelector) {
        const line = document.getElementById(lineId);
        const area = document.getElementById(areaId);
        if (!line) return;

        const shapes = [
            "M0,35 C25,30 50,20 75,25 C100,30 125,10 150,15 C175,20 190,8 200,12",
            "M0,20 C25,35 50,15 75,30 C100,20 125,25 150,10 C175,15 190,30 200,22",
            "M0,28 C25,15 50,30 75,18 C100,12 125,30 150,25 C175,10 190,20 200,8",
            "M0,15 C25,25 50,10 75,20 C100,35 125,18 150,30 C175,25 190,12 200,18",
        ];

        let idx = 0, prog = 0, running = false;

        function parseP(d) { return d.match(/-?\d+\.?\d*/g).map(Number); }
        function buildP(pts) {
            return `M${pts[0]},${pts[1]} C${pts[2]},${pts[3]} ${pts[4]},${pts[5]} ${pts[6]},${pts[7]} C${pts[8]},${pts[9]} ${pts[10]},${pts[11]} ${pts[12]},${pts[13]} C${pts[14]},${pts[15]} ${pts[16]},${pts[17]} ${pts[18]},${pts[19]}`;
        }

        function tick() {
            if (!running) return;
            prog += 0.004;
            if (prog >= 1) { prog = 0; idx = (idx + 1) % shapes.length; }
            const from = parseP(shapes[idx]);
            const to = parseP(shapes[(idx + 1) % shapes.length]);
            const t = (1 - Math.cos(prog * Math.PI)) / 2;
            const cur = from.map((v, i) => v + (to[i] - v) * t);
            const d = buildP(cur);
            line.setAttribute('d', d);
            if (area) area.setAttribute('d', d + ' L200,50 L0,50 Z');
            requestAnimationFrame(tick);
        }

        const parent = line.closest(parentSelector);
        if (parent) {
            new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { running = true; tick(); }
                    else { running = false; }
                });
            }, { threshold: 0.1 }).observe(parent);
        }
    }

    animateSolLine('solAgentLine', 'solAgentArea', '.solution-row');

    // Risk line (no area fill, different viewBox height)
    (function() {
        const line = document.getElementById('solRiskLine');
        if (!line) return;
        const shapes = [
            "M0,30 C30,25 50,15 80,20 C110,25 140,10 170,18 C185,22 195,12 200,15",
            "M0,18 C30,12 50,25 80,15 C110,10 140,22 170,12 C185,18 195,28 200,20",
            "M0,22 C30,30 50,10 80,25 C110,18 140,28 170,15 C185,10 195,20 200,25",
        ];
        let idx = 0, prog = 0, running = false;
        function parseP(d) { return d.match(/-?\d+\.?\d*/g).map(Number); }
        function buildP(pts) {
            return `M${pts[0]},${pts[1]} C${pts[2]},${pts[3]} ${pts[4]},${pts[5]} ${pts[6]},${pts[7]} C${pts[8]},${pts[9]} ${pts[10]},${pts[11]} ${pts[12]},${pts[13]} C${pts[14]},${pts[15]} ${pts[16]},${pts[17]} ${pts[18]},${pts[19]}`;
        }
        function tick() {
            if (!running) return;
            prog += 0.003;
            if (prog >= 1) { prog = 0; idx = (idx + 1) % shapes.length; }
            const from = parseP(shapes[idx]);
            const to = parseP(shapes[(idx + 1) % shapes.length]);
            const t = (1 - Math.cos(prog * Math.PI)) / 2;
            const cur = from.map((v, i) => v + (to[i] - v) * t);
            line.setAttribute('d', buildP(cur));
            requestAnimationFrame(tick);
        }
        const parent = line.closest('.solution-row');
        if (parent) {
            new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { running = true; tick(); }
                    else { running = false; }
                });
            }, { threshold: 0.1 }).observe(parent);
        }
    })();

    // --- Shared world points for all globe instances ---
    const WORLD_POINTS = [
        [51.5,-0.1],[48.9,2.3],[52.5,13.4],[40.4,-3.7],[41.9,12.5],
        [50.1,14.4],[48.2,16.4],[59.9,10.7],[55.7,12.6],[59.3,18.1],
        [52.2,21.0],[47.5,19.1],[44.4,26.1],[42.7,23.3],[37.9,23.7],
        [38.7,-9.1],[53.3,-6.3],[46.2,6.1],[46.1,14.5],[45.8,16.0],
        [60.2,24.9],[56.9,24.1],[54.7,25.3],[44.8,20.5],[43.9,20.5],
        [41.3,19.8],[42.4,18.8],[43.7,7.3],[45.4,4.8],[43.3,5.4],
        [50.9,6.9],[53.6,10.0],[48.1,11.6],[47.4,8.5],[46.9,7.4],
        [55.8,37.6],[59.9,30.3],[53.9,27.6],[50.4,30.5],[46.5,30.7],
        [49.8,24.0],[48.5,35.0],[51.7,36.2],[54.2,-4.5],[53.5,-2.3],
        [51.5,-3.2],[55.9,-3.2],[57.1,-2.1],
        [35.2,33.4],[34.7,33.0],[34.9,33.6],[35.0,32.8],[34.6,32.9],
        [25.3,55.3],[24.5,54.4],[25.3,51.5],[26.2,50.6],[21.5,39.2],
        [29.4,48.0],[33.3,44.4],[36.2,37.1],[32.9,13.2],[36.8,10.2],
        [33.9,35.5],[31.9,35.2],[32.1,34.8],
        [28.6,77.2],[19.1,72.9],[13.1,80.3],[22.6,88.4],[12.97,77.6],
        [17.4,78.5],[23.0,72.6],[26.8,80.9],[21.2,79.1],[30.7,76.8],
        [27.2,84.0],[6.9,79.9],[23.8,90.4],[27.7,85.3],
        [39.9,116.4],[31.2,121.5],[23.1,113.3],[22.5,114.1],[22.3,114.2],
        [30.6,104.1],[34.3,108.9],[38.0,114.5],[29.9,121.5],[36.1,120.4],
        [25.0,121.5],[35.7,139.7],[34.7,135.5],[35.2,136.9],[43.1,131.9],
        [37.6,127.0],[35.2,129.0],[37.5,126.9],[21.0,105.8],[14.6,121.0],
        [13.8,100.5],[1.3,103.8],[3.1,101.7],[-6.2,106.8],
        [41.3,69.3],[43.2,76.9],[51.1,71.4],[38.6,68.8],
        [30.0,31.2],[6.5,3.4],[-1.3,36.8],[-6.8,39.3],[5.6,-0.2],
        [14.7,-17.5],[12.6,-8.0],[9.0,7.5],[9.0,38.7],[15.6,32.5],
        [33.6,-7.6],[36.8,3.1],[-4.3,15.3],[-26.2,28.0],[-33.9,18.4],
        [-15.4,28.3],[-8.8,13.2],[-12.0,-77.0],[11.6,43.1],
        [40.7,-74.0],[34.1,-118.2],[41.9,-87.6],[29.8,-95.4],[33.4,-112.1],
        [37.8,-122.4],[47.6,-122.3],[32.7,-117.2],[42.4,-71.1],[38.9,-77.0],
        [39.7,-75.2],[28.5,-81.4],[25.8,-80.2],[35.2,-80.8],[36.2,-115.2],
        [30.3,-97.7],[44.0,-79.4],[45.5,-73.6],[49.3,-123.1],[51.0,-114.1],
        [43.7,-79.4],[19.4,-99.1],[20.7,-103.3],[25.7,-100.3],
        [-23.5,-46.6],[-22.9,-43.2],[-34.6,-58.4],[-33.4,-70.6],
        [-12.0,-77.0],[-0.2,-78.5],[10.5,-66.9],[4.7,-74.1],
        [-15.8,-47.9],[-3.7,-38.5],[-8.0,-34.9],[-30.0,-51.2],
        [-1.8,-79.5],[3.4,-76.5],
        [-33.9,151.2],[-37.8,145.0],[-27.5,153.0],[-31.9,115.9],
        [-41.3,174.8],[-36.8,174.8],
        [64.1,-21.9],[60.4,5.3],[63.4,10.4],[69.6,18.9],
    ];
    const DEG = Math.PI / 180;

    // Reusable globe renderer — reads canvas size dynamically each frame
    function createGlobeRenderer(canvas, opts) {
        const ctx = canvas.getContext('2d');
        const rFactor = opts.radiusFactor || 0.42;
        const showArcs = opts.showArcs !== false;
        const showGrid = opts.showGrid !== false;
        const ROTATION_SPEED = opts.speed || 0.004;
        const MAX_ARCS = opts.maxArcs || 10;
        const dotBase = opts.dotBase || 1.5;
        const dotScale = opts.dotScale || 2.5;

        let rotation = 0;
        const arcs = [];
        let arcTimer = 0;

        function getDims() {
            const W = canvas.width;
            const H = canvas.height;
            return { W, H, CX: W / 2, CY: H / 2, R: W * rFactor };
        }

        function project(lat, lng, rot, d) {
            const phi = lat * DEG;
            const lambda = (lng + rot) * DEG;
            const x = Math.cos(phi) * Math.sin(lambda);
            const y = -Math.sin(phi);
            const z = Math.cos(phi) * Math.cos(lambda);
            return { x: d.CX + x * d.R, y: d.CY + y * d.R, z };
        }

        function spawnArc(now, d) {
            const visible = [];
            const rotDeg = rotation / DEG;
            for (let i = 0; i < WORLD_POINTS.length; i++) {
                const p = project(WORLD_POINTS[i][0], WORLD_POINTS[i][1], rotDeg, d);
                if (p.z > 0.15) visible.push({ idx: i, p });
            }
            if (visible.length < 2) return;
            const a = visible[Math.floor(Math.random() * visible.length)];
            let b, att = 0;
            do { b = visible[Math.floor(Math.random() * visible.length)]; att++; }
            while (b.idx === a.idx && att < 10);
            if (b.idx === a.idx) return;
            arcs.push({ from: a.idx, to: b.idx, birth: now,
                life: 1200 + Math.random() * 1000,
                color: Math.random() > 0.5 ? [0, 200, 255] : [33, 150, 243] });
        }

        function draw(now) {
            const d = getDims();
            const { W, H, CX, CY, R } = d;
            ctx.clearRect(0, 0, W, H);

            const atmGrad = ctx.createRadialGradient(CX, CY, R * 0.85, CX, CY, R * 1.25);
            atmGrad.addColorStop(0, 'rgba(0,200,255,0.06)');
            atmGrad.addColorStop(0.5, 'rgba(33,150,243,0.03)');
            atmGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = atmGrad;
            ctx.beginPath(); ctx.arc(CX, CY, R * 1.25, 0, Math.PI * 2); ctx.fill();

            ctx.strokeStyle = 'rgba(0,200,255,0.15)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();

            if (showGrid) {
                ctx.strokeStyle = 'rgba(0,200,255,0.04)'; ctx.lineWidth = 0.8;
                for (let lat = -60; lat <= 60; lat += 30) {
                    const phi = lat * DEG;
                    const ry = R * Math.cos(phi);
                    const cy2 = CY - R * Math.sin(phi);
                    ctx.beginPath(); ctx.ellipse(CX, cy2, ry, ry * 0.15, 0, 0, Math.PI * 2); ctx.stroke();
                }
                const rotDeg = rotation / DEG;
                for (let lng = 0; lng < 360; lng += 40) {
                    ctx.beginPath(); let first = true;
                    for (let lat = -90; lat <= 90; lat += 3) {
                        const p = project(lat, lng, rotDeg, d);
                        if (p.z > 0) { if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y); }
                        else { first = true; }
                    }
                    ctx.stroke();
                }
            }

            const rotDegVal = rotation / DEG;
            const projected = WORLD_POINTS.map(([lat, lng]) => project(lat, lng, rotDegVal, d));

            if (showArcs) {
                for (let i = arcs.length - 1; i >= 0; i--) {
                    const arc = arcs[i];
                    const t = (now - arc.birth) / arc.life;
                    if (t > 1) { arcs.splice(i, 1); continue; }
                    const pA = projected[arc.from], pB = projected[arc.to];
                    if (pA.z < 0.05 && pB.z < 0.05) continue;
                    const fade = t < 0.15 ? t / 0.15 : t > 0.7 ? (1 - t) / 0.3 : 1;
                    const [r, g, b] = arc.color;
                    const mx = (pA.x + pB.x) / 2, my = (pA.y + pB.y) / 2;
                    const dx = pB.x - pA.x, dy = pB.y - pA.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const lift = Math.min(dist * 0.35, R * 0.2);
                    const nx = -(pB.y - pA.y) / (dist || 1), ny = (pB.x - pA.x) / (dist || 1);
                    const cpx = mx + nx * lift, cpy = my + ny * lift;
                    ctx.strokeStyle = `rgba(${r},${g},${b},${fade * 0.7})`; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.quadraticCurveTo(cpx, cpy, pB.x, pB.y); ctx.stroke();
                    const pulseT = (t * 2) % 1;
                    const px = (1-pulseT)*(1-pulseT)*pA.x + 2*(1-pulseT)*pulseT*cpx + pulseT*pulseT*pB.x;
                    const py = (1-pulseT)*(1-pulseT)*pA.y + 2*(1-pulseT)*pulseT*cpy + pulseT*pulseT*pB.y;
                    const pg = ctx.createRadialGradient(px, py, 0, px, py, 8);
                    pg.addColorStop(0, `rgba(${r},${g},${b},${fade * 0.9})`); pg.addColorStop(1, `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
                    if (t < 0.3) {
                        const rr = t / 0.3 * 18, ra = (1 - t / 0.3) * fade;
                        ctx.strokeStyle = `rgba(${r},${g},${b},${ra * 0.5})`; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.arc(pA.x, pA.y, rr, 0, Math.PI * 2); ctx.stroke();
                    }
                }
                arcTimer++;
                if (arcTimer % 15 === 0 && arcs.length < MAX_ARCS) spawnArc(now, d);
            }

            const sorted = projected.map((p, i) => ({ p, i })).filter(dd => dd.p.z > 0).sort((a, b) => a.p.z - b.p.z);
            for (const { p } of sorted) {
                const alpha = 0.2 + p.z * 0.8;
                const dotR = dotBase + p.z * dotScale;
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dotR * 3);
                glow.addColorStop(0, `rgba(0,200,255,${alpha * 0.4})`); glow.addColorStop(1, 'rgba(0,200,255,0)');
                ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, dotR * 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = `rgba(0,200,255,${alpha})`; ctx.beginPath(); ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2); ctx.fill();
            }

            rotation += ROTATION_SPEED;
        }

        return { draw };
    }

    // --- Hero Globe ---
    const globeCanvas = document.getElementById('globe-canvas');
    if (globeCanvas) {
        // Match canvas internal resolution to its CSS display size (incl. devicePixelRatio for sharpness)
        function resizeGlobeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const displayW = globeCanvas.parentElement.offsetWidth || 520;
            const displayH = globeCanvas.parentElement.offsetHeight || 520;
            const size = Math.min(displayW, displayH);
            globeCanvas.width = size * dpr;
            globeCanvas.height = size * dpr;
        }
        resizeGlobeCanvas();
        window.addEventListener('resize', () => {
            resizeGlobeCanvas();
        });

        const heroGlobe = createGlobeRenderer(globeCanvas, { showArcs: true, showGrid: true });
        let heroRunning = false, heroAnimId = null;
        function heroLoop(now) { if (!heroRunning) return; heroGlobe.draw(now); heroAnimId = requestAnimationFrame(heroLoop); }

        function startHeroGlobe() { if (!heroRunning) { heroRunning = true; heroAnimId = requestAnimationFrame(heroLoop); } }
        function stopHeroGlobe() { heroRunning = false; if (heroAnimId) cancelAnimationFrame(heroAnimId); }

        const heroObs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) startHeroGlobe(); else stopHeroGlobe(); });
        }, { threshold: 0 });
        heroObs.observe(globeCanvas.closest('.globe-wrap'));
    }

    // --- Services Orbit Globe + Beams + Rotating Nodes ---
    const orbitScene = document.getElementById('orbit-scene');
    if (orbitScene) {
        const sGlobe = document.getElementById('service-globe');
        const beamCanvas = document.getElementById('orbit-beams');
        const orbitNodes = orbitScene.querySelectorAll('.orbit-node');
        const NODE_COUNT = orbitNodes.length;

        const sGlobeRenderer = createGlobeRenderer(sGlobe, {
            showArcs: true, showGrid: false, radiusFactor: 0.40,
            speed: 0.003, maxArcs: 3, dotBase: 1, dotScale: 1.5
        });

        const bCtx = beamCanvas.getContext('2d');
        const BW = beamCanvas.width;
        const BH = beamCanvas.height;
        const BCX = BW / 2;
        const BCY = BH / 2;
        const ORBIT_R = 260;
        const ORBIT_SPEED = 0.0003;
        let orbitAngle = 0;
        let sRunning = false, sAnimId = null;

        // Beam pulse state per node
        const beamPulses = Array.from({ length: NODE_COUNT }, () => ({ t: Math.random(), speed: 0.005 + Math.random() * 0.005, dir: 1 }));

        function getNodePos(i) {
            const baseAngle = (i / NODE_COUNT) * Math.PI * 2;
            const angle = baseAngle + orbitAngle;
            return {
                x: BCX + Math.cos(angle) * ORBIT_R,
                y: BCY + Math.sin(angle) * ORBIT_R
            };
        }

        function positionDOMNodes() {
            const sceneRect = orbitScene.getBoundingClientRect();
            const sceneW = sceneRect.width;
            const sceneH = sceneRect.height;
            const cx = sceneW / 2;
            const cy = sceneH / 2;
            const domOrbitR = sceneW * (ORBIT_R / BW);

            for (let i = 0; i < NODE_COUNT; i++) {
                const baseAngle = (i / NODE_COUNT) * Math.PI * 2;
                const angle = baseAngle + orbitAngle;
                const x = cx + Math.cos(angle) * domOrbitR;
                const y = cy + Math.sin(angle) * domOrbitR;
                orbitNodes[i].style.left = x + 'px';
                orbitNodes[i].style.top = y + 'px';
            }
        }

        function drawBeams(now) {
            bCtx.clearRect(0, 0, BW, BH);

            for (let i = 0; i < NODE_COUNT; i++) {
                const pos = getNodePos(i);
                const pulse = beamPulses[i];
                pulse.t += pulse.speed * pulse.dir;
                if (pulse.t > 1) { pulse.t = 1; pulse.dir = -1; }
                if (pulse.t < 0) { pulse.t = 0; pulse.dir = 1; }

                const dx = BCX - pos.x, dy = BCY - pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Beam line
                const grad = bCtx.createLinearGradient(pos.x, pos.y, BCX, BCY);
                grad.addColorStop(0, 'rgba(0,200,255,0.25)');
                grad.addColorStop(0.5, 'rgba(33,150,243,0.12)');
                grad.addColorStop(1, 'rgba(0,200,255,0.25)');
                bCtx.strokeStyle = grad;
                bCtx.lineWidth = 1.5;
                bCtx.beginPath();
                bCtx.moveTo(pos.x, pos.y);
                bCtx.lineTo(BCX, BCY);
                bCtx.stroke();

                // Traveling pulse dot
                const pt = pulse.t;
                const px = pos.x + dx * pt;
                const py = pos.y + dy * pt;
                const pg = bCtx.createRadialGradient(px, py, 0, px, py, 10);
                pg.addColorStop(0, 'rgba(0,200,255,0.9)');
                pg.addColorStop(1, 'rgba(0,200,255,0)');
                bCtx.fillStyle = pg;
                bCtx.beginPath(); bCtx.arc(px, py, 10, 0, Math.PI * 2); bCtx.fill();

                // Small glow at node connection point
                const ng = bCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 15);
                ng.addColorStop(0, 'rgba(0,200,255,0.15)');
                ng.addColorStop(1, 'rgba(0,200,255,0)');
                bCtx.fillStyle = ng;
                bCtx.beginPath(); bCtx.arc(pos.x, pos.y, 15, 0, Math.PI * 2); bCtx.fill();
            }

            // Center glow
            const cg = bCtx.createRadialGradient(BCX, BCY, 0, BCX, BCY, 30);
            cg.addColorStop(0, 'rgba(0,200,255,0.2)');
            cg.addColorStop(1, 'rgba(0,200,255,0)');
            bCtx.fillStyle = cg;
            bCtx.beginPath(); bCtx.arc(BCX, BCY, 30, 0, Math.PI * 2); bCtx.fill();
        }

        function serviceLoop(now) {
            if (!sRunning) return;
            orbitAngle += ORBIT_SPEED;
            sGlobeRenderer.draw(now);
            drawBeams(now);
            positionDOMNodes();
            sAnimId = requestAnimationFrame(serviceLoop);
        }

        const sObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { if (!sRunning) { sRunning = true; sAnimId = requestAnimationFrame(serviceLoop); } }
                else { sRunning = false; if (sAnimId) cancelAnimationFrame(sAnimId); }
            });
        }, { threshold: 0.05 });
        sObs.observe(orbitScene);

        positionDOMNodes();
    }

    // --- Process Timeline Beam Animation ---
    const tlCanvas = document.getElementById('timeline-beams');
    const tlContainer = document.getElementById('process-timeline');
    if (tlCanvas && tlContainer) {
        const tlCtx = tlCanvas.getContext('2d');
        const tlNodes = tlContainer.querySelectorAll('.tl-circle');
        const PULSE_COUNT = 5;
        const pulses = Array.from({ length: PULSE_COUNT }, () => ({
            seg: Math.floor(Math.random() * (tlNodes.length - 1)),
            t: Math.random(),
            speed: 0.006 + Math.random() * 0.006
        }));
        let tlRunning = false, tlAnimId = null;

        function getCircleCenters() {
            const containerRect = tlContainer.getBoundingClientRect();
            const canvasW = tlCanvas.width;
            const canvasH = tlCanvas.height;
            const scaleX = canvasW / containerRect.width;
            const scaleY = canvasH / (parseFloat(getComputedStyle(tlCanvas).height) || canvasH);

            return Array.from(tlNodes).map(node => {
                const r = node.getBoundingClientRect();
                return {
                    x: (r.left - containerRect.left + r.width / 2) * scaleX,
                    y: canvasH / 2
                };
            });
        }

        function drawTimeline(now) {
            const TW = tlCanvas.width;
            const TH = tlCanvas.height;
            tlCtx.clearRect(0, 0, TW, TH);

            const centers = getCircleCenters();
            if (centers.length < 2) return;

            // Draw connecting lines between nodes
            for (let i = 0; i < centers.length - 1; i++) {
                const a = centers[i];
                const b = centers[i + 1];
                const grad = tlCtx.createLinearGradient(a.x, a.y, b.x, b.y);
                grad.addColorStop(0, 'rgba(0, 200, 255, 0.2)');
                grad.addColorStop(0.5, 'rgba(33, 150, 243, 0.1)');
                grad.addColorStop(1, 'rgba(0, 200, 255, 0.2)');
                tlCtx.strokeStyle = grad;
                tlCtx.lineWidth = 2;
                tlCtx.beginPath();
                tlCtx.moveTo(a.x, a.y);
                tlCtx.lineTo(b.x, b.y);
                tlCtx.stroke();
            }

            // Glows at each node
            for (const c of centers) {
                const g = tlCtx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 20);
                g.addColorStop(0, 'rgba(0, 200, 255, 0.15)');
                g.addColorStop(1, 'rgba(0, 200, 255, 0)');
                tlCtx.fillStyle = g;
                tlCtx.beginPath();
                tlCtx.arc(c.x, c.y, 20, 0, Math.PI * 2);
                tlCtx.fill();
            }

            // Animate traveling pulses left-to-right
            for (const pulse of pulses) {
                pulse.t += pulse.speed;
                if (pulse.t >= 1) {
                    pulse.t = 0;
                    pulse.seg++;
                    if (pulse.seg >= centers.length - 1) {
                        pulse.seg = 0;
                    }
                }

                const a = centers[pulse.seg];
                const b = centers[pulse.seg + 1];
                if (!a || !b) continue;

                const px = a.x + (b.x - a.x) * pulse.t;
                const py = a.y + (b.y - a.y) * pulse.t;

                const pg = tlCtx.createRadialGradient(px, py, 0, px, py, 12);
                pg.addColorStop(0, 'rgba(0, 200, 255, 0.9)');
                pg.addColorStop(0.5, 'rgba(0, 200, 255, 0.3)');
                pg.addColorStop(1, 'rgba(0, 200, 255, 0)');
                tlCtx.fillStyle = pg;
                tlCtx.beginPath();
                tlCtx.arc(px, py, 12, 0, Math.PI * 2);
                tlCtx.fill();

                // Bright core
                tlCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                tlCtx.beginPath();
                tlCtx.arc(px, py, 2, 0, Math.PI * 2);
                tlCtx.fill();
            }
        }

        function tlLoop(now) {
            if (!tlRunning) return;
            drawTimeline(now);
            tlAnimId = requestAnimationFrame(tlLoop);
        }

        const tlObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { if (!tlRunning) { tlRunning = true; tlAnimId = requestAnimationFrame(tlLoop); } }
                else { tlRunning = false; if (tlAnimId) cancelAnimationFrame(tlAnimId); }
            });
        }, { threshold: 0.1 });
        tlObs.observe(tlContainer);
    }

    // --- Animated Logo Pulses ---
    const logoCanvas = document.getElementById('logo-pulses');
    const logoContainer = document.getElementById('logo-anim');
    if (logoCanvas && logoContainer) {
        const lCtx = logoCanvas.getContext('2d');
        const LW = logoCanvas.width;
        const LH = logoCanvas.height;

        // Circuit trace paths on the key icon (coordinates in 1000x700 space)
        // Mapped from the logo: key head top area, branching traces, shaft
        const circuitPaths = [
            // Head — top horizontal traces
            { from: [155, 72], to: [200, 72] },
            { from: [200, 72], to: [200, 105] },
            { from: [200, 105], to: [240, 105] },
            { from: [240, 105], to: [240, 135] },
            { from: [155, 72], to: [120, 72] },
            { from: [120, 72], to: [120, 105] },
            // Head — upper branches
            { from: [120, 105], to: [80, 105] },
            { from: [80, 105], to: [80, 150] },
            { from: [240, 135], to: [275, 135] },
            { from: [275, 135], to: [275, 175] },
            // Head — mid horizontal
            { from: [80, 150], to: [55, 150] },
            { from: [55, 150], to: [55, 200] },
            { from: [275, 175], to: [290, 175] },
            { from: [290, 175], to: [290, 225] },
            // Head — center vertical spine
            { from: [155, 72], to: [155, 130] },
            { from: [155, 130], to: [120, 130] },
            { from: [155, 130], to: [190, 130] },
            { from: [155, 130], to: [155, 185] },
            // Head — lower branches
            { from: [155, 185], to: [100, 185] },
            { from: [100, 185], to: [100, 225] },
            { from: [155, 185], to: [210, 185] },
            { from: [210, 185], to: [210, 225] },
            // Head — bottom converge
            { from: [55, 200], to: [55, 265] },
            { from: [100, 225], to: [100, 265] },
            { from: [55, 265], to: [100, 265] },
            { from: [210, 225], to: [210, 265] },
            { from: [290, 225], to: [290, 265] },
            { from: [210, 265], to: [290, 265] },
            { from: [100, 265], to: [155, 295] },
            { from: [210, 265], to: [155, 295] },
            // Shaft — vertical down
            { from: [155, 295], to: [155, 370] },
            { from: [155, 370], to: [130, 370] },
            { from: [130, 370], to: [130, 400] },
            { from: [155, 370], to: [180, 370] },
            { from: [180, 370], to: [180, 400] },
            { from: [155, 370], to: [155, 440] },
            { from: [155, 440], to: [135, 440] },
            { from: [155, 440], to: [175, 440] },
            { from: [155, 440], to: [155, 510] },
            { from: [155, 510], to: [155, 580] },
            // Shaft — bottom teeth
            { from: [155, 510], to: [130, 510] },
            { from: [130, 510], to: [130, 545] },
            { from: [130, 545], to: [155, 545] },
            { from: [155, 545], to: [155, 580] },
            { from: [155, 580], to: [135, 620] },
            { from: [155, 580], to: [175, 620] },
        ];

        // Nodes — junctions where dots sit on the logo
        const nodes = [];
        const nodeSet = new Set();
        for (const seg of circuitPaths) {
            for (const pt of [seg.from, seg.to]) {
                const key = pt[0] + ',' + pt[1];
                if (!nodeSet.has(key)) {
                    nodeSet.add(key);
                    nodes.push(pt);
                }
            }
        }

        // Pulses traveling along random path segments
        const LOGO_PULSE_COUNT = 12;
        const logoPulses = Array.from({ length: LOGO_PULSE_COUNT }, () => ({
            seg: Math.floor(Math.random() * circuitPaths.length),
            t: Math.random(),
            speed: 0.008 + Math.random() * 0.012,
            color: Math.random() > 0.5 ? [0, 200, 255] : [33, 150, 243]
        }));

        let logoRunning = false, logoAnimId = null;

        function drawLogoPulses(now) {
            lCtx.clearRect(0, 0, LW, LH);

            // Draw subtle glow at each node
            for (const n of nodes) {
                const g = lCtx.createRadialGradient(n[0], n[1], 0, n[0], n[1], 8);
                g.addColorStop(0, 'rgba(0, 200, 255, 0.12)');
                g.addColorStop(1, 'rgba(0, 200, 255, 0)');
                lCtx.fillStyle = g;
                lCtx.beginPath();
                lCtx.arc(n[0], n[1], 8, 0, Math.PI * 2);
                lCtx.fill();
            }

            // Draw faint trace lines
            lCtx.strokeStyle = 'rgba(0, 200, 255, 0.06)';
            lCtx.lineWidth = 1.5;
            for (const seg of circuitPaths) {
                lCtx.beginPath();
                lCtx.moveTo(seg.from[0], seg.from[1]);
                lCtx.lineTo(seg.to[0], seg.to[1]);
                lCtx.stroke();
            }

            // Animate pulses
            for (const pulse of logoPulses) {
                pulse.t += pulse.speed;
                if (pulse.t >= 1) {
                    pulse.t = 0;
                    // Pick a connected segment (share an endpoint)
                    const curEnd = circuitPaths[pulse.seg].to;
                    const connected = [];
                    for (let i = 0; i < circuitPaths.length; i++) {
                        if (circuitPaths[i].from[0] === curEnd[0] && circuitPaths[i].from[1] === curEnd[1]) {
                            connected.push(i);
                        }
                    }
                    pulse.seg = connected.length > 0
                        ? connected[Math.floor(Math.random() * connected.length)]
                        : Math.floor(Math.random() * circuitPaths.length);
                }

                const seg = circuitPaths[pulse.seg];
                const px = seg.from[0] + (seg.to[0] - seg.from[0]) * pulse.t;
                const py = seg.from[1] + (seg.to[1] - seg.from[1]) * pulse.t;
                const [r, g, b] = pulse.color;

                // Outer glow
                const pg = lCtx.createRadialGradient(px, py, 0, px, py, 14);
                pg.addColorStop(0, `rgba(${r},${g},${b},0.7)`);
                pg.addColorStop(0.4, `rgba(${r},${g},${b},0.2)`);
                pg.addColorStop(1, `rgba(${r},${g},${b},0)`);
                lCtx.fillStyle = pg;
                lCtx.beginPath();
                lCtx.arc(px, py, 14, 0, Math.PI * 2);
                lCtx.fill();

                // Bright core
                lCtx.fillStyle = `rgba(255, 255, 255, 0.9)`;
                lCtx.beginPath();
                lCtx.arc(px, py, 2.5, 0, Math.PI * 2);
                lCtx.fill();
            }
        }

        function logoLoop(now) {
            if (!logoRunning) return;
            drawLogoPulses(now);
            logoAnimId = requestAnimationFrame(logoLoop);
        }

        const logoObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { if (!logoRunning) { logoRunning = true; logoAnimId = requestAnimationFrame(logoLoop); } }
                else { logoRunning = false; if (logoAnimId) cancelAnimationFrame(logoAnimId); }
            });
        }, { threshold: 0.1 });
        logoObs.observe(logoContainer);
    }

    console.log("Key IT Solutions: Systems Online.");
});
