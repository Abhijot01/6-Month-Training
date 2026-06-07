USE uav_marketplace;

CREATE TABLE IF NOT EXISTS firmware (
    firmware_id INT AUTO_INCREMENT PRIMARY KEY,

    firmware_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150),

    category VARCHAR(100),
    purpose VARCHAR(150),
    license_type VARCHAR(50),
    supported_hardware VARCHAR(150),
    development_status VARCHAR(50),
    industry_adoption VARCHAR(50),
    typical_use VARCHAR(200)

) ENGINE=InnoDB;

DROP TABLE IF EXISTS firmware_csv_staging;

CREATE TABLE firmware_csv_staging (
    FirmwareID VARCHAR(20),
    Name VARCHAR(150),
    Category VARCHAR(100),
    Purpose VARCHAR(150),
    LicenseType VARCHAR(50),
    SupportedHardware VARCHAR(150),
    DevelopmentStatus VARCHAR(50),
    IndustryAdoption VARCHAR(50),
    TypicalUse VARCHAR(200)
) ENGINE=InnoDB;

TRUNCATE firmware_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/firmware.csv'
INTO TABLE firmware_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8,@c9
)
SET
    FirmwareID = TRIM(@c1),
    Name = TRIM(@c2),
    Category = TRIM(@c3),
    Purpose = TRIM(@c4),
    LicenseType = TRIM(@c5),
    SupportedHardware = TRIM(@c6),
    DevelopmentStatus = TRIM(@c7),
    IndustryAdoption = TRIM(@c8),
    TypicalUse = TRIM(@c9);
    
    DROP PROCEDURE IF EXISTS sp_import_firmware_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_firmware_csv()
BEGIN

    INSERT INTO firmware (
        firmware_code,
        name,
        category,
        purpose,
        license_type,
        supported_hardware,
        development_status,
        industry_adoption,
        typical_use
    )
    SELECT
        TRIM(s.FirmwareID),
        TRIM(s.Name),
        TRIM(s.Category),
        TRIM(s.Purpose),
        TRIM(s.LicenseType),
        TRIM(s.SupportedHardware),
        TRIM(s.DevelopmentStatus),
        TRIM(s.IndustryAdoption),
        TRIM(s.TypicalUse)

    FROM firmware_csv_staging s
    WHERE s.FirmwareID IS NOT NULL
      AND TRIM(s.FirmwareID) != ''

    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        category = VALUES(category),
        purpose = VALUES(purpose),
        license_type = VALUES(license_type),
        supported_hardware = VALUES(supported_hardware),
        development_status = VALUES(development_status),
        industry_adoption = VALUES(industry_adoption),
        typical_use = VALUES(typical_use);

    TRUNCATE firmware_csv_staging;

END$$
DELIMITER ;

CALL sp_import_firmware_csv();

CREATE INDEX idx_fw_category
ON firmware(category);

CREATE INDEX idx_fw_license
ON firmware(license_type);

CREATE INDEX idx_fw_status
ON firmware(development_status);

CREATE INDEX idx_fw_adoption
ON firmware(industry_adoption);