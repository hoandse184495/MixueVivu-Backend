IF OBJECT_ID('Notifications', 'U') IS NULL
BEGIN
  CREATE TABLE Notifications (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    userId INT NOT NULL,
    bookingId INT NULL,
    tourId INT NULL,
    paymentId INT NULL,
    type NVARCHAR(50) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    status NVARCHAR(20) NULL,
    isRead BIT NOT NULL CONSTRAINT DF_Notifications_isRead DEFAULT 0,
    createdAt DATETIME NULL CONSTRAINT DF_Notifications_createdAt DEFAULT GETDATE(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Notifications_Bookings FOREIGN KEY (bookingId) REFERENCES Bookings(id)
  );
END;
GO

IF COL_LENGTH('Notifications', 'tourId') IS NULL
BEGIN
  ALTER TABLE Notifications ADD tourId INT NULL;
END;
GO

IF COL_LENGTH('Notifications', 'paymentId') IS NULL
BEGIN
  ALTER TABLE Notifications ADD paymentId INT NULL;
END;
GO

IF COL_LENGTH('Notifications', 'status') IS NULL
BEGIN
  ALTER TABLE Notifications ADD status NVARCHAR(20) NULL;
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_Notifications_User_Read_Created'
    AND object_id = OBJECT_ID('Notifications')
)
BEGIN
  CREATE INDEX IX_Notifications_User_Read_Created
  ON Notifications(userId, isRead, createdAt DESC);
END;
GO
