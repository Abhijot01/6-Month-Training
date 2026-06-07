CREATE TABLE IF NOT EXISTS frame_prop_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,

    frame_id INT NOT NULL,
    propeller_id INT NOT NULL,

    fit_type VARCHAR(50),          -- Yes / Optimal / TightFit
    recommended_use VARCHAR(150),

    UNIQUE KEY unique_pair (frame_id, propeller_id),

    CONSTRAINT fk_fp_frame
        FOREIGN KEY (frame_id)
        REFERENCES frames(frame_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_fp_prop
        FOREIGN KEY (propeller_id)
        REFERENCES propellers(propeller_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS frame_prop_csv_staging;

CREATE TABLE frame_prop_csv_staging (
    FrameCode VARCHAR(20),
    PropCode VARCHAR(20),
    Fits VARCHAR(50),
    RecommendedUse VARCHAR(150)
);

TRUNCATE frame_prop_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/frame_prop_compatibility.csv'
INTO TABLE frame_prop_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4
)
SET
    FrameCode = TRIM(@c1),
    PropCode = TRIM(@c2),
    Fits = TRIM(@c3),
    RecommendedUse = TRIM(@c4);
    
DROP PROCEDURE IF EXISTS sp_import_frame_prop_compatibility;
DELIMITER $$

CREATE PROCEDURE sp_import_frame_prop_compatibility()
BEGIN

    INSERT INTO frame_prop_compatibility (
        frame_id,
        propeller_id,
        fit_type,
        recommended_use
    )
    SELECT
        f.frame_id,
        p.propeller_id,
        s.Fits,
        s.RecommendedUse

    FROM frame_prop_csv_staging s

    INNER JOIN frames f
        ON f.frame_code = TRIM(s.FrameCode)

    INNER JOIN propellers p
        ON p.prop_code = TRIM(s.PropCode)

    WHERE s.FrameCode IS NOT NULL
      AND s.PropCode IS NOT NULL

    ON DUPLICATE KEY UPDATE
        fit_type = VALUES(fit_type),
        recommended_use = VALUES(recommended_use);

    TRUNCATE frame_prop_csv_staging;

END$$
DELIMITER ;

CALL sp_import_frame_prop_compatibility();

CREATE INDEX idx_fp_frame
ON frame_prop_compatibility(frame_id);

CREATE INDEX idx_fp_prop
ON frame_prop_compatibility(propeller_id);

SELECT COUNT(*) FROM frame_prop_compatibility;

SELECT
    f.frame_code,
    p.prop_code,
    c.fit_type,
    c.recommended_use
FROM frame_prop_compatibility c
JOIN frames f ON c.frame_id = f.frame_id
JOIN propellers p ON c.propeller_id = p.propeller_id
LIMIT 10;