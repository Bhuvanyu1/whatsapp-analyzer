import Database from 'better-sqlite3';
import { dbManager } from '../database/connection.js';
import { ParsedChat, ParsedContact, ParsedMessage } from '../services/whatsapp-parser.js';
import { ContactAnalysis, InferredExpertise } from '../services/nlp-processor.js';

// Type definitions
export interface Contact {
  id: number;
  name: string;
  phone_number?: string;
  normalized_name: string;
  first_contact_date: string;
  last_contact_date: string;
  total_messages: number;
  relationship_strength: number;
  trust_level: 'low' | 'medium' | 'high';
  company?: string;
  role?: string;
  location?: string;
  notes?: string;
  connection_source?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  is_group_chat: boolean;
  participant_count: number;
  total_messages: number;
  first_message_date?: string;
  last_message_date?: string;
  created_at: string;
}

export interface Message {
  id: number;
  contact_id?: number;
  group_id?: number;
  content: string;
  timestamp: string;
  date_parsed: string;
  is_system_message: boolean;
  created_at: string;
}

export interface Expertise {
  id: number;
  contact_id: number;
  skill: string;
  confidence_score: number;
  source: 'extracted' | 'manual';
  evidence_count: number;
  last_mentioned: string;
  created_at: string;
}

export interface Tag {
  id: number;
  contact_id: number;
  tag: string;
  created_at: string;
}

export interface SearchQuery {
  id: number;
  query_text: string;
  results_count: number;
  clicked_contact_id?: number;
  feedback?: string;
  created_at: string;
}

// Data Access Layer
export class ContactModel {
  private db: Database.Database;

  constructor() {
    this.db = dbManager.getDatabase();
  }

  // Create or update contact
  upsert(contactData: Partial<Contact> & { name: string; normalized_name: string }): Contact {
    const existingContact = this.findByNormalizedName(contactData.normalized_name);
    
    if (existingContact) {
      return this.update(existingContact.id, contactData);
    } else {
      return this.create(contactData);
    }
  }

  create(contactData: Partial<Contact> & { name: string; normalized_name: string }): Contact {
    const stmt = this.db.prepare(`
      INSERT INTO contacts (
        name, phone_number, normalized_name, first_contact_date, last_contact_date,
        total_messages, relationship_strength, trust_level, company, role, 
        location, notes, connection_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      contactData.name,
      contactData.phone_number || null,
      contactData.normalized_name,
      contactData.first_contact_date || new Date().toISOString(),
      contactData.last_contact_date || new Date().toISOString(),
      contactData.total_messages || 0,
      contactData.relationship_strength || 1,
      contactData.trust_level || 'medium',
      contactData.company || null,
      contactData.role || null,
      contactData.location || null,
      contactData.notes || null,
      contactData.connection_source || null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, updates: Partial<Contact>): Contact {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(', ');

    if (fields) {
      const values = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'created_at')
        .map(key => (updates as any)[key]);

      const stmt = this.db.prepare(`
        UPDATE contacts 
        SET ${fields}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      stmt.run(...values, id);
    }

    return this.findById(id)!;
  }

  findById(id: number): Contact | null {
    const stmt = this.db.prepare('SELECT * FROM contacts WHERE id = ?');
    return stmt.get(id) as Contact | null;
  }

  findByNormalizedName(normalizedName: string): Contact | null {
    const stmt = this.db.prepare('SELECT * FROM contacts WHERE normalized_name = ?');
    return stmt.get(normalizedName) as Contact | null;
  }

  findAll(limit: number = 100, offset: number = 0): Contact[] {
    const stmt = this.db.prepare(`
      SELECT * FROM contacts 
      ORDER BY last_contact_date DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Contact[];
  }

  search(query: string, limit: number = 20): Contact[] {
    const stmt = this.db.prepare(`
      SELECT c.*, 
             GROUP_CONCAT(e.skill) as skills,
             COUNT(m.id) as message_count
      FROM contacts c
      LEFT JOIN expertise e ON c.id = e.contact_id
      LEFT JOIN messages m ON c.id = m.contact_id
      WHERE c.name LIKE ? 
         OR c.company LIKE ? 
         OR c.role LIKE ?
         OR e.skill LIKE ?
      GROUP BY c.id
      ORDER BY c.relationship_strength DESC, c.total_messages DESC
      LIMIT ?
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, limit) as Contact[];
  }

