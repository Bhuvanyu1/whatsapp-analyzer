import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class DatabaseManager {
  private db: Database.Database | null = null;
  private static instance: DatabaseManager;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  connect(dbPath: string = 'whatsapp_network.db'): Database.Database {
    if (this.db) {
      return this.db;
    }

    try {
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
      // Initialize schema
      this.initializeSchema();
      
      console.log('✅ Database connected successfully');
      return this.db;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  private initializeSchema(): void {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    try {
      const schemaPath = join(__dirname, 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
      console.log('✅ Database schema initialized');
    } catch (error) {
      console.error('❌ Schema initialization failed:', error);
      throw error;
    }
  }

  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('✅ Database connection closed');
    }
  }

  // Utility method for transactions
  transaction<T>(fn: (db: Database.Database) => T): T {
    const db = this.getDatabase();
    const transaction = db.transaction(() => fn(db));
    return transaction();
  }

  // Health check
  isHealthy(): boolean {
    try {
      if (!this.db) return false;
      this.db.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }

  // Get database statistics
  getStats(): any {
    if (!this.db) return null;
    
    const stats = {
      contacts: this.db.prepare('SELECT COUNT(*) as count FROM contacts').get(),
      messages: this.db.prepare('SELECT COUNT(*) as count FROM messages').get(),
      expertise: this.db.prepare('SELECT COUNT(*) as count FROM expertise').get(),
      groups: this.db.prepare('SELECT COUNT(*) as count FROM groups').get(),
      keywords: this.db.prepare('SELECT COUNT(*) as count FROM keywords').get()
    };

    return stats;
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();
export default dbManager;
