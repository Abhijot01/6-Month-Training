USE uav_marketplace;

CREATE TABLE IF NOT EXISTS video_transmitters (
    vtx_id INT AUTO_INCREMENT PRIMARY KEY,

    vtx_code VARCHAR(20) NOT NULL UNIQUE,
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),
    video_system VARCHAR(100),
    frequency_band VARCHAR(50),
    output_power_mw INT,
    channel_count INT,
    input_voltage VARCHAR(100),
    antenna_connector VARCHAR(50),
    control_protocol VARCHAR(50),
    mount_pattern VARCHAR(50),
    antenna_type VARCHAR(50),
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_vtx_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB;

Drop table video_transmitters;
DROP TABLE IF EXISTS vtx_csv_staging;

CREATE TABLE vtx_csv_staging (
    VTXID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    VideoSystem VARCHAR(100),
    FrequencyBand VARCHAR(50),
    OutputPower VARCHAR(20),
    ChannelCount VARCHAR(20),
    InputVoltage VARCHAR(100),
    AntennaConnector VARCHAR(50),
    ControlProtocol VARCHAR(50),
    MountPattern VARCHAR(50),
    AntennaType VARCHAR(50),
    SupportedDroneType VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB;

TRUNCATE vtx_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/video_transmitters.csv'
INTO TABLE vtx_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8,@c9,@c10,@c11,@c12,@c13,@c14,@c15
)
SET
    VTXID = TRIM(@c1),
    Brand = TRIM(@c2),
    Category = TRIM(@c3),
    SubCategory = TRIM(@c4),
    VideoSystem = TRIM(@c5),
    FrequencyBand = TRIM(@c6),
    OutputPower = TRIM(@c7),
    ChannelCount = TRIM(@c8),
    InputVoltage = TRIM(@c9),
    AntennaConnector = TRIM(@c10),
    ControlProtocol = TRIM(@c11),
    MountPattern = TRIM(@c12),
    AntennaType = TRIM(@c13),
    SupportedDroneType = TRIM(@c14),
    IntendedUse = TRIM(@c15);

DROP PROCEDURE IF EXISTS sp_import_vtx_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_vtx_csv()
BEGIN

    -- Insert manufacturers
    INSERT IGNORE INTO manufacturers (manufacturer_name)
    SELECT DISTINCT TRIM(Brand)
    FROM vtx_csv_staging
    WHERE Brand IS NOT NULL AND TRIM(Brand) != '';

    -- Insert / Update VTX
    INSERT INTO video_transmitters (
        vtx_code,
        manufacturer_id,
        sub_category,
        video_system,
        frequency_band,
        output_power_mw,
        channel_count,
        input_voltage,
        antenna_connector,
        control_protocol,
        mount_pattern,
        antenna_type,
        supported_drone_type,
        intended_use
    )
    SELECT
        TRIM(s.VTXID),
        m.manufacturer_id,
        TRIM(s.SubCategory),
        TRIM(s.VideoSystem),
        TRIM(s.FrequencyBand),

        CAST(NULLIF(NULLIF(TRIM(s.OutputPower), ''), 'N/A') AS UNSIGNED),
        CAST(NULLIF(NULLIF(TRIM(s.ChannelCount), ''), 'N/A') AS UNSIGNED),

        TRIM(s.InputVoltage),
        TRIM(s.AntennaConnector),
        TRIM(s.ControlProtocol),
        TRIM(s.MountPattern),
        TRIM(s.AntennaType),
        TRIM(s.SupportedDroneType),
        TRIM(s.IntendedUse)

    FROM vtx_csv_staging s
    JOIN manufacturers m
      ON m.manufacturer_name = TRIM(s.Brand)

    WHERE s.VTXID IS NOT NULL
      AND TRIM(s.VTXID) != ''

    ON DUPLICATE KEY UPDATE
        manufacturer_id = VALUES(manufacturer_id),
        sub_category = VALUES(sub_category),
        video_system = VALUES(video_system),
        frequency_band = VALUES(frequency_band),
        output_power_mw = VALUES(output_power_mw),
        channel_count = VALUES(channel_count),
        input_voltage = VALUES(input_voltage),
        antenna_connector = VALUES(antenna_connector),
        control_protocol = VALUES(control_protocol),
        mount_pattern = VALUES(mount_pattern),
        antenna_type = VALUES(antenna_type),
        supported_drone_type = VALUES(supported_drone_type),
        intended_use = VALUES(intended_use);

    -- Clean staging
    TRUNCATE vtx_csv_staging;

END$$
DELIMITER ;


CALL sp_import_vtx_csv();

SELECT COUNT(*) FROM video_transmitters;
SELECT COUNT(*) FROM vtx_csv_staging;
SELECT
    v.vtx_code,
    m.name,
    v.frequency_band,
    v.output_power_mw
FROM video_transmitters v
JOIN manufacturers m
ON v.manufacturer_id = m.manufacturer_id
LIMIT 10;


CREATE INDEX idx_vtx_manufacturer
ON video_transmitters(manufacturer_id);

CREATE INDEX idx_vtx_frequency
ON video_transmitters(frequency_band);

CREATE INDEX idx_vtx_power
ON video_transmitters(output_power_mw);

CREATE INDEX idx_vtx_channel
ON video_transmitters(channel_count);

CREATE INDEX idx_vtx_protocol
ON video_transmitters(control_protocol);

CREATE INDEX idx_vtx_platform
ON video_transmitters(supported_drone_type);



ALTER TABLE video_transmitters
DROP FOREIGN KEY fk_vtx_manufacturer;

SELECT COUNT(*) AS orphan_rows

FROM video_transmitters v

LEFT JOIN manufacturers m
ON v.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE video_transmitters
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE video_transmitters

ADD CONSTRAINT fk_vtx_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);


SELECT DISTINCT Brand
FROM vtx_csv_staging
ORDER BY Brand;

SELECT
    VTXID,
    Brand
FROM vtx_csv_staging
LIMIT 20;

SELECT
    VTXID,
    Brand
FROM vtx_csv_staging
LIMIT 20;

UPDATE video_transmitters v

JOIN vtx_csv_staging s
ON v.vtx_code = s.VTXID

JOIN manufacturers m
ON m.manufacturer_name = s.Brand

SET v.manufacturer_id = m.manufacturer_id;

SELECT DISTINCT m.manufacturer_name

FROM video_transmitters v

JOIN manufacturers m
ON v.manufacturer_id = m.manufacturer_id

ORDER BY m.manufacturer_name;
SELECT COUNT(*)

FROM video_transmitters v

JOIN manufacturers m
ON v.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_name = 'Northrop Grumman';

