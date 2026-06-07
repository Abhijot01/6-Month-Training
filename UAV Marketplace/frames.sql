USE uav_marketplace;
describe frames;
CREATE TABLE frames (
    frame_id INT AUTO_INCREMENT PRIMARY KEY,

    frame_code VARCHAR(20) NOT NULL UNIQUE,      -- FRM-0001
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),                   -- FPV Frame, Fixed Wing
    frame_type VARCHAR(100),                     -- Whoop Frame, Freestyle Frame
    size_inch VARCHAR(20),
    wheelbase_mm VARCHAR(20),
    material VARCHAR(100),
    arm_type VARCHAR(50),
    mounting VARCHAR(50),
    supported_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_frames_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE frame_csv_staging (
    FrameID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    FrameType VARCHAR(100),
    Size_Inch VARCHAR(20),
    Wheelbase VARCHAR(20),
    Material VARCHAR(100),
    ArmType VARCHAR(50),
    Mounting VARCHAR(50),
    Supported VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;


TRUNCATE frame_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Frames.csv'
INTO TABLE frame_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6,
    @c7, @c8, @c9, @c10, @c11, @c12
)
SET
    FrameID     = @c1,
    Brand       = @c2,
    Category    = @c3,
    SubCategory = @c4,
    FrameType   = @c5,
    Size_Inch   = @c6,
    Wheelbase   = @c7,
    Material    = @c8,
    ArmType     = @c9,
    Mounting    = @c10,
    Supported   = @c11,
    IntendedUse = @c12;




DROP PROCEDURE IF EXISTS sp_import_frames_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_frames_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_code VARCHAR(20);
    DECLARE v_brand VARCHAR(100);
    DECLARE v_subcat VARCHAR(100);
    DECLARE v_type VARCHAR(100);
    DECLARE v_size VARCHAR(20);
    DECLARE v_wheelbase VARCHAR(20);
    DECLARE v_material VARCHAR(100);
    DECLARE v_arm VARCHAR(50);
    DECLARE v_mount VARCHAR(50);
    DECLARE v_supported VARCHAR(100);
    DECLARE v_use VARCHAR(150);

    DECLARE cur CURSOR FOR
        SELECT
            FrameID,
            Brand,
            SubCategory,
            FrameType,
            Size_Inch,
            Wheelbase,
            Material,
            ArmType,
            Mounting,
            Supported,
            IntendedUse
        FROM frame_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_code,
            v_brand,
            v_subcat,
            v_type,
            v_size,
            v_wheelbase,
            v_material,
            v_arm,
            v_mount,
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

        INSERT IGNORE INTO frames (
            frame_code,
            manufacturer_id,
            sub_category,
            frame_type,
            size_inch,
            wheelbase_mm,
            material,
            arm_type,
            mounting,
            supported_drone_type,
            intended_use
        )
        SELECT
            TRIM(v_code),
            m.manufacturer_id,
            TRIM(v_subcat),
            TRIM(v_type),
            TRIM(v_size),
            TRIM(v_wheelbase),
            TRIM(v_material),
            TRIM(v_arm),
            TRIM(v_mount),
            TRIM(v_supported),
            TRIM(v_use)
        FROM manufacturers m
        WHERE m.manufacturer_name = TRIM(v_brand);

    END LOOP;

    CLOSE cur;
    TRUNCATE frame_csv_staging;
END$$
DELIMITER ;

CALL sp_import_frames_csv();

SELECT
    f.frame_code,
    m.name AS manufacturer,
    f.frame_type,
    f.size_inch,
    f.wheelbase_mm,
    f.material,
    f.arm_type,
    f.mounting,
    f.supported_drone_type,
    f.intended_use
FROM frames f
JOIN manufacturers m
  ON m.manufacturer_id = f.manufacturer_id
ORDER BY f.frame_id
LIMIT 10;

CREATE INDEX idx_frames_manufacturer
    ON frames(manufacturer_id);

CREATE INDEX idx_frames_type
    ON frames(frame_type);

CREATE INDEX idx_frames_size
    ON frames(size_inch);

UPDATE frames
SET size_inch = 5
WHERE size_inch NOT REGEXP '^[0-9]+$';


SELECT DISTINCT m.manufacturer_name
FROM frames f
JOIN manufacturers m
  ON f.manufacturer_id = m.manufacturer_id
ORDER BY m.manufacturer_name;

SELECT COUNT(*) AS military_contamination_count
FROM frames f
JOIN manufacturers m
  ON f.manufacturer_id = m.manufacturer_id
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
FROM frames
WHERE manufacturer_id = 1;
