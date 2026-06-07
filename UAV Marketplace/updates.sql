USE drone_forensics;
INSERT INTO drone_forensics.manufacturers (manufacturer_name, sector)
SELECT DISTINCT name, 'Commercial'
FROM uav_marketplace.manufacturers
WHERE name NOT IN (
    SELECT manufacturer_name
    FROM drone_forensics.manufacturers
);

SELECT COUNT(*) FROM manufacturers;

SELECT * 
FROM manufacturers
ORDER BY manufacturer_id DESC
LIMIT 20;


RENAME TABLE 
uav_marketplace.batteries 
TO 
drone_forensics.batteries;
SHOW TABLES;

USE uav_marketplace;
SHOW TABLES;

RENAME TABLE 
uav_marketplace.cameras TO drone_forensics.cameras,
uav_marketplace.chargers TO drone_forensics.chargers,
uav_marketplace.esc TO drone_forensics.esc,
uav_marketplace.firmware TO drone_forensics.firmware,
uav_marketplace.flight_controllers TO drone_forensics.flight_controllers,
uav_marketplace.frames TO drone_forensics.frames,
uav_marketplace.gps_modules TO drone_forensics.gps_modules,
uav_marketplace.motors TO drone_forensics.motors,
uav_marketplace.propellers TO drone_forensics.propellers,
uav_marketplace.radios_receivers TO drone_forensics.radios_receivers,
uav_marketplace.rtf_uav TO drone_forensics.rtf_uav,
uav_marketplace.software TO drone_forensics.software,
uav_marketplace.video_transmitters TO drone_forensics.video_transmitters;

RENAME TABLE
uav_marketplace.esc_motor_compatibility 
TO drone_forensics.esc_motor_compatibility,

uav_marketplace.frame_prop_compatibility 
TO drone_forensics.frame_prop_compatibility,

uav_marketplace.motor_prop_compatibility 
TO drone_forensics.motor_prop_compatibility,

uav_marketplace.uav_build_compatibility 
TO drone_forensics.uav_build_compatibility;

USE drone_forensics;
SHOW TABLES;

RENAME TABLE
uav_marketplace.battery_csv_staging TO drone_forensics.battery_csv_staging,
uav_marketplace.camera_csv_staging TO drone_forensics.camera_csv_staging,
uav_marketplace.charger_csv_staging TO drone_forensics.charger_csv_staging,
uav_marketplace.esc_csv_staging TO drone_forensics.esc_csv_staging,
uav_marketplace.esc_motor_csv_staging TO drone_forensics.esc_motor_csv_staging,
uav_marketplace.firmware_csv_staging TO drone_forensics.firmware_csv_staging,
uav_marketplace.flight_controller_csv_staging TO drone_forensics.flight_controller_csv_staging,
uav_marketplace.frame_csv_staging TO drone_forensics.frame_csv_staging,
uav_marketplace.frame_prop_csv_staging TO drone_forensics.frame_prop_csv_staging,
uav_marketplace.gps_csv_staging TO drone_forensics.gps_csv_staging,
uav_marketplace.motor_csv_staging TO drone_forensics.motor_csv_staging,
uav_marketplace.motor_prop_csv_staging TO drone_forensics.motor_prop_csv_staging,
uav_marketplace.propeller_csv_staging TO drone_forensics.propeller_csv_staging,
uav_marketplace.radio_csv_staging TO drone_forensics.radio_csv_staging,
uav_marketplace.rtf_csv_staging TO drone_forensics.rtf_csv_staging,
uav_marketplace.software_csv_staging TO drone_forensics.software_csv_staging,
uav_marketplace.uav_build_csv_staging TO drone_forensics.uav_build_csv_staging,
uav_marketplace.vtx_csv_staging TO drone_forensics.vtx_csv_staging;

RENAME TABLE
uav_marketplace.ml_training_dataset
TO drone_forensics.ml_training_dataset;


USE drone_forensics;

SELECT esc_id, esc_code
FROM esc
WHERE esc_code = 'ESC-0011';

SELECT motor_id, motor_code
FROM motors
WHERE motor_code = 'MTR-0040';

SELECT esc_id, esc_code
FROM esc
LIMIT 20;

SELECT motor_id, motor_code
FROM motors
LIMIT 20;

USE drone_forensics;


USE drone_forensics;

SELECT *
FROM esc_motor_compatibility
LIMIT 20;

