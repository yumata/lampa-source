class NoiseEffect {
    constructor(name) {
        this.name = name;
        this.enabled = true;
    }

    update() {}

    draw() {}

    destroy() {}
}


class NoiseBandsEffect extends NoiseEffect {
    constructor(options = {}) {
        super('bands');

        this.count = options.count ?? 10;
        this.bands = [];
    }

    init(noise) {
        this.noise = noise;
        this.reset();
    }

    reset() {
        this.bands = [];

        for (let i = 0; i < this.count; i++) {
            this.bands.push(this.createBand());
        }
    }

    createBand() {
        const height = 5 + Math.random() * 35;

        return {
            y: Math.random() * this.noise.height,
            height,
            speed: (Math.random() - 0.5) * 1.2,
            strength: 0.25 + Math.random() * 1.1,
            life: 30 + Math.random() * 160
        };
    }

    update() {
        for (let i = 0; i < this.bands.length; i++) {
            const band = this.bands[i];

            band.y += band.speed;
            band.life--;

            if (
                band.life <= 0 ||
                band.y > this.noise.height ||
                band.y + band.height < 0
            ) {
                this.bands[i] = this.createBand();
            }
        }
    }

    getStrength(y) {
        let strength = 0;

        for (const band of this.bands) {
            if (y < band.y || y > band.y + band.height) {
                continue;
            }

            const center = band.y + band.height / 2;
            const distance = Math.abs(y - center);
            const fade = 1 - distance / (band.height / 2);

            strength += band.strength * Math.max(0, fade);
        }

        return Math.min(strength, 1.8);
    }

    destroy() {
        this.bands = [];
        this.noise = null;
    }
}


class HorizontalSmearEffect extends NoiseEffect {
    constructor(options = {}) {
        super('smear');

        this.minCount = options.minCount ?? 12;
        this.maxCount = options.maxCount ?? 35;
    }

    draw(noise) {
        const { ctx, canvas, width, height } = noise;

        const count =
            this.minCount +
            Math.floor(
                Math.random() *
                (this.maxCount - this.minCount + 1)
            );

        for (let i = 0; i < count; i++) {
            const y = Math.floor(Math.random() * height);
            const sliceHeight = 1 + Math.floor(Math.random() * 5);

            const sourceX = Math.floor(Math.random() * width);
            const sourceWidth =
                5 +
                Math.floor(
                    Math.random() *
                    Math.max(5, width - sourceX)
                );

            const destinationX =
                sourceX +
                Math.floor((Math.random() - 0.5) * 120);

            const destinationWidth =
                sourceWidth * (1.2 + Math.random() * 5);

            ctx.globalAlpha = 0.1 + Math.random() * 0.55;

            ctx.drawImage(
                canvas,
                sourceX,
                y,
                sourceWidth,
                sliceHeight,
                destinationX,
                y,
                destinationWidth,
                sliceHeight
            );
        }

        ctx.globalAlpha = 1;
    }
}


class DisplacedBandsEffect extends NoiseEffect {
    constructor(options = {}) {
        super('displacement');

        this.minCount = options.minCount ?? 3;
        this.maxCount = options.maxCount ?? 9;
        this.maxOffset = options.maxOffset ?? 90;
    }

    draw(noise) {
        const { ctx, canvas, width, height } = noise;

        const count =
            this.minCount +
            Math.floor(
                Math.random() *
                (this.maxCount - this.minCount + 1)
            );

        for (let i = 0; i < count; i++) {
            const y = Math.floor(Math.random() * height);
            const bandHeight =
                2 + Math.floor(Math.random() * 20);

            const offset =
                Math.floor(
                    (Math.random() - 0.5) *
                    this.maxOffset * 2
                );

            ctx.globalAlpha = 0.3 + Math.random() * 0.65;

            ctx.drawImage(
                canvas,
                0,
                y,
                width,
                bandHeight,
                offset,
                y,
                width,
                bandHeight
            );

            if (Math.random() < 0.55) {
                const color = Math.random();

                if (color < 0.33) {
                    ctx.fillStyle = 'rgba(0, 180, 255, 0.22)';
                }
                else if (color < 0.66) {
                    ctx.fillStyle = 'rgba(0, 255, 170, 0.18)';
                }
                else {
                    ctx.fillStyle = 'rgba(255, 30, 90, 0.16)';
                }

                ctx.fillRect(
                    0,
                    y,
                    width,
                    1 + Math.floor(Math.random() * 2)
                );
            }
        }

        ctx.globalAlpha = 1;
    }
}


