USE uav_marketplace;

CREATE TABLE IF NOT EXISTS cameras (
    camera_id INT AUTO_INCREMENT PRIMARY KEY,

    camera_code VARCHAR(20) NOT NULL UNIQUE,
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),
    camera_type VARCHAR(100),
    sensor_type VARCHAR(100),
    resolution VARCHAR(50),
    video_system VARCHAR(100),
    lens_size_mm DECIMAL(5,2),
    field_of_view_deg INT,
    interface_type VARCHAR(50),
    mount_type VARCHAR(50),
    weight_g INT,
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_camera_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS camera_csv_staging;

CREATE TABLE camera_csv_staging (
    CameraID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    CameraType VARCHAR(100),
    SensorType VARCHAR(100),
    Resolution VARCHAR(50),
    VideoSystem VARCHAR(100),
    LensSize_mm VARCHAR(20),
    FieldOfView_deg VARCHAR(20),
    Interface VARCHAR(50),
    MountType VARCHAR(50),
    Weight_g VARCHAR(20),
    SupportedDroneType VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB;

TRUNCATE camera_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/camera.csv'
INTO TABLE camera_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8,@c9,@c10,@c11,@c12,@c13,@c14,@c15
)
SET
    CameraID = TRIM(@c1),
    Brand = TRIM(@c2),
    Category = TRIM(@c3),
    SubCategory = TRIM(@c4),
    CameraType = TRIM(@c5),
    SensorType = TRIM(@c6),
    Resolution = TRIM(@c7),
    VideoSystem = TRIM(@c8),
    LensSize_mm = TRIM(@c9),
    FieldOfView_deg = TRIM(@c10),
    Interface = TRIM(@c11),
    MountType = TRIM(@c12),
    Weight_g = TRIM(@c13),
    SupportedDroneType = TRIM(@c14),
    IntendedUse = TRIM(@c15);
    
    DROP PROCEDURE IF EXISTS sp_import_camera_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_camera_csv()
BEGIN

    -- Normalize manufacturers
    INSERT IGNORE INTO manufacturers (manufacturer_name)
    SELECT DISTINCT UPPER(TRIM(Brand))
    FROM camera_csv_staging
    WHERE Brand IS NOT NULL AND TRIM(Brand) != '';

    -- Insert / Update cameras
    INSERT INTO cameras (
        camera_code,
        manufacturer_id,
        sub_category,
        camera_type,
        sensor_type,
        resolution,
        video_system,
        lens_size_mm,
        field_of_view_deg,
        interface_type,
        mount_type,
        weight_g,
        supported_drone_type,
        intended_use
    )
    SELECT
        TRIM(s.CameraID),
        m.manufacturer_id,
        TRIM(s.SubCategory),
        TRIM(s.CameraType),
        TRIM(s.SensorType),
        TRIM(s.Resolution),
        TRIM(s.VideoSystem),

        CAST(NULLIF(NULLIF(TRIM(s.LensSize_mm), ''), 'N/A') AS DECIMAL(5,2)),
        CAST(NULLIF(NULLIF(TRIM(s.FieldOfView_deg), ''), 'N/A') AS UNSIGNED),

        TRIM(s.Interface),
        TRIM(s.MountType),

        CAST(NULLIF(NULLIF(TRIM(s.Weight_g), ''), 'N/A') AS UNSIGNED),

        TRIM(s.SupportedDroneType),
        TRIM(s.IntendedUse)

    FROM camera_csv_staging s
    JOIN manufacturers m
      ON m.manufacturer_name = UPPER(TRIM(s.Brand))

    WHERE s.CameraID IS NOT NULL
      AND TRIM(s.CameraID) != ''

    ON DUPLICATE KEY UPDATE
        manufacturer_id = VALUES(manufacturer_id),
        sub_category = VALUES(sub_category),
        camera_type = VALUES(camera_type),
        sensor_type = VALUES(sensor_type),
        resolution = VALUES(resolution),
        video_system = VALUES(video_system),
        lens_size_mm = VALUES(lens_size_mm),
        field_of_view_deg = VALUES(field_of_view_deg),
        interface_type = VALUES(interface_type),
        mount_type = VALUES(mount_type),
        weight_g = VALUES(weight_g),
        supported_drone_type = VALUES(supported_drone_type),
        intended_use = VALUES(intended_use);

    TRUNCATE camera_csv_staging;

END$$
DELIMITER ;

CALL sp_import_camera_csv();

CREATE INDEX idx_camera_manufacturer
ON cameras(manufacturer_id);

CREATE INDEX idx_camera_type
ON cameras(camera_type);

CREATE INDEX idx_camera_resolution
ON cameras(resolution);

CREATE INDEX idx_camera_weight
ON cameras(weight_g);

CREATE INDEX idx_camera_interface
ON cameras(interface_type);

SELECT
    CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'cameras'
AND TABLE_SCHEMA = 'drone_forensics'
AND REFERENCED_TABLE_NAME IS NOT NULL;

ALTER TABLE cameras
DROP FOREIGN KEY fk_camera_manufacturer;
SELECT COUNT(*) AS orphan_rows

FROM cameras c

LEFT JOIN manufacturers m
ON c.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE cameras
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE cameras

ADD CONSTRAINT fk_camera_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);

SHOW CREATE TABLE cameras;

UPDATE cameras
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

SELECT DISTINCT m.manufacturer_name
FROM cameras c
JOIN manufacturers m
  ON c.manufacturer_id = m.manufacturer_id
ORDER BY m.manufacturer_name;

SELECT COUNT(*) AS military_contamination_count
FROM cameras c
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

SELECT COUNT(*) AS manufacturer_id_1_count
FROM cameras
WHERE manufacturer_id = 1;

SELECT
    CameraID,
    Brand
FROM camera_csv_staging
LIMIT 25;

SELECT DISTINCT s.Brand
FROM camera_csv_staging s
LEFT JOIN manufacturers m
  ON m.manufacturer_name = s.Brand
WHERE m.manufacturer_id IS NULL
ORDER BY s.Brand;

UPDATE cameras c
JOIN camera_csv_staging s
  ON c.camera_code = s.CameraID
JOIN manufacturers m
  ON m.manufacturer_name = s.Brand
SET c.manufacturer_id = m.manufacturer_id;

SELECT COUNT(*) AS military_contamination_count
FROM cameras c
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

SELECT COUNT(*) AS manufacturer_id_1_count
FROM cameras
WHERE manufacturer_id = 1;

SELECT
    c.camera_code,
    m.manufacturer_name
FROM cameras c
JOIN manufacturers m
  ON c.manufacturer_id = m.manufacturer_id
WHERE c.camera_code IN (
    'CAM-0001',
    'CAM-0002',
    'CAM-0003',
    'CAM-0004',
    'CAM-0005'
);

SELECT DISTINCT m.manufacturer_name
FROM cameras c
JOIN manufacturers m
  ON c.manufacturer_id = m.manufacturer_id
ORDER BY m.manufacturer_name;

SELECT
    m.manufacturer_name,
    COUNT(*) AS component_count
FROM cameras c
JOIN manufacturers m
  ON c.manufacturer_id = m.manufacturer_id
GROUP BY m.manufacturer_name
ORDER BY m.manufacturer_name;