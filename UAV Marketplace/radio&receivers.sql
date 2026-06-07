USE uav_marketplace;

CREATE TABLE radios_receivers (
    radio_id INT AUTO_INCREMENT PRIMARY KEY,

    radio_code VARCHAR(20) NOT NULL UNIQUE,     -- RAD-0001
    manufacturer_id INT NOT NULL,

    device_type VARCHAR(100),                  -- Handheld, Gamepad, RX
    protocol VARCHAR(100),                     -- ELRS, Crossfire, ACCST
    frequency VARCHAR(50),                     -- 2.4GHz, 900MHz
    channel_count VARCHAR(20),
    telemetry VARCHAR(20),
    antenna_type VARCHAR(100),
    connector VARCHAR(100),
    power_output VARCHAR(50),
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_radios_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE radio_csv_staging (
    RadioID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    DeviceType VARCHAR(100),
    Protocol VARCHAR(100),
    Frequency VARCHAR(50),
    ChannelCount VARCHAR(20),
    Telemetry VARCHAR(20),
    AntennaType VARCHAR(100),
    Connector VARCHAR(100),
    PowerOutput VARCHAR(50),
    Supported VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

TRUNCATE radio_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Radio & Receivers.csv'
INTO TABLE radio_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6, @c7,
    @c8, @c9, @c10, @c11, @c12, @c13, @c14
)
SET
    RadioID       = @c1,
    Brand         = @c2,
    Category      = @c3,
    SubCategory   = @c4,
    DeviceType    = @c5,
    Protocol      = @c6,
    Frequency     = @c7,
    ChannelCount  = @c8,
    Telemetry     = @c9,
    AntennaType   = @c10,
    Connector     = @c11,
    PowerOutput   = @c12,
    Supported     = @c13,
    IntendedUse   = @c14;


DROP PROCEDURE IF EXISTS sp_import_radios_csv;


DELIMITER $$


CREATE PROCEDURE sp_import_radios_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_code VARCHAR(20);
    DECLARE v_brand VARCHAR(100);
    DECLARE v_device VARCHAR(100);
    DECLARE v_protocol VARCHAR(100);
    DECLARE v_freq VARCHAR(50);
    DECLARE v_channels VARCHAR(20);
    DECLARE v_telemetry VARCHAR(20);
    DECLARE v_antenna VARCHAR(100);
    DECLARE v_connector VARCHAR(100);
    DECLARE v_power VARCHAR(50);
    DECLARE v_supported VARCHAR(100);
    DECLARE v_use VARCHAR(150);

    DECLARE cur CURSOR FOR
        SELECT
            RadioID,
            Brand,
            DeviceType,
            Protocol,
            Frequency,
            ChannelCount,
            Telemetry,
            AntennaType,
            Connector,
            PowerOutput,
            Supported,
            IntendedUse
        FROM radio_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_code,
            v_brand,
            v_device,
            v_protocol,
            v_freq,
            v_channels,
            v_telemetry,
            v_antenna,
            v_connector,
            v_power,
            v_supported,
            v_use;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF v_code IS NULL OR TRIM(v_code) = '' THEN
            ITERATE read_loop;
        END IF;

        INSERT IGNORE INTO manufacturers (manufacturer_name)
        VALUES (TRIM(v_brand));

        INSERT IGNORE INTO radios_receivers (
            radio_code,
            manufacturer_id,
            device_type,
            protocol,
            frequency,
            channel_count,
            telemetry,
            antenna_type,
            connector,
            power_output,
            supported_drone_type,
            intended_use
        )
        SELECT
            TRIM(v_code),
            m.manufacturer_id,
            TRIM(v_device),
            TRIM(v_protocol),
            TRIM(v_freq),
            TRIM(v_channels),
            TRIM(v_telemetry),
            TRIM(v_antenna),
            TRIM(v_connector),
            TRIM(v_power),
            TRIM(v_supported),
            TRIM(v_use)
        FROM manufacturers m
        WHERE m.manufacturer_name = TRIM(v_brand);

    END LOOP;

    CLOSE cur;
    TRUNCATE radio_csv_staging;
END$$
DELIMITER ;

CALL sp_import_radios_csv();

SELECT
    r.radio_code,
    m.name AS manufacturer,
    r.device_type,
    r.protocol,
    r.frequency,
    r.channel_count,
    r.telemetry,
    r.connector,
    r.power_output,
    r.supported_drone_type,
    r.intended_use
FROM radios_receivers r
JOIN manufacturers m
  ON m.manufacturer_id = r.manufacturer_id
ORDER BY r.radio_id
LIMIT 10;

CREATE INDEX idx_radios_manufacturer
    ON radios_receivers(manufacturer_id);

CREATE INDEX idx_radios_protocol
    ON radios_receivers(protocol);

CREATE INDEX idx_radios_frequency
    ON radios_receivers(frequency);

ALTER TABLE radios_receivers
DROP FOREIGN KEY fk_radios_manufacturer;

SELECT COUNT(*) AS orphan_rows

FROM radios_receivers r

LEFT JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE radios_receivers
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE radios_receivers

ADD CONSTRAINT fk_radios_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);


