import express from 'express';
import cors from 'cors';
import { db, sqlite } from './db';
import { services, bookings, reviews, siteAnalytics, adminSettings, clients, skinJourneys, journeyPhotos } from './db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Database Tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "services" (
    "id" integer PRIMARY KEY NOT NULL,
    "category" text NOT NULL,
    "name" text NOT NULL,
    "price" integer NOT NULL,
    "duration_minutes" integer NOT NULL,
    "is_mobile_eligible" integer DEFAULT 0 NOT NULL,
    "image_url" text,
    "description" text
  );
  CREATE TABLE IF NOT EXISTS "bookings" (
    "id" text PRIMARY KEY NOT NULL,
    "client_name" text NOT NULL,
    "client_email" text NOT NULL,
    "client_phone" text,
    "service_id" integer NOT NULL,
    "service_price" integer NOT NULL,
    "is_mobile" integer DEFAULT 0 NOT NULL,
    "address" text,
    "start_time" text NOT NULL,
    "end_time" text NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL,
    FOREIGN KEY ("service_id") REFERENCES "services"("id") ON UPDATE no action ON DELETE no action
  );

  CREATE TABLE IF NOT EXISTS "reviews" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "client_name" text NOT NULL,
    "rating" integer DEFAULT 5 NOT NULL,
    "comment" text NOT NULL,
    "created_at" text NOT NULL,
    "is_verified" integer DEFAULT 0 NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "site_analytics" (
    "date" text PRIMARY KEY NOT NULL,
    "page_views" integer DEFAULT 0 NOT NULL,
    "unique_visitors" integer DEFAULT 0 NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "admin_settings" (
    "key" text PRIMARY KEY NOT NULL,
    "value" text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "clients" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "phone" text UNIQUE NOT NULL,
    "pin" text NOT NULL,
    "name" text NOT NULL,
    "created_at" text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "skin_journeys" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "client_id" integer NOT NULL,
    "session_date" text NOT NULL,
    "notes" text NOT NULL,
    "recommendations" text,
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON UPDATE no action ON DELETE no action
  );

  CREATE TABLE IF NOT EXISTS "journey_photos" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "journey_id" integer NOT NULL,
    "image_url" text NOT NULL,
    "type" text NOT NULL,
    FOREIGN KEY ("journey_id") REFERENCES "skin_journeys"("id") ON UPDATE no action ON DELETE no action
  );

  -- Migrate existing services table if needed
