#!/usr/bin/env tsx

import { sensorDB } from '../src/database.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', '..', 'database', 'sensor.db');

export async function resetDatabase() {
  console.log('🚨 Resetting SQLite database...');
  
  try {
    // First initialize the database
    console.log('🔧 Initializing database connection...');
    await sensorDB.initialize();
    console.log('✅ Database initialized');
    
    // Check if database file exists
    if (fs.existsSync(DB_PATH)) {
      const stats = fs.statSync(DB_PATH);
      console.log(`📁 Current database: ${DB_PATH}`);
      console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Created: ${stats.birthtime.toLocaleString()}`);
      
      // Create backup
      const backupPath = DB_PATH + '.backup';
      fs.copyFileSync(DB_PATH, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    } else {
      console.log(`📁 Database file not found at: ${DB_PATH}`);
    }
    
    // Reset database
    console.log('🔄 Resetting database tables...');
    await sensorDB.resetDatabase();
    console.log('✅ Database reset successful!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await sensorDB.close();
    console.log('🔒 Database connection closed');
  }
}
