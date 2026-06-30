import express from 'express';
import cors from 'cors';
import { db, sqlite } from './db';
import { services, bookings } from './db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, gte, lte } from 'drizzle-orm';
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

// ADMIN ROUTES (Protected by simple PIN)
const ADMIN_PIN = process.env.ADMIN_PIN || '1234'; // In production, pass this in env

const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const pin = req.headers['x-admin-pin'];
  if (pin === ADMIN_PIN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid PIN' });
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

    res.json({
      totalBookings: validBookings.length,
      grossRevenue: totalRevenue,
      trustLayerFee: trustLayerFee,
      chartData: chartData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
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

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Willow & Honey scheduling API running on port ${PORT}`);
});
