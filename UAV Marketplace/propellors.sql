USE uav_marketplace;
show databases;
show tables;
CREATE TABLE propellers (
    propeller_id INT AUTO_INCREMENT PRIMARY KEY,

    prop_code VARCHAR(20) NOT NULL UNIQUE,     -- PROP-0001
    manufacturer_id INT NOT NULL,

    sub_category VARCHAR(100),                 -- FPV Props, Cinewhoop, Fixed Wing
    prop_type VARCHAR(50),                     -- Standard, Signature, Ducted
    diameter_in VARCHAR(20),
    pitch_in VARCHAR(20),
    blade_count VARCHAR(10),
    material VARCHAR(100),
    mount_type VARCHAR(50),
    rotation VARCHAR(20),
    compatible_drone_type VARCHAR(100),
    intended_use VARCHAR(150),

    CONSTRAINT fk_propellers_manufacturer
        FOREIGN KEY (manufacturer_id)
        REFERENCES manufacturers(manufacturer_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE propeller_csv_staging (
    PropID VARCHAR(20),
    Brand VARCHAR(100),
    Category VARCHAR(50),
    SubCategory VARCHAR(100),
    PropType VARCHAR(50),
    Diameter VARCHAR(20),
    Pitch VARCHAR(20),
    BladeCount VARCHAR(10),
    Material VARCHAR(100),
    MountType VARCHAR(50),
    Rotation VARCHAR(20),
    Compatible VARCHAR(100),
    IntendedUse VARCHAR(150)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE utf8mb4_unicode_ci;

TRUNCATE propeller_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Propellors.csv'
INTO TABLE propeller_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(
    @c1, @c2, @c3, @c4, @c5, @c6,
    @c7, @c8, @c9, @c10, @c11, @c12, @c13
)
SET
    PropID        = @c1,
    Brand         = @c2,
    Category      = @c3,
    SubCategory   = @c4,
    PropType      = @c5,
    Diameter      = @c6,
    Pitch         = @c7,
    BladeCount    = @c8,
    Material      = @c9,
    MountType     = @c10,
    Rotation      = @c11,
    Compatible    = @c12,
    IntendedUse   = @c13;

DROP PROCEDURE IF EXISTS sp_import_propellers_csv;
DELIMITER $$

CREATE PROCEDURE sp_import_propellers_csv()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_code VARCHAR(20);
    DECLARE v_brand VARCHAR(100);
    DECLARE v_subcat VARCHAR(100);
    DECLARE v_type VARCHAR(50);
    DECLARE v_diam VARCHAR(20);
    DECLARE v_pitch VARCHAR(20);
    DECLARE v_blades VARCHAR(10);
    DECLARE v_material VARCHAR(100);
    DECLARE v_mount VARCHAR(50);
    DECLARE v_rotation VARCHAR(20);
    DECLARE v_compat VARCHAR(100);
    DECLARE v_use VARCHAR(150);

    DECLARE cur CURSOR FOR
        SELECT
            PropID,
            Brand,
            SubCategory,
            PropType,
            Diameter,
            Pitch,
            BladeCount,
            Material,
            MountType,
            Rotation,
            Compatible,
            IntendedUse
        FROM propeller_csv_staging;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO
            v_code,
            v_brand,
            v_subcat,
            v_type,
            v_diam,
            v_pitch,
            v_blades,
            v_material,
            v_mount,
            v_rotation,
            v_compat,
            v_use;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF v_code IS NULL OR TRIM(v_code) = '' THEN
            ITERATE read_loop;
        END IF;

        INSERT IGNORE INTO manufacturers (name)
        VALUES (TRIM(v_brand));

        INSERT IGNORE INTO propellers (
            prop_code,
            manufacturer_id,
            sub_category,
            prop_type,
            diameter_in,
            pitch_in,
            blade_count,
            material,
            mount_type,
            rotation,
            compatible_drone_type,
            intended_use
        )
        SELECT
            TRIM(v_code),
            m.manufacturer_id,
            TRIM(v_subcat),
            TRIM(v_type),
            TRIM(v_diam),
            TRIM(v_pitch),
            TRIM(v_blades),
            TRIM(v_material),
            TRIM(v_mount),
            TRIM(v_rotation),
            TRIM(v_compat),
            TRIM(v_use)
        FROM manufacturers m
        WHERE m.name = TRIM(v_brand);

    END LOOP;

    CLOSE cur;
    TRUNCATE propeller_csv_staging;
END$$
DELIMITER ;


CALL sp_import_propellers_csv();

SELECT
    p.prop_code,
    m.name AS manufacturer,
    p.prop_type,
    p.diameter_in,
    p.pitch_in,
    p.blade_count,
    p.mount_type,
    p.rotation,
    p.compatible_drone_type,
    p.intended_use
FROM propellers p
JOIN manufacturers m
  ON m.manufacturer_id = p.manufacturer_id
ORDER BY p.propeller_id
LIMIT 10;


CREATE INDEX idx_propellers_manufacturer
    ON propellers(manufacturer_id);

CREATE INDEX idx_propellers_size
    ON propellers(diameter_in);

CREATE INDEX idx_propellers_type
    ON propellers(prop_type);


ALTER TABLE propellers
DROP FOREIGN KEY fk_propellers_manufacturer;

SELECT COUNT(*) AS orphan_rows

FROM propellers p

LEFT JOIN manufacturers m
ON p.manufacturer_id = m.manufacturer_id

WHERE m.manufacturer_id IS NULL;

UPDATE propellers
SET manufacturer_id = 1
WHERE manufacturer_id NOT IN (
    SELECT manufacturer_id
    FROM manufacturers
);

ALTER TABLE propellers

ADD CONSTRAINT fk_propellers_manufacturer

FOREIGN KEY (manufacturer_id)

REFERENCES manufacturers(manufacturer_id);

SHOW CREATE TABLE propellers;

SELECT DISTINCT m.manufacturer_name
FROM propellers p
JOIN manufacturers m
  ON p.manufacturer_id = m.manufacturer_id
ORDER BY m.manufacturer_name;

SELECT COUNT(*) AS military_contamination_count
FROM propellers p
JOIN manufacturers m
  ON p.manufacturer_id = m.manufacturer_id
WHERE m.manufacturer_name IN (
    'Northrop Grumman',
    'DRN-0033',
    'Pulse',
    'Athlon Avia',
    'Omnibus',
    'Izhmash Unmanned Systems',
    'Ukrainian Industry'
);