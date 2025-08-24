import { z } from 'zod';

// Types for parsed data
export interface ParsedMessage {
  timestamp: string;
  sender: string;
  content: string;
  isSystemMessage: boolean;
  dateTime: Date;
}

export interface ParsedContact {
  name: string;
  normalizedName: string;
  messageCount: number;
  firstContact: Date;
  lastContact: Date;
}

export interface ParsedChat {
  isGroupChat: boolean;
  groupName?: string;
  participants: ParsedContact[];
  messages: ParsedMessage[];
  totalMessages: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  metadata: {
    fileName: string;
    fileSize: number;
    parsedAt: Date;
  };
}

export class WhatsAppParser {
  private static readonly DATE_TIME_PATTERNS = [
    // US format: 12/31/2023, 11:59 PM - Contact Name:
    /^(\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}\s(?:AM|PM))\s-\s([^:]+):\s(.*)$/,
    // 24-hour format: 31/12/2023, 23:59 - Contact Name:
    /^(\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // ISO format: 2023-12-31, 23:59 - Contact Name:
    /^(\d{4}-\d{1,2}-\d{1,2},\s\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Alternative format: [31/12/2023, 23:59:59] Contact Name:
    /^\[(\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.*)$/
  ];

  private static readonly SYSTEM_MESSAGE_PATTERNS = [
    /added|left|removed|changed|created|deleted|security code|end-to-end encryption/i,
    /messages and calls are end-to-end encrypted/i,
    /joined using this group's invite link/i,
    /\w+ changed their phone number/i,
    /you're now an admin/i
  ];

  static parseContent(content: string, fileName: string = '', fileSize: number = 0): ParsedChat {
    const lines = content.split('\n').filter(line => line.trim());
    const messages: ParsedMessage[] = [];
    const contactMap = new Map<string, ParsedContact>();
    
    let isGroupChat = false;
    let groupName = '';
    
    // Detect if it's a group chat by looking for group indicators
    const firstFewLines = lines.slice(0, 10).join('\n');
    if (this.detectGroupChat(firstFewLines)) {
      isGroupChat = true;
      groupName = this.extractGroupName(fileName, firstFewLines);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parsed = this.parseMessageLine(line);
      if (parsed) {
        messages.push(parsed);
        
        // Track contacts
        if (!parsed.isSystemMessage) {
          this.updateContactStats(contactMap, parsed);
        }
      } else {
        // Handle multi-line messages (continuation)
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          lastMessage.content += '\n' + line;
        }
      }
    }

    // Convert contact map to array
    const participants = Array.from(contactMap.values());

    // Calculate date range
    const dates = messages.map(m => m.dateTime).filter(d => d);
    const dateRange = {
      start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date(),
      end: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date()
    };

    return {
      isGroupChat,
      groupName: isGroupChat ? groupName : undefined,
      participants,
      messages,
      totalMessages: messages.length,
      dateRange,
      metadata: {
        fileName,
        fileSize,
        parsedAt: new Date()
      }
    };
  }

  private static parseMessageLine(line: string): ParsedMessage | null {
    for (const pattern of this.DATE_TIME_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const [, timestampStr, sender, content] = match;
        const dateTime = this.parseDateTime(timestampStr);
        const isSystemMessage = this.isSystemMessage(content, sender);

        return {
          timestamp: timestampStr,
          sender: sender.trim(),
          content: content.trim(),
          isSystemMessage,
          dateTime
        };
      }
    }
    return null;
  }

  private static parseDateTime(timestampStr: string): Date {
    // Handle different date formats
    try {
      // Try US format first: 12/31/2023, 11:59 PM
      if (timestampStr.includes('AM') || timestampStr.includes('PM')) {
        return new Date(timestampStr);
      }
      
      // Handle 24-hour format: 31/12/2023, 23:59
      const [datePart, timePart] = timestampStr.split(', ');
      
      if (datePart.includes('/')) {
        const [month, day, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
      }
      
      // Handle ISO format: 2023-12-31, 23:59
      if (datePart.includes('-')) {
        return new Date(timestampStr.replace(', ', 'T') + ':00');
      }

      // Fallback
      return new Date(timestampStr);
    } catch (error) {
      console.warn('Failed to parse date:', timestampStr);
      return new Date();
    }
  }

  private static isSystemMessage(content: string, sender: string): boolean {
    // Check if sender indicates system message
    if (sender.toLowerCase().includes('whatsapp') || sender.includes('~')) {
      return true;
    }

    // Check content patterns
    return this.SYSTEM_MESSAGE_PATTERNS.some(pattern => pattern.test(content));
  }

  private static updateContactStats(contactMap: Map<string, ParsedContact>, message: ParsedMessage): void {
    const normalizedName = this.normalizeName(message.sender);
    
    if (contactMap.has(normalizedName)) {
      const contact = contactMap.get(normalizedName)!;
      contact.messageCount++;
      contact.lastContact = message.dateTime;
      
      // Update first contact if this message is earlier
      if (message.dateTime < contact.firstContact) {
        contact.firstContact = message.dateTime;
      }
    } else {
      contactMap.set(normalizedName, {
        name: message.sender,
        normalizedName,
        messageCount: 1,
        firstContact: message.dateTime,
        lastContact: message.dateTime
      });
    }
  }

  private static normalizeName(name: string): string {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  private static detectGroupChat(content: string): boolean {
    const groupIndicators = [
      /\d+ participants?/i,
      /group info/i,
      /added|left|removed/i,
      /group invite/i,
      /admin/i
    ];

    return groupIndicators.some(pattern => pattern.test(content));
  }

  private static extractGroupName(fileName: string, content: string): string {
    // Try to extract from filename first
    const fileBaseName = fileName.replace(/\.txt$/i, '');
    if (fileBaseName && !fileBaseName.includes('WhatsApp') && !fileBaseName.includes('Chat')) {
      return fileBaseName;
    }

    // Try to extract from content
    const groupNamePatterns = [
      /Group:\s*(.+)/i,
      /Chat with (.+)/i,
      /(.+) group/i
    ];

    for (const pattern of groupNamePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Unknown Group';
  }

  // Validate WhatsApp export format
  static validateFormat(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      errors.push('File is empty');
      return { isValid: false, errors };
    }

    // Check if at least some lines match WhatsApp format
    const validMessages = lines.slice(0, 10).filter(line => {
      return this.DATE_TIME_PATTERNS.some(pattern => pattern.test(line));
    });

    if (validMessages.length === 0) {
      errors.push('No valid WhatsApp message format detected');
    }

    // Check for minimum message count
    if (lines.length < 5) {
      errors.push('File seems too short to be a valid WhatsApp export');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Extract metadata without full parsing
  static extractMetadata(content: string, fileName: string = ''): {
    messageCount: number;
    participantCount: number;
    isGroupChat: boolean;
    dateRange: { start: Date | null; end: Date | null };
  } {
    const lines = content.split('\n').filter(line => line.trim());
    const contacts = new Set<string>();
    const dates: Date[] = [];
    let messageCount = 0;

    for (const line of lines.slice(0, Math.min(100, lines.length))) {
      const parsed = this.parseMessageLine(line);
      if (parsed && !parsed.isSystemMessage) {
        contacts.add(this.normalizeName(parsed.sender));
        dates.push(parsed.dateTime);
        messageCount++;
      }
    }

    const isGroupChat = this.detectGroupChat(lines.slice(0, 10).join('\n'));

    return {
      messageCount: lines.length, // Approximate
      participantCount: contacts.size,
      isGroupChat,
      dateRange: {
        start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null,
        end: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null
      }
    };
  }
}

export default WhatsAppParser;
