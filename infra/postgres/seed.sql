BEGIN;
INSERT INTO operating_entities (id, code, legal_name, vat_pan_number, base_currency) VALUES
('11111111-1111-1111-1111-111111111111', 'XCG_HOLDING', 'Ximalaya Coffee Group Pvt. Ltd.', '601234567', 'NPR'),
('22222222-2222-2222-2222-222222222222', 'XCC_PROCUREMENT', 'Ximalaya Coffee Procurement Company Ltd.', '601234568', 'NPR'),
('33333333-3333-3333-3333-333333333333', 'XCC_PROCESSING', 'Ximalaya Coffee Processing Company Ltd.', '601234569', 'NPR'),
('44444444-4444-4444-4444-444444444444', 'XCC_SALES', 'Ximalaya Sales & Marketing Company Ltd.', '601234570', 'NPR')
ON CONFLICT (code) DO NOTHING;

INSERT INTO suppliers (id, entity_id, supplier_code, supplier_type, full_name, phone_number, pan_number, district, altitude_masl, payment_method_pref, name_on_bag_consent) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'F-GUL-0142', 'SAHAKARI', 'Ruru Coffee Sahakari', '9857012345', '302918273', 'Gulmi', 1450, 'BANK', TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'F-GUL-0143', 'FARMER', 'Hari Prasad Thapa', '9847054321', NULL, 'Gulmi', 1520, 'ESEWA', TRUE)
ON CONFLICT (supplier_code) DO NOTHING;
COMMIT;