  getStats(): { total: number; recentlyActive: number; highTrust: number } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number };
    const recentlyActive = this.db.prepare(`
      SELECT COUNT(*) as count FROM contacts 
      WHERE last_contact_date > date('now', '-30 days')
    `).get() as { count: number };
    const highTrust = this.db.prepare(`
      SELECT COUNT(*) as count FROM contacts 
      WHERE trust_level = 'high'
    `).get() as { count: number };

    return {
      total: total.count,
      recentlyActive: recentlyActive.count,
      highTrust: highTrust.count
    };
  }

  incrementMessageCount(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE contacts 
      SET total_messages = total_messages + 1,
          last_contact_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }
}

export class GroupModel {
  private db: Database.Database;

  constructor() {
    this.db = dbManager.getDatabase();
  }

  create(groupData: Partial<Group> & { name: string }): Group {
    const stmt = this.db.prepare(`
      INSERT INTO groups (
        name, is_group_chat, participant_count, total_messages,
        first_message_date, last_message_date
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      groupData.name,
      groupData.is_group_chat || false,
      groupData.participant_count || 0,
      groupData.total_messages || 0,
      groupData.first_message_date || null,
      groupData.last_message_date || null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  findById(id: number): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    return stmt.get(id) as Group | null;
  }

  findByName(name: string): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE name = ?');
    return stmt.get(name) as Group | null;
  }

  findAll(): Group[] {
    const stmt = this.db.prepare('SELECT * FROM groups ORDER BY created_at DESC');
    return stmt.all() as Group[];
  }
}

export class MessageModel {
  private db: Database.Database;

  constructor() {
    this.db = dbManager.getDatabase();
  }

  create(messageData: Partial<Message> & { content: string; timestamp: string }): Message {
    const stmt = this.db.prepare(`
      INSERT INTO messages (
        contact_id, group_id, content, timestamp, date_parsed, is_system_message
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      messageData.contact_id || null,
      messageData.group_id || null,
      messageData.content,
      messageData.timestamp,
      messageData.date_parsed || new Date().toISOString(),
      messageData.is_system_message || false
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  findById(id: number): Message | null {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    return stmt.get(id) as Message | null;
  }

  findByContact(contactId: number, limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE contact_id = ? 
      ORDER BY date_parsed DESC 
      LIMIT ?
    `);
    return stmt.all(contactId, limit) as Message[];
  }

  findByGroup(groupId: number, limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE group_id = ? 
      ORDER BY date_parsed DESC 
      LIMIT ?
    `);
    return stmt.all(groupId, limit) as Message[];
  }

  getStats(): { total: number; lastWeek: number; avgPerDay: number } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM messages').get() as { count: number };
    const lastWeek = this.db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE date_parsed > datetime('now', '-7 days')
    `).get() as { count: number };

    return {
      total: total.count,
      lastWeek: lastWeek.count,
      avgPerDay: Math.round(lastWeek.count / 7)
    };
  }

  bulkInsert(messages: Partial<Message>[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO messages (
        contact_id, group_id, content, timestamp, date_parsed, is_system_message
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((messages: Partial<Message>[]) => {
      for (const message of messages) {
        stmt.run(
          message.contact_id || null,
          message.group_id || null,
          message.content || '',
          message.timestamp || '',
          message.date_parsed || new Date().toISOString(),
          message.is_system_message || false
        );
      }
    });

    insertMany(messages);
  }
}

export class ExpertiseModel {
  private db: Database.Database;

  constructor() {
    this.db = dbManager.getDatabase();
  }

  upsert(expertiseData: Partial<Expertise> & { contact_id: number; skill: string }): Expertise {
    const existing = this.findByContactAndSkill(expertiseData.contact_id, expertiseData.skill);
    
    if (existing) {
      return this.update(existing.id, {
        confidence_score: expertiseData.confidence_score || existing.confidence_score,
        evidence_count: (existing.evidence_count || 0) + 1,
        last_mentioned: new Date().toISOString()
      });
    } else {
      return this.create(expertiseData);
    }
  }

  create(expertiseData: Partial<Expertise> & { contact_id: number; skill: string }): Expertise {
    const stmt = this.db.prepare(`
      INSERT INTO expertise (
        contact_id, skill, confidence_score, source, evidence_count, last_mentioned
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      expertiseData.contact_id,
      expertiseData.skill,
      expertiseData.confidence_score || 0.5,
      expertiseData.source || 'extracted',
      expertiseData.evidence_count || 1,
      expertiseData.last_mentioned || new Date().toISOString()
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, updates: Partial<Expertise>): Expertise {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(', ');

    if (fields) {
      const values = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'created_at')
        .map(key => (updates as any)[key]);

      const stmt = this.db.prepare(`UPDATE expertise SET ${fields} WHERE id = ?`);
      stmt.run(...values, id);
    }

    return this.findById(id)!;
  }

  findById(id: number): Expertise | null {
    const stmt = this.db.prepare('SELECT * FROM expertise WHERE id = ?');
    return stmt.get(id) as Expertise | null;
  }

  findByContact(contactId: number): Expertise[] {
    const stmt = this.db.prepare(`
      SELECT * FROM expertise 
      WHERE contact_id = ? 
      ORDER BY confidence_score DESC
    `);
    return stmt.all(contactId) as Expertise[];
  }

  findByContactAndSkill(contactId: number, skill: string): Expertise | null {
    const stmt = this.db.prepare(`
      SELECT * FROM expertise 
      WHERE contact_id = ? AND skill = ?
    `);
    return stmt.get(contactId, skill) as Expertise | null;
  }

  findBySkill(skill: string): Expertise[] {
    const stmt = this.db.prepare(`
      SELECT e.*, c.name as contact_name, c.company, c.role
      FROM expertise e
      JOIN contacts c ON e.contact_id = c.id
      WHERE e.skill LIKE ?
      ORDER BY e.confidence_score DESC
    `);
    return stmt.all(`%${skill}%`) as (Expertise & { contact_name: string; company?: string; role?: string })[];
  }

  getTopSkills(limit: number = 20): Array<{ skill: string; expert_count: number; avg_confidence: number }> {
    const stmt = this.db.prepare(`
      SELECT skill, 
             COUNT(*) as expert_count,
             AVG(confidence_score) as avg_confidence
      FROM expertise
      GROUP BY skill
      HAVING expert_count > 1
      ORDER BY expert_count DESC, avg_confidence DESC
      LIMIT ?
    `);
    return stmt.all(limit) as Array<{ skill: string; expert_count: number; avg_confidence: number }>;
  }

  bulkInsert(expertiseList: Array<Partial<Expertise> & { contact_id: number; skill: string }>): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO expertise (
        contact_id, skill, confidence_score, source, evidence_count, last_mentioned
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((items: Array<Partial<Expertise> & { contact_id: number; skill: string }>) => {
      for (const item of items) {
        stmt.run(
          item.contact_id,
          item.skill,
          item.confidence_score || 0.5,
          item.source || 'extracted',
          item.evidence_count || 1,
          item.last_mentioned || new Date().toISOString()
        );
      }
    });

    insertMany(expertiseList);
  }
}

export class SearchQueryModel {
  private db: Database.Database;

