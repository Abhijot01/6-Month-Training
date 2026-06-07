USE uav_marketplace;

CREATE TABLE IF NOT EXISTS gps_modules (
    gps_id INT AUTO_INCREMENT PRIMARY KEY,

    gps_code VARCHAR(20) NOT NULL UNIQUE,
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),
    gnss_support VARCHAR(150),
    compass_included VARCHAR(10),
    update_rate_hz INT,
    interface_type VARCHAR(50),
    voltage_input VARCHAR(50),
    antenna_type VARCHAR(100),
    mounting_type VARCHAR(50),
    supported_firmware VARCHAR(100),
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_gps_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS gps_csv_staging;

CREATE TABLE gps_csv_staging (
    GPSID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    GNSSSupport VARCHAR(150),
    CompassIncluded VARCHAR(10),
    UpdateRate_Hz VARCHAR(20),
    Interface VARCHAR(50),
    VoltageInput_V VARCHAR(50),
    AntennaType VARCHAR(100),
    MountingType VARCHAR(50),
    SupportedFirmware VARCHAR(100),
    SupportedDroneType VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB;

TRUNCATE gps_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/gps_modules.csv'
INTO TABLE gps_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8,@c9,@c10,@c11,@c12,@c13,@c14
)
SET
    GPSID = TRIM(@c1),
    Brand = TRIM(@c2),
    Category = TRIM(@c3),
    SubCategory = TRIM(@c4),
    GNSSSupport = TRIM(@c5),
    CompassIncluded = TRIM(@c6),
    UpdateRate_Hz = TRIM(@c7),
    Interface = TRIM(@c8),
    VoltageInput_V = TRIM(@c9),
    AntennaType = TRIM(@c10),
    MountingType = TRIM(@c11),
    SupportedFirmware = TRIM(@c12),
    SupportedDroneType = TRIM(@c13),
    IntendedUse = TRIM(@c14);

DROP PROCEDURE IF EXISTS sp_import_gps_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_gps_csv()
BEGIN

    -- Insert manufacturers
    INSERT IGNORE INTO manufacturers (manufacturer_name)
    SELECT DISTINCT TRIM(Brand)
    FROM gps_csv_staging
    WHERE Brand IS NOT NULL AND TRIM(Brand) != '';

    -- Insert / Update GPS modules
    INSERT INTO gps_modules (
        gps_code,
        manufacturer_id,
        sub_category,
        gnss_support,
        compass_included,
        update_rate_hz,
        interface_type,
        voltage_input,
        antenna_type,
        mounting_type,
        supported_firmware,
        supported_drone_type,
        intended_use
    )
    SELECT
        TRIM(s.GPSID),
        m.manufacturer_id,
        TRIM(s.SubCategory),
        TRIM(s.GNSSSupport),
        TRIM(s.CompassIncluded),

        CAST(NULLIF(NULLIF(TRIM(s.UpdateRate_Hz), ''), 'N/A') AS UNSIGNED),

        TRIM(s.Interface),
        TRIM(s.VoltageInput_V),
        TRIM(s.AntennaType),
        TRIM(s.MountingType),
        TRIM(s.SupportedFirmware),
        TRIM(s.SupportedDroneType),
        TRIM(s.IntendedUse)

    FROM gps_csv_staging s
    JOIN manufacturers m
      ON m.manufacturer_name = TRIM(s.Brand)

    WHERE s.GPSID IS NOT NULL
      AND TRIM(s.GPSID) != ''

    ON DUPLICATE KEY UPDATE
        manufacturer_id = VALUES(manufacturer_id),
        sub_category = VALUES(sub_category),
        gnss_support = VALUES(gnss_support),
        compass_included = VALUES(compass_included),
        update_rate_hz = VALUES(update_rate_hz),
        interface_type = VALUES(interface_type),
        voltage_input = VALUES(voltage_input),
        antenna_type = VALUES(antenna_type),
        mounting_type = VALUES(mounting_type),
        supported_firmware = VALUES(supported_firmware),
        supported_drone_type = VALUES(supported_drone_type),
        intended_use = VALUES(intended_use);

    -- Clean staging
    TRUNCATE gps_csv_staging;

END$$
DELIMITER ;

CALL sp_import_gps_csv();
SELECT COUNT(*) FROM gps_csv_staging;
SELECT COUNT(*) FROM gps_modules;

CREATE INDEX idx_gps_manufacturer
ON gps_modules(manufacturer_id);

CREATE INDEX idx_gps_gnss
ON gps_modules(gnss_support);

CREATE INDEX idx_gps_update_rate
ON gps_modules(update_rate_hz);

CREATE INDEX idx_gps_interface
ON gps_modules(interface_type);

