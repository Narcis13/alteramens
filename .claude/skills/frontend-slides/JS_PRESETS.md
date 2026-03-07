# JavaScript Presets Reference

Reusable, copy-pasteable JS modules for Frontend Slides presentations.
**Always use these presets instead of regenerating from scratch.**

---

## CORE (Mandatory in Every Presentation)

### SlidePresentation Class

Handles navigation (keyboard, wheel, touch), progress bar, nav dots, and animation triggers via IntersectionObserver.

```javascript
/* ===========================================
   SLIDE PRESENTATION CONTROLLER

   Handles:
   - Keyboard navigation (arrows, space, home/end)
   - Mouse wheel navigation (debounced)
   - Touch/swipe navigation
   - Progress bar updates
   - Navigation dots sync
   - .visible class for CSS entrance animations

   Usage:
     new SlidePresentation();

   Customize:
   - SCROLL_COOLDOWN: ms to wait between wheel events (default 900)
   - SWIPE_THRESHOLD: px delta to trigger swipe (default 50)
   - OBSERVER_THRESHOLD: % of slide visible to trigger (default 0.5)
   =========================================== */
class SlidePresentation {
    constructor({
        slideSelector   = '.slide',
        progressBarId   = 'progressBar',
        navDotsId       = 'navDots',
        scrollCooldown  = 900,
        swipeThreshold  = 50,
        observerThreshold = 0.5,
    } = {}) {
        this.slides     = Array.from(document.querySelectorAll(slideSelector));
        this.total      = this.slides.length;
        this.current    = 0;
        this.isScrolling = false;

        this.progressBar = document.getElementById(progressBarId);
        this.dotsEl      = document.getElementById(navDotsId);

        this.scrollCooldown      = scrollCooldown;
        this.swipeThreshold      = swipeThreshold;
        this.observerThreshold   = observerThreshold;

        this._buildDots();
        this._initObserver();
        this._initKeyboard();
        this._initWheel();
        this._initTouch();
        this._updateProgress(0);
    }

    /* Build one nav dot per slide */
    _buildDots() {
        if (!this.dotsEl) return;
        this.slides.forEach((_, i) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'button');
            li.setAttribute('aria-label', `Go to slide ${i + 1}`);
            li.addEventListener('click', () => this.goTo(i));
            this.dotsEl.appendChild(li);
        });
        this._syncDots(0);
    }

    /* IntersectionObserver: adds .visible when slide enters viewport */
    _initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const idx = parseInt(entry.target.dataset.slide, 10);
                    if (!isNaN(idx)) {
                        this.current = idx;
                        this._updateProgress(idx);
                        this._syncDots(idx);
                    }
                }
            });
        }, { threshold: this.observerThreshold });

        this.slides.forEach(s => observer.observe(s));
    }

    /* Arrow keys, Space, Home, End */
    _initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.key) {
                case 'ArrowDown': case 'ArrowRight': case ' ':
                    e.preventDefault(); this.goTo(this.current + 1); break;
                case 'ArrowUp': case 'ArrowLeft':
                    e.preventDefault(); this.goTo(this.current - 1); break;
                case 'Home': this.goTo(0); break;
                case 'End':  this.goTo(this.total - 1); break;
            }
        });
    }

    /* Mouse wheel (debounced to prevent skipping slides) */
    _initWheel() {
        document.addEventListener('wheel', (e) => {
            if (this.isScrolling) return;
            this.isScrolling = true;
            this.goTo(e.deltaY > 0 ? this.current + 1 : this.current - 1);
            setTimeout(() => { this.isScrolling = false; }, this.scrollCooldown);
        }, { passive: true });
    }

    /* Touch swipe */
    _initTouch() {
        let startY = 0;
        document.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        document.addEventListener('touchend', e => {
            const delta = startY - e.changedTouches[0].clientY;
            if (Math.abs(delta) > this.swipeThreshold) {
                this.goTo(delta > 0 ? this.current + 1 : this.current - 1);
            }
        }, { passive: true });
    }

    /* Scroll target slide into view (clamped to valid range) */
    goTo(index) {
        const i = Math.max(0, Math.min(this.total - 1, index));
        this.slides[i].scrollIntoView({ behavior: 'smooth' });
    }

    /* Update thin progress bar width */
    _updateProgress(index) {
        if (!this.progressBar) return;
        const pct = this.total <= 1 ? 100 : (index / (this.total - 1)) * 100;
        this.progressBar.style.width = pct + '%';
    }

    /* Highlight active nav dot */
    _syncDots(index) {
        if (!this.dotsEl) return;
        this.dotsEl.querySelectorAll('li').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}

// Initialize
new SlidePresentation();
```