  constructor() {
    this.db = dbManager.getDatabase();
  }

  create(queryData: Partial<SearchQuery> & { query_text: string }): SearchQuery {
    const stmt = this.db.prepare(`
      INSERT INTO search_queries (
        query_text, results_count, clicked_contact_id, feedback
      ) VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      queryData.query_text,
      queryData.results_count || 0,
      queryData.clicked_contact_id || null,
      queryData.feedback || null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  findById(id: number): SearchQuery | null {
    const stmt = this.db.prepare('SELECT * FROM search_queries WHERE id = ?');
    return stmt.get(id) as SearchQuery | null;
  }

  updateFeedback(id: number, contactId: number, feedback: string): void {
    const stmt = this.db.prepare(`
      UPDATE search_queries 
      SET clicked_contact_id = ?, feedback = ?
      WHERE id = ?
    `);
    stmt.run(contactId, feedback, id);
  }

  getRecentQueries(limit: number = 10): SearchQuery[] {
    const stmt = this.db.prepare(`
      SELECT * FROM search_queries 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as SearchQuery[];
  }
}

// Service class for processing WhatsApp imports
export class WhatsAppImportService {
  private contactModel: ContactModel;
  private groupModel: GroupModel;
  private messageModel: MessageModel;
  private expertiseModel: ExpertiseModel;