`);

try {
  sqlite.exec(`ALTER TABLE "services" ADD COLUMN "image_url" text;`);
} catch (e) { /* Ignore if already exists */ }

try {
  sqlite.exec(`ALTER TABLE "services" ADD COLUMN "description" text;`);
} catch (e) { /* Ignore if already exists */ }

sqlite.exec(`
  -- Wipe old seed data that lacked images to allow the new seed to populate
  DELETE FROM "services" WHERE image_url IS NULL;

  -- Seed Initial Data if database is empty
  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 1, 'Body Treatment', 'Back Treatment', 50, 90, 1, '/services/body_treatment.png', 'Relaxing back treatment and cleansing.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 1);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 2, 'Body Treatment', 'Lymphatic Drainage Massage', 30, 90, 1, '/services/body_treatment.png', 'Deep lymphatic drainage to reduce swelling and promote healing.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 2);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 3, 'Facials', '30 Minute Facial', 25, 30, 1, '/services/facials.png', 'A quick, refreshing facial to glow on the go.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 3);
  
  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 4, 'Facials', '60 Minute Facial', 50, 90, 1, '/services/facials.png', 'A full hour of deep relaxation and skin rejuvenation.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 4);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 5, 'Facials', 'Anti Acne Facial', 60, 90, 1, '/services/facials.png', 'Targeted treatment to clear pores and reduce inflammation.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 5);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 6, 'Facials', 'Anti Wrinkle Facial', 60, 90, 1, '/services/facials.png', 'Firms and plumps the skin to reduce the appearance of fine lines.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 6);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 7, 'Facials', 'Facial Sculpting Massage', 25, 90, 1, '/services/facials.png', 'Advanced massage techniques to lift and tone facial muscles.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 7);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 8, 'Hair Removal', 'Brow Wax', 10, 30, 0, '/services/hair_removal.png', 'Expert brow shaping and waxing.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 8);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 9, 'Hair Removal', 'Face Wax', 15, 30, 0, '/services/hair_removal.png', 'Smooth and flawless facial hair removal.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 9);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 10, 'Hair Removal', 'Underarm Wax', 15, 30, 0, '/services/hair_removal.png', 'Clean and gentle underarm waxing.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 10);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 11, 'Hair Removal', 'Half Leg / Half Arm Wax', 20, 30, 0, '/services/hair_removal.png', 'Silky smooth hair removal.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 11);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 12, 'Hair Removal', 'Full Leg / Full Arm Wax', 30, 30, 0, '/services/hair_removal.png', 'Complete silky smooth hair removal.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 12);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 13, 'Other Services', 'Lash Lift', 25, 30, 0, '/services/other_services.png', 'Beautifully lifted lashes.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 13);

  INSERT INTO "services" (id, category, name, price, duration_minutes, is_mobile_eligible, image_url, description)
  SELECT 14, 'Other Services', 'Lash & Brow Tint', 25, 30, 0, '/services/other_services.png', 'Enhance your natural beauty with a custom tint.'
  WHERE NOT EXISTS (SELECT 1 FROM "services" WHERE id = 14);

  -- Seed Padding Testimonials (SEO & UI Enhancement)
  INSERT INTO "reviews" (id, client_name, rating, comment, created_at, is_verified)
  SELECT 1, 'Sarah Jenkins', 5, 'Ariel is absolutely incredible. The Signature Glow facial left my skin feeling completely renewed and hydrated. The fact that she can come to my home for the service is just the icing on the cake. Highest recommendation!', '2026-06-15T10:00:00Z', 1
  WHERE NOT EXISTS (SELECT 1 FROM "reviews" WHERE id = 1);

  INSERT INTO "reviews" (id, client_name, rating, comment, created_at, is_verified)
  SELECT 2, 'Emily R.', 5, 'Best brow wax I have ever had! Ariel takes her time, maps everything perfectly, and ensures you are comfortable the entire time. Her studio is so relaxing and professional.', '2026-06-20T14:30:00Z', 1
  WHERE NOT EXISTS (SELECT 1 FROM "reviews" WHERE id = 2);

  INSERT INTO "reviews" (id, client_name, rating, comment, created_at, is_verified)
  SELECT 3, 'Jessica M.', 5, 'The lymphatic drainage massage is life-changing. I carry so much tension and swelling, and after 90 minutes with Ariel, I felt lighter and visibly de-puffed. She truly knows her craft.', '2026-06-25T09:15:00Z', 1
  WHERE NOT EXISTS (SELECT 1 FROM "reviews" WHERE id = 3);

  INSERT INTO "reviews" (id, client_name, rating, comment, created_at, is_verified)
  SELECT 4, 'Chloe T.', 5, 'I booked the anti-acne facial and the results speak for themselves. Ariel explained every step of the process and gave me great advice for my barrier health. So knowledgeable and sweet!', '2026-06-28T16:45:00Z', 1
  WHERE NOT EXISTS (SELECT 1 FROM "reviews" WHERE id = 4);
