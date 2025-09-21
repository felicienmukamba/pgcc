-- Seed some common medications for testing
INSERT INTO medications (id, trade_name, generic_name, dosage, unit, admin_route, manufacturer, description) VALUES
('med-001', 'Doliprane', 'Paracétamol', '500', 'mg', 'Oral', 'Sanofi', 'Antalgique et antipyrétique'),
('med-002', 'Advil', 'Ibuprofène', '400', 'mg', 'Oral', 'Pfizer', 'Anti-inflammatoire non stéroïdien'),
('med-003', 'Amoxicilline', 'Amoxicilline', '1000', 'mg', 'Oral', 'Mylan', 'Antibiotique pénicilline'),
('med-004', 'Ventoline', 'Salbutamol', '100', 'mcg', 'Inhalation', 'GSK', 'Bronchodilatateur'),
('med-005', 'Kardégic', 'Aspirine', '75', 'mg', 'Oral', 'Sanofi', 'Antiagrégant plaquettaire'),
('med-006', 'Inexium', 'Ésoméprazole', '20', 'mg', 'Oral', 'AstraZeneca', 'Inhibiteur de la pompe à protons'),
('med-007', 'Levothyrox', 'Lévothyroxine', '50', 'mcg', 'Oral', 'Merck', 'Hormone thyroïdienne'),
('med-008', 'Tahor', 'Atorvastatine', '20', 'mg', 'Oral', 'Pfizer', 'Hypolipémiant'),
('med-009', 'Seroplex', 'Escitalopram', '10', 'mg', 'Oral', 'Lundbeck', 'Antidépresseur ISRS'),
('med-010', 'Coversyl', 'Périndopril', '5', 'mg', 'Oral', 'Servier', 'Inhibiteur de l\'enzyme de conversion')
ON CONFLICT (id) DO NOTHING;
