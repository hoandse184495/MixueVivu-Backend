IF COL_LENGTH('Bookings', 'slotsDeducted') IS NULL
BEGIN
  ALTER TABLE Bookings
  ADD slotsDeducted BIT NOT NULL
    CONSTRAINT DF_Bookings_slotsDeducted DEFAULT 0;
END;

GO

;WITH SlotUsage AS (
  SELECT tourId, SUM(numberOfPeople) AS bookedSlots
  FROM Bookings
  WHERE status IN ('confirmed', 'completed')
    AND slotsDeducted = 0
  GROUP BY tourId
)
UPDATE Tours
SET availableSlots =
  CASE
    WHEN Tours.availableSlots >= SlotUsage.bookedSlots
      THEN Tours.availableSlots - SlotUsage.bookedSlots
    ELSE 0
  END
FROM Tours
INNER JOIN SlotUsage ON SlotUsage.tourId = Tours.id;

GO

UPDATE Bookings
SET slotsDeducted = 1
WHERE status IN ('confirmed', 'completed')
  AND slotsDeducted = 0;
