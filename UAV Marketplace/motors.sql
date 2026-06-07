USE uav_marketplace;

CREATE TABLE motors (
    motor_id INT AUTO_INCREMENT PRIMARY KEY,

    motor_code VARCHAR(20) NOT NULL UNIQUE,     -- MTR-0001
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),                  -- FPV Motors, Industrial UAV Motors
    motor_type VARCHAR(100),                    -- Brushless Outrunner
    kv_rating INT,
    max_current_a INT,
    max_power_w INT,
    shaft_diameter VARCHAR(20),
    mount_pattern VARCHAR(50),
    recommended_prop_size VARCHAR(50),
    compatible_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_motors_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;


CREATE TABLE motor_csv_staging (
    MotorID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    MotorType VARCHAR(100),
    KV_Rating VARCHAR(20),
    MaxCurrent VARCHAR(20),
    MaxPower VARCHAR(20),
    ShaftDiam VARCHAR(20),
    MountPattern VARCHAR(50),
    RecommendedPropSize VARCHAR(50),
    CompatibleDroneType VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

TRUNCATE motor_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Motors.csv'
INTO TABLE motor_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5,
    @c6, @c7, @c8, @c9, @c10,
    @c11, @c12, @c13,
    @ignore_extra
)
SET
    MotorID               = NULLIF(TRIM(@c1), ''),
    Brand                 = NULLIF(TRIM(@c2), ''),
    Category              = NULLIF(TRIM(@c3), ''),
    SubCategory            = NULLIF(TRIM(@c4), ''),
    MotorType             = NULLIF(TRIM(@c5), ''),
    KV_Rating             = NULLIF(TRIM(@c6), ''),
    MaxCurrent             = NULLIF(TRIM(@c7), ''),
    MaxPower               = NULLIF(TRIM(@c8), ''),
    ShaftDiam              = NULLIF(TRIM(@c9), ''),
    MountPattern           = NULLIF(TRIM(@c10), ''),
    RecommendedPropSize    = NULLIF(TRIM(@c11), ''),
    CompatibleDroneType    = NULLIF(TRIM(@c12), ''),
    IntendedUse            = NULLIF(TRIM(@c13), '');


DROP PROCEDURE IF EXISTS sp_import_motors_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_motors_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_code VARCHAR(20);
    DECLARE v_brand VARCHAR(100);
    DECLARE v_subcat VARCHAR(100);
    DECLARE v_type VARCHAR(100);
    DECLARE v_kv VARCHAR(20);
    DECLARE v_current VARCHAR(20);
    DECLARE v_power VARCHAR(20);
    DECLARE v_shaft VARCHAR(20);
    DECLARE v_mount VARCHAR(50);
    DECLARE v_prop VARCHAR(50);
    DECLARE v_compat VARCHAR(100);
    DECLARE v_use VARCHAR(150);

    DECLARE cur CURSOR FOR
        SELECT
            MotorID,
            Brand,
            SubCategory,
            MotorType,
            KV_Rating,
            MaxCurrent,
            MaxPower,
            ShaftDiam,
            MountPattern,
            RecommendedPropSize,
            CompatibleDroneType,
            IntendedUse
        FROM motor_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_code, v_brand, v_subcat, v_type,
            v_kv, v_current, v_power,
            v_shaft, v_mount, v_prop,
            v_compat, v_use;

        IF done THEN
            LEAVE read_loop;
        END IF;

        INSERT IGNORE INTO manufacturers (name)
        VALUES (TRIM(v_brand));

        INSERT IGNORE INTO motors (
            motor_code,
            manufacturer_id,
            sub_category,
            motor_type,
            kv_rating,
            max_current_a,
            max_power_w,
            shaft_diameter,
            mount_pattern,
            recommended_prop_size,
            compatible_drone_type,
            intended_use
        )
        SELECT
            v_code,
            m.manufacturer_id,
            v_subcat,
            v_type,
            NULLIF(v_kv, ''),
            NULLIF(v_current, ''),
            NULLIF(v_power, ''),
            v_shaft,
            v_mount,
            v_prop,
            v_compat,
            v_use
        FROM manufacturers m
        WHERE m.name = v_brand;

    END LOOP;

    CLOSE cur;
    TRUNCATE motor_csv_staging;
END$$
DELIMITER ;


CALL sp_import_motors_csv();

SELECT
    m.motor_code,
    mf.name AS manufacturer,
    m.kv_rating,
    m.shaft_diameter,
    m.mount_pattern,
    m.recommended_prop_size,
    m.compatible_drone_type,
    m.intended_use
FROM motors m
JOIN manufacturers mf
  ON mf.manufacturer_id = m.manufacturer_id
ORDER BY m.motor_id
LIMIT 10;


CREATE INDEX idx_motors_manufacturer
    ON motors(manufacturer_id);

CREATE INDEX idx_motors_kv
    ON motors(kv_rating);

CREATE INDEX idx_motors_prop
    ON motors(recommended_prop_size);

SELECT DISTINCT m.manufacturer_name
FROM motors mo
JOIN manufacturers m
  ON mo.manufacturer_id = m.manufacturer_id
ORDER BY m.manufacturer_name;

SELECT COUNT(*) AS military_contamination_count
FROM motors mo
JOIN manufacturers m
  ON mo.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_name IN (
    'Northrop Grumman',
    'DRN-0033',
    'Pulse',
    'Athlon Avia',
    'Omnibus',
    'Izhmash Unmanned Systems',
    'Ukrainian Industry'
);