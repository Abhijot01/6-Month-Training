USE uav_marketplace;

CREATE TABLE flight_controllers (
    flight_controller_id INT AUTO_INCREMENT PRIMARY KEY,

    fc_code VARCHAR(20) NOT NULL UNIQUE,        -- FC-0001
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),                  -- FPV FC, AIO FC, Autopilot
    processor VARCHAR(100),
    form_factor VARCHAR(50),
    mounting VARCHAR(50),
    firmware_supported VARCHAR(100),
    imu VARCHAR(100),
    barometer VARCHAR(100),
    osd VARCHAR(20),
    blackbox VARCHAR(20),
    esc_interface VARCHAR(100),
    connector_type VARCHAR(50),
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_fc_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE flight_controller_csv_staging (
    FCID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    Processor VARCHAR(100),
    FormFactor VARCHAR(50),
    Mounting VARCHAR(50),
    FirmwareSupported VARCHAR(100),
    IMU VARCHAR(100),
    Barometer VARCHAR(100),
    OSD VARCHAR(20),
    Blackbox VARCHAR(20),
    ESCInterface VARCHAR(100),
    ConnectorType VARCHAR(50),
    SupportedDroneType VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

TRUNCATE flight_controller_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/flight_controllers.csv'
INTO TABLE flight_controller_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6, @c7, @c8,
    @c9, @c10, @c11, @c12, @c13, @c14, @c15, @c16
)
SET
    FCID                = @c1,
    Brand               = @c2,
    Category            = @c3,
    SubCategory          = @c4,
    Processor           = @c5,
    FormFactor           = @c6,
    Mounting             = @c7,
    FirmwareSupported    = @c8,
    IMU                  = @c9,
    Barometer            = @c10,
    OSD                  = @c11,
    Blackbox             = @c12,
    ESCInterface         = @c13,
    ConnectorType        = @c14,
    SupportedDroneType   = @c15,
    IntendedUse          = @c16;
    
    
DROP PROCEDURE IF EXISTS sp_import_flight_controllers_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_flight_controllers_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_code VARCHAR(20);
    DECLARE v_brand VARCHAR(100);
    DECLARE v_subcat VARCHAR(100);
    DECLARE v_processor VARCHAR(100);
    DECLARE v_form VARCHAR(50);
    DECLARE v_mount VARCHAR(50);
    DECLARE v_firmware VARCHAR(100);
    DECLARE v_imu VARCHAR(100);
    DECLARE v_baro VARCHAR(100);
    DECLARE v_osd VARCHAR(20);
    DECLARE v_blackbox VARCHAR(20);
    DECLARE v_esc VARCHAR(100);
    DECLARE v_connector VARCHAR(50);
    DECLARE v_drone VARCHAR(100);
    DECLARE v_use VARCHAR(150);

    DECLARE cur CURSOR FOR
        SELECT
            FCID,
            Brand,
            SubCategory,
            Processor,
            FormFactor,
            Mounting,
            FirmwareSupported,
            IMU,
            Barometer,
            OSD,
            Blackbox,
            ESCInterface,
            ConnectorType,
            SupportedDroneType,
            IntendedUse
        FROM flight_controller_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_code,
            v_brand,
            v_subcat,
            v_processor,
            v_form,
            v_mount,
            v_firmware,
            v_imu,
            v_baro,
            v_osd,
            v_blackbox,
            v_esc,
            v_connector,
            v_drone,
            v_use;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF v_code IS NULL OR TRIM(v_code) = '' THEN
            ITERATE read_loop;
        END IF;

        INSERT IGNORE INTO manufacturers (name)
        VALUES (TRIM(v_brand));

        INSERT IGNORE INTO flight_controllers (
            fc_code,
            manufacturer_id,
            sub_category,
            processor,
            form_factor,
            mounting,
            firmware_supported,
            imu,
            barometer,
            osd,
            blackbox,
            esc_interface,
            connector_type,
            supported_drone_type,
            intended_use
        )
        SELECT
            TRIM(v_code),
            m.manufacturer_id,
            TRIM(v_subcat),
            TRIM(v_processor),
            TRIM(v_form),
            TRIM(v_mount),
            TRIM(v_firmware),
            TRIM(v_imu),
            TRIM(v_baro),
            TRIM(v_osd),
            TRIM(v_blackbox),
            TRIM(v_esc),
            TRIM(v_connector),
            TRIM(v_drone),
            TRIM(v_use)
        FROM manufacturers m
        WHERE m.name = TRIM(v_brand);

    END LOOP;

    CLOSE cur;
    TRUNCATE flight_controller_csv_staging;