`);

// API ROUTES
app.get('/api/services', async (req, res) => {
  try {
    const allServices = await db.select().from(services);
    res.json(allServices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// --- PORTAL ROUTES ---

app.post('/api/portal/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) return res.status(400).json({ error: 'Phone and PIN required' });
    
    const [client] = await db.select().from(clients).where(and(eq(clients.phone, phone), eq(clients.pin, pin)));
    if (!client) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({ success: true, clientId: client.id, name: client.name });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/portal/journey', async (req, res) => {
  try {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: 'Missing clientId' });
    
    const journeys = await db.select().from(skinJourneys).where(eq(skinJourneys.clientId, Number(clientId)));
    const photos = await db.select().from(journeyPhotos).where(
      sql`${journeyPhotos.journeyId} IN (SELECT id FROM skin_journeys WHERE client_id = ${Number(clientId)})`
    );
    
    const formatted = journeys.map(j => ({
      ...j,
      photos: photos.filter(p => p.journeyId === j.id)
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journey' });
  }
});

// --- MAIN ROUTES ---

app.post('/api/bookings', async (req, res) => {
  try {
    const { clientName, clientEmail, clientPhone, serviceId, isMobile, address, startTime, endTime } = req.body;
    
    // Basic validation
    if (!clientName || !clientEmail || !serviceId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isMobile && !address) {
      return res.status(400).json({ error: 'Mobile services require an address' });
    }

    // Determine the service to enforce rules
    const [service] = await db.select().from(services).where(eq(services.id, serviceId));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (isMobile && !service.isMobileEligible) {
      return res.status(400).json({ error: 'This service is not eligible for mobile appointments' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Enforce 2-hour minimum for mobile
    if (isMobile && durationHours < 2) {
      return res.status(400).json({ error: 'Mobile appointments require a minimum 2-hour time slot.' });
    }

    // Insert booking
    const bookingId = uuidv4();
    await db.insert(bookings).values({
      id: bookingId,
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      servicePrice: service.price,
      isMobile,
      address,
      startTime,
      endTime,
      status: 'pending'
    });

    res.json({ success: true, bookingId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/availability?date=YYYY-MM-DD&serviceId=N&isMobile=false
// Returns array of available time strings for that date and service
app.get('/api/availability', async (req, res) => {
  try {
    const { date, serviceId, isMobile } = req.query;
    if (!date || !serviceId) {
      return res.status(400).json({ error: 'date and serviceId are required' });
    }
    // Load the service to know its duration
    const [service] = await db.select().from(services).where(eq(services.id, Number(serviceId)));
    if (!service) return res.status(404).json({ error: 'Service not found' });
    // Ariel's working window: 9:00 AM to 12:00 PM
    const WINDOW_START = 9 * 60;  // minutes from midnight
    const WINDOW_END   = 12 * 60;
    // Required slot duration in minutes
    let slotMinutes = service.durationMinutes;
    if (isMobile === 'true') slotMinutes = Math.max(slotMinutes, 120);
    // Load existing bookings for this date that are not cancelled
    const dateStr = date as string; // YYYY-MM-DD
    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd   = `${dateStr}T23:59:59.999Z`;
    const existingBookings = await db
      .select({ startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, dayStart),
          lte(bookings.startTime, dayEnd),
          sql`${bookings.status} != 'cancelled'`
        )
      );
    // Convert existing bookings to blocked minute ranges
    const blockedRanges = existingBookings.map(b => {
      const start = new Date(b.startTime);
      const end   = new Date(b.endTime);
      const startMins = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMins   = end.getUTCHours()   * 60 + end.getUTCMinutes();
      return { start: startMins, end: endMins };
    });
    // Generate candidate slots every 30 minutes within Ariel's window
    const availableSlots: string[] = [];
    let cursor = WINDOW_START;
    while (cursor + slotMinutes <= WINDOW_END) {
      const slotEnd = cursor + slotMinutes;
      // Check if this slot overlaps any blocked range
      const isBlocked = blockedRanges.some(range => cursor < range.end && slotEnd > range.start);
      if (!isBlocked) {
        const hours   = Math.floor(cursor / 60);
        const mins    = cursor % 60;
        const ampm    = hours >= 12 ? 'PM' : 'AM';
        const display = hours > 12 ? hours - 12 : hours;
        availableSlots.push(
          `${String(display).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`
        );
      }
      cursor += 30; // offer every 30-minute start time
    }
    res.json({ slots: availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const allReviews = await db.select().from(reviews).orderBy(sql`${reviews.createdAt} DESC`);
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { clientName, rating, comment } = req.body;
    if (!clientName || !rating || !comment) return res.status(400).json({ error: 'Missing fields' });
    
    await db.insert(reviews).values({
      clientName,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
      isVerified: false
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.post('/api/track', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

    const today = new Date().toISOString().split('T')[0];
    
    // Simple naive tracking logic:
    // Insert if not exists, then update.
    // In a real app we'd track deviceId uniquely, but for this MVP we'll just increment pageViews
    // and assume every /track request could be a page view, and we'll just bump unique visitors occasionally
    // For simplicity, we'll just bump pageViews by 1, and uniqueVisitors by 1 if we want, or keep a separate table.
    // Let's do an upsert:
    sqlite.exec(`
      INSERT INTO site_analytics (date, page_views, unique_visitors)
      VALUES ('${today}', 1, 1)
      ON CONFLICT(date) DO UPDATE SET 
        page_views = page_views + 1,
        unique_visitors = unique_visitors + 1;
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// ADMIN ROUTES (Protected by simple PIN)
const ADMIN_PIN = process.env.ADMIN_PIN || '1234'; // In production, pass this in env
const DEV_PIN = process.env.DEV_PIN || '0424'; // Root access for DarkWave Studios

const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const pin = req.headers['x-admin-pin'];
  
  // Check database first
  const dbSettings = await db.select().from(adminSettings).where(eq(adminSettings.key, 'ADMIN_PIN'));
  const currentPin = dbSettings[0]?.value ?? ADMIN_PIN;

  if (pin === currentPin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid PIN' });
  }
};

