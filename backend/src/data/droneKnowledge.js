export const droneKnowledge = {
  motor: {
    kv: {
      explanation: "KV defines motor speed per volt.",
      rules: [
        "High KV motors → small props",
        "Low KV motors → large props",
        "KV must match battery voltage"
      ]
    },

    selection: {
      explanation: "Motor selection depends on frame size and prop.",
      rules: [
        "5 inch drone → 2207 1700–2400KV",
        "7 inch drone → 1300–1800KV",
        "Check thrust-to-weight ratio"
      ]
    }
  },

  propeller: {
    explanation: "Propellers generate thrust.",
    rules: [
      "Larger prop → more thrust",
      "Higher pitch → more speed",
      "Match with motor KV"
    ]
  },

  battery: {
    explanation: "Battery determines power and flight time.",
    rules: [
      "Higher S → more voltage",
      "mAh → flight time",
      "C rating → discharge capability"
    ]
  },

  troubleshooting: {
    vibration: {
      explanation: "Drone vibration is usually mechanical or tuning issue.",
      steps: [
        "Check propellers",
        "Check motors",
        "Tighten frame",
        "Tune PID",
        "Check FC mounting"
      ]
    }
  },

  builds: {
    "5inch": {
      frame: "5-inch carbon frame",
      motor: "2207 1800–2400KV",
      esc: "30–40A 4-in-1 ESC",
      battery: "4S/6S 1300–1500mAh",
      prop: "5-inch tri-blade"
    }
  }
};