**Required HTML:**
```html
<div class="progress-bar" id="progressBar"></div>
<ul class="nav-dots" id="navDots" aria-label="Slide navigation"></ul>

<!-- Each slide needs data-slide="N" (0-indexed) -->
<section class="slide" data-slide="0">...</section>
<section class="slide" data-slide="1">...</section>
```

---

## OPTIONAL ENHANCEMENTS

Include only when the style calls for it. Each is self-contained — add after `SlidePresentation`.

---

### Custom Cursor with Trail

Replaces the default cursor. A dot follows the mouse with smooth lerp; a larger ring follows with lag.
Best for: dark/premium styles (Dark Botanical, Bold Signal, Neon Cyber).

```javascript
/* ===========================================
   CUSTOM CURSOR

   Creates a two-part cursor:
   - Inner dot: follows mouse exactly
   - Outer ring: follows with lerp lag (smooth trailing)
   - Grows on hover over interactive elements

   Disable on touch devices automatically.
   =========================================== */
class CustomCursor {
    constructor({ color = '#ffffff', accentColor = null } = {}) {
        if (window.matchMedia('(hover: none)').matches) return; // skip touch

        this.dot  = this._create('cursor-dot',  8);
        this.ring = this._create('cursor-ring', 36);
        this.x = this.y = 0;
        this.ringX = this.ringY = 0;
        this.color = color;
        this.accent = accentColor || color;

        document.body.style.cursor = 'none';
        this._applyStyles();
        this._bindEvents();
        this._animate();
    }

    _create(className, size) {
        const el = document.createElement('div');
        el.className = className;
        el.style.cssText = `
            position: fixed; pointer-events: none; z-index: 9999;
            width: ${size}px; height: ${size}px;
            border-radius: 50%; top: 0; left: 0;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s, opacity 0.2s;
        `;
        document.body.appendChild(el);
        return el;
    }

    _applyStyles() {
        this.dot.style.background  = this.color;
        this.ring.style.border     = `1.5px solid ${this.color}`;
        this.ring.style.opacity    = '0.6';
    }

    _bindEvents() {
        document.addEventListener('mousemove', e => {
            this.x = e.clientX; this.y = e.clientY;
        });

        const interactives = 'a, button, [role="button"], li';
        document.querySelectorAll(interactives).forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.dot.style.width  = this.dot.style.height  = '12px';
                this.ring.style.width = this.ring.style.height = '52px';
                this.ring.style.borderColor = this.accent;
            });
            el.addEventListener('mouseleave', () => {
                this.dot.style.width  = this.dot.style.height  = '8px';
                this.ring.style.width = this.ring.style.height = '36px';
                this.ring.style.borderColor = this.color;
            });
        });
    }

    _animate() {
        // Lerp: ring follows mouse with smooth lag
        this.ringX += (this.x - this.ringX) * 0.12;
        this.ringY += (this.y - this.ringY) * 0.12;

        this.dot.style.transform  = `translate(${this.x - 4}px, ${this.y - 4}px)`;
        this.ring.style.transform = `translate(${this.ringX - 18}px, ${this.ringY - 18}px)`;

        requestAnimationFrame(() => this._animate());
    }
}

new CustomCursor({ color: '#ffffff', accentColor: '#7a9e7a' });
```

---

### Particle System Background

Canvas-based floating particles. Lightweight — uses requestAnimationFrame, auto-pauses off-screen.
Best for: Neon Cyber, Bold Signal, dark tech styles.

