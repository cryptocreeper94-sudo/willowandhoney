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
    "is_mobile_eligible" integer DEFAULT 0 NOT NULL
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Willow & Honey scheduling API running on port ${PORT}`);
});
