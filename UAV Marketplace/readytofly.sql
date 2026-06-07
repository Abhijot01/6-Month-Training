USE uav_marketplace;

CREATE TABLE rtf_uav (
    rtf_id INT AUTO_INCREMENT PRIMARY KEY,

    manufacturer_id INT NOT NULL,

    category VARCHAR(100),            -- Kits & RTF
    sub_category VARCHAR(100),        -- FPV RTF, Industrial RTF
    drone_type VARCHAR(100),          -- Freestyle FPV, Survey UAV
    build_level VARCHAR(50),          -- RTF / Kit

    frame_size VARCHAR(50),           -- 5, 7, 10, Custom
    wheelbase VARCHAR(50),
    motor_spec VARCHAR(100),
    propeller_spec VARCHAR(100),
    battery_spec VARCHAR(100),
    flight_controller VARCHAR(100),
    firmware VARCHAR(100),
    payload_support VARCHAR(150),

    max_takeoff_kg VARCHAR(20),       -- keep VARCHAR (1.2, 3.5, 15)
    intended_use VARCHAR(150),

    CONSTRAINT fk_rtf_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS rtf_csv_staging;

CREATE TABLE rtf_csv_staging (
    DroneID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(100),
    SubCategory VARCHAR(100),
    DroneType VARCHAR(100),
    BuildLevel VARCHAR(50),
    FrameSize_Inch VARCHAR(50),
    Wheelbase_mm VARCHAR(50),
    MotorSize VARCHAR(100),
    PropellerSize VARCHAR(100),
    BatterySpec VARCHAR(100),
    FlightController VARCHAR(100),
    Firmware VARCHAR(100),
    PayloadSupport VARCHAR(150),
    MaxTakeoffWeight_kg VARCHAR(20),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;


TRUNCATE rtf_csv_staging;


LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Ready to Fly.csv'
INTO TABLE rtf_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6, @c7, @c8,
    @c9, @c10, @c11, @c12, @c13, @c14, @c15, @c16,
    @ignore_extra
)
SET
    DroneID              = NULLIF(TRIM(@c1), ''),
    Brand                = NULLIF(TRIM(@c2), ''),
    Category             = NULLIF(TRIM(@c3), ''),
    SubCategory          = NULLIF(TRIM(@c4), ''),
    DroneType            = NULLIF(TRIM(@c5), ''),
    BuildLevel           = NULLIF(TRIM(@c6), ''),
    FrameSize_Inch       = NULLIF(TRIM(@c7), ''),
    Wheelbase_mm         = NULLIF(TRIM(@c8), ''),
    MotorSize            = NULLIF(TRIM(@c9), ''),
    PropellerSize        = NULLIF(TRIM(@c10), ''),
    BatterySpec          = NULLIF(TRIM(@c11), ''),
    FlightController     = NULLIF(TRIM(@c12), ''),
    Firmware             = NULLIF(TRIM(@c13), ''),
    PayloadSupport       = NULLIF(TRIM(@c14), ''),
    MaxTakeoffWeight_kg  = NULLIF(TRIM(@c15), ''),
    IntendedUse          = NULLIF(TRIM(@c16), '');



DROP PROCEDURE IF EXISTS sp_import_rtf_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_rtf_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_brand VARCHAR(100);
    DECLARE v_cat VARCHAR(100);
    DECLARE v_subcat VARCHAR(100);
    DECLARE v_type VARCHAR(100);
    DECLARE v_level VARCHAR(50);
    DECLARE v_frame VARCHAR(50);
    DECLARE v_wheel VARCHAR(50);
    DECLARE v_motor VARCHAR(100);
    DECLARE v_prop VARCHAR(100);
    DECLARE v_batt VARCHAR(100);
    DECLARE v_fc VARCHAR(100);
    DECLARE v_fw VARCHAR(100);
    DECLARE v_payload VARCHAR(150);
    DECLARE v_mtow VARCHAR(20);
    DECLARE v_use VARCHAR(150);

    DECLARE cur CURSOR FOR
        SELECT
            Brand,
            Category,
            SubCategory,
            DroneType,
            BuildLevel,
            FrameSize_Inch,
            Wheelbase_mm,
            MotorSize,
            PropellerSize,
            BatterySpec,
            FlightController,
            Firmware,
            PayloadSupport,
            MaxTakeoffWeight_kg,
            IntendedUse
        FROM rtf_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_brand, v_cat, v_subcat, v_type, v_level,
            v_frame, v_wheel, v_motor, v_prop, v_batt,
            v_fc, v_fw, v_payload, v_mtow, v_use;

        IF done THEN
            LEAVE read_loop;
        END IF;

        INSERT IGNORE INTO manufacturers (name)
        VALUES (TRIM(v_brand));

        INSERT INTO rtf_uav (
            manufacturer_id,
            category,
            sub_category,
            drone_type,
            build_level,
            frame_size,
            wheelbase,
            motor_spec,
            propeller_spec,
            battery_spec,
            flight_controller,
            firmware,
            payload_support,
            max_takeoff_kg,
            intended_use
        )
        SELECT
            m.manufacturer_id,
            v_cat,
            v_subcat,
            v_type,
            v_level,
            v_frame,
            v_wheel,
            v_motor,
            v_prop,
            v_batt,
            v_fc,
            v_fw,
            v_payload,
            v_mtow,
            v_use
        FROM manufacturers m
        WHERE m.name = v_brand;

    END LOOP;

    CLOSE cur;
END$$
DELIMITER ;


CALL sp_import_rtf_csv();

SELECT
    m.name,
    r.drone_type,
    r.build_level,
    r.frame_size,
    r.wheelbase,
    r.motor_spec,
    r.propeller_spec,
    r.battery_spec,
    r.flight_controller,
    r.max_takeoff_kg,
    r.intended_use
FROM rtf_uav r
JOIN manufacturers m
  ON m.manufacturer_id = r.manufacturer_id
ORDER BY r.rtf_id
LIMIT 10;


SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE rtf_uav;
TRUNCATE rtf_csv_staging;

SET FOREIGN_KEY_CHECKS = 1;

CREATE INDEX idx_rtf_manufacturer
    ON rtf_uav(manufacturer_id);

CREATE INDEX idx_rtf_drone_type
    ON rtf_uav(drone_type);

CREATE INDEX idx_rtf_use
    ON rtf_uav(intended_use);

ALTER TABLE rtf_uav
DROP FOREIGN KEY fk_rtf_manufacturer;

SELECT COUNT(*) AS orphan_rows

FROM rtf_uav r

LEFT JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE rtf_uav
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE rtf_uav

ADD CONSTRAINT fk_rtf_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);
