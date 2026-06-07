import express from 'express';
import * as tf from '@tensorflow/tfjs';
import fs from 'fs';

const router = express.Router();

let model;

// 🔹 LOAD MODEL
async function loadModel() {
    if (model) return model;

    const saved = JSON.parse(fs.readFileSync('./ml/model.json'));

    model = await tf.loadLayersModel(tf.io.fromMemory({
        modelTopology: saved.modelTopology,
        weightSpecs: saved.weightSpecs,
        weightData: new Uint8Array(saved.weightData).buffer
    }));

    console.log('✅ Model loaded');
    return model;
}

// ✅ GET (for browser test)
router.get('/predict', (req, res) => {
    res.send('✅ Predict API is working. Use POST to get results.');
});

// 🔹 POST (actual AI prediction)
router.post('/predict', async (req, res) => {
    try {
        const {
            frame_size,
            motor_kv,
            esc_amp,
            prop_diameter,
            battery_cells
        } = req.body;

        const model = await loadModel();

        
        const fs = Number(frame_size) || 0;
        const kv = Number(motor_kv) || 0;
        const esc = Number(esc_amp) || 0;
        const prop = Number(prop_diameter) || 0;
        const batt = Number(battery_cells) || 0;

        const input = tf.tensor2d([[
    fs / 20,
    kv / 3000,
    esc / 100,
    prop / 20,
    batt / 10,

    (kv * prop) / 10000,
    esc / (kv || 1),
    prop / (fs || 1),

    kv / (fs || 1),
    (batt * kv) / 10000
]]);

        const prediction = model.predict(input);
        const score = (await prediction.data())[0];

        res.json({
            compatibility_score: (score * 100).toFixed(2) + '%',
            raw_score: score
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Prediction failed' });
    }
});

export default router;