SELECT DISTINCT m.manufacturer_name

FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT
    radio_id,
    manufacturer_id
FROM radios_receivers
WHERE manufacturer_id IN (
    SELECT manufacturer_id
    FROM fake_drn_manufacturers
)
LIMIT 100;

SELECT DISTINCT Brand
FROM radio_csv_staging
ORDER BY Brand;

SELECT
    RadioID,
    Brand
FROM radio_csv_staging
WHERE RadioID IN (
'RAD-0045',
'RAD-0046',
'RAD-0047',
'RAD-0048',
'RAD-0049',
'RAD-0050'
);

SELECT
    manufacturer_id
FROM manufacturers
WHERE manufacturer_name = 'Custom';

UPDATE radios_receivers
SET manufacturer_id = 122
WHERE manufacturer_id = 159;

SELECT DISTINCT m.manufacturer_name

FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT
    r.radio_id,
    r.radio_code,
    r.manufacturer_id,
    m.manufacturer_name
FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name = 'Northrop Grumman';

CREATE TABLE radios_receivers_backup AS
SELECT *
FROM radios_receivers;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE radios_receivers;

SET FOREIGN_KEY_CHECKS = 1;
TRUNCATE TABLE radio_csv_staging;

SELECT DISTINCT m.manufacturer_name

FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;

SELECT COUNT(*) AS orphan_rows

FROM radios_receivers r

LEFT JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

SELECT COUNT(*) FROM radios_receivers;

SELECT COUNT(*)

FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name LIKE 'DRN-%';
SELECT COUNT(*)

FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name = 'Northrop Grumman';

SELECT
    radio_code,
    manufacturer_id
FROM radios_receivers

WHERE manufacturer_id = (
    SELECT manufacturer_id
    FROM manufacturers
    WHERE manufacturer_name = 'Northrop Grumman'
)

LIMIT 20;

SELECT
    RadioID,
    Brand
FROM radio_csv_staging

WHERE RadioID IN (
'RAD-0001',
'RAD-0002',
'RAD-0003',
'RAD-0004',
'RAD-0005'
);

CREATE TABLE manufacturers_backup_final AS
SELECT *
FROM manufacturers;

DELETE FROM manufacturers
WHERE manufacturer_name IN (
    'Northrop Grumman',
    'DRN-0033',
    'Athlon Avia',
    'Pulse',
    'Omnibus'
);

SELECT
    r.radio_code,
    s.Brand
FROM radios_receivers r

JOIN radio_csv_staging s
ON r.radio_code = s.RadioID

LIMIT 20;

UPDATE radios_receivers r

JOIN radio_csv_staging s
ON r.radio_code = s.RadioID

JOIN manufacturers m
ON m.manufacturer_name = s.Brand

SET r.manufacturer_id = m.manufacturer_id;

SELECT DISTINCT m.manufacturer_name

FROM radios_receivers r

JOIN manufacturers m
ON r.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;