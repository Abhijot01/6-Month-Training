CREATE TABLE IF NOT EXISTS esc_motor_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,

    esc_id INT NOT NULL,
    motor_id INT NOT NULL,

    compatibility_level VARCHAR(50),
    recommended_use VARCHAR(150),

    UNIQUE KEY unique_pair (esc_id, motor_id),

    CONSTRAINT fk_em_esc
        FOREIGN KEY (esc_id)
        REFERENCES esc(esc_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_em_motor
        FOREIGN KEY (motor_id)
        REFERENCES motors(motor_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS esc_motor_csv_staging;

CREATE TABLE esc_motor_csv_staging (
    ESCCode VARCHAR(20),
    MotorCode VARCHAR(20),
    CompatibilityLevel VARCHAR(50),
    RecommendedUse VARCHAR(150)
);

TRUNCATE esc_motor_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/esc_motor_compatibility.csv'
INTO TABLE esc_motor_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4
)
SET
    ESCCode = TRIM(@c1),
    MotorCode = TRIM(@c2),
    CompatibilityLevel = TRIM(@c3),
    RecommendedUse = TRIM(@c4);
    
DROP PROCEDURE IF EXISTS sp_import_esc_motor_compatibility;
DELIMITER $$

CREATE PROCEDURE sp_import_esc_motor_compatibility()
BEGIN

    INSERT INTO esc_motor_compatibility (
        esc_id,
        motor_id,
        compatibility_level,
        recommended_use
    )
    SELECT
        e.esc_id,
        m.motor_id,
        s.CompatibilityLevel,
        s.RecommendedUse

    FROM esc_motor_csv_staging s

    INNER JOIN esc e
        ON e.esc_code = TRIM(s.ESCCode)

    INNER JOIN motors m
        ON m.motor_code = TRIM(s.MotorCode)

    WHERE s.ESCCode IS NOT NULL
      AND s.MotorCode IS NOT NULL

    ON DUPLICATE KEY UPDATE
        compatibility_level = VALUES(compatibility_level),
        recommended_use = VALUES(recommended_use);

    TRUNCATE esc_motor_csv_staging;

END$$
DELIMITER ;

CALL sp_import_esc_motor_compatibility();

CREATE INDEX idx_em_esc ON esc_motor_compatibility(esc_id);
CREATE INDEX idx_em_motor ON esc_motor_compatibility(motor_id);


SELECT *
FROM esc_motor_csv_staging s
LEFT JOIN esc e ON e.esc_code = s.ESCCode
LEFT JOIN motors m ON m.motor_code = s.MotorCode
WHERE e.esc_id IS NULL OR m.motor_id IS NULL;

SELECT COUNT(*) FROM esc_motor_compatibility;

SELECT
    e.esc_code,
    m.motor_code,
    c.compatibility_level,
    c.recommended_use
FROM esc_motor_compatibility c
JOIN esc e ON c.esc_id = e.esc_id
JOIN motors m ON c.motor_id = m.motor_id
LIMIT 10;