```javascript
/* ===========================================
   PARTICLE SYSTEM

   Renders floating dots on a canvas background.
   - Auto-sizes to window
   - Particles wrap at edges
   - Speed and count scale with viewport

   Options:
   - count: number of particles (default 60)
   - color: particle color (default '#ffffff')
   - opacity: max particle opacity (default 0.3)
   - speed: movement speed multiplier (default 0.4)
   - maxRadius: max particle size in px (default 2)
   =========================================== */
class ParticleSystem {
    constructor({
        count    = 60,
        color    = '#ffffff',
        opacity  = 0.3,
        speed    = 0.4,
        maxRadius = 2,
    } = {}) {
        this.canvas  = document.createElement('canvas');
        this.ctx     = this.canvas.getContext('2d');
        this.count   = count;
        this.color   = color;
        this.opacity = opacity;
        this.speed   = speed;
        this.maxRadius = maxRadius;
        this.particles = [];

        this.canvas.style.cssText = `
            position: fixed; inset: 0;
            width: 100%; height: 100%;
            pointer-events: none; z-index: 0;
        `;
        document.body.prepend(this.canvas);

        this._resize();
        this._populate();
        this._animate();

        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    _populate() {
        this.particles = Array.from({ length: this.count }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * this.maxRadius + 0.5,
            vx: (Math.random() - 0.5) * this.speed,
            vy: (Math.random() - 0.5) * this.speed,
            a: Math.random() * this.opacity,
        }));
    }

    _animate() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.particles.forEach(p => {
            p.x = (p.x + p.vx + canvas.width)  % canvas.width;
            p.y = (p.y + p.vy + canvas.height) % canvas.height;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = p.a;
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        requestAnimationFrame(() => this._animate());
    }
}

new ParticleSystem({ color: '#7a9e7a', opacity: 0.25, count: 50 });
```

---

### 3D Card Tilt on Hover

Adds a subtle perspective tilt to cards/elements when hovered.
Best for: Bold Signal, Creative Voltage, feature grid slides.

```javascript
/* ===========================================
   3D TILT EFFECT

   Applies perspective rotation to elements on mousemove.
   - Smooth reset on mouseleave
   - Configurable max tilt angle

   Usage:
     new TiltEffect('.card');          // all .card elements
     new TiltEffect('.feature', 8);   // max 8 degrees tilt
   =========================================== */
class TiltEffect {
    constructor(selector = '.card', maxTilt = 10) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.transformStyle = 'preserve-3d';
            el.style.transition = 'transform 0.1s ease';
            this._bind(el, maxTilt);
        });
    }

    _bind(el, maxTilt) {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width  - 0.5) * maxTilt * 2;
            const y = ((e.clientY - rect.top)  / rect.height - 0.5) * maxTilt * 2;
            el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.4s ease';
            el.style.transform  = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
            setTimeout(() => { el.style.transition = 'transform 0.1s ease'; }, 400);
        });
    }
}

new TiltEffect('.card', 8);
```

---

### Magnetic Button Effect

Buttons subtly attract toward the cursor when nearby.
Best for: Bold Signal, Creative Voltage, call-to-action slides.

```javascript
/* ===========================================
   MAGNETIC BUTTON

   Elements move slightly toward the cursor when it's within range.
   Snaps back smoothly on exit.

   Usage:
     new MagneticButton('.btn');
     new MagneticButton('.cta', 60); // 60px attraction radius
   =========================================== */
class MagneticButton {
    constructor(selector = '.btn', radius = 80) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            this._bind(el, radius);
        });
    }

    _bind(el, radius) {
        el.addEventListener('mousemove', (e) => {
            const rect  = el.getBoundingClientRect();
            const cx    = rect.left + rect.width  / 2;
            const cy    = rect.top  + rect.height / 2;
            const dx    = e.clientX - cx;
            const dy    = e.clientY - cy;
            const dist  = Math.sqrt(dx * dx + dy * dy);
            const force = Math.max(0, 1 - dist / radius);
            el.style.transform = `translate(${dx * force * 0.35}px, ${dy * force * 0.35}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    }
}

new MagneticButton('.btn');
```

---

### Counter Animation

Animates numbers from 0 to their target value when the containing slide becomes visible.
Best for: data/metrics slides, stats highlights.

```javascript
/* ===========================================
   COUNTER ANIMATION

   Finds elements with data-count="N" and animates
   from 0 to N when their parent slide gets .visible.

   HTML usage:
     <span class="counter" data-count="1247">0</span>

   Options:
   - duration: animation duration in ms (default 1800)
   - easing: 'linear' | 'easeOut' | 'easeInOut' (default 'easeOut')
   =========================================== */
class CounterAnimation {
    constructor({ duration = 1800, easing = 'easeOut' } = {}) {
        this.duration = duration;
        this.easing   = easing;
        this._init();
    }

    _ease(t) {
        switch (this.easing) {
            case 'linear':    return t;
            case 'easeInOut': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:          return 1 - Math.pow(1 - t, 3); // easeOut cubic
        }
    }

    _animateCounter(el) {
        if (el.dataset.animated) return;
        el.dataset.animated = '1';

        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = (String(target).split('.')[1] || '').length;
        const start = performance.now();

        const step = (now) => {
            const t = Math.min((now - start) / this.duration, 1);
            const value = target * this._ease(t);
            el.textContent = value.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    _init() {
        // Watch for .visible being added to slides
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    const slide = m.target;
                    if (slide.classList.contains('visible')) {
                        slide.querySelectorAll('[data-count]').forEach(el => this._animateCounter(el));
                    }
                }
            });
        });

        document.querySelectorAll('.slide').forEach(slide => {
            observer.observe(slide, { attributes: true });
        });
    }
}

new CounterAnimation({ duration: 1600 });
```

---

### Parallax Scrolling

Moves background elements at a slower rate than the slide for depth.
Best for: editorial, storytelling, cinematic styles.

```javascript
/* ===========================================
   PARALLAX EFFECT

   Elements with data-parallax="N" move at N * scroll speed.
   N < 1 = slower than scroll (classic parallax)
   N > 1 = faster than scroll (exaggerated)

   HTML usage:
     <div class="hero-bg" data-parallax="0.4"></div>
   =========================================== */
class ParallaxScroller {
    constructor(selector = '[data-parallax]') {
        this.elements = Array.from(document.querySelectorAll(selector));
        if (!this.elements.length) return;

        let ticking = false;
        document.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => { this._update(); ticking = false; });
                ticking = true;
            }
        }, { passive: true });

        this._update();
    }

    _update() {
        const scrollY = window.scrollY;
        this.elements.forEach(el => {
            const speed  = parseFloat(el.dataset.parallax) || 0.5;
            const offset = scrollY * (1 - speed);
            el.style.transform = `translateY(${offset}px)`;
        });
    }
}

new ParallaxScroller();
```

---

### Annotation Overlay (Presenter Toolbox)

Draw, circle, arrow, and annotate slides live — like Excalidraw's pen mode.
Best for: any live presentation where you want to highlight or annotate on the fly.

```javascript
/* ===========================================
   ANNOTATION OVERLAY (Presenter Toolbox)

   Draws on a transparent canvas overlay during presentations.
   - Tools: freedraw, line, arrow, square, text, eraser
   - 7 color presets + custom color picker
   - S / M / L stroke sizes
   - Per-slide annotation state (preserved on slide change)
   - Navigation lockout while drawing (wheel, touch, keyboard)
   - Press E (or custom key) to toggle; Escape to close

   Options:
   - accentColor:  active toggle button color  (default '#7a9e7a')
   - defaultColor: starting pen color          (default '#ef4444')
   - defaultSize:  starting stroke width px    (default 4)
   - defaultTool:  starting tool name          (default 'freedraw')
   - toggleKey:    keyboard shortcut key       (default 'e')
   =========================================== */
class AnnotationOverlay {
    constructor({
        accentColor  = '#7a9e7a',
        defaultColor = '#ef4444',
        defaultSize  = 4,
        defaultTool  = 'freedraw',
        toggleKey    = 'e',
    } = {}) {
        this.accentColor = accentColor;
        this.color       = defaultColor;
        this.size        = defaultSize;
        this.tool        = defaultTool;
        this.toggleKey   = toggleKey.toLowerCase();

        this.isActive  = false;
        this.isDrawing = false;
        this.snapshot  = null;
        this.slideData = new Map();        // Map<slideIndex, ImageData>
        this.currentSlideIdx = 0;
        this.startX = this.startY = 0;
        this.textInput = null;

        this._buildCanvas();
        this._buildUI();
        this._initSlideWatcher();
        this._initNavLockout();
        this._initKeyboard();
        this._initDrawing();
        window.addEventListener('resize', () => this._resizeCanvas());
    }

