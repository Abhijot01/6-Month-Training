import { getRecommendations } from "../services/recommendation.service.js";

export async function recommendHandler(req, res) {
  try {
    const { frame_id, motor_id, esc_id, battery_id, propeller_id } = req.body;

    // ✅ at least one input required
    if (!frame_id && !motor_id && !esc_id && !battery_id && !propeller_id) {
      return res.json({
        success: false,
        message: "At least one component is required"
      });
    }

    const result = await getRecommendations({
      frame_id,
      motor_id,
      esc_id,
      battery_id,
      propeller_id
    });

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}