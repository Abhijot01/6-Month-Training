import 'dotenv/config';
import * as tf from '@tensorflow/tfjs';
import mysql from 'mysql2/promise';
import fs from 'fs';

async function loadData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'uav_marketplace'
  });

  const [rows] = await connection.execute(`
    SELECT 
      frame_size,
      motor_kv,
      esc_amp,
      prop_diameter,
      battery_cells,
      is_valid
    FROM ml_training_dataset
  `);

  await connection.end();
  return rows;
}

function preprocess(rows) {
  const features = [];
  const labels = [];

  rows.forEach(r => {
    const frame = Number(r.frame_size) || 1;
    const kv = Number(r.motor_kv) || 0;
    const esc = Number(r.esc_amp) || 0;
    const prop = Number(r.prop_diameter) || 0;
    const batt = Number(r.battery_cells) || 3;

    features.push([
      frame / 20,
      kv / 2500,
      esc / 120,
      prop / 15,
      batt / 8,

      (kv * prop) / 15000,
      esc / (kv || 1),
      prop / (frame || 1),

      kv / (frame || 1),
      (batt * kv) / 15000,

      esc / 100,
      2 / 5,
      1000 / 2000,
      200 / 300
    ]);

    labels.push(Number(r.is_valid));
  });

  return {
    xs: tf.tensor2d(features, [features.length, 14]),
    ys: tf.tensor2d(labels, [labels.length, 1])
  };
}

async function train() {
  console.log('🚀 TRAINING STARTED');

  const data = await loadData();
  console.log(`Loaded ${data.length} rows`);

  const { xs, ys } = preprocess(data);

  const model = tf.sequential();

  model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [14] }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  await model.fit(xs, ys, {
    epochs: 30,
    batchSize: 32,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, acc=${(logs.accuracy || 0).toFixed(4)}`
        );
      }
    }
  });

  await model.save(tf.io.withSaveHandler(async (artifacts) => {
    const data = {
      modelTopology: artifacts.modelTopology,
      weightSpecs: artifacts.weightSpecs,
      weightData: Array.from(new Uint8Array(artifacts.weightData))
    };

    fs.writeFileSync('./ml/model.json', JSON.stringify(data));

    return { modelArtifactsInfo: { dateSaved: new Date() } };
  }));

  console.log("✅ MODEL SAVED");
}

train();