class RandomLinesEffect extends NoiseEffect {
    constructor(options = {}) {
        super('lines');

        this.minCount = options.minCount ?? 8;
        this.maxCount = options.maxCount ?? 22;
    }

    draw(noise) {
        const { ctx, width, height } = noise;

        const count =
            this.minCount +
            Math.floor(
                Math.random() *
                (this.maxCount - this.minCount + 1)
            );

        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const lineWidth =
                20 + Math.random() * Math.max(20, width - x);

            if (Math.random() < 0.65) {
                const r = Math.floor(Math.random() * 90);
                const g = 90 + Math.floor(Math.random() * 165);
                const b = 100 + Math.floor(Math.random() * 155);
                const alpha = 0.06 + Math.random() * 0.3;

                ctx.fillStyle =
                    `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            else {
                ctx.fillStyle =
                    `rgba(255,255,255,${0.04 + Math.random() * 0.25})`;
            }

            ctx.fillRect(
                x,
                y,
                lineWidth,
                Math.random() < 0.85 ? 1 : 2
            );
        }
    }
}


class FrameJumpEffect extends NoiseEffect {
    constructor(options = {}) {
        super('jump');

        this.chance = options.chance ?? 0.07;
        this.maxX = options.maxX ?? 14;
        this.maxY = options.maxY ?? 5;
    }

    draw(noise) {
        if (Math.random() > this.chance) {
            return;
        }

        const { ctx, canvas } = noise;

        const offsetX =
            Math.floor((Math.random() - 0.5) * this.maxX * 2);

        const offsetY =
            Math.floor((Math.random() - 0.5) * this.maxY * 2);

        ctx.globalAlpha = 0.75;

        ctx.drawImage(
            canvas,
            offsetX,
            offsetY
        );

        ctx.globalAlpha = 1;
    }
}


class ScanlinesEffect extends NoiseEffect {
    constructor(options = {}) {
        super('scanlines');

        this.step = options.step ?? 3;
        this.alpha = options.alpha ?? 0.2;
    }

    draw(noise) {
        const { ctx, width, height } = noise;

        ctx.fillStyle = `rgba(0,0,0,${this.alpha})`;

        for (let y = 0; y < height; y += this.step) {
            ctx.fillRect(0, y, width, 1);
        }
    }
}


class VignetteEffect extends NoiseEffect {
    constructor(options = {}) {
        super('vignette');

        this.strength = options.strength ?? 0.7;
    }

    draw(noise) {
        const { ctx, width, height } = noise;

        const gradient = ctx.createRadialGradient(
            width / 2,
            height / 2,
            height * 0.12,
            width / 2,
            height / 2,
            width * 0.72
        );

        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.65, 'rgba(0,0,0,0.05)');
        gradient.addColorStop(
            1,
            `rgba(0,0,0,${this.strength})`
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
}


class FlickerEffect extends NoiseEffect {
    constructor(options = {}) {
        super('flicker');

        this.chance = options.chance ?? 0.2;
    }

    draw(noise) {
        if (Math.random() > this.chance) {
            return;
        }

        const { ctx, width, height } = noise;

        if (Math.random() < 0.5) {
            ctx.fillStyle =
                `rgba(255,255,255,${Math.random() * 0.035})`;
        }
        else {
            ctx.fillStyle =
                `rgba(0,0,0,${Math.random() * 0.1})`;
        }

        ctx.fillRect(0, 0, width, height);
    }
}


class Noise {
    constructor(canvas, options = {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(
                'Noise: первым аргументом должен быть canvas'
            );
        }

        this.canvas = canvas;

        this.ctx = canvas.getContext('2d', {
            alpha: false
        });

        if (!this.ctx) {
            throw new Error('Noise: Canvas 2D не поддерживается');
        }

        this.width = options.width ?? 480;
        this.height = options.height ?? 270;
        this.fps = options.fps ?? 25;

        this.baseBrightness = options.baseBrightness ?? 16;
        this.bandBrightness = options.bandBrightness ?? 145;
        this.trailAlpha = options.trailAlpha ?? 0.84;

        this.running = false;
        this.destroyed = false;
        this.animationId = null;
        this.lastFrameTime = 0;

        this._renderBound = this._render.bind(this);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx.imageSmoothingEnabled = false;

        this._createBuffer();

        this.effects = options.effects ?? [
            new NoiseBandsEffect(),
            new HorizontalSmearEffect(),
            new DisplacedBandsEffect(),
            new RandomLinesEffect(),
            new FrameJumpEffect(),
            new ScanlinesEffect(),
            new VignetteEffect(),
            new FlickerEffect()
        ];

        for (const effect of this.effects) {
            if (typeof effect.init === 'function') {
                effect.init(this);
            }
        }

        this.start();
    }

    _createBuffer() {
        this.noiseCanvas = document.createElement('canvas');

        this.noiseCanvas.width = this.width;
        this.noiseCanvas.height = this.height;

        this.noiseCtx = this.noiseCanvas.getContext('2d', {
            alpha: false
        });

        if (!this.noiseCtx) {
            throw new Error(
                'Noise: не удалось создать внутренний canvas'
            );
        }

        this.noiseImage = this.noiseCtx.createImageData(
            this.width,
            this.height
        );

        this.pixels = this.noiseImage.data;
    }

    getEffect(name) {
        return this.effects.find(
            effect => effect.name === name
        ) ?? null;
    }

    enable(name) {
        const effect = this.getEffect(name);

        if (effect) {
            effect.enabled = true;
        }

        return this;
    }

    disable(name) {
        const effect = this.getEffect(name);

        if (effect) {
            effect.enabled = false;
        }

        return this;
    }

    toggle(name, enabled) {
        const effect = this.getEffect(name);

        if (effect) {
            effect.enabled =
                enabled === undefined
                    ? !effect.enabled
                    : Boolean(enabled);
        }

        return this;
    }

    addEffect(effect) {
        if (!effect || typeof effect.draw !== 'function') {
            throw new TypeError(
                'Noise.addEffect: передан некорректный эффект'
            );
        }

        if (typeof effect.init === 'function') {
            effect.init(this);
        }

        this.effects.push(effect);

        return this;
    }

    removeEffect(name) {
        const index = this.effects.findIndex(
            effect => effect.name === name
        );

        if (index === -1) {
            return this;
        }

        const [effect] = this.effects.splice(index, 1);

        if (typeof effect.destroy === 'function') {
            effect.destroy();
        }

        return this;
    }

    start() {
        if (this.destroyed || this.running) {
            return this;
        }

        this.running = true;
        this.lastFrameTime = 0;

        this.animationId = requestAnimationFrame(
            this._renderBound
        );

        return this;
    }

    stop() {
        this.running = false;

        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        return this;
    }

    resize(width, height) {
        if (this.destroyed) {
            return this;
        }

        if (
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width <= 0 ||
            height <= 0
        ) {
            throw new TypeError(
                'Noise.resize: некорректный размер'
            );
        }

        this.width = Math.floor(width);
        this.height = Math.floor(height);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx.imageSmoothingEnabled = false;

        this._destroyBuffer();
        this._createBuffer();

        for (const effect of this.effects) {
            if (typeof effect.reset === 'function') {
                effect.reset();
            }
        }

        return this;
    }

    _getBandsEffect() {
        const effect = this.getEffect('bands');

        return effect?.enabled
            ? effect
            : null;
    }

    _generateNoise() {
        const bandsEffect = this._getBandsEffect();

        let index = 0;

        for (let y = 0; y < this.height; y++) {
            const bandStrength = bandsEffect
                ? bandsEffect.getStrength(y)
                : 0;

            const rowBrightness =
                Math.random() < 0.14
                    ? Math.random() * 0.9
                    : Math.random() * 0.12;

            for (let x = 0; x < this.width; x++) {
                let intensity =
                    Math.random() * this.baseBrightness +
                    bandStrength *
                        Math.random() *
                        this.bandBrightness +
                    rowBrightness * 65;

                const brightPixelChance =
                    0.025 + bandStrength * 0.11;

                if (Math.random() < brightPixelChance) {
                    intensity += 60 + Math.random() * 195;
                }

                const colorMode = Math.random();

                let r;
                let g;
                let b;

                if (colorMode < 0.24) {
                    r = intensity * (0.7 + Math.random() * 0.8);
                    g = intensity * (0.15 + Math.random() * 0.5);
                    b = intensity * (0.05 + Math.random() * 0.35);
                }
                else if (colorMode < 0.48) {
                    r = intensity * (0.05 + Math.random() * 0.35);
                    g = intensity * (0.55 + Math.random() * 0.8);
                    b = intensity * (0.45 + Math.random() * 0.8);
                }
                else if (colorMode < 0.72) {
                    r = intensity * (0.1 + Math.random() * 0.4);
                    g = intensity * (0.1 + Math.random() * 0.5);
                    b = intensity * (0.65 + Math.random() * 0.9);
                }
                else {
                    const gray =
                        intensity *
                        (0.55 + Math.random() * 0.55);

                    r = gray;
                    g = gray;
                    b = gray;
                }

                this.pixels[index] = Math.min(255, r);
                this.pixels[index + 1] = Math.min(255, g);
                this.pixels[index + 2] = Math.min(255, b);
                this.pixels[index + 3] = 255;

                index += 4;
            }
        }

        this.noiseCtx.putImageData(
            this.noiseImage,
            0,
            0
        );
    }

    _render(time) {
        if (!this.running || this.destroyed) {
            return;
        }

        this.animationId = requestAnimationFrame(
            this._renderBound
        );

        const frameDuration = 1000 / this.fps;

        if (time - this.lastFrameTime < frameDuration) {
            return;
        }

        this.lastFrameTime =
            time - ((time - this.lastFrameTime) % frameDuration);

        for (const effect of this.effects) {
            if (
                effect.enabled &&
                typeof effect.update === 'function'
            ) {
                effect.update(this);
            }
        }

        this._generateNoise();

        this.ctx.globalAlpha = this.trailAlpha;

        this.ctx.drawImage(
            this.noiseCanvas,
            0,
            0,
            this.width,
            this.height
        );

        this.ctx.globalAlpha = 1;

        for (const effect of this.effects) {
            if (
                effect.enabled &&
                effect.name !== 'bands' &&
                typeof effect.draw === 'function'
            ) {
                effect.draw(this);
            }
        }
    }

    _destroyBuffer() {
        if (this.noiseCanvas) {
            this.noiseCanvas.width = 0;
            this.noiseCanvas.height = 0;
        }

        this.noiseImage = null;
        this.pixels = null;
        this.noiseCtx = null;
        this.noiseCanvas = null;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.stop();

        for (const effect of this.effects) {
            if (typeof effect.destroy === 'function') {
                effect.destroy();
            }
        }

        this.effects.length = 0;

        if (this.ctx && this.canvas) {
            this.ctx.globalAlpha = 1;
            this.ctx.clearRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }

        this._destroyBuffer();

        this.ctx = null;
        this.canvas = null;
        this._renderBound = null;

        this.destroyed = true;
    }
}

export default Noise;