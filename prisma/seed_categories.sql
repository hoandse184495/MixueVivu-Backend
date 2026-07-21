IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'nui')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Núi', 'nui', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'bien')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Biển', 'bien', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'khac')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Khác', 'khac', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'nghi-duong')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Nghỉ dưỡng', 'nghi-duong', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'phieu-luu')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Phiêu lưu', 'phieu-luu', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'van-hoa')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Văn hóa', 'van-hoa', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'am-thuc')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Ẩm thực', 'am-thuc', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'gia-dinh')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Gia đình', 'gia-dinh', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'tham-quan')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Tham quan', 'tham-quan', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'tam-linh')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Tâm linh', 'tam-linh', NULL, 1);
END;

IF NOT EXISTS (SELECT 1 FROM Categories WHERE slug = 'du-thuyen')
BEGIN
  INSERT INTO Categories (name, slug, image, isActive)
  VALUES (N'Du thuyền', 'du-thuyen', NULL, 1);
END;
