/* Pannellum-compatible sphere <-> screen math (roll = 0, yaw convention matches
   Pannellum's hotspot projection: increasing yaw renders to the LEFT of screen).
   Formulas derived 1:1 from Pannellum's internal hotspot projection. */

const D = Math.PI / 180

export interface ProjectedPin {
  x: number
  y: number
  visible: boolean
}

export function projectPin(
  yawDeg: number,
  pitchDeg: number,
  camYawDeg: number,
  camPitchDeg: number,
  hfovDeg: number,
  w: number,
  h: number
): ProjectedPin {
  const p = pitchDeg * D
  const cp = camPitchDeg * D
  const dy = (yawDeg - camYawDeg) * D
  const f = Math.sin(p)
  const c = Math.cos(p)
  const e = Math.sin(cp)
  const d = Math.cos(cp)
  const g = Math.cos(dy)
  const l = Math.sin(dy)
  const zc = f * e + c * g * d
  if (zc <= 0 || w <= 0 || h <= 0) return { x: 0, y: 0, visible: false }
  const k = Math.tan((hfovDeg * D) / 2)
  const X = l * c
  const Y = f * d - c * g * e
  return {
    x: w / 2 - (w / (2 * k)) * (X / zc),
    y: h / 2 - (w / (2 * k)) * (Y / zc),
    visible: true
  }
}

export function unprojectPin(
  px: number,
  py: number,
  camYawDeg: number,
  camPitchDeg: number,
  hfovDeg: number,
  w: number,
  h: number
): { yaw: number; pitch: number } {
  if (w <= 0 || h <= 0) return { yaw: camYawDeg, pitch: camPitchDeg }
  const cp = camPitchDeg * D
  const k = Math.tan((hfovDeg * D) / 2)
  const a = (-(2 * k) * (px - w / 2)) / w
  const b = (-(2 * k) * (py - h / 2)) / w
  const Z = 1 / Math.sqrt(a * a + b * b + 1)
  const X = a * Z
  const Y = b * Z
  const sP = Y * Math.cos(cp) + Z * Math.sin(cp)
  const cT = Z * Math.cos(cp) - Y * Math.sin(cp)
  const pitch = Math.asin(Math.max(-1, Math.min(1, sP))) / D
  const cosP = Math.cos(pitch * D)
  let dy = 0
  if (Math.abs(cosP) > 1e-9) dy = Math.atan2(X / cosP, cT / cosP) / D
  let yaw = camYawDeg + dy
  while (yaw > 180) yaw -= 360
  while (yaw <= -180) yaw += 360
  return { yaw, pitch }
}

export function flatToYawPitch(xPct: number, yPct: number): { yaw: number; pitch: number } {
  return { yaw: (xPct / 100) * 360 - 180, pitch: (0.5 - yPct / 100) * 180 }
}

/* Push a screen point away from the center toward the edges/corners so newly
   placed pins never land dead-center on top of the photographed object.
   Applied to the click position BEFORE unprojecting to yaw/pitch. */
export function edgeOffset(px: number, py: number, w: number, h: number): { x: number; y: number } {
  const cx = w / 2
  const cy = h / 2
  let dx = px - cx
  let dy = py - cy
  const n = Math.hypot(dx, dy)
  const minR = 0.32 * Math.min(w, h)
  if (n < 1e-6) {
    dx = w * 0.18
    dy = h * 0.15
  } else if (n < minR) {
    const s = minR / n
    dx *= s
    dy *= s
  }
  let x = cx + dx
  let y = cy + dy
  const mx = w * 0.07
  const my = h * 0.07
  x = Math.min(Math.max(x, mx), w - mx)
  y = Math.min(Math.max(y, my), h - my)
  return { x, y }
}
