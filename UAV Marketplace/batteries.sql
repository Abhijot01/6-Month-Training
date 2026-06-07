-- UAV Marketplace database (NEW)
CREATE DATABASE IF NOT EXISTS uav_marketplace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE uav_marketplace;
show tables;
CREATE TABLE manufacturers (
    manufacturer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;

CREATE TABLE batteries (
    battery_id INT AUTO_INCREMENT PRIMARY KEY,

    battery_code VARCHAR(20) NOT NULL UNIQUE,   -- BAT-0001
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),                  -- LiPo FPV Battery, Industrial LiPo Battery
    battery_chemistry VARCHAR(50),              -- LiPo, Li-ion
    cell_count INT,
    voltage_v DECIMAL(6,2),
    capacity_mah INT,
    discharge_rate_c INT,
    energy_wh DECIMAL(8,2),
    connector_type VARCHAR(50),
    intended_use VARCHAR(100),
    compatible_drone_type VARCHAR(100),
    

    CONSTRAINT fk_batteries_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;

-- BATTERY STAGING TABLE -- -- -- -- --

CREATE TABLE battery_csv_staging (
    BatteryID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    BatteryChemistry VARCHAR(50),
    CellCount VARCHAR(20),
    Voltage_V VARCHAR(20),
    Capacity_mAh VARCHAR(20),
    DischargeRate_C VARCHAR(20),
    Energy_Wh VARCHAR(20),
    ConnectorType VARCHAR(50),
    IntendedUse VARCHAR(100),
    CompatibleDroneType VARCHAR(100)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;

-- FILE LOADING -- ----------------

TRUNCATE battery_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Batteries.csv'
INTO TABLE battery_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    BatteryID,
    Brand,
    Category,
    SubCategory,
    BatteryChemistry,
    CellCount,
    Voltage_V,
    Capacity_mAh,
    DischargeRate_C,
    Energy_Wh,
    ConnectorType,
    IntendedUse,
    CompatibleDroneType
);

-- --- --- --- -- STORED PROCEDURE -- ---- ---- ---- ---

DROP PROCEDURE IF EXISTS sp_import_batteries_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_batteries_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    -- keep EVERYTHING from CSV as VARCHAR
    DECLARE v_code VARCHAR(20);
    DECLARE v_brand VARCHAR(100);
    DECLARE v_subcat VARCHAR(100);
    DECLARE v_chem VARCHAR(50);
    DECLARE v_cells VARCHAR(20);
    DECLARE v_voltage VARCHAR(20);
    DECLARE v_capacity VARCHAR(20);
    DECLARE v_discharge VARCHAR(20);
    DECLARE v_energy VARCHAR(20);
    DECLARE v_connector VARCHAR(50);
    DECLARE v_use VARCHAR(100);
    DECLARE v_compat VARCHAR(100);
    

    DECLARE cur CURSOR FOR
        SELECT
            BatteryID,
            Brand,
            SubCategory,
            BatteryChemistry,
            CellCount,
            Voltage_V,
            Capacity_mAh,
            DischargeRate_C,
            Energy_Wh,
            ConnectorType,
            IntendedUse,
            CompatibleDroneType
        FROM battery_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_code,
            v_brand,
            v_subcat,
            v_chem,
            v_cells,
            v_voltage,
            v_capacity,
            v_discharge,
            v_energy,
            v_connector,
            v_use,
            v_compat;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        -- manufacturers
        INSERT IGNORE INTO manufacturers (manufacturer_name)
        VALUES (TRIM(v_brand));

        -- batteries (ALL numeric conversion handled here)
        INSERT IGNORE INTO batteries (
            battery_code,
            manufacturer_id,
            sub_category,
            battery_chemistry,
            cell_count,
            voltage_v,
            capacity_mah,
            discharge_rate_c,
            energy_wh,
            connector_type,
            intended_use,
            compatible_drone_type
        )
        SELECT
            TRIM(v_code),
            m.manufacturer_id,
            TRIM(v_subcat),
            TRIM(v_chem),

            CAST(NULLIF(NULLIF(TRIM(v_cells), ''), 'N/A') AS UNSIGNED),
            CAST(NULLIF(NULLIF(TRIM(v_voltage), ''), 'N/A') AS DECIMAL(6,2)),
            CAST(NULLIF(NULLIF(TRIM(v_capacity), ''), 'N/A') AS UNSIGNED),
            CAST(NULLIF(NULLIF(TRIM(v_discharge), ''), 'N/A') AS UNSIGNED),
            CAST(NULLIF(NULLIF(TRIM(v_energy), ''), 'N/A') AS DECIMAL(8,2)),

            TRIM(v_connector),
            TRIM(v_use),
            TRIM(v_compat)
            
        FROM manufacturers m
        WHERE m.manufacturer_name = TRIM(v_brand);

    END LOOP;

    CLOSE cur;

    TRUNCATE battery_csv_staging;
END$$

DELIMITER ;

CALL sp_import_batteries_csv();

-- --------------------------------------------
ALTER TABLE manufacturers
CONVERT TO CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

ALTER TABLE batteries
CONVERT TO CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

ALTER TABLE battery_csv_staging
CONVERT TO CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
SELECT * FROM batteries;

 -- -----------------------------------------------------
/* cheching the data    --------

SELECT COUNT(*) FROM batteries;
SELECT COUNT(*) FROM manufacturers;

SELECT
    b.battery_code,
    m.name AS manufacturer,
    b.cell_count,
    b.voltage_v,
    b.capacity_mah
FROM batteries b
JOIN manufacturers m
  ON b.manufacturer_id = m.manufacturer_id
LIMIT 20;

SELECT
    b.battery_id,
    b.battery_code,
    m.name AS manufacturer,
    b.sub_category,
    b.battery_chemistry,
    b.cell_count,
    b.voltage_v,
    b.capacity_mah,
    b.discharge_rate_c,
    b.energy_wh,
    b.connector_type,
    b.intended_use,
    b.compatible_drone_type,
    b.notes
FROM batteries b
JOIN manufacturers m
  ON m.manufacturer_id = b.manufacturer_id
ORDER BY b.battery_id
LIMIT 5;
*/ 

CREATE INDEX idx_batteries_manufacturer
    ON batteries(manufacturer_id);

CREATE INDEX idx_batteries_cell_count
    ON batteries(cell_count);

CREATE INDEX idx_batteries_capacity
    ON batteries(capacity_mah);

CREATE INDEX idx_batteries_voltage
    ON batteries(voltage_v);
    

-- Apply permissions
FLUSH PRIVILEGES;
-- confirm current user
SELECT USER();
GRANT SELECT, INSERT, UPDATE, DELETE
ON uav_marketplace.*
TO 'drone_app_user'@'localhost';

FLUSH PRIVILEGES;
UPDATE batteries 
SET cell_count = 4 
WHERE cell_count IS NULL;

DESCRIBE batteries;
DESCRIBE chargers;
DESCRIBE motors;
DESCRIBE frames;
DESCRIBE esc;
DESCRIBE flight_controllers;
DESCRIBE propellers;
DESCRIBE radios_receivers;
DESCRIBE rtf_uav;
DESCRIBE video_transmitters;
DESCRIBE cameras;
DESCRIBE gps_modules;
describe firmware;
describe cameras;
describe gps_modules;

SHOW CREATE TABLE batteries;
ALTER TABLE batteries
DROP FOREIGN KEY fk_batteries_manufacturer;
SELECT COUNT(*) AS orphan_rows

FROM batteries b

LEFT JOIN manufacturers m
ON b.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE batteries
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE batteries

ADD CONSTRAINT fk_batteries_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);
SHOW CREATE TABLE batteries;

SELECT DISTINCT m.manufacturer_name

FROM batteries b

JOIN manufacturers m
ON b.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

select count(*) from batteries;

SELECT DISTINCT m.manufacturer_name

FROM chargers c

JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT DISTINCT m.manufacturer_name

FROM batteries b

JOIN manufacturers m
ON b.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT
    battery_code,
    manufacturer_id
FROM batteries
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
);

SELECT
    BatteryID,
    Brand
FROM battery_csv_staging
LIMIT 20;

UPDATE batteries b

JOIN battery_csv_staging s
ON b.battery_code = s.BatteryID

JOIN manufacturers m
ON (
    m.manufacturer_name = s.Brand
    OR (s.Brand = 'GNB' AND m.manufacturer_name = 'Gaoneng GNB')
    OR (s.Brand = 'CNHY' AND m.manufacturer_name = 'CNHL')
)

SET b.manufacturer_id = m.manufacturer_id;

SELECT DISTINCT m.manufacturer_name

FROM batteries b

JOIN manufacturers m
ON b.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

UPDATE batteries b

JOIN manufacturers old_m
ON b.manufacturer_id = old_m.manufacturer_id

JOIN manufacturers new_m
ON new_m.manufacturer_name = 'Gaoneng GNB'

SET b.manufacturer_id = new_m.manufacturer_id

WHERE old_m.manufacturer_name = 'Gaoneng';

UPDATE batteries b

JOIN manufacturers old_m
ON b.manufacturer_id = old_m.manufacturer_id

JOIN manufacturers new_m
ON new_m.manufacturer_name = 'Ovonic'

SET b.manufacturer_id = new_m.manufacturer_id

WHERE old_m.manufacturer_name = 'Ovonics';

UPDATE batteries b

JOIN manufacturers old_m
ON b.manufacturer_id = old_m.manufacturer_id

JOIN manufacturers new_m
ON new_m.manufacturer_name = 'Custom'

SET b.manufacturer_id = new_m.manufacturer_id

WHERE old_m.manufacturer_name IN (
'Northrop Grumman',
'Pulse'
);

SELECT DISTINCT m.manufacturer_name

FROM batteries b

JOIN manufacturers m
ON b.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

use drone_forensics;
ALTER TABLE batteries
MODIFY manufacturer_id INT NULL;

ALTER TABLE cameras
MODIFY manufacturer_id INT NULL;

ALTER TABLE chargers
MODIFY manufacturer_id INT NULL;