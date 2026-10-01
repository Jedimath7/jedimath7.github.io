(function (root) {
  'use strict';

  const Core = typeof module !== 'undefined' && module.exports
    ? require('./shared/scene-core.js')
    : root.Stereo;
  const PATCH = Object.freeze({ x: 2.2, y: 1.55 });
  const INITIAL = Object.freeze({ height: 0.75, tilt: -35, azimuth: 25 });
  const PRESETS = Object.freeze({
    contained: { height: 0, tilt: 0, azimuth: 25 },
    intersecting: INITIAL,
    parallel: { height: 0.75, tilt: 0, azimuth: 25 }
  });

  // Stereo.linePlane uses EPS only to absorb floating-point error, not to
  // visually snap a small nonzero tilt into parallelism.
  function derive({ height, tilt, azimuth }) {
    const h = Number(height);
    const t = Number(tilt) * Math.PI / 180;
    const a = Number(azimuth) * Math.PI / 180;
    const origin = [0, 0, h];
    const direction = [Math.cos(t) * Math.cos(a), Math.cos(t) * Math.sin(a), Math.sin(t)];
    const relation = Core.linePlane(origin, direction);
    const point = relation.point;
    const insidePatch = point !== null &&
      Math.abs(point[0]) <= PATCH.x && Math.abs(point[1]) <= PATCH.y;
    return { origin, direction, kind: relation.kind, point, insidePatch };
  }

  const api = { derive, PATCH, INITIAL, PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  const byId = id => document.getElementById(id);
  const canvas = byId('scene');
  const controls = {
    height: byId('height'), tilt: byId('tilt'), azimuth: byId('azimuth')
  };
  const buttons = Array.from(document.querySelectorAll('[data-preset]'));
  const plane = [
    [-PATCH.x, -PATCH.y, 0], [PATCH.x, -PATCH.y, 0],
    [PATCH.x, PATCH.y, 0], [-PATCH.x, PATCH.y, 0]
  ];
  const addScaled = (a, d, k) => Core.add(a, Core.mul(d, k));
  let state = derive(INITIAL);

  function draw(v) {
    v.clear();
    v.polygon(plane, '#568ed52b', '#8faecb');
    for (let i = -2; i <= 2; i++) {
      v.line([-PATCH.x, i * .6, 0], [PATCH.x, i * .6, 0], '#8aa9c350', 1);
      v.line([i * .8, -PATCH.y, 0], [i * .8, PATCH.y, 0], '#8aa9c350', 1);
    }
    v.label([-1.8, -1.15, 0], 'α', '#52769e', -15, 17);

    const { origin, direction, point, insidePatch } = state;
    // Keep a visible intersection connected to the drawn line, even at a patch corner.
    const reach = point && insidePatch ? Math.max(2.65, Core.norm(Core.add(point, Core.mul(origin, -1))) + .25) : 2.65;
    v.line(addScaled(origin, direction, -reach), addScaled(origin, direction, reach), '#7756c8', 3.5);
    v.point(origin, point && Math.hypot(...Core.add(origin, Core.mul(point, -1))) < 1e-9 ? 'A = P' : 'A', '#ca7656', 6);
    v.label(addScaled(origin, direction, 1.95), 'a', '#6845bc', 10, -9);
    if (point && insidePatch && Math.hypot(...Core.add(origin, Core.mul(point, -1))) >= 1e-9) {
      v.point(point, 'P', '#263f62', 6);
    }
  }

  const view = new Core.View(canvas, draw, { yaw: .45, pitch: .62, span: 6.25 });

  function sync() {
    state = derive({
      height: controls.height.value,
      tilt: controls.tilt.value,
      azimuth: controls.azimuth.value
    });
    byId('height-value').textContent = Number(controls.height.value).toFixed(2);
    byId('tilt-value').textContent = controls.tilt.value + '°';
    byId('azimuth-value').textContent = controls.azimuth.value + '°';
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.preset === state.kind));
    });
    const badge = byId('badge');
    const title = byId('status-title');
    const detail = byId('status-detail');
    if (state.kind === 'contained') {
      badge.textContent = 'a лежит в α';
      title.textContent = 'Прямая лежит в плоскости';
      detail.textContent = 'Каждая точка прямой a принадлежит α.';
    } else if (state.kind === 'parallel') {
      badge.textContent = 'a ∥ α';
      title.textContent = 'Прямая параллельна плоскости';
      detail.textContent = 'У прямой a и плоскости α нет общих точек.';
    } else {
      badge.textContent = 'a пересекает α';
      title.textContent = 'Прямая пересекает плоскость';
      detail.textContent = state.insidePatch
        ? 'Единственная общая точка — P.'
        : 'Точка пересечения P находится за показанным фрагментом плоскости.';
    }
    view.draw(view);
  }

  function setParameters(parameters) {
    Object.entries(parameters).forEach(([name, value]) => { controls[name].value = value; });
    sync();
  }

  Object.values(controls).forEach(control => control.addEventListener('input', sync));
  buttons.forEach(button => button.addEventListener('click', () => setParameters(PRESETS[button.dataset.preset])));
  byId('reset-view').addEventListener('click', () => view.reset());
  byId('reset-all').addEventListener('click', () => { setParameters(INITIAL); view.reset(); });
  sync();
  view.resize();
})(typeof globalThis !== 'undefined' ? globalThis : this);
