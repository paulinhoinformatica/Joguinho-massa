// SpriteRenderer para Nova Aurora - sprites em pixel art externa.
// Mantem a API original, incluindo onEvent, scaleOverride e a renderizacao espelhada.
export class SpriteRenderer {
  constructor(assets, animations) {
    this.assets = assets;
    this.animations = animations;
    this.warned = new Set();
  }

  animationName(entityId, requested) {
    const animations = this.assets.getConfig(entityId)?.animations || {};
    if (animations[requested]) return requested;
    // O estado do jogador e os nomes antigos no config nao eram identicos.
    const aliases = entityId === 'protagonist'
      ? { attack: 'melee', dash: 'dodge', hurt: 'damage', dead: 'death' }
      : {};
    return aliases[requested] || requested;
  }

  available(entityId, animation) {
    const key = this.animationName(entityId, animation);
    const def = this.assets.getConfig(entityId)?.animations?.[key];
    if (!def || def.enabled === false || def.invalid) return false;
    return Boolean((def.sheet && this.assets.get(def.sheet)) ||
      def.frames?.some(path => this.assets.get(path)));
  }

  draw(ctx, entityId, animation, target, dt = 0,
       { x = target.x, y = target.y, facing = null, scaleOverride = null,
         onEvent = () => {}, frameOverride = null } = {}) {
    const cfg = this.assets.getConfig(entityId);
    if (!cfg) return false;
    let key = this.animationName(entityId, animation);
    let def = cfg.animations?.[key];

    if (!def || def.enabled === false || def.invalid || !(def.sheet ? this.assets.get(def.sheet) :
        def.frames?.some(path => this.assets.get(path)))) {
      const message = `${entityId}.${animation}: sprite ausente; usando idle temporariamente.`;
      if (!this.warned.has(message)) {
        console.warn(message);
        this.warned.add(message);
      }
      if (key === 'idle' || !this.available(entityId, 'idle')) return false;
      key = 'idle';
      def = cfg.animations.idle;
    }

    const step = this.animations.play(target, key, def, dt, onEvent);
    if (!step) return false;
    if (Number.isInteger(frameOverride)) step.index = Math.max(0, Math.min((def.frames?.length || def.count || 1) - 1, frameOverride));
    const imagePath = def.frames?.[step.index] || def.sheet;
    const img = this.assets.get(imagePath);
    if (!img) return false;

    const fw = def.sheet ? (def.frameWidth || img.naturalWidth) : img.naturalWidth;
    const fh = def.sheet ? (def.frameHeight || img.naturalHeight) : img.naturalHeight;
    const columns = def.columns || Math.max(1, Math.floor(img.naturalWidth / fw));
    const sx = def.sheet ? (step.index % columns) * fw : 0;
    const sy = def.sheet ? Math.floor(step.index / columns) * fh : 0;

    const origin = def.origin || cfg.origin || { x: fw / 2, y: fh };
    const visual = cfg.visual || {};
    const scale = scaleOverride ?? def.scale ?? cfg.scale ?? 1;
    const direction = facing ?? target.facing ?? cfg.facing ?? 1;
    const ox = (visual.offsetX || 0) + (def.offsetX || 0);
    const oy = (visual.offsetY || 0) + (def.offsetY || 0);
    const dw = Math.round(fw * scale);
    const dh = Math.round(fh * scale);
    const dx = Math.round(x - origin.x * scale + ox * scale);
    const dy = Math.round(y - origin.y * scale + oy * scale);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const nativeDirection = def.nativeFacing ?? cfg.nativeFacing ?? 1;
    if (direction * nativeDirection < 0) {
      // Espelha ao redor do centro do retangulo de destino.
      ctx.translate(2 * dx + dw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, sx, sy, fw, fh, dx, dy, dw, dh);
    ctx.restore();
    return true;
  }
}