SELECT esc_id, esc_code
FROM esc
WHERE esc_id = 31;

SELECT motor_id, motor_code
FROM motors
WHERE motor_id = 109;

DESCRIBE esc_motor_compatibility;

SELECT esc_id, esc_code
FROM esc
LIMIT 50;

SELECT COUNT(*) FROM esc;
SELECT COUNT(*) FROM motors;

SELECT motor_id, motor_code
FROM motors
LIMIT 50;

SELECT * FROM esc WHERE esc_id = 31;
SELECT *
FROM manufacturers
WHERE manufacturer_id = 2126;

SELECT COUNT(*) AS orphan_esc
FROM esc e
LEFT JOIN manufacturers m
ON e.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

SELECT COUNT(*) AS orphan_motors
FROM motors mo
LEFT JOIN manufacturers m
ON mo.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

SELECT COUNT(*) AS orphan_frames
FROM frames f
LEFT JOIN manufacturers m
ON f.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

SELECT COUNT(*) AS orphan_propellers
FROM propellers p
LEFT JOIN manufacturers m
ON p.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

SELECT COUNT(*) AS total_manufacturers
FROM manufacturers;

SELECT manufacturer_id, manufacturer_name
FROM manufacturers
ORDER BY manufacturer_id
LIMIT 20;

SELECT COUNT(*) AS esc_staging_rows
FROM esc_csv_staging;
SELECT COUNT(*) AS motor_staging_rows
FROM motor_csv_staging;

SELECT esc_id, esc_code, manufacturer_id
FROM esc
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
)
LIMIT 20;

SELECT manufacturer_id, manufacturer_name
FROM manufacturers
WHERE manufacturer_id BETWEEN 250 AND 330;

-- ESC REPAIR

USE drone_forensics;

TRUNCATE esc_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/esc.csv'
INTO TABLE esc_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8,@c9,@c10,@c11,@c12,@c13,@c14,@c15
)
SET
    ESCID = TRIM(@c1),
    Brand = TRIM(@c2),
    Category = TRIM(@c3),
    SubCategory = TRIM(@c4),
    ESCType = TRIM(@c5),
    ContinuousCurrent_A = TRIM(@c6),
    BurstCurrent_A = TRIM(@c7),
    SupportedVoltage = TRIM(@c8),
    Firmware = TRIM(@c9),
    InputProtocol = TRIM(@c10),
    MountPattern = TRIM(@c11),
    BEC_Output = TRIM(@c12),
    CoolingMethod = TRIM(@c13),
    SupportedDrone = TRIM(@c14),
    IntendedUse = TRIM(@c15);
    
    SELECT COUNT(*) FROM esc_csv_staging;
    
    
    UPDATE esc e
JOIN esc_csv_staging s
    ON e.esc_code = s.ESCID
JOIN manufacturers m
    ON UPPER(TRIM(m.manufacturer_name)) = UPPER(TRIM(s.Brand))
SET e.manufacturer_id = m.manufacturer_id;
SHOW CREATE TABLE esc;

ALTER TABLE esc
DROP FOREIGN KEY fk_esc_manufacturer;
ALTER TABLE esc
ADD CONSTRAINT fk_esc_manufacturer
FOREIGN KEY (manufacturer_id)
REFERENCES manufacturers(manufacturer_id);

UPDATE esc e
JOIN esc_csv_staging s
    ON e.esc_code = s.ESCID
JOIN manufacturers m
    ON UPPER(TRIM(m.manufacturer_name)) = UPPER(TRIM(s.Brand))
SET e.manufacturer_id = m.manufacturer_id;

SELECT COUNT(*) AS orphan_esc
FROM esc e
LEFT JOIN manufacturers m
ON e.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

SELECT esc_code, manufacturer_id
FROM esc
WHERE esc_code = 'ESC-0031';

SELECT manufacturer_name
FROM manufacturers
WHERE manufacturer_id = (
    SELECT manufacturer_id
    FROM esc
    WHERE esc_code = 'ESC-0031'
);

ALTER TABLE esc
ADD CONSTRAINT fk_esc_manufacturer
FOREIGN KEY (manufacturer_id)
REFERENCES manufacturers(manufacturer_id);
SHOW CREATE TABLE esc;

-- MOTOR REPAIR

