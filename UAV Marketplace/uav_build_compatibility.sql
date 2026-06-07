CREATE TABLE IF NOT EXISTS uav_build_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,

    build_code VARCHAR(20) NOT NULL UNIQUE,
    build_type VARCHAR(100),

    frame_id INT NOT NULL,
    motor_id INT NOT NULL,
    propeller_id INT NOT NULL,
    esc_id INT NOT NULL,
    battery_id INT NOT NULL,
    flight_controller_id INT NOT NULL,

    compatibility_status VARCHAR(50),
    recommended_use VARCHAR(150),

    CONSTRAINT fk_build_frame
        FOREIGN KEY (frame_id)
        REFERENCES frames(frame_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_build_motor
        FOREIGN KEY (motor_id)
        REFERENCES motors(motor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_build_prop
        FOREIGN KEY (propeller_id)
        REFERENCES propellers(propeller_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_build_esc
        FOREIGN KEY (esc_id)
        REFERENCES esc(esc_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_build_battery
        FOREIGN KEY (battery_id)
        REFERENCES batteries(battery_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_build_fc
        FOREIGN KEY (flight_controller_id)
        REFERENCES flight_controllers(flight_controller_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS uav_build_csv_staging;

CREATE TABLE uav_build_csv_staging (
    BuildCode VARCHAR(20),
    BuildType VARCHAR(100),
    FrameCode VARCHAR(20),
    MotorCode VARCHAR(20),
    PropCode VARCHAR(20),
    ESCCode VARCHAR(20),
    BatteryCode VARCHAR(20),
    FCCode VARCHAR(20),
    CompatibilityStatus VARCHAR(50),
    RecommendedUse VARCHAR(150)
);

TRUNCATE uav_build_csv_staging;

LOAD DATA INFILE
'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/uav_build_compatibility.csv'
INTO TABLE uav_build_csv_staging
CHARACTER SET latin1
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    @c1,@c2,@c3,@c4,@c5,@c6,@c7,@c8,@c9,@c10
)
SET
    BuildCode = TRIM(@c1),
    BuildType = TRIM(@c2),
    FrameCode = TRIM(@c3),
    MotorCode = TRIM(@c4),
    PropCode = TRIM(@c5),
    ESCCode = TRIM(@c6),
    BatteryCode = TRIM(@c7),
    FCCode = TRIM(@c8),
    CompatibilityStatus = TRIM(@c9),
    RecommendedUse = TRIM(@c10);
    
DROP PROCEDURE IF EXISTS sp_import_uav_build_compatibility;
DELIMITER $$

CREATE PROCEDURE sp_import_uav_build_compatibility()
BEGIN

    INSERT INTO uav_build_compatibility (
        build_code,
        build_type,
        frame_id,
        motor_id,
        propeller_id,
        esc_id,
        battery_id,
        flight_controller_id,
        compatibility_status,
        recommended_use
    )
    SELECT
        s.BuildCode,
        s.BuildType,
        f.frame_id,
        m.motor_id,
        p.propeller_id,
        e.esc_id,
        b.battery_id,
        fc.flight_controller_id,
        s.CompatibilityStatus,
        s.RecommendedUse

    FROM uav_build_csv_staging s

    INNER JOIN frames f
        ON f.frame_code = TRIM(s.FrameCode)

    INNER JOIN motors m
        ON m.motor_code = TRIM(s.MotorCode)

    INNER JOIN propellers p
        ON p.prop_code = TRIM(s.PropCode)

    INNER JOIN esc e
        ON e.esc_code = TRIM(s.ESCCode)

    INNER JOIN batteries b
        ON b.battery_code = TRIM(s.BatteryCode)

    INNER JOIN flight_controllers fc
        ON fc.fc_code = TRIM(s.FCCode)

    WHERE s.BuildCode IS NOT NULL

    ON DUPLICATE KEY UPDATE
        compatibility_status = VALUES(compatibility_status),
        recommended_use = VALUES(recommended_use);

    TRUNCATE uav_build_csv_staging;

END$$
DELIMITER ;

CALL sp_import_uav_build_compatibility();

CREATE INDEX idx_build_frame ON uav_build_compatibility(frame_id);
CREATE INDEX idx_build_motor ON uav_build_compatibility(motor_id);
CREATE INDEX idx_build_esc ON uav_build_compatibility(esc_id);
CREATE INDEX idx_build_battery ON uav_build_compatibility(battery_id);
CREATE INDEX idx_build_fc ON uav_build_compatibility(flight_controller_id);

SHOW TABLES;
describe batteries;
describe cameras;
describe chargers;
describe esc;
describe firmware;
describe flight_controllers;
describe frames;
describe gps_modules;
describe motors;
describe propellers;
describe radios_receivers;
describe rtf_uav;
describe software;
describe video_transmitters;
describe uav_build_compatibility;
describe motor_prop_compatibility;
describe frame_prop_compatibility;
