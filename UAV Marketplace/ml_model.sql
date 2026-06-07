TRUNCATE ml_training_dataset;

CREATE TABLE ml_training_dataset (
    id INT AUTO_INCREMENT PRIMARY KEY,

    frame_id INT,
    motor_id INT,
    esc_id INT,
    propeller_id INT,
    battery_id INT,

    frame_size INT,
    motor_kv INT,
    esc_amp INT,
    prop_diameter DECIMAL(5,2),
    battery_cells INT,

    is_valid TINYINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

show tables;
describe ml_training_dataset;
select count(*) from ml_training_dataset;
SELECT COUNT(*) FROM ml_training_dataset;

SELECT 
    is_valid,
    COUNT(*) 
FROM ml_training_dataset
GROUP BY is_valid;

SELECT * 
FROM ml_training_dataset
WHERE is_valid = 0
LIMIT 100;


DELETE FROM ml_training_dataset;

INSERT INTO ml_training_dataset (
    frame_id, motor_id, esc_id, propeller_id, battery_id,
    frame_size, motor_kv, esc_amp, prop_diameter, battery_cells,
    is_valid
)
SELECT 
    ub.frame_id,
    ub.motor_id,
    ub.esc_id,
    ub.propeller_id,
    ub.battery_id,

    CAST(f.size_inch AS UNSIGNED),
    m.kv_rating,
    e.continuous_current_a,
    p.diameter_in,
    b.cell_count,

    1
FROM uav_build_compatibility ub
JOIN frames f ON ub.frame_id = f.frame_id
JOIN motors m ON ub.motor_id = m.motor_id
JOIN esc e ON ub.esc_id = e.esc_id
JOIN propellers p ON ub.propeller_id = p.propeller_id
JOIN batteries b ON ub.battery_id = b.battery_id

WHERE ub.compatibility_status = 'compatible'
AND f.size_inch REGEXP '^[0-9]+$'
AND m.kv_rating IS NOT NULL
AND p.diameter_in IS NOT NULL
AND e.continuous_current_a IS NOT NULL
AND b.cell_count IS NOT NULL;
 
 
 SELECT frame_size, motor_kv, esc_amp, prop_diameter, battery_cells
FROM ml_training_dataset
LIMIT 10;


INSERT INTO ml_training_dataset (
    frame_id, motor_id, esc_id, propeller_id, battery_id,
    frame_size, motor_kv, esc_amp, prop_diameter, battery_cells,
    is_valid
)
SELECT 
    ub.frame_id,
    ub.motor_id,
    ub.esc_id,
    ub.propeller_id,
    ub.battery_id,

    CAST(f.size_inch AS UNSIGNED),
    m.kv_rating,
    e.continuous_current_a,
    p.diameter_in,
    b.cell_count,

    0
FROM uav_build_compatibility ub
JOIN frames f ON ub.frame_id = f.frame_id
JOIN motors m ON ub.motor_id = m.motor_id
JOIN esc e ON ub.esc_id = e.esc_id
JOIN propellers p ON ub.propeller_id = p.propeller_id
JOIN batteries b ON ub.battery_id = b.battery_id

WHERE 
    f.size_inch REGEXP '^[0-9]+$'   -- ✅ FIX ADDED

AND (
    p.diameter_in > CAST(f.size_inch AS UNSIGNED) * 1.2

    OR (m.kv_rating > 1800 AND p.diameter_in > 6)

    OR (m.kv_rating < 800 AND p.diameter_in < 4)

    OR e.continuous_current_a < (m.max_current_a * 0.7)

    OR b.cell_count > 6

    OR b.cell_count < 3
)
LIMIT 1000;



SELECT is_valid, COUNT(*) 
FROM ml_training_dataset 
GROUP BY is_valid;