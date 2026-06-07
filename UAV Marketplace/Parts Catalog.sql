-- COMPONENT 1: PARTS MASTER CATALOG
-- Purpose:
--   Stores the list of all drone parts (Frame, Motor, ESC, etc.)
--   Acts as a reference table used by all other modules.


USE uav_marketplace;
SHOW TABLES;

USE drone_forensics;
SHOW TABLES;

CREATE TABLE parts_catalog (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Index for fast search by part name (UI search, API filters)
CREATE INDEX idx_parts_name
ON parts_catalog(part_name);
show databases;


-- COMPONENT 2: FORENSIC ACTIONS MASTER CATALOG
-- Purpose:
--   Stores the controlled vocabulary of forensic actions
--   (Measure, Photograph, Record, Analyze, etc.)
--   Reused across multiple forensic modules later.

CREATE TABLE forensic_actions_catalog (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    action_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Index for fast lookup by action name
CREATE INDEX idx_actions_name
ON forensic_actions_catalog(action_name);


-- COMPONENT 3: PART ↔ ACTION MAPPING (QUICK REFERENCE CORE)
-- Purpose:
--   This table implements the "Focus (quick)" column from the PDF.
--   One Part → Many Actions
--   One Action → Many Parts
--   This is the core business table for the catalog.

CREATE TABLE part_quick_focus (
    part_id INT NOT NULL,
    action_id INT NOT NULL,

    PRIMARY KEY (part_id, action_id),

    FOREIGN KEY (part_id)
        REFERENCES parts_catalog(part_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (action_id)
        REFERENCES forensic_actions_catalog(action_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Indexes for fast joins and reverse searches
CREATE INDEX idx_pq_part
ON part_quick_focus(part_id);

CREATE INDEX idx_pq_action
ON part_quick_focus(action_id);


-- COMPONENT 4: SEED DATA - PARTS (FROM YOUR PDF)
-- Purpose:
--   Pre-loads the standard drone parts used in the catalog.

INSERT INTO parts_catalog (part_name) VALUES
('Frame / Body'),
('Motor'),
('Propeller'),
('ESC (Electronic Speed Controller)'),
('Flight Controller'),
('Battery (LiPo / Li-ion)'),
('Power Distribution / BEC'),
('Camera (FPV / Payload)'),
('Gimbal'),
('GPS / GNSS Module');


-- COMPONENT 5: SEED DATA - FORENSIC ACTIONS (FROM YOUR PDF)
-- Purpose:
--   Pre-loads the standard forensic actions used across parts.

INSERT INTO forensic_actions_catalog (action_name) VALUES
('Measure'),
('Look'),
('Check'),
('Photograph'),
('Record'),
('Match'),
('Analyze'),
('Capture'),
('Extract'),
('Note'),
('Photo'),
('Identify');


-- COMPONENT 6: SEED DATA - QUICK REFERENCE MAPPINGS
-- Purpose:
--   Recreates exactly the "Quick Reference" table from your PDF.
--   This defines which actions apply to which part.

-- Frame / Body: Measure, Look, Check
INSERT INTO part_quick_focus VALUES (1,1),(1,2),(1,3);

-- Motor: Photograph, Record, Check
INSERT INTO part_quick_focus VALUES (2,4),(2,5),(2,3);

-- Propeller: Record, Match, Analyze
INSERT INTO part_quick_focus VALUES (3,5),(3,6),(3,7);

-- ESC: Capture, Record, Check
INSERT INTO part_quick_focus VALUES (4,8),(4,5),(4,3);

-- Flight Controller: Photograph, Record, Extract
INSERT INTO part_quick_focus VALUES (5,4),(5,5),(5,9);

-- Battery: Record, Photograph, Note
INSERT INTO part_quick_focus VALUES (6,5),(6,4),(6,10);

-- Power Distribution / BEC: Measure, Photo, Check
INSERT INTO part_quick_focus VALUES (7,1),(7,11),(7,3);

-- Camera: Record, Check, Identify
INSERT INTO part_quick_focus VALUES (8,5),(8,3),(8,12);

-- Gimbal: Record, Photo, Check
INSERT INTO part_quick_focus VALUES (9,5),(9,11),(9,3);

-- GPS / GNSS Module: Record, Photo, Check
INSERT INTO part_quick_focus VALUES (10,5),(10,11),(10,3);


-- COMPONENT 7: STORED PROCEDURE - READ QUICK REFERENCE
-- Purpose:
--   Official read-only API for backend / UI.
--   Returns the same table format as the PDF:
--     Part | Focus (quick)

DELIMITER $$

CREATE PROCEDURE sp_get_part_quick_reference()
BEGIN
    SELECT 
        p.part_id,
        p.part_name AS part,
        GROUP_CONCAT(a.action_name ORDER BY a.action_name SEPARATOR ', ') AS focus_quick
    FROM parts_catalog p
    JOIN part_quick_focus pq ON p.part_id = pq.part_id
    JOIN forensic_actions_catalog a ON pq.action_id = a.action_id
    GROUP BY p.part_id
    ORDER BY p.part_name;
END$$

DELIMITER ;


-- COMPONENT 8: STORED PROCEDURE - ADD NEW PART
-- Purpose:
--   Controlled way to add new parts without direct table access.
--   Used by admin tools or migration scripts.

DELIMITER $$

CREATE PROCEDURE sp_add_part(
    IN p_part_name VARCHAR(120)
)
BEGIN
    INSERT INTO parts_catalog (part_name)
    VALUES (p_part_name);
END$$

DELIMITER ;


-- COMPONENT 9: STORED PROCEDURE - ADD NEW ACTION
-- Purpose:
--   Controlled way to extend forensic actions vocabulary.

DELIMITER $$

CREATE PROCEDURE sp_add_action(
    IN p_action_name VARCHAR(50)
)
BEGIN
    INSERT INTO forensic_actions_catalog (action_name)
    VALUES (p_action_name);
END$$

DELIMITER ;


-- COMPONENT 10: STORED PROCEDURE - MAP PART TO ACTION
-- Purpose:
--   Safely edits the Quick Reference mapping.
--   Prevents duplicate mappings via INSERT IGNORE.

DELIMITER $$

CREATE PROCEDURE sp_add_part_action(
    IN p_part_id INT,
    IN p_action_id INT
)
BEGIN
    INSERT IGNORE INTO part_quick_focus (part_id, action_id)
    VALUES (p_part_id, p_action_id);
END$$

DELIMITER ;


-- COMPONENT 11: STORED PROCEDURE - REMOVE ACTION FROM PART
-- Purpose:
--   Allows controlled deletion of a mapping.
--   Used when updating forensic guidelines.

DELIMITER $$

CREATE PROCEDURE sp_remove_part_action(
    IN p_part_id INT,
    IN p_action_id INT
)
BEGIN
    DELETE FROM part_quick_focus
    WHERE part_id = p_part_id
      AND action_id = p_action_id;
END$$

DELIMITER ;


-- COMPONENT 12: STORED PROCEDURE - SEARCH PARTS BY ACTION
-- Purpose:
--   Allows queries like:
--     "Which parts require Analyze?"
--   Very useful for forensic workflows and UI filters.

DELIMITER $$

CREATE PROCEDURE sp_find_parts_by_action(
    IN p_action_name VARCHAR(50)
)
BEGIN
    SELECT DISTINCT
        p.part_id,
        p.part_name
    FROM forensic_actions_catalog a
    JOIN part_quick_focus pq ON a.action_id = pq.action_id
    JOIN parts_catalog p ON pq.part_id = p.part_id
    WHERE a.action_name = p_action_name
    ORDER BY p.part_name;
END$$

DELIMITER ;
