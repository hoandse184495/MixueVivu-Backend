IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'UX_Users_Email' AND object_id = OBJECT_ID('Users')
)
BEGIN
  CREATE UNIQUE INDEX UX_Users_Email ON Users(email);
END;

IF OBJECT_ID('RefreshTokens', 'U') IS NULL
BEGIN
  CREATE TABLE RefreshTokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    tokenHash CHAR(64) NOT NULL,
    expiresAt DATETIME2 NOT NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_RefreshTokens_Users
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_RefreshTokens_TokenHash UNIQUE (tokenHash)
  );

  CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(userId);
  CREATE INDEX IX_RefreshTokens_ExpiresAt ON RefreshTokens(expiresAt);
END;