USE drone_forensics;

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
    SubCategory           = NULLIF(TRIM(@c4), ''),
    MotorType             = NULLIF(TRIM(@c5), ''),
    KV_Rating             = NULLIF(TRIM(@c6), ''),
    MaxCurrent            = NULLIF(TRIM(@c7), ''),
    MaxPower              = NULLIF(TRIM(@c8), ''),
    ShaftDiam             = NULLIF(TRIM(@c9), ''),
    MountPattern          = NULLIF(TRIM(@c10), ''),
    RecommendedPropSize   = NULLIF(TRIM(@c11), ''),
    CompatibleDroneType   = NULLIF(TRIM(@c12), ''),
    IntendedUse           = NULLIF(TRIM(@c13), '');
    
    SELECT COUNT(*) AS motor_staging_rows
FROM motor_csv_staging;
ALTER TABLE motors
DROP FOREIGN KEY fk_motors_manufacturer;
SHOW CREATE TABLE motors;

UPDATE motors mo
JOIN motor_csv_staging s
    ON mo.motor_code = s.MotorID
JOIN manufacturers m
    ON UPPER(TRIM(m.manufacturer_name)) = UPPER(TRIM(s.Brand))
SET mo.manufacturer_id = m.manufacturer_id;

SELECT COUNT(*) AS orphan_motors
FROM motors mo
LEFT JOIN manufacturers m
ON mo.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

ALTER TABLE motors
ADD CONSTRAINT fk_motors_manufacturer
FOREIGN KEY (manufacturer_id)
REFERENCES manufacturers(manufacturer_id);

USE drone_forensics;

TRUNCATE propeller_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Propellors.csv'
INTO TABLE propeller_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6,
    @c7, @c8, @c9, @c10, @c11, @c12, @c13
)
SET
    PropID        = TRIM(@c1),
    Brand         = TRIM(@c2),
    Category      = TRIM(@c3),
    SubCategory   = TRIM(@c4),
    PropType      = TRIM(@c5),
    Diameter      = TRIM(@c6),
    Pitch         = TRIM(@c7),
    BladeCount    = TRIM(@c8),
    Material      = TRIM(@c9),
    MountType     = TRIM(@c10),
    Rotation      = TRIM(@c11),
    Compatible    = TRIM(@c12),
    IntendedUse   = TRIM(@c13);
    
    ALTER TABLE propellers
DROP FOREIGN KEY fk_propellers_manufacturer;
UPDATE propellers p
JOIN propeller_csv_staging s
    ON p.prop_code = s.PropID
JOIN manufacturers m
    ON UPPER(TRIM(m.manufacturer_name)) = UPPER(TRIM(s.Brand))
SET p.manufacturer_id = m.manufacturer_id;

SELECT COUNT(*) AS orphan_propellers
FROM propellers p
LEFT JOIN manufacturers m
ON p.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;
ALTER TABLE propellers
ADD CONSTRAINT fk_propellers_manufacturer
FOREIGN KEY (manufacturer_id)
REFERENCES manufacturers(manufacturer_id);

SHOW CREATE TABLE propellers;



TRUNCATE frame_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Frames.csv'
INTO TABLE frame_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6,
    @c7, @c8, @c9, @c10, @c11, @c12
)
SET
    FrameID     = TRIM(@c1),
    Brand       = TRIM(@c2),
    Category    = TRIM(@c3),
    SubCategory = TRIM(@c4),
    FrameType   = TRIM(@c5),
    Size_Inch   = TRIM(@c6),
    Wheelbase   = TRIM(@c7),
    Material    = TRIM(@c8),
    ArmType     = TRIM(@c9),
    Mounting    = TRIM(@c10),
    Supported   = TRIM(@c11),
    IntendedUse = TRIM(@c12);
SELECT COUNT(*) AS frame_staging_rows
FROM frame_csv_staging;

ALTER TABLE frames
DROP FOREIGN KEY fk_frames_manufacturer;

UPDATE frames f
JOIN frame_csv_staging s
    ON f.frame_code = s.FrameID
JOIN manufacturers m
    ON UPPER(TRIM(m.manufacturer_name)) = UPPER(TRIM(s.Brand))
SET f.manufacturer_id = m.manufacturer_id;

SELECT COUNT(*) AS orphan_frames
FROM frames f
LEFT JOIN manufacturers m
ON f.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_id IS NULL;

ALTER TABLE frames
ADD CONSTRAINT fk_frames_manufacturer
FOREIGN KEY (manufacturer_id)
REFERENCES manufacturers(manufacturer_id);

SHOW CREATE TABLE frames;





    
    