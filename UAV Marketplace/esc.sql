USE uav_marketplace;
describe esc;

CREATE TABLE IF NOT EXISTS esc (
    esc_id INT AUTO_INCREMENT PRIMARY KEY,

    esc_code VARCHAR(20) NOT NULL UNIQUE,
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),
    esc_type VARCHAR(100),
    continuous_current_a INT,
    burst_current_a INT,
    supported_voltage VARCHAR(50),
    firmware VARCHAR(50),
    input_protocol VARCHAR(50),
    mount_pattern VARCHAR(50),
    bec_output VARCHAR(50),
    cooling_method VARCHAR(50),
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_esc_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS esc_csv_staging;

CREATE TABLE esc_csv_staging (
    ESCID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    ESCType VARCHAR(100),
    ContinuousCurrent_A VARCHAR(20),
    BurstCurrent_A VARCHAR(20),
    SupportedVoltage VARCHAR(50),
    Firmware VARCHAR(50),
    InputProtocol VARCHAR(50),
    MountPattern VARCHAR(50),
    BEC_Output VARCHAR(50),
    CoolingMethod VARCHAR(50),
    SupportedDrone VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB;

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
    
    
    DROP PROCEDURE IF EXISTS sp_import_esc_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_esc_csv()
BEGIN

    -- Normalize manufacturers
    INSERT IGNORE INTO manufacturers (name)
    SELECT DISTINCT UPPER(TRIM(Brand))
    FROM esc_csv_staging
    WHERE Brand IS NOT NULL AND TRIM(Brand) != '';

    -- Insert / Update ESC
    INSERT INTO esc (
        esc_code,
        manufacturer_id,
        sub_category,
        esc_type,
        continuous_current_a,
        burst_current_a,
        supported_voltage,
        firmware,
        input_protocol,
        mount_pattern,
        bec_output,
        cooling_method,
        supported_drone_type,
        intended_use
    )
    SELECT
        TRIM(s.ESCID),
        m.manufacturer_id,
        TRIM(s.SubCategory),
        TRIM(s.ESCType),

        CAST(NULLIF(NULLIF(TRIM(s.ContinuousCurrent_A), ''), 'N/A') AS UNSIGNED),
        CAST(NULLIF(NULLIF(TRIM(s.BurstCurrent_A), ''), 'N/A') AS UNSIGNED),

        TRIM(s.SupportedVoltage),
        TRIM(s.Firmware),
        TRIM(s.InputProtocol),
        TRIM(s.MountPattern),
        TRIM(s.BEC_Output),
        TRIM(s.CoolingMethod),
        TRIM(s.SupportedDrone),
        TRIM(s.IntendedUse)

    FROM esc_csv_staging s
    JOIN manufacturers m
      ON m.name = UPPER(TRIM(s.Brand))

    WHERE s.ESCID IS NOT NULL
      AND TRIM(s.ESCID) != ''

    ON DUPLICATE KEY UPDATE
        manufacturer_id = VALUES(manufacturer_id),
        sub_category = VALUES(sub_category),
        esc_type = VALUES(esc_type),
        continuous_current_a = VALUES(continuous_current_a),
        burst_current_a = VALUES(burst_current_a),
        supported_voltage = VALUES(supported_voltage),
        firmware = VALUES(firmware),
        input_protocol = VALUES(input_protocol),
        mount_pattern = VALUES(mount_pattern),
        bec_output = VALUES(bec_output),
        cooling_method = VALUES(cooling_method),
        supported_drone_type = VALUES(supported_drone_type),
        intended_use = VALUES(intended_use);

    TRUNCATE esc_csv_staging;

END$$
DELIMITER ;

CALL sp_import_esc_csv();


CREATE INDEX idx_esc_manufacturer
ON esc(manufacturer_id);

CREATE INDEX idx_esc_current
ON esc(continuous_current_a);

CREATE INDEX idx_esc_voltage
ON esc(supported_voltage);

CREATE INDEX idx_esc_firmware
ON esc(firmware);

CREATE INDEX idx_esc_protocol
ON esc(input_protocol);
