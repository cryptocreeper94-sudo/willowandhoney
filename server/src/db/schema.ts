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

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientName: text('client_name').notNull(),
  rating: integer('rating').notNull().default(5),
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(), // ISO datetime string
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
});

export const siteAnalytics = sqliteTable('site_analytics', {
  date: text('date').primaryKey(), // YYYY-MM-DD
  pageViews: integer('page_views').notNull().default(0),
  uniqueVisitors: integer('unique_visitors').notNull().default(0),
});

export const adminSettings = sqliteTable('admin_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').notNull().unique(),
  pin: text('pin').notNull(), // 6-digit PIN
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});

export const skinJourneys = sqliteTable('skin_journeys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  sessionDate: text('session_date').notNull(), // YYYY-MM-DD
  notes: text('notes').notNull(),
  recommendations: text('recommendations'),
});

export const journeyPhotos = sqliteTable('journey_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  journeyId: integer('journey_id').references(() => skinJourneys.id).notNull(),
  imageUrl: text('image_url').notNull(),
  type: text('type').notNull(), // 'before' or 'after'
});
