USE uav_marketplace;

CREATE TABLE IF NOT EXISTS software (
    software_id INT AUTO_INCREMENT PRIMARY KEY,

    software_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150),

    software_type VARCHAR(100),
    supported_platform VARCHAR(150),
    license_type VARCHAR(50),
    connection_type VARCHAR(100),
    development_status VARCHAR(50),
    primary_purpose VARCHAR(200)

) ENGINE=InnoDB;

DROP TABLE IF EXISTS software_csv_staging;

CREATE TABLE software_csv_staging (
    SoftwareID VARCHAR(20),
    Name VARCHAR(150),
    SoftwareType VARCHAR(100),
    SupportedPlatform VARCHAR(150),
    LicenseType VARCHAR(50),
    ConnectionType VARCHAR(100),
    DevelopmentStatus VARCHAR(50),
    PrimaryPurpose VARCHAR(200)
) ENGINE=InnoDB;

TRUNCATE software_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/software.csv'
INTO TABLE software_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8
)
SET
    SoftwareID = TRIM(@c1),
    Name = TRIM(@c2),
    SoftwareType = TRIM(@c3),
    SupportedPlatform = TRIM(@c4),
    LicenseType = TRIM(@c5),
    ConnectionType = TRIM(@c6),
    DevelopmentStatus = TRIM(@c7),
    PrimaryPurpose = TRIM(@c8);
    
DROP PROCEDURE IF EXISTS sp_import_software_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_software_csv()
BEGIN

    INSERT INTO software (
        software_code,
        name,
        software_type,
        supported_platform,
        license_type,
        connection_type,
        development_status,
        primary_purpose
    )
    SELECT
        TRIM(s.SoftwareID),
        TRIM(s.Name),
        TRIM(s.SoftwareType),
        TRIM(s.SupportedPlatform),
        TRIM(s.LicenseType),
        TRIM(s.ConnectionType),
        TRIM(s.DevelopmentStatus),
        TRIM(s.PrimaryPurpose)

    FROM software_csv_staging s
    WHERE s.SoftwareID IS NOT NULL
      AND TRIM(s.SoftwareID) != ''

    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        software_type = VALUES(software_type),
        supported_platform = VALUES(supported_platform),
        license_type = VALUES(license_type),
        connection_type = VALUES(connection_type),
        development_status = VALUES(development_status),
        primary_purpose = VALUES(primary_purpose);

    TRUNCATE software_csv_staging;

END$$
DELIMITER ;

CALL sp_import_software_csv();

select count(*) from software_csv_staging;
select count(*) from software;

CREATE INDEX idx_software_type
ON software(software_type);

CREATE INDEX idx_software_platform
ON software(supported_platform);

CREATE INDEX idx_software_license
ON software(license_type);

CREATE INDEX idx_software_status
ON software(development_status);
