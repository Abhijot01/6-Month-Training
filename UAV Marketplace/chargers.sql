USE uav_marketplace;
show tables;

CREATE TABLE IF NOT EXISTS chargers (
    charger_id INT AUTO_INCREMENT PRIMARY KEY,

    charger_code VARCHAR(20) NOT NULL UNIQUE,
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),
    charger_type VARCHAR(100),
    supported_chemistry VARCHAR(150),
    max_charge_power_w INT,
    input_voltage VARCHAR(100),
    output_current VARCHAR(50),
    balancer_type VARCHAR(50),
    port_type VARCHAR(50),
    supported_platform VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_chargers_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS charger_csv_staging;

CREATE TABLE charger_csv_staging (
    ChargerID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    ChargerType VARCHAR(100),
    SupportedChemistry VARCHAR(150),
    MaxChargePower_W VARCHAR(20),
    InputVoltage VARCHAR(100),
    OutputCur VARCHAR(50),
    BalancerType VARCHAR(50),
    PortType VARCHAR(50),
    Supported VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB;

TRUNCATE charger_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Chargers.csv'
INTO TABLE charger_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    ChargerID,
    Brand,
    Category,
    SubCategory,
    ChargerType,
    SupportedChemistry,
    MaxChargePower_W,
    InputVoltage,
    OutputCur,
    BalancerType,
    PortType,
    Supported,
    IntendedUse
);


DROP PROCEDURE IF EXISTS sp_import_chargers_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_chargers_csv()
BEGIN

    -- 1. Insert manufacturers safely
    INSERT IGNORE INTO manufacturers (manufacturer_name)
    SELECT DISTINCT TRIM(Brand)
    FROM charger_csv_staging
    WHERE Brand IS NOT NULL AND TRIM(Brand) != '';

    -- 2. UPSERT chargers (INSERT + UPDATE)
    INSERT INTO chargers (
        charger_code,
        manufacturer_id,
        sub_category,
        charger_type,
        supported_chemistry,
        max_charge_power_w,
        input_voltage,
        output_current,
        balancer_type,
        port_type,
        supported_platform,
        intended_use
    )
    SELECT
        TRIM(s.ChargerID),
        m.manufacturer_id,
        TRIM(s.SubCategory),
        TRIM(s.ChargerType),
        TRIM(s.SupportedChemistry),

        CAST(NULLIF(NULLIF(TRIM(s.MaxChargePower_W), ''), 'N/A') AS UNSIGNED),
        TRIM(s.InputVoltage),
        TRIM(s.OutputCur),
        TRIM(s.BalancerType),
        TRIM(s.PortType),
        TRIM(s.Supported),
        TRIM(s.IntendedUse)

    FROM charger_csv_staging s
    JOIN manufacturers m
      ON m.manufacturer_name = TRIM(s.Brand)

    WHERE s.ChargerID IS NOT NULL
      AND TRIM(s.ChargerID) != ''

    ON DUPLICATE KEY UPDATE
        manufacturer_id = VALUES(manufacturer_id),
        sub_category = VALUES(sub_category),
        charger_type = VALUES(charger_type),
        supported_chemistry = VALUES(supported_chemistry),
        max_charge_power_w = VALUES(max_charge_power_w),
        input_voltage = VALUES(input_voltage),
        output_current = VALUES(output_current),
        balancer_type = VALUES(balancer_type),
        port_type = VALUES(port_type),
        supported_platform = VALUES(supported_platform),
        intended_use = VALUES(intended_use);

    -- 3. Clean staging
    TRUNCATE charger_csv_staging;

END$$
DELIMITER ;

CALL sp_import_chargers_csv();

SELECT COUNT(*) FROM chargers;

CREATE INDEX idx_chargers_manufacturer ON chargers(manufacturer_id);
CREATE INDEX idx_chargers_power ON chargers(max_charge_power_w);
CREATE INDEX idx_chargers_port ON chargers(port_type);

ALTER TABLE chargers
DROP FOREIGN KEY fk_chargers_manufacturer;

SELECT COUNT(*) AS orphan_rows

FROM chargers c

LEFT JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE chargers
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE chargers

ADD CONSTRAINT fk_chargers_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);

SHOW CREATE TABLE chargers;


SELECT
    charger_code,
    manufacturer_id
FROM chargers
LIMIT 20;

SELECT
    manufacturer_id,
    manufacturer_name
FROM manufacturers
WHERE manufacturer_name LIKE 'DRN-%';

SELECT COUNT(*) FROM chargers;

SELECT
    charger_code,
    input_voltage,
    output_voltage,
    charge_current_a
FROM chargers
LIMIT 20;

