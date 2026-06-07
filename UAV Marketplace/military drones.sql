CREATE DATABASE IF NOT EXISTS drone_forensics
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE drone_forensics;
show tables;
SELECT *
FROM drone_platforms;

CREATE TABLE countries (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE manufacturers (
    manufacturer_id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer_name VARCHAR(150) NOT NULL UNIQUE,
    sector VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE drone_platforms (
    platform_id INT AUTO_INCREMENT PRIMARY KEY,
    base_platform_id VARCHAR(100),
    platform_name VARCHAR(150) NOT NULL UNIQUE,

    manufacturer_id INT,
    drone_class VARCHAR(100),

    introduction_year INT,
    status VARCHAR(50),

    FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB;

CREATE TABLE drone_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,

    platform_id INT NOT NULL,
    country_id INT NOT NULL,

    variant_name VARCHAR(150),
    variant_type VARCHAR(100),

    role_primary VARCHAR(150),
    role_secondary VARCHAR(150),

    launch_type VARCHAR(100),
    recovery_type VARCHAR(100),
    propulsion_type VARCHAR(100),

    wingspan_m DECIMAL(6,2),
    mtow_kg DECIMAL(8,2),
    max_payload_kg DECIMAL(8,2),

    endurance_hr DECIMAL(6,2),
    operational_range_km DECIMAL(8,2),
    datalink_range_km DECIMAL(8,2),

    cruise_speed_kmh DECIMAL(6,2),
    max_speed_kmh DECIMAL(6,2),
    service_ceiling_m INT,

    power_source VARCHAR(100),
    armament_capable BOOLEAN,

    sensor_types TEXT,
    notes TEXT,

    FOREIGN KEY (platform_id)
        REFERENCES drone_platforms(platform_id),

    FOREIGN KEY (country_id)
        REFERENCES countries(country_id)
) ENGINE=InnoDB;

CREATE TABLE drone_csv_staging (
    Country VARCHAR(100),
    BasePlatformID VARCHAR(100),
    PlatformName VARCHAR(150),
    VariantName VARCHAR(150),
    VariantType VARCHAR(100),
    Manufacturer VARCHAR(150),
    Sector VARCHAR(100),
    DroneClass VARCHAR(100),
    RolePrimary VARCHAR(150),
    RoleSecondary VARCHAR(150),
    LaunchType VARCHAR(100),
    RecoveryType VARCHAR(100),
    PropulsionType VARCHAR(100),
    Wingspan_m DECIMAL(6,2),
    MTOW_kg DECIMAL(8,2),
    MaxPayload_kg DECIMAL(8,2),
    Endurance_hr DECIMAL(6,2),
    OperationalRange_km DECIMAL(8,2),
    DataLinkRange_km DECIMAL(8,2),
    CruiseSpeed_kmh DECIMAL(6,2),
    MaxSpeed_kmh DECIMAL(6,2),
    ServiceCeiling_m INT,
    PowerSource VARCHAR(100),
    ArmamentCapable VARCHAR(10),
    SensorTypes TEXT,
    IntroductionYear INT,
    Status VARCHAR(50),
    Notes TEXT
) ENGINE=InnoDB;


-- This procedure imports ANY country CSV.
DELIMITER $$

CREATE PROCEDURE sp_import_drone_csv()
BEGIN
    INSERT IGNORE INTO countries (country_name)
    SELECT DISTINCT Country FROM drone_csv_staging;

    INSERT IGNORE INTO manufacturers (manufacturer_name, sector)
    SELECT DISTINCT Manufacturer, Sector
    FROM drone_csv_staging;

    INSERT IGNORE INTO drone_platforms (
        base_platform_id,
        platform_name,
        manufacturer_id,
        drone_class,
        introduction_year,
        status
    )
    SELECT DISTINCT
        s.BasePlatformID,
        s.PlatformName,
        m.manufacturer_id,
        s.DroneClass,
        s.IntroductionYear,
        s.Status
    FROM drone_csv_staging s
    JOIN manufacturers m
      ON s.Manufacturer = m.manufacturer_name;

    INSERT INTO drone_variants (
        platform_id,
        country_id,
        variant_name,
        variant_type,
        role_primary,
        role_secondary,
        launch_type,
        recovery_type,
        propulsion_type,
        wingspan_m,
        mtow_kg,
        max_payload_kg,
        endurance_hr,
        operational_range_km,
        datalink_range_km,
        cruise_speed_kmh,
        max_speed_kmh,
        service_ceiling_m,
        power_source,
        armament_capable,
        sensor_types,
        notes
    )
    SELECT
        p.platform_id,
        c.country_id,
        s.VariantName,
        s.VariantType,
        s.RolePrimary,
        s.RoleSecondary,
        s.LaunchType,
        s.RecoveryType,
        s.PropulsionType,
        s.Wingspan_m,
        s.MTOW_kg,
        s.MaxPayload_kg,
        s.Endurance_hr,
        s.OperationalRange_km,
        s.DataLinkRange_km,
        s.CruiseSpeed_kmh,
        s.MaxSpeed_kmh,
        s.ServiceCeiling_m,
        s.PowerSource,
        IF(s.ArmamentCapable = 'Yes', TRUE, FALSE),
        s.SensorTypes,
        s.Notes
    FROM drone_csv_staging s
    JOIN drone_platforms p
      ON s.PlatformName = p.platform_name
    JOIN countries c
      ON s.Country = c.country_name;
END$$
DELIMITER ;

SHOW VARIABLES LIKE 'secure_file_priv';

-- ---- ---- ---- ---- ----- ----- ----- ----- ----- 
-- Import all CSV files in the below three steps

TRUNCATE TABLE drone_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Military Drones(USA).csv'
INTO TABLE drone_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
  Country,
  BasePlatformID,
  PlatformName,
  VariantName,
  VariantType,
  Manufacturer,
  Sector,
  DroneClass,
  RolePrimary,
  RoleSecondary,
  LaunchType,
  RecoveryType,
  PropulsionType,
  @Wingspan_m,
  @MTOW_kg,
  @MaxPayload_kg,
  @Endurance_hr,
  @OperationalRange_km,
  @DataLinkRange_km,
  @CruiseSpeed_kmh,
  @MaxSpeed_kmh,
  @ServiceCeiling_m,
  PowerSource,
  ArmamentCapable,
  SensorTypes,
  @IntroductionYear,
  Status,
  Notes
)
SET
  Wingspan_m = 
    CASE 
      WHEN @Wingspan_m REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @Wingspan_m ELSE NULL 
    END,

  MTOW_kg = 
    CASE 
      WHEN @MTOW_kg REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @MTOW_kg ELSE NULL 
    END,

  MaxPayload_kg = 
    CASE 
      WHEN @MaxPayload_kg REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @MaxPayload_kg ELSE NULL 
    END,

  Endurance_hr = 
    CASE 
      WHEN @Endurance_hr REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @Endurance_hr ELSE NULL 
    END,

  OperationalRange_km = 
    CASE 
      WHEN @OperationalRange_km REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @OperationalRange_km ELSE NULL 
    END,

  DataLinkRange_km = 
    CASE 
      WHEN @DataLinkRange_km REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @DataLinkRange_km ELSE NULL 
    END,

  CruiseSpeed_kmh = 
    CASE 
      WHEN @CruiseSpeed_kmh REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @CruiseSpeed_kmh ELSE NULL 
    END,

  MaxSpeed_kmh = 
    CASE 
      WHEN @MaxSpeed_kmh REGEXP '^[0-9]+(\\.[0-9]+)?$' 
      THEN @MaxSpeed_kmh ELSE NULL 
    END,

  ServiceCeiling_m = 
    CASE 
      WHEN @ServiceCeiling_m REGEXP '^[0-9]+$' 
      THEN @ServiceCeiling_m ELSE NULL 
    END,

  IntroductionYear = 
    CASE 
      WHEN @IntroductionYear REGEXP '^[0-9]{4}$' 
      THEN @IntroductionYear ELSE NULL 
    END;
	
SELECT COUNT(*) FROM drone_csv_staging;
SELECT * FROM drone_csv_staging;

CALL sp_import_drone_csv();

-- ---- --- --- --- --- --- ---- ---- --- 
-- CHECKING TABLE ENTRIES ---------------
SELECT * FROM drone_variants;

SELECT country_id, country_name
FROM countries
ORDER BY country_id;

SELECT 
    c.country_name,
    COUNT(*) AS variant_count
FROM drone_variants v
JOIN countries c ON v.country_id = c.country_id
GROUP BY c.country_name;

SELECT country_id
FROM countries
WHERE country_name = 'India';

SELECT *
FROM drone_variants
WHERE country_id = 6;

-- ---- --- --- --- --- --- ---- ---- ---

-- INDICES SEACHING ---------------------

CREATE INDEX idx_variants_country
ON drone_variants(country_id);

CREATE INDEX idx_variants_platform
ON drone_variants(platform_id);

CREATE INDEX idx_variants_role_primary
ON drone_variants(role_primary);

CREATE INDEX idx_variants_launch_type
ON drone_variants(launch_type);

CREATE INDEX idx_variants_armament
ON drone_variants(armament_capable);

CREATE INDEX idx_platforms_name
ON drone_platforms(platform_name);

CREATE INDEX idx_countries_name
ON countries(country_name);

SHOW INDEX FROM drone_variants;
-- ------------------------- --------------- --------------------- 

-- Create a dedicated application user
CREATE USER 'drone_app_user'@'localhost'
IDENTIFIED BY 'StrongAppPassword@123';

-- Give ONLY required permissions
GRANT SELECT, INSERT, UPDATE, DELETE
ON drone_forensics.*
TO 'drone_app_user'@'localhost';

-- Apply permissions
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'drone_app_user'@'localhost';

SELECT COUNT(*) FROM countries;
SELECT country_id, country_name
FROM countries
ORDER BY country_name;
SELECT COUNT(DISTINCT country_id)
FROM drone_variants;
SELECT DISTINCT c.country_name
FROM countries c
JOIN drone_variants v ON v.country_id = c.country_id
ORDER BY c.country_name;


SELECT DISTINCT country_name
FROM countries
ORDER BY country_name;

SELECT COUNT(*) 
FROM drone_variants v
JOIN countries c ON v.country_id = c.country_id
WHERE c.country_name = 'India';

SHOW TABLES FROM drone_forensics;

SHOW COLUMNS FROM drone_platforms;
SHOW COLUMNS FROM drone_variants;
SHOW COLUMNS FROM manufacturers;
SHOW COLUMNS FROM drone_csv_staging;
SHOW COLUMNS FROM countries;

ALTER TABLE drone_platforms
ADD COLUMN image_filename VARCHAR(255) NULL;

UPDATE drone_platforms
SET image_filename = 'Heron.jpg'
WHERE platform_name = 'Heron';

UPDATE drone_platforms
SET image_filename = 'MQ-9_Reaper.jpg'
WHERE platform_name = 'MQ-9 Reaper';

UPDATE drone_platforms SET image_filename='MQ-4C_Triton.jpg' WHERE platform_name='MQ-4C Triton';
UPDATE drone_platforms SET image_filename='MQ-28_Ghost_Bat.jpg' WHERE platform_name='MQ-28 Ghost Bat';
UPDATE drone_platforms SET image_filename='Predator_B.jpg' WHERE platform_name='Predator B';
UPDATE drone_platforms SET image_filename='Wasp_AE.jpg' WHERE platform_name='Wasp AE';
UPDATE drone_platforms SET image_filename='RQ-20_Puma.jpg' WHERE platform_name='RQ-20 Puma';
UPDATE drone_platforms SET image_filename='A1CM_Furia.jpg' WHERE platform_name='A1CM Furia';
UPDATE drone_platforms SET image_filename='Ababil-3.jpg' WHERE platform_name='Ababil-3';
UPDATE drone_platforms SET image_filename='AKINCI.jpg' WHERE platform_name='AKINCI';
UPDATE drone_platforms SET image_filename='Alpagu.jpg' WHERE platform_name='Alpagu';
UPDATE drone_platforms SET image_filename='Altus-U.jpg' WHERE platform_name='Altus-U';
UPDATE drone_platforms SET image_filename='ANKA.jpg' WHERE platform_name='ANKA';
UPDATE drone_platforms SET image_filename='Arash-2.jpg' WHERE platform_name='Arash-2';
UPDATE drone_platforms SET image_filename='AU_HYDRA.jpg' WHERE platform_name='AU HYDRA';
UPDATE drone_platforms SET image_filename='Bayraktar.jpg' WHERE platform_name='Bayraktar';
UPDATE drone_platforms SET image_filename='Bayraktar_TB2.jpg' WHERE platform_name='Bayraktar TB2';
UPDATE drone_platforms SET image_filename='Beaver_UAV.jpg' WHERE platform_name='Beaver UAV';
UPDATE drone_platforms SET image_filename='BI0102_1.png' WHERE platform_name='BI0102';
UPDATE drone_platforms SET image_filename='Buraq.jpg' WHERE platform_name='Buraq';
UPDATE drone_platforms SET image_filename='BZK-005.jpg' WHERE platform_name='BZK-005';
UPDATE drone_platforms SET image_filename='CH-3.jpg' WHERE platform_name='CH-3';
UPDATE drone_platforms SET image_filename='CH-4.jpg' WHERE platform_name='CH-4';
UPDATE drone_platforms SET image_filename='CH-5.jpg' WHERE platform_name='CH-5';
UPDATE drone_platforms SET image_filename='CH-901.jpg' WHERE platform_name='CH-901';
UPDATE drone_platforms SET image_filename='CN_ASN15.png' WHERE platform_name='ASN-15';
UPDATE drone_platforms SET image_filename='CN_ASN209.jpeg' WHERE platform_name='ASN-209';
UPDATE drone_platforms SET image_filename='CN_GJ-11_Sharp_Sword.jpeg' WHERE platform_name='GJ-11 Sharp Sword';
UPDATE drone_platforms SET image_filename='CN_WINGLOONG1.jpg' WHERE platform_name='Wing Loong I';
UPDATE drone_platforms SET image_filename='CN_WINGLOONG2.jpg' WHERE platform_name='Wing Loong II';
UPDATE drone_platforms SET image_filename='CN_WJ600.jpg' WHERE platform_name='WJ-600';
UPDATE drone_platforms SET image_filename='CN_WJ700.jpg' WHERE platform_name='WJ-700';
UPDATE drone_platforms SET image_filename='Desert_Hawk_III.jpg' WHERE platform_name='Desert Hawk III';
UPDATE drone_platforms SET image_filename='Devil_Killer.jpg' WHERE platform_name='Devil Killer';
UPDATE drone_platforms SET image_filename='Eitan.jpg' WHERE platform_name='Eitan';
UPDATE drone_platforms SET image_filename='Eleron-3SV.jpg' WHERE platform_name='Eleron-3SV';
UPDATE drone_platforms SET image_filename='EuroMALE.jpg' WHERE platform_name='EuroMALE';
UPDATE drone_platforms SET image_filename='Falco.jpg' WHERE platform_name='Falco';
UPDATE drone_platforms SET image_filename='Forpost.jpg' WHERE platform_name='Forpost';
UPDATE drone_platforms SET image_filename='Fotros.jpg' WHERE platform_name='Fotros';
UPDATE drone_platforms SET image_filename='Gozcu.jpg' WHERE platform_name='Gözcu';
UPDATE drone_platforms SET image_filename='Grom.jpg' WHERE platform_name='Grom';
UPDATE drone_platforms SET image_filename='Harop.jpg' WHERE platform_name='Harop';
UPDATE drone_platforms SET image_filename='Harpy.jpg' WHERE platform_name='Harpy';
UPDATE drone_platforms SET image_filename='Hermes_450.jpg' WHERE platform_name='Hermes 450';
UPDATE drone_platforms SET image_filename='Hermes_900.jpg' WHERE platform_name='Hermes 900';
UPDATE drone_platforms SET image_filename='Heron.jpg' WHERE platform_name='Heron';
UPDATE drone_platforms SET image_filename='Heron_TP.jpg' WHERE platform_name='Heron TP';
UPDATE drone_platforms SET image_filename='Huma.jpg' WHERE platform_name='Huma';
UPDATE drone_platforms SET image_filename='IR_KAMAN22.png' WHERE platform_name='Kaman-22';
UPDATE drone_platforms SET image_filename='IR_SADEGH.jpg' WHERE platform_name='Sadegh';
UPDATE drone_platforms SET image_filename='IR_SHAHED181.jpg' WHERE platform_name='Shahed-181';
UPDATE drone_platforms SET image_filename='Jindivik.jpg' WHERE platform_name='Jindivik';
UPDATE drone_platforms SET image_filename='Kamikaze.jpg' WHERE platform_name='Kamikaze';
UPDATE drone_platforms SET image_filename='Karayel-SU.jpg' WHERE platform_name='Karayel-SU';
UPDATE drone_platforms SET image_filename='Kargu_LM.jpg' WHERE platform_name='Kargu LM';
UPDATE drone_platforms SET image_filename='Kargu.jpg' WHERE platform_name='Kargu';
UPDATE drone_platforms SET image_filename='Kizilelma_MIUS.jpg' WHERE platform_name='Kizilelma MIUS';
UPDATE drone_platforms SET image_filename='K-MAX_Cargo_UAV.jpg' WHERE platform_name='K-MAX Cargo UAV';
UPDATE drone_platforms SET image_filename='KUB-BLA.jpg' WHERE platform_name='KUB-BLA';
UPDATE drone_platforms SET image_filename='Lancet.jpg' WHERE platform_name='Lancet';
UPDATE drone_platforms SET image_filename='Lancet-3.jpg' WHERE platform_name='Lancet-3';
UPDATE drone_platforms SET image_filename='Leleka-100.jpg' WHERE platform_name='Leleka-100';
UPDATE drone_platforms SET image_filename='Mohajer-4.jpg' WHERE platform_name='Mohajer-4';
UPDATE drone_platforms SET image_filename='Mohajer-6.jpg' WHERE platform_name='Mohajer-6';
UPDATE drone_platforms SET image_filename='MQ-1C_Gray_Eagle.jpg' WHERE platform_name='MQ-1C Gray Eagle';
UPDATE drone_platforms SET image_filename='MQ-4C_Triton.jpg' WHERE platform_name='MQ-4C Triton';
UPDATE drone_platforms SET image_filename='MQ-9_Reaper.jpg' WHERE platform_name='MQ-9 Reaper';
UPDATE drone_platforms SET image_filename='MQ-9B_SeaGuardian.jpg' WHERE platform_name='MQ-9B SeaGuardian';
UPDATE drone_platforms SET image_filename='MQ-9B_SkyGuardian.jpg' WHERE platform_name='MQ-9B SkyGuardian';
UPDATE drone_platforms SET image_filename='MQ-25_Stingray.jpg' WHERE platform_name='MQ-25 Stingray';
UPDATE drone_platforms SET image_filename='MQ-28_Ghost_Bat.jpg' WHERE platform_name='MQ-28 Ghost Bat';

UPDATE drone_platforms SET image_filename='Orlan-10.jpg' WHERE platform_name='Orlan-10';
UPDATE drone_platforms SET image_filename='Orlan-30.jpg' WHERE platform_name='Orlan-30';
UPDATE drone_platforms SET image_filename='Patroller.jpg' WHERE platform_name='Patroller';
UPDATE drone_platforms SET image_filename='PD-1.jpeg' WHERE platform_name='PD-1';
UPDATE drone_platforms SET image_filename='PD-2.png' WHERE platform_name='PD-2';
UPDATE drone_platforms SET image_filename='Peregrine.jpg' WHERE platform_name='Peregrine';
UPDATE drone_platforms SET image_filename='Predator.jpg' WHERE platform_name='Predator';
UPDATE drone_platforms SET image_filename='RAM_II.jpg' WHERE platform_name='RAM II';
UPDATE drone_platforms SET image_filename='Raven_RQ-11.jpg' WHERE platform_name='RQ-11 Raven';
UPDATE drone_platforms SET image_filename='RQ-4_Global_Hawk.jpg' WHERE platform_name='RQ-4 Global Hawk';
UPDATE drone_platforms SET image_filename='RQ-7_Shadow.jpg' WHERE platform_name='RQ-7 Shadow';
UPDATE drone_platforms SET image_filename='RQ-20_Puma.jpg' WHERE platform_name='RQ-20 Puma';
UPDATE drone_platforms SET image_filename='RQ-21_Blackjack.jpg' WHERE platform_name='RQ-21 Blackjack';
UPDATE drone_platforms SET image_filename='RQ-101_Songgolmae.jpg' WHERE platform_name='RQ-101 Songgolmae';
UPDATE drone_platforms SET image_filename='RQ-170_Sentinel.jpg' WHERE platform_name='RQ-170 Sentinel';
UPDATE drone_platforms SET image_filename='RQ-180.webp' WHERE platform_name='RQ-180';
UPDATE drone_platforms SET image_filename='Rustom-II.jpg' WHERE platform_name='Rustom-II';
UPDATE drone_platforms SET image_filename='S-70_Okhotnik.jpg' WHERE platform_name='S-70 Okhotnik';
UPDATE drone_platforms SET image_filename='ScanEagle.jpg' WHERE platform_name='ScanEagle';
UPDATE drone_platforms SET image_filename='Searcher.jpg' WHERE platform_name='Searcher';
UPDATE drone_platforms SET image_filename='Shahed-129.jpg' WHERE platform_name='Shahed-129';
UPDATE drone_platforms SET image_filename='Shahed-131.jpg' WHERE platform_name='Shahed-131';
UPDATE drone_platforms SET image_filename='Shahed-136.jpg' WHERE platform_name='Shahed-136';
UPDATE drone_platforms SET image_filename='Shahed-149_Gaza.jpg' WHERE platform_name='Shahed-149 Gaza';
UPDATE drone_platforms SET image_filename='Shahed-191.jpg' WHERE platform_name='Shahed-191';
UPDATE drone_platforms SET image_filename='Shahpur-II.jpg' WHERE platform_name='Shahpur-II';
UPDATE drone_platforms SET image_filename='Sky-Y.jpg' WHERE platform_name='Sky-Y';
UPDATE drone_platforms SET image_filename='Sokol-300.jpg' WHERE platform_name='Sokol-300';
UPDATE drone_platforms SET image_filename='Spectator-M1.jpg' WHERE platform_name='Spectator-M1';
UPDATE drone_platforms SET image_filename='Switchblade_600.jpg' WHERE platform_name='Switchblade 600';
UPDATE drone_platforms SET image_filename='Switchblade_300.jpg' WHERE platform_name='Switchblade 300';
UPDATE drone_platforms SET image_filename='Takhion.jpg' WHERE platform_name='Takhion';
UPDATE drone_platforms SET image_filename='Taranis.jpg' WHERE platform_name='Taranis';
UPDATE drone_platforms SET image_filename='UJ-22_Airborne.jpg' WHERE platform_name='UJ-22 Airborne';
UPDATE drone_platforms SET image_filename='Uqab.jpg' WHERE platform_name='Uqab';
UPDATE drone_platforms SET image_filename='Watchkeeper_WK450.jpg' WHERE platform_name='Watchkeeper WK450';
UPDATE drone_platforms SET image_filename='WZ-7_Soaring_Dragon.jpg' WHERE platform_name='WZ-7 Soaring Dragon';
UPDATE drone_platforms SET image_filename='X-47B.jpg' WHERE platform_name='X-47B';
UPDATE drone_platforms SET image_filename='X-58A_Valkyrie.jpg' WHERE platform_name='X-58A Valkyrie';
UPDATE drone_platforms SET image_filename='Yasir.jpg' WHERE platform_name='Yasir';
UPDATE drone_platforms SET image_filename='ZALA.jpg' WHERE platform_name='ZALA';

UPDATE drone_platforms SET image_filename='Naval_UAV.jpg' WHERE platform_name='Naval UAV';
UPDATE drone_platforms SET image_filename='nEUROn.jpg' WHERE platform_name='nEUROn';
UPDATE drone_platforms SET image_filename='Nishant.jpg' WHERE platform_name='Nishant';
UPDATE drone_platforms SET image_filename='RQ-11_Raven.jpg' WHERE platform_name='RQ-11 Raven';
UPDATE drone_platforms SET image_filename='RemoEye_002B.jpg' WHERE platform_name='RemoEye 002B';
UPDATE drone_platforms SET image_filename='ujab.jpg' WHERE platform_name='Uqab';
UPDATE drone_platforms SET image_filename='Orion_E.jpg' WHERE platform_name='Orion';
UPDATE drone_platforms SET image_filename='Switchblade_300_usa.jpg' WHERE platform_name='Switchblade 300';
UPDATE drone_platforms SET image_filename='Switchblade_600_usa.jpg' WHERE platform_name='Switchblade 600';
UPDATE drone_platforms SET image_filename='SeaGuardian.jpg' WHERE platform_name='MQ-9B SeaGuardian';




-- not updated in the database--------------------------------------------------------------------------------------
UPDATE drone_platforms SET image_filename='Orion_M.jpg' WHERE platform_name='Orion M';
UPDATE drone_platforms SET image_filename='Patroller.jpg' WHERE platform_name='Patroller';
UPDATE drone_platforms SET image_filename='PD-1.jpeg' WHERE platform_name='PD-1';
UPDATE drone_platforms SET image_filename='PD-2.png' WHERE platform_name='PD-2';
UPDATE drone_platforms SET image_filename='RQ-20_Puma.jpg' WHERE platform_name='RQ-20 Puma';
UPDATE drone_platforms SET image_filename='RQ-7_Shadow.jpg' WHERE platform_name='RQ-7 Shadow';
UPDATE drone_platforms SET image_filename='ScanEagle.jpg' WHERE platform_name='ScanEagle';
UPDATE drone_platforms SET image_filename='Watchkeeper_WK450.jpg' WHERE platform_name='Watchkeeper WK450';
UPDATE drone_platforms SET image_filename='WZ-7_Soaring_Dragon.jpg' WHERE platform_name='WZ-7 Soaring Dragon';
UPDATE drone_platforms SET image_filename='X-47B.jpg' WHERE platform_name='X-47B';
UPDATE drone_platforms SET image_filename='X-58A_Valkyrie.jpg' WHERE platform_name='X-58A Valkyrie';
UPDATE drone_platforms SET image_filename='Yasir.jpg' WHERE platform_name='Yasir';
UPDATE drone_platforms SET image_filename='ZALA.jpg' WHERE platform_name='ZALA';
-- ----------------------------------------------------------------------------------------------------




SELECT platform_name, image_filename
FROM drone_platforms
WHERE image_filename IS NOT NULL;

SELECT COUNT(*) 
FROM drone_platforms
WHERE image_filename IS NOT NULL;

SELECT platform_name
FROM drone_platforms
WHERE image_filename IS NULL;

SELECT platform_name FROM drone_platforms WHERE platform_name LIKE '%RQ%';
SELECT platform_name FROM drone_platforms WHERE platform_name LIKE '%PD%';
SELECT platform_name FROM drone_platforms WHERE platform_name LIKE '%WZ%';
SELECT platform_name FROM drone_platforms WHERE platform_name LIKE '%Watch%';

SELECT platform_name, image_filename
FROM drone_platforms
WHERE platform_name = 'RQ-7 Shadow';