END$$
DELIMITER ;

CALL sp_import_flight_controllers_csv();

SELECT COUNT(*) FROM flight_controllers;

SELECT
    fc.fc_code,
    m.name AS manufacturer,
    fc.processor,
    fc.form_factor,
    fc.firmware_supported,
    fc.imu,
    fc.esc_interface,
    fc.supported_drone_type,
    fc.intended_use
FROM flight_controllers fc
JOIN manufacturers m
  ON m.manufacturer_id = fc.manufacturer_id
ORDER BY fc.flight_controller_id
LIMIT 10;

CREATE INDEX idx_fc_manufacturer
    ON flight_controllers(manufacturer_id);

CREATE INDEX idx_fc_processor
    ON flight_controllers(processor);

CREATE INDEX idx_fc_drone_type
    ON flight_controllers(supported_drone_type);


ALTER TABLE flight_controllers
DROP FOREIGN KEY fk_fc_manufacturer;

SELECT COUNT(*) AS orphan_rows

FROM flight_controllers fc

LEFT JOIN manufacturers m
ON fc.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE flight_controllers
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE flight_controllers

ADD CONSTRAINT fk_fc_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);

SHOW CREATE TABLE flight_controllers;

SELECT DISTINCT m.manufacturer_name

FROM flight_controllers f

JOIN manufacturers m
ON f.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;
select count(*) from flight_controllers;
SELECT
    flight_controller_id,
    manufacturer_id
FROM flight_controllers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)
LIMIT 50;

SELECT DISTINCT Brand
FROM flight_controller_csv_staging
ORDER BY Brand;

SELECT
    flight_controller_id,
    manufacturer_id
FROM flight_controllers
WHERE manufacturer_id = 159
LIMIT 30;

SELECT
    FCID,
    Brand
FROM flight_controller_csv_staging
WHERE FCID IN (
'FC-0050',
'FC-0091',
'FC-0092',
'FC-0093',
'FC-0094',
'FC-0095'
);

SELECT
    manufacturer_id,
    manufacturer_name
FROM manufacturers
WHERE manufacturer_name = 'Custom';

UPDATE flight_controllers
SET manufacturer_id = 122
WHERE manufacturer_id = 159;

SELECT DISTINCT m.manufacturer_name

FROM flight_controllers f

JOIN manufacturers m
ON f.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT
    manufacturer_id,
    manufacturer_name
FROM manufacturers
WHERE manufacturer_name = 'Northrop Grumman';

SELECT
    fc_id,
    manufacturer_id
FROM flight_controllers
WHERE manufacturer_id = (
    SELECT manufacturer_id
    FROM manufacturers
    WHERE manufacturer_name = 'Northrop Grumman'
);

SELECT
    FCID,
    Brand
FROM flight_controller_csv_staging
WHERE FCID IN (
'FC-0050',
'FC-0091',
'FC-0092',
'FC-0093',
'FC-0094',
'FC-0095'
);

SELECT
    manufacturer_id
FROM manufacturers
WHERE manufacturer_name = 'Northrop Grumman';

SELECT
    manufacturer_id
FROM manufacturers
WHERE manufacturer_name = 'Custom';

UPDATE flight_controllers
SET manufacturer_id = 122
WHERE manufacturer_id = 1;

SELECT DISTINCT m.manufacturer_name

FROM flight_controllers f

JOIN manufacturers m
ON f.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;