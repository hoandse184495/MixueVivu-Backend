IF COL_LENGTH('Users', 'providerStatus') IS NULL
BEGIN
  ALTER TABLE Users
  ADD providerStatus NVARCHAR(20) NULL
    CONSTRAINT DF_Users_providerStatus DEFAULT 'approved';
END;

GO

IF COL_LENGTH('Users', 'providerRejectReason') IS NULL
BEGIN
  ALTER TABLE Users ADD providerRejectReason NVARCHAR(MAX) NULL;
END;

GO

UPDATE Users
SET providerStatus = 'approved'
WHERE providerStatus IS NULL;