CREATE INDEX idx_gps_firmware
ON gps_modules(supported_firmware);

CREATE INDEX idx_gps_platform
ON gps_modules(supported_drone_type);


ALTER TABLE gps_modules
DROP FOREIGN KEY fk_gps_manufacturer;
SELECT COUNT(*) AS orphan_rows

FROM gps_modules g

LEFT JOIN manufacturers m
ON g.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE gps_modules
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE gps_modules

ADD CONSTRAINT fk_gps_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);

SELECT DISTINCT m.manufacturer_name



FROM gps_modules g

JOIN manufacturers m
ON g.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT COUNT(*)

FROM gps_modules g

JOIN manufacturers m
ON g.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name IN (
'Northrop Grumman',
'DRN-0033',
'Pulse',
'Athlon Avia',
'Omnibus',
'Izhmash Unmanned Systems',
'Ukrainian Industry'
);

SELECT COUNT(*)
FROM gps_modules
WHERE manufacturer_id = 1;

SELECT DISTINCT Brand
FROM gps_csv_staging
ORDER BY Brand;

SELECT
    GPSID,
    Brand
FROM gps_csv_staging
LIMIT 20;

UPDATE gps_modules g

JOIN gps_csv_staging s
ON g.gps_code = s.GPSID

JOIN manufacturers m
ON m.manufacturer_name = s.Brand

SET g.manufacturer_id = m.manufacturer_id;

SELECT DISTINCT m.manufacturer_name

FROM gps_modules g

JOIN manufacturers m
ON g.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT COUNT(*)

FROM gps_modules g

JOIN manufacturers m
ON g.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name = 'Northrop Grumman';

SELECT DISTINCT m.manufacturer_name

FROM rtf_uav r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT COUNT(*)

FROM rtf_uav r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name IN (
'Northrop Grumman',
'DRN-0033',
'Pulse',
'Athlon Avia',
'Omnibus',
'Izhmash Unmanned Systems',
'Ukrainian Industry'
);

SELECT COUNT(*)
FROM rtf_uav
WHERE manufacturer_id = 1;

SELECT DISTINCT Brand
FROM rtf_csv_staging
ORDER BY Brand;

SELECT
    DroneID,
    Brand
FROM rtf_csv_staging
LIMIT 20;

UPDATE rtf_uav r

JOIN rtf_csv_staging s
ON r.rtf_id IS NOT NULL

JOIN manufacturers m
ON m.manufacturer_name = s.Brand

SET r.manufacturer_id = m.manufacturer_id;

SELECT *
FROM rtf_uav
LIMIT 5;

SELECT manufacturer_id, manufacturer_name
FROM manufacturers
WHERE manufacturer_id = 292;

SELECT
    rtf_id,
    drone_type,
    frame_size,
    motor_spec,
    battery_spec
FROM rtf_uav
LIMIT 20;

SELECT
    manufacturer_id,
    COUNT(*) AS total_rows
FROM rtf_uav
GROUP BY manufacturer_id
ORDER BY total_rows DESC;

SELECT
    manufacturer_id,
    manufacturer_name
FROM manufacturers
WHERE manufacturer_name IN (
'Northrop Grumman',
'DRN-0033',
'Athlon Avia',
'Omnibus',
'Pulse',
'Parrot'
);

SELECT
    rtf_id,
    manufacturer_id,
    drone_type,
    frame_size,
    motor_spec
FROM rtf_uav
WHERE manufacturer_id IN (
1,
159
);

SELECT DISTINCT
    m.manufacturer_id,
    m.manufacturer_name

FROM rtf_uav r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT DISTINCT
    m.manufacturer_id,
    m.manufacturer_name

FROM rtf_uav r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;


select count(*) from gps_modules;

SELECT
    Brand,
    COUNT(*) AS total_rows
FROM rtf_csv_staging
GROUP BY Brand
ORDER BY total_rows DESC;

SELECT *
FROM rtf_csv_staging
LIMIT 5;

SELECT
    rtf_id,
    drone_type,
    frame_size,
    motor_spec
FROM rtf_uav
LIMIT 10;

ALTER TABLE rtf_csv_staging
ADD COLUMN temp_row_id INT AUTO_INCREMENT PRIMARY KEY FIRST;

UPDATE rtf_uav r

JOIN rtf_csv_staging s
ON r.rtf_id = s.temp_row_id

JOIN manufacturers m
ON m.manufacturer_name = s.Brand

SET r.manufacturer_id = m.manufacturer_id;

SELECT
    m.manufacturer_name,
    COUNT(*) AS total_rows
FROM rtf_uav r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

GROUP BY m.manufacturer_name
ORDER BY total_rows DESC;