import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const services = sqliteTable('services', {
  id: integer('id').primaryKey(),
  category: text('category').notNull(),
  name: text('name').notNull(),
  price: integer('price').notNull(), // stored in whole dollars
  durationMinutes: integer('duration_minutes').notNull(),
  isMobileEligible: integer('is_mobile_eligible', { mode: 'boolean' }).notNull().default(true),
  imageUrl: text('image_url'),
  description: text('description'),
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(), // UUID
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  clientPhone: text('client_phone').notNull(),
  serviceId: integer('service_id').references(() => services.id),
  servicePrice: integer('service_price').notNull().default(0), // Lock in price for 20% calculation
  isMobile: integer('is_mobile', { mode: 'boolean' }).notNull().default(false),
  address: text('address'), // Only required if isMobile
  startTime: text('start_time').notNull(), // ISO datetime string
  endTime: text('end_time').notNull(), // ISO datetime string
  status: text('status').notNull().default('pending'), // pending, confirmed, cancelled
});
