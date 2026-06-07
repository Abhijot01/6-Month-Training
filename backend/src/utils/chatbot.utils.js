export function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/gi, "").trim();
}

/* ---------- INTENT ---------- */
export function detectIntent(message) {
  const msg = normalizeText(message);

  if (msg.includes("why") || msg.includes("how")) return "theory";
  if (msg.includes("best") || msg.includes("recommend")) return "recommendation";
  if (msg.includes("compatible")) return "compatibility";
  if (msg.includes("problem") || msg.includes("issue")) return "troubleshoot";

  return "general";
}

/* ---------- BUILD REQUEST ---------- */
export function isBuildRequest(message) {
  const msg = message.toLowerCase();

  return (
    msg.includes("build") ||
    msg.includes("setup") ||
    msg.includes("recommend drone") ||
    msg.includes("suggest build")
  );
}

/* ---------- MATCH KNOWLEDGE ---------- */
export function matchKnowledge(message, knowledgeBase) {
  const msg = message.toLowerCase();

  for (const item of knowledgeBase) {
    for (const keyword of item.keywords) {
      if (msg.includes(keyword)) {
        return item;
      }
    }
  }

  return null;
}

/* ---------- FORMAT ---------- */
export function formatResponse(item) {
  const type = item.response.type || "paragraph";

  // Always ensure readable output
  return {
    type,
    short: item.response.short || null,

    detailed:
      item.response.detailed ||
      (item.response.bullets
        ? "Here’s what you need to know:"
        : null),

    bullets: item.response.bullets || []
  };
}

/* ---------- RULE ENGINE ---------- */
export function applyDroneRules(context) {
  if (!context) return [];

  const issues = [];

  if (context.motor_current && context.esc_current) {
    if (context.esc_current < context.motor_current) {
      issues.push("ESC current is lower than motor requirement");
    }
  }

  if (context.prop_size && context.motor_kv) {
    if (context.prop_size > 6 && context.motor_kv > 2400) {
      issues.push("Large prop with high KV is inefficient");
    }
  }

  return issues;
}