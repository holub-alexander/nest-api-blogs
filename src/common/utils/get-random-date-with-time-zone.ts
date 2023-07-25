import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { faker } from '@faker-js/faker';

// Function to generate random dates with time zones
export const getRandomDateWithTimeZone = (): string => {
  const randomDate = faker.date.past();
  const randomTimeZoneOffset = getRandomTimeZoneOffset();
  const zonedDate = utcToZonedTime(randomDate, randomTimeZoneOffset);
  const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ss');

  return `${formattedDate}${randomTimeZoneOffset}`;
};

// Helper function to get a random time zone offset (you can customize this as per your needs)
function getRandomTimeZoneOffset(): string {
  // For demonstration purposes, let's assume we have a few sample time zone offsets
  const timeZones = ['-05:00', '+00:00', '+05:30', '+08:00', '+10:00'];

  // Return a random time zone offset from the array
  return timeZones[Math.floor(Math.random() * timeZones.length)];
}