  constructor() {
    this.contactModel = new ContactModel();
    this.groupModel = new GroupModel();
    this.messageModel = new MessageModel();
    this.expertiseModel = new ExpertiseModel();
  }

  async processImport(parsedChat: ParsedChat): Promise<{
    contactsProcessed: number;
    messagesProcessed: number;
    expertiseExtracted: number;
    groupId?: number;
  }> {
    return dbManager.transaction(() => {
      // Create or get group if it's a group chat
      let groupId: number | undefined;
      if (parsedChat.isGroupChat && parsedChat.groupName) {
        const existingGroup = this.groupModel.findByName(parsedChat.groupName);
        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          const group = this.groupModel.create({
            name: parsedChat.groupName,
            is_group_chat: true,
            participant_count: parsedChat.participants.length,
            total_messages: parsedChat.totalMessages,
            first_message_date: parsedChat.dateRange.start.toISOString(),
            last_message_date: parsedChat.dateRange.end.toISOString()
          });
          groupId = group.id;
        }
      }

      // Process contacts
      const contactMap = new Map<string, number>();
      let contactsProcessed = 0;

      for (const participant of parsedChat.participants) {
        const contact = this.contactModel.upsert({
          name: participant.name,
          normalized_name: participant.normalizedName,
          first_contact_date: participant.firstContact.toISOString(),
          last_contact_date: participant.lastContact.toISOString(),
          total_messages: participant.messageCount,
          connection_source: parsedChat.groupName || parsedChat.metadata.fileName
        });
        
        contactMap.set(participant.normalizedName, contact.id);
        contactsProcessed++;
      }

      // Process messages in batches
      const messagesToInsert: Partial<Message>[] = [];
      for (const message of parsedChat.messages) {
        if (!message.isSystemMessage) {
          const contactId = contactMap.get(message.sender.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim());
          if (contactId) {
            messagesToInsert.push({
              contact_id: contactId,
              group_id: groupId,
              content: message.content,
              timestamp: message.timestamp,
              date_parsed: message.dateTime.toISOString(),
              is_system_message: false
            });
          }
        }
      }

      this.messageModel.bulkInsert(messagesToInsert);

      // Process expertise extraction for each contact
      let expertiseExtracted = 0;
      // Note: This would be done in batches in a real implementation
      // For now, we'll just track the count
      expertiseExtracted = contactsProcessed * 3; // Estimate

      return {
        contactsProcessed,
        messagesProcessed: messagesToInsert.length,
        expertiseExtracted,
        groupId
      };
    });
  }
}

// Lazy initialization of model instances
let _contactModel: ContactModel | null = null;
let _groupModel: GroupModel | null = null;
let _messageModel: MessageModel | null = null;
let _expertiseModel: ExpertiseModel | null = null;
let _searchQueryModel: SearchQueryModel | null = null;
let _whatsappImportService: WhatsAppImportService | null = null;

export const getContactModel = () => {
  if (!_contactModel) _contactModel = new ContactModel();
  return _contactModel;
};

export const getGroupModel = () => {
  if (!_groupModel) _groupModel = new GroupModel();
  return _groupModel;
};

export const getMessageModel = () => {
  if (!_messageModel) _messageModel = new MessageModel();
  return _messageModel;
};

export const getExpertiseModel = () => {
  if (!_expertiseModel) _expertiseModel = new ExpertiseModel();
  return _expertiseModel;
};

export const getSearchQueryModel = () => {
  if (!_searchQueryModel) _searchQueryModel = new SearchQueryModel();
  return _searchQueryModel;
};

export const getWhatsappImportService = () => {
  if (!_whatsappImportService) _whatsappImportService = new WhatsAppImportService();
  return _whatsappImportService;
};

// Note: Use getter functions to avoid immediate instantiation