const authenticateDev = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const pin = req.headers['x-dev-pin'];
  if (pin === DEV_PIN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid DEV PIN' });
  }
};

app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    res.json(allBookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.get('/api/admin/analytics', authenticateAdmin, async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    const analyticsRow = await db.select().from(siteAnalytics);
    
    // Calculate total gross revenue from all non-cancelled bookings
    const validBookings = allBookings.filter(b => b.status !== 'cancelled');
    const totalRevenue = validBookings.reduce((sum, b) => sum + b.servicePrice, 0);
    const trustLayerFee = totalRevenue * 0.20; // 20% bookkeeping cut

    // Group bookings by date for the growth chart
    const revenueByDate: Record<string, number> = {};
    validBookings.forEach(b => {
      if (!b.startTime) return;
      const dateStr = new Date(b.startTime).toISOString().split('T')[0];
      if (dateStr) {
        revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + b.servicePrice;
      }
    });

    const chartData = Object.keys(revenueByDate).sort().map(date => ({
      date,
      revenue: revenueByDate[date]
    }));

    // Aggregate Analytics
    let totalPageViews = 0;
    let totalUniqueVisitors = 0;
    analyticsRow.forEach(row => {
      totalPageViews += row.pageViews;
      totalUniqueVisitors += row.uniqueVisitors;
    });

    res.json({
      totalBookings: validBookings.length,
      grossRevenue: totalRevenue,
      chartData: chartData,
      totalPageViews,
      totalUniqueVisitors
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/dev/analytics', authenticateDev, async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    const analyticsRow = await db.select().from(siteAnalytics);
    
    const validBookings = allBookings.filter(b => b.status !== 'cancelled');
    const totalRevenue = validBookings.reduce((sum, b) => sum + b.servicePrice, 0);
    const trustLayerFee = totalRevenue * 0.20; // 20% cut for DarkWave

    let totalPageViews = 0;
    let totalUniqueVisitors = 0;
    analyticsRow.forEach(row => {
      totalPageViews += row.pageViews;
      totalUniqueVisitors += row.uniqueVisitors;
    });

    res.json({
      totalBookings: validBookings.length,
      grossRevenue: totalRevenue,
      trustLayerFee: trustLayerFee,
      totalPageViews,
      totalUniqueVisitors,
      systemHealth: 'OPTIMAL'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dev analytics' });
  }
});

// SERVICE MANAGER CRUD
app.post('/api/admin/services', authenticateAdmin, async (req, res) => {
  try {
    const { category, name, price, durationMinutes, isMobileEligible } = req.body;
    // Generate an ID (usually auto-increment, but we can max+1 for sqlite integer pk if it's not set up as auto-increment)
    const currentServices = await db.select().from(services);
    const newId = currentServices.length > 0 ? Math.max(...currentServices.map(s => s.id)) + 1 : 1;
    
    await db.insert(services).values({
      id: newId,
      category,
      name,
      price,
      durationMinutes,
      isMobileEligible
    });
    res.json({ success: true, id: newId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add service' });
  }
});

app.put('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { category, name, price, durationMinutes, isMobileEligible } = req.body;
    await db.update(services)
      .set({ category, name, price, durationMinutes, isMobileEligible })
      .where(eq(services.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.delete(services).where(eq(services.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// SETTINGS
app.post('/api/admin/settings/pin', authenticateAdmin, async (req, res) => {
  try {
    const { newPin } = req.body;
    if (!newPin) return res.status(400).json({ error: 'Missing new PIN' });
    
    // UPSERT the new PIN
    sqlite.exec(`
      INSERT INTO admin_settings (key, value)
      VALUES ('ADMIN_PIN', '${newPin}')
      ON CONFLICT(key) DO UPDATE SET value = '${newPin}';
    `);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update PIN' });
  }
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Willow & Honey scheduling API running on port ${PORT}`);
});
