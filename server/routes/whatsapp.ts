import { RequestHandler } from "express";
import multer from "multer";
import { WhatsAppParser } from "../services/whatsapp-parser.js";
import { NLPProcessor } from "../services/nlp-processor.js";
import { getWhatsappImportService, getContactModel, getMessageModel, getExpertiseModel } from "../models/index.js";
import { z } from "zod";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
});

// Validation schemas
const ImportResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    fileId: z.string(),
    fileName: z.string(),
    isGroupChat: z.boolean(),
    groupName: z.string().optional(),
    totalMessages: z.number(),
    uniqueContacts: z.number(),
    dateRange: z.object({
      start: z.string(),
      end: z.string()
    }),
    processing: z.object({
      contactsProcessed: z.number(),
      messagesProcessed: z.number(),
      expertiseExtracted: z.number()
    })
  }).optional(),
  error: z.string().optional()
});

// Validate WhatsApp file format
export const validateFile: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const content = req.file.buffer.toString('utf-8');
    const validation = WhatsAppParser.validateFormat(content);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid WhatsApp export format',
        details: validation.errors
      });
    }

    // Extract metadata for preview
    const metadata = WhatsAppParser.extractMetadata(content, req.file.originalname);

    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        isValid: true,
        preview: metadata
      }
    });
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate file'
    });
  }
};

// Process and import WhatsApp file
export const importFile: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const content = req.file.buffer.toString('utf-8');
    const fileName = req.file.originalname;

    // Step 1: Parse the WhatsApp file
    const parsedChat = WhatsAppParser.parseContent(content, fileName, req.file.size);

    // Step 2: Process the import and store in database
    const importResult = await getWhatsappImportService().processImport(parsedChat);

    // Step 3: Run NLP analysis on contacts
    let expertiseCount = 0;
    for (const participant of parsedChat.participants) {
      const userMessages = parsedChat.messages.filter(m => 
        m.sender === participant.name && !m.isSystemMessage
      );
      
      if (userMessages.length > 5) { // Only analyze contacts with enough messages
        const analysis = NLPProcessor.analyzeContact(userMessages);
        
        // Store expertise in database
        const contact = getContactModel().findByNormalizedName(participant.normalizedName);
        if (contact && analysis.expertise.length > 0) {
          const expertiseData = analysis.expertise.map(exp => ({
            contact_id: contact.id,
            skill: exp.skill,
            confidence_score: exp.confidence,
            source: 'extracted' as const,
            evidence_count: exp.frequency,
            last_mentioned: new Date().toISOString()
          }));
          
          getExpertiseModel().bulkInsert(expertiseData);
          expertiseCount += expertiseData.length;
        }
      }
    }

    // Generate unique file ID
    const fileId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = {
      success: true,
      data: {
        fileId,
        fileName,
        isGroupChat: parsedChat.isGroupChat,
        groupName: parsedChat.groupName,
        totalMessages: parsedChat.totalMessages,
        uniqueContacts: parsedChat.participants.length,
        dateRange: {
          start: parsedChat.dateRange.start.toISOString(),
          end: parsedChat.dateRange.end.toISOString()
        },
        processing: {
          contactsProcessed: importResult.contactsProcessed,
          messagesProcessed: importResult.messagesProcessed,
          expertiseExtracted: expertiseCount
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process WhatsApp import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get import status/history
export const getImportHistory: RequestHandler = (req, res) => {
  try {
    // This would typically come from a separate imports tracking table
    // For now, we'll return basic stats
    const contactStats = getContactModel().getStats();
    const messageStats = getMessageModel().getStats();

    res.json({
      success: true,
      data: {
        totalImports: 1, // Would be tracked in a separate table
        totalContacts: contactStats.total,
        totalMessages: messageStats.total,
        lastImport: new Date().toISOString(), // Would be from tracking table
        recentActivity: {
          contactsAdded: contactStats.recentlyActive,
          messagesProcessed: messageStats.lastWeek
        }
      }
    });
  } catch (error) {
    console.error('Import history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get import history'
    });
  }
};

// Export data
export const exportData: RequestHandler = async (req, res) => {
  try {
    const { format = 'json', type = 'contacts' } = req.query;

    let data: any;
    let filename: string;
    let contentType: string;

    switch (type) {
      case 'contacts':
        data = getContactModel().findAll(1000); // Export up to 1000 contacts
        filename = `contacts_export_${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
        break;
      
      case 'expertise':
        data = getExpertiseModel().getTopSkills(100);
        filename = `expertise_export_${new Date().toISOString().split('T')[0]}.json`;
        contentType = 'application/json';
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type'
        });
    }

    if (format === 'csv' && type === 'contacts') {
      // Convert to CSV for contacts
      const csvHeader = 'name,company,role,location,total_messages,relationship_strength,trust_level\n';
      const csvData = data.map((contact: any) => 
        `"${contact.name}","${contact.company || ''}","${contact.role || ''}","${contact.location || ''}",${contact.total_messages},${contact.relationship_strength},"${contact.trust_level}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename.replace('.json', '.csv')}"`);
      res.send(csvHeader + csvData);
    } else {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json({
        success: true,
        exportedAt: new Date().toISOString(),
        count: Array.isArray(data) ? data.length : 1,
        data
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
};

// Add multer middleware to routes that need it
export const uploadMiddleware = upload.single('whatsappFile');