SELECT COUNT(*) FROM batteries;

SELECT COUNT(*)
FROM manufacturers;

DELETE FROM manufacturers
WHERE manufacturer_name LIKE 'DRN-%';

SELECT manufacturer_name
FROM manufacturers
WHERE manufacturer_name LIKE 'DRN-%';

SELECT *
FROM manufacturers
WHERE manufacturer_id = 1;

SELECT
    manufacturer_id,
    manufacturer_name
FROM manufacturers
ORDER BY manufacturer_name;

DELETE FROM manufacturers
WHERE manufacturer_name IS NULL
   OR TRIM(manufacturer_name) = '';
   
   SELECT COUNT(*)
FROM manufacturers
WHERE manufacturer_name LIKE 'DRN-%';

CREATE TABLE manufacturers_backup AS
SELECT *
FROM manufacturers;

CREATE TABLE fake_drn_manufacturers AS
SELECT *
FROM manufacturers
WHERE manufacturer_name LIKE 'DRN-%';

SELECT
    'batteries' AS table_name,
    COUNT(*) AS affected_rows
FROM batteries
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'chargers',
    COUNT(*)
FROM chargers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'cameras',
    COUNT(*)
FROM cameras
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'motors',
    COUNT(*)
FROM motors
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'frames',
    COUNT(*)
FROM frames
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'propellers',
    COUNT(*)
FROM propellers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'flight_controllers',
    COUNT(*)
FROM flight_controllers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'gps_modules',
    COUNT(*)
FROM gps_modules
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'video_transmitters',
    COUNT(*)
FROM video_transmitters
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)

UNION ALL

SELECT
    'radios_receivers',
    COUNT(*)
FROM radios_receivers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
);

SELECT
    charger_code,
    manufacturer_id
FROM chargers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)
LIMIT 20;

SELECT DISTINCT Brand
FROM charger_csv_staging
ORDER BY Brand;

INSERT IGNORE INTO manufacturers (manufacturer_name)
VALUES
('Custom'),
('EV-Peak'),
('GensAce'),
('Grepow'),
('HobbyMate'),
('HOTA'),
('ISDT'),
('SkyRC'),
('Spektrum'),
('Tattu'),
('Tenergy'),
('ToolkitRC'),
('Turnigy'),
('Ultra Power'),
('UltraPower');

SELECT manufacturer_id, manufacturer_name
FROM manufacturers
WHERE manufacturer_name IN (
'Custom',
'EV-Peak',
'GensAce',
'Grepow',
'HobbyMate',
'HOTA',
'ISDT',
'SkyRC',
'Spektrum',
'Tattu',
'Tenergy',
'ToolkitRC',
'Turnigy',
'Ultra Power',
'UltraPower'
)
ORDER BY manufacturer_name;

SELECT
    charger_code,
    manufacturer_id
FROM chargers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)
ORDER BY charger_code;

SELECT
    manufacturer_id,
    COUNT(*) AS rows_using_it
FROM chargers
GROUP BY manufacturer_id
ORDER BY manufacturer_id;

SELECT
    charger_code,
    manufacturer_id
FROM chargers
ORDER BY charger_code
LIMIT 50;

UPDATE chargers
SET manufacturer_id =
CASE manufacturer_id

    WHEN 159 THEN 262
    WHEN 165 THEN 273
    WHEN 170 THEN 277
    WHEN 175 THEN 289
    WHEN 180 THEN 295
    WHEN 200 THEN 330

    ELSE manufacturer_id

END;

SELECT DISTINCT m.manufacturer_name

FROM chargers c

JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT
    ChargerID,
    Brand
FROM charger_csv_staging
LIMIT 80;

UPDATE chargers
SET manufacturer_id =
CASE manufacturer_id

    WHEN 165 THEN 295
    WHEN 170 THEN 289
    WHEN 175 THEN 340
    WHEN 180 THEN 330
    WHEN 81 THEN 341
    WHEN 63 THEN 277
    WHEN 1 THEN 337
    WHEN 200 THEN 342
    WHEN 159 THEN 122

    ELSE manufacturer_id

END;

SELECT DISTINCT m.manufacturer_name

FROM chargers c

JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT DISTINCT charger_type
FROM chargers
ORDER BY charger_type;

SELECT COUNT(DISTINCT charger_type)
FROM chargers;
DELETE FROM chargers
WHERE charger_type = 'ChargerType';

SELECT DISTINCT m.manufacturer_name

FROM chargers c

JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT COUNT(*)

FROM chargers c

JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

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
FROM chargers
WHERE manufacturer_id = 1;

SELECT
    ChargerID,
    Brand
FROM charger_csv_staging
LIMIT 20;