/* =========================
   KV RANGE BASED ON FRAME SIZE
========================= */
function getKVRange(frameSize) {
  if (!frameSize) return { min: 1500, max: 3000 }; // fallback

  if (frameSize <= 3) {
    return { min: 3000, max: 5000 };
  }

  if (frameSize <= 5) {
    return { min: 1800, max: 2600 };
  }

  if (frameSize <= 7) {
    return { min: 1200, max: 1800 };
  }

  // large frames (cinelifter, long range)
  return { min: 800, max: 1400 };
}

/* =========================
   BATTERY RANGE BASED ON KV
========================= */
function getBatteryRange(kv) {
  if (!kv) return { min: 3, max: 6 }; // fallback

  if (kv > 2500) {
    return { min: 3, max: 4 };
  }

  if (kv >= 1800) {
    return { min: 4, max: 6 };
  }

  return { min: 6, max: 8 };
}

/* =========================
   ESTIMATE MOTOR CURRENT
========================= */
function estimateMotorCurrent(kv, propDiameter) {
  if (!kv || !propDiameter) return 20; // safe fallback

  // Simple approximation formula
  let current = (kv * propDiameter) / 400;

  // Clamp to realistic drone ranges
  if (current < 10) current = 10;
  if (current > 80) current = 80;

  return Math.round(current);
}

/* =========================
   OPTIONAL: PROP SIZE SAFETY CHECK
========================= */
function isPropCompatibleWithFrame(propDiameter, frameSize) {
  if (!propDiameter || !frameSize) return true;

  return propDiameter <= frameSize;
}

/* =========================
   OPTIONAL: KV vs PROP MATCH
========================= */
function isKVCompatibleWithProp(kv, propDiameter) {
  if (!kv || !propDiameter) return true;

  // crude logic for now (can improve later)
  if (propDiameter <= 5 && kv >= 1800) return true;
  if (propDiameter > 5 && kv <= 2000) return true;

  return false;
}

/* =========================
   EXPORTS
========================= */
export {
  getKVRange,
  getBatteryRange,
  estimateMotorCurrent,
  isPropCompatibleWithFrame,
  isKVCompatibleWithProp
};