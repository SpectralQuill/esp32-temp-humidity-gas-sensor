import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test database connection
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: (error as Error).message
    });
  }
});

// Create a temperature reading
app.post('/api/temperature', async (req, res) => {
  try {
    const { value } = req.body;
    const reading = await prisma.temperatureCReading.create({
      data: { value: parseFloat(value) }
    });
    res.json(reading);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reading' });
  }
});

// Get all temperature readings
app.get('/api/temperature', async (req, res) => {
  try {
    const readings = await prisma.temperatureCReading.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// Similar endpoints for humidity and gas...

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database URL: ${process.env.DATABASE_URL}`);
});