    /* ── Canvas ── */
    _buildCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'anno-canvas';
        this.canvas.style.cssText = `
            position: fixed; inset: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 998;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this._resizeCanvas();
    }

    _resizeCanvas() {
        const saved = (this.isActive && this.canvas.width > 0)
            ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
            : null;
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (saved) this.ctx.putImageData(saved, 0, 0);
    }

    /* ── UI: Toggle button + Toolbox ── */
    _buildUI() {
        // Toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'anno-toggle';
        this.toggleBtn.title = `Toggle annotation (${this.toggleKey.toUpperCase()})`;
        this.toggleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            <span style="font-size:8px;font-family:monospace;color:rgba(255,255,255,0.4);display:block;line-height:1">
                ${this.toggleKey.toUpperCase()}
            </span>
        `;
        this.toggleBtn.style.cssText = `
            position: fixed; bottom: 1.75rem; left: 1.75rem;
            width: 40px; height: 40px; border-radius: 50%;
            background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.7); cursor: pointer;
            display: flex; align-items: center; justify-content: center; flex-direction: column;
            gap: 1px; z-index: 999; padding: 0;
            transition: background 0.2s, border-color 0.2s, color 0.2s;
        `;
        this.toggleBtn.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.toggleBtn);

        // Toolbox panel
        this.toolbox = document.createElement('div');
        this.toolbox.className = 'anno-toolbox';
        this.toolbox.style.cssText = `
            position: fixed; bottom: 5.5rem; left: 1.75rem;
            background: rgba(12,12,12,0.92); backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
            padding: 0.75rem; display: flex; flex-direction: column; gap: 0.6rem;
            z-index: 999; transform-origin: bottom left;
            transform: translateY(8px) scale(0.96); opacity: 0;
            pointer-events: none;
            transition: opacity 0.18s, transform 0.18s;
        `;

        // Tools row
        const tools = [
            { id: 'freedraw', label: 'Draw',  icon: '\u270f\ufe0f' },
            { id: 'line',     label: 'Line',  icon: '\u2571'        },
            { id: 'arrow',    label: 'Arrow', icon: '\u2192'        },
            { id: 'square',   label: 'Rect',  icon: '\u25ad'        },
            { id: 'text',     label: 'Text',  icon: 'T'             },
            { id: 'eraser',   label: 'Erase', icon: '\u232b'        },
        ];
        const toolRow = this._row();
        this.toolBtns = {};
        tools.forEach(({ id, label, icon }) => {
            const btn = document.createElement('button');
            btn.title = label;
            btn.textContent = icon;
            btn.style.cssText = `
                width: 32px; height: 32px; border-radius: 7px;
                background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.8); cursor: pointer; padding: 0;
                font-size: 14px; display: flex; align-items: center; justify-content: center;
                transition: border-color 0.15s, background 0.15s;
            `;
            btn.addEventListener('click', () => this._selectTool(id));
            toolRow.appendChild(btn);
            this.toolBtns[id] = btn;
        });
        this.toolbox.appendChild(toolRow);

        // Colors row
        const presetColors = ['#ef4444','#f97316','#facc15','#4ade80','#60a5fa','#ffffff','#1a1a1a'];
        const colorRow = this._row();
        this.colorBtns = {};
        presetColors.forEach(c => {
            const btn = document.createElement('button');
            btn.title = c;
            btn.style.cssText = `
                width: 20px; height: 20px; border-radius: 50%;
                background: ${c}; border: 2px solid transparent;
                cursor: pointer; padding: 0; flex-shrink: 0;
                transition: border-color 0.15s, transform 0.15s;
            `;
            btn.addEventListener('click', () => this._selectColor(c));
            colorRow.appendChild(btn);
            this.colorBtns[c] = btn;
        });
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = this.color;
        colorPicker.title = 'Custom color';
        colorPicker.style.cssText = `
            width: 20px; height: 20px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.2); cursor: pointer;
            padding: 0; flex-shrink: 0; background: none; overflow: hidden;
        `;
        colorPicker.addEventListener('input', e => this._selectColor(e.target.value));
        colorRow.appendChild(colorPicker);
        this.toolbox.appendChild(colorRow);

        // Sizes row + clear button
        const sizeRow = this._row();
        const sizes = [{ label: 'S', value: 2 }, { label: 'M', value: 4 }, { label: 'L', value: 8 }];
        this.sizeBtns = {};
        sizes.forEach(({ label, value }) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.style.cssText = `
                min-width: 28px; height: 28px; border-radius: 6px;
                background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.8); cursor: pointer; padding: 0 6px;
                font-size: 11px; font-family: sans-serif;
                transition: border-color 0.15s, background 0.15s;
            `;
            btn.addEventListener('click', () => this._selectSize(value));
            sizeRow.appendChild(btn);
            this.sizeBtns[value] = btn;
        });
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        sizeRow.appendChild(spacer);
        const clearBtn = document.createElement('button');
        clearBtn.title = 'Clear annotations on this slide';
        clearBtn.textContent = '\ud83d\uddd1';
        clearBtn.style.cssText = `
            width: 28px; height: 28px; border-radius: 6px;
            background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
            color: rgba(255,255,255,0.8); cursor: pointer; padding: 0;
            font-size: 13px; transition: background 0.15s;
        `;
        clearBtn.addEventListener('click', () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.slideData.delete(this.currentSlideIdx);
        });
        sizeRow.appendChild(clearBtn);
        this.toolbox.appendChild(sizeRow);

        document.body.appendChild(this.toolbox);

        // Apply defaults
        this._selectTool(this.tool);
        this._selectColor(this.color);
        this._selectSize(this.size);
    }

    _row() {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:6px;align-items:center;';
        return row;
    }

    _selectTool(id) {
        this.tool = id;
        Object.entries(this.toolBtns).forEach(([tid, btn]) => {
            const active = tid === id;
            btn.style.background  = active ? `${this.accentColor}33` : 'rgba(255,255,255,0.06)';
            btn.style.borderColor = active ? this.accentColor         : 'rgba(255,255,255,0.1)';
            btn.style.color       = active ? this.accentColor         : 'rgba(255,255,255,0.8)';
        });
        this.canvas.style.cursor = id === 'eraser' ? 'cell' : id === 'text' ? 'text' : 'crosshair';
    }

    _selectColor(c) {
        this.color = c;
        Object.entries(this.colorBtns).forEach(([col, btn]) => {
            btn.style.borderColor = col === c ? 'rgba(255,255,255,0.9)' : 'transparent';
            btn.style.transform   = col === c ? 'scale(1.2)'            : 'none';
        });
    }

    _selectSize(v) {
        this.size = v;
        Object.entries(this.sizeBtns).forEach(([val, btn]) => {
            const active = parseInt(val) === v;
            btn.style.borderColor = active ? this.accentColor         : 'rgba(255,255,255,0.1)';
            btn.style.background  = active ? `${this.accentColor}22`  : 'rgba(255,255,255,0.06)';
        });
    }

    /* ── Per-slide state ── */
    _initSlideWatcher() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    const slide = m.target;
                    if (slide.classList.contains('visible')) {
                        const newIdx = parseInt(slide.dataset.slide, 10);
                        if (!isNaN(newIdx) && newIdx !== this.currentSlideIdx) {
                            this._saveCurrentSlide();
                            this.currentSlideIdx = newIdx;
                            this._loadSlide(newIdx);
                        }
                    }
                }
            });
        });
        document.querySelectorAll('.slide').forEach(s => observer.observe(s, { attributes: true }));
    }

    _saveCurrentSlide() {
        const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.slideData.set(this.currentSlideIdx, data);
    }

    _loadSlide(idx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const data = this.slideData.get(idx);
        if (data) this.ctx.putImageData(data, 0, 0);
    }

    /* ── Navigation lockout ── */
    _initNavLockout() {
        const capture = { capture: true, passive: false };
        // Block wheel + touch entirely while annotation is active
        window.addEventListener('wheel', (e) => {
            if (this.isActive) e.stopPropagation();
        }, capture);
        window.addEventListener('touchstart', (e) => {
            if (this.isActive) e.stopPropagation();
        }, capture);
        window.addEventListener('touchend', (e) => {
            if (this.isActive) e.stopPropagation();
        }, capture);
        // Block arrow/space only while actively drawing a stroke
        window.addEventListener('keydown', (e) => {
            if (this.isActive && this.isDrawing) {
                if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                    e.stopPropagation();
                }
            }
        }, capture);
    }

    /* ── Keyboard shortcut ── */
    _initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key.toLowerCase() === this.toggleKey) {
                this.toggle();
            } else if (e.key === 'Escape' && this.isActive) {
                this.toggle();
            }
        });
    }

    /* ── Toggle on/off ── */
    toggle() {
        this.isActive = !this.isActive;
        this.canvas.style.pointerEvents = this.isActive ? 'all' : 'none';
        if (this.isActive) {
            this.toolbox.style.opacity        = '1';
            this.toolbox.style.transform      = 'none';
            this.toolbox.style.pointerEvents  = 'all';
            this.toggleBtn.style.background   = this.accentColor;
            this.toggleBtn.style.borderColor  = this.accentColor;
            this.toggleBtn.style.color        = '#fff';
        } else {
            this.toolbox.style.opacity        = '0';
            this.toolbox.style.transform      = 'translateY(8px) scale(0.96)';
            this.toolbox.style.pointerEvents  = 'none';
            this.toggleBtn.style.background   = 'rgba(255,255,255,0.08)';
            this.toggleBtn.style.borderColor  = 'rgba(255,255,255,0.15)';
            this.toggleBtn.style.color        = 'rgba(255,255,255,0.7)';
        }
    }

    /* ── Drawing event wiring ── */
    _initDrawing() {
        this.canvas.addEventListener('mousedown',  e => this._onDown(e.offsetX, e.offsetY));
        this.canvas.addEventListener('mousemove',  e => this._onMove(e.offsetX, e.offsetY));
        this.canvas.addEventListener('mouseup',    e => this._onUp(e.offsetX, e.offsetY));
        this.canvas.addEventListener('mouseleave', () => { if (this.isDrawing) this._onUp(0, 0); });

        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0], r = this.canvas.getBoundingClientRect();
            this._onDown(t.clientX - r.left, t.clientY - r.top);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const t = e.touches[0], r = this.canvas.getBoundingClientRect();
            this._onMove(t.clientX - r.left, t.clientY - r.top);
        }, { passive: false });
        this.canvas.addEventListener('touchend', e => {
            e.preventDefault();
            const t = e.changedTouches[0], r = this.canvas.getBoundingClientRect();
            this._onUp(t.clientX - r.left, t.clientY - r.top);
        }, { passive: false });
    }

    _onDown(x, y) {
        if (!this.isActive) return;
        if (this.tool === 'text') { this._startText(x, y); return; }

        this.isDrawing = true;
        this.startX = x; this.startY = y;
        this._applyCtxStyle();

        if (this.tool === 'freedraw') {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        } else if (this.tool !== 'eraser') {
            // Snapshot for shape preview (line, arrow, square)
            this.snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    _onMove(x, y) {
        if (!this.isDrawing || !this.isActive) return;

        if (this.tool === 'freedraw') {
            this._applyCtxStyle();
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            return;
        }
        if (this.tool === 'eraser') {
            this._erase(x, y);
            return;
        }
        // Shape preview: restore snapshot then redraw current shape
        this.ctx.putImageData(this.snapshot, 0, 0);
        this._applyCtxStyle();
        this._drawShape(this.tool, this.startX, this.startY, x, y);
    }

    _onUp(x, y) {
        if (!this.isDrawing || !this.isActive) return;
        this.isDrawing = false;

        if (this.tool !== 'freedraw' && this.tool !== 'eraser' && this.snapshot) {
            this.ctx.putImageData(this.snapshot, 0, 0);
            this._applyCtxStyle();
            this._drawShape(this.tool, this.startX, this.startY, x, y);
        }
        this.snapshot = null;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    _applyCtxStyle() {
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle   = this.color;
        this.ctx.lineWidth   = this.size;
        this.ctx.lineCap     = 'round';
        this.ctx.lineJoin    = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
    }

    _drawShape(tool, x1, y1, x2, y2) {
        this.ctx.beginPath();
        if (tool === 'line') {
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        } else if (tool === 'arrow') {
            const headLen = Math.max(15, this.size * 4);
            const angle   = Math.atan2(y2 - y1, x2 - x1);
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            // Arrowhead — two lines at ±30° from reverse angle
            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(
                x2 - headLen * Math.cos(angle - Math.PI / 6),
                y2 - headLen * Math.sin(angle - Math.PI / 6)
            );
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(
                x2 - headLen * Math.cos(angle + Math.PI / 6),
                y2 - headLen * Math.sin(angle + Math.PI / 6)
            );
            this.ctx.stroke();
        } else if (tool === 'square') {
            this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
    }

    _erase(x, y) {
        const r = this.size * 4;
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
    }

    _startText(x, y) {
        if (this.textInput) this.textInput.remove();
        const fontSize = Math.max(14, this.size * 4);
        const input = document.createElement('input');
        input.type = 'text';
        input.style.cssText = `
            position: fixed; left: ${x}px; top: ${y}px;
            background: transparent; border: none;
            outline: 1px dashed rgba(255,255,255,0.4);
            color: ${this.color}; font-size: ${fontSize}px;
            font-family: sans-serif; min-width: 120px;
            z-index: 1000; padding: 2px 4px;
        `;
        document.body.appendChild(input);
        this.textInput = input;
        // Defer focus to next frame — prevents the canvas mousedown from immediately
        // blurring the input before the user has a chance to type.
        requestAnimationFrame(() => input.focus());

        const commit = () => {
            if (!input.isConnected) return;
            const val = input.value.trim();
            if (val) {
                this.ctx.font      = `${fontSize}px sans-serif`;
                this.ctx.fillStyle = this.color;
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillText(val, x, y + fontSize);
            }
            input.remove();
            if (this.textInput === input) this.textInput = null;
        };
        input.addEventListener('keydown', e => {
            e.stopPropagation(); // prevent arrows/space from triggering slide navigation
            if (e.key === 'Enter')  { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); input.remove(); if (this.textInput === input) this.textInput = null; }
        });
        // Delay blur listener so the canvas mousedown that spawned this input
        // doesn't fire an immediate blur and dismiss it before any typing.
        setTimeout(() => { input.addEventListener('blur', commit); }, 300);
    }
}

new AnnotationOverlay();
```

---

## Usage Guide

### Which enhancements to pick per style

| Style | Core | Custom Cursor | Particles | Tilt | Magnetic | Counter | Parallax | Annotation |
|-------|------|--------------|-----------|------|----------|---------|----------|------------|
| Bold Signal | ✅ | ✅ | — | ✅ | ✅ | — | — | ✅ |
| Dark Botanical | ✅ | ✅ | — | — | — | — | — | ✅ |
| Neon Cyber | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | ✅ |
| Terminal Green | ✅ | — | — | — | — | ✅ | — | ✅ |
| Swiss Modern | ✅ | — | — | — | — | ✅ | — | ✅ |
| Creative Voltage | ✅ | ✅ | — | ✅ | ✅ | — | — | ✅ |
| Paper & Ink | ✅ | — | — | — | — | — | ✅ | ✅ |
| Vintage Editorial | ✅ | — | — | — | — | — | ✅ | ✅ |
| Pastel Geometry | ✅ | — | — | ✅ | — | — | — | ✅ |
| Electric Studio | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | ✅ |

### Integration order

Always add in this order at the bottom of `<body>`, before `</body>`:

```html
<script>
    // 1. Core (always)
    class SlidePresentation { ... }
    new SlidePresentation();

    // 2. Optional enhancements (only if style calls for it)
    class CustomCursor { ... }
    new CustomCursor({ color: '#ffffff' });

    class ParticleSystem { ... }
    new ParticleSystem({ color: '#00ffcc' });

    // etc.
</script>
```
