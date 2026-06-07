CREATE TABLE IF NOT EXISTS motor_prop_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,

    motor_id INT NOT NULL,
    propeller_id INT NOT NULL,

    compatibility_level VARCHAR(50),   -- Safe / Recommended / Performance
    recommended_use VARCHAR(150),

    UNIQUE KEY unique_pair (motor_id, propeller_id),

    CONSTRAINT fk_mp_motor
        FOREIGN KEY (motor_id)
        REFERENCES motors(motor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mp_prop
        FOREIGN KEY (propeller_id)
        REFERENCES propellers(propeller_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS motor_prop_csv_staging;

CREATE TABLE motor_prop_csv_staging (
    MotorCode VARCHAR(20),
    PropCode VARCHAR(20),
    CompatibilityLevel VARCHAR(50),
    RecommendedUse VARCHAR(150)
);

TRUNCATE motor_prop_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/motor_prop_compatibility.csv'
INTO TABLE motor_prop_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4
)
SET
    MotorCode = TRIM(@c1),
    PropCode = TRIM(@c2),
    CompatibilityLevel = TRIM(@c3),
    RecommendedUse = TRIM(@c4);
    
DROP PROCEDURE IF EXISTS sp_import_motor_prop_compatibility;
DELIMITER $$

CREATE PROCEDURE sp_import_motor_prop_compatibility()
BEGIN

    INSERT INTO motor_prop_compatibility (
        motor_id,
        propeller_id,
        compatibility_level,
        recommended_use
    )
    SELECT
        m.motor_id,
        p.propeller_id,
        s.CompatibilityLevel,
        s.RecommendedUse

    FROM motor_prop_csv_staging s

    INNER JOIN motors m
        ON m.motor_code = TRIM(s.MotorCode)

    INNER JOIN propellers p
        ON p.prop_code = TRIM(s.PropCode)

    WHERE s.MotorCode IS NOT NULL
      AND s.PropCode IS NOT NULL

    ON DUPLICATE KEY UPDATE
        compatibility_level = VALUES(compatibility_level),
        recommended_use = VALUES(recommended_use);

    TRUNCATE motor_prop_csv_staging;

END$$
DELIMITER ;

CALL sp_import_motor_prop_compatibility();

CREATE INDEX idx_mp_motor
ON motor_prop_compatibility(motor_id);

CREATE INDEX idx_mp_prop
ON motor_prop_compatibility(propeller_id);

SELECT COUNT(*) FROM motor_prop_compatibility;

SELECT
    m.motor_code,
    p.prop_code,
    c.compatibility_level,
    c.recommended_use
FROM motor_prop_compatibility c
JOIN motors m ON c.motor_id = m.motor_id
JOIN propellers p ON c.propeller_id = p.propeller_id
LIMIT 10;

DESCRIBE propellers;