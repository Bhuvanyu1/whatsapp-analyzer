import { RequestHandler } from "express";
import { z } from "zod";
import { getContactModel, getExpertiseModel, getMessageModel, getSearchQueryModel } from "../models/index.js";
import { NLPProcessor } from "../services/nlp-processor.js";

// Validation schemas
const ContactQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'lastContact', 'messageCount', 'relationshipStrength']).optional().default('lastContact'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  trustLevel: z.enum(['low', 'medium', 'high']).optional(),
  hasExpertise: z.string().optional()
});

const ContactUpdateSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  trust_level: z.enum(['low', 'medium', 'high']).optional(),
  relationship_strength: z.number().min(1).max(5).optional()
});

const SearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10)
});

const TagSchema = z.object({
  tag: z.string().min(1).max(50)
});

// Get all contacts with filtering and pagination
export const getContacts: RequestHandler = async (req, res) => {
  try {
    const query = ContactQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    let contacts;
    if (query.search) {
      contacts = getContactModel().search(query.search, query.limit);
    } else {
      contacts = getContactModel().findAll(query.limit, offset);
    }

    // Enrich with expertise data
    const enrichedContacts = await Promise.all(
      contacts.map(async (contact) => {
        const expertise = getExpertiseModel().findByContact(contact.id);
        const topSkills = expertise
          .sort((a, b) => b.confidence_score - a.confidence_score)
          .slice(0, 5)
          .map(e => e.skill);

        return {
          ...contact,
          expertise: topSkills,
          expertiseCount: expertise.length
        };
      })
    );

    // Apply additional filters
    let filteredContacts = enrichedContacts;

    if (query.trustLevel) {
      filteredContacts = filteredContacts.filter(c => c.trust_level === query.trustLevel);
    }

    if (query.hasExpertise) {
      filteredContacts = filteredContacts.filter(c => 
        c.expertise.some(skill => 
          skill.toLowerCase().includes(query.hasExpertise!.toLowerCase())
        )
      );
    }

    // Sort results
    filteredContacts.sort((a, b) => {
      let aVal, bVal;
      
      switch (query.sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'lastContact':
          aVal = new Date(a.last_contact_date).getTime();
          bVal = new Date(b.last_contact_date).getTime();
          break;
        case 'messageCount':
          aVal = a.total_messages;
          bVal = b.total_messages;
          break;
        case 'relationshipStrength':
          aVal = a.relationship_strength;
          bVal = b.relationship_strength;
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }

      if (query.order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    res.json({
      success: true,
      data: {
        contacts: filteredContacts,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: filteredContacts.length,
          hasMore: filteredContacts.length === query.limit
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contacts'
    });
  }
};

// Get single contact with full details
export const getContact: RequestHandler = async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const contact = getContactModel().findById(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Get expertise
    const expertise = getExpertiseModel().findByContact(contactId);
    
    // Get recent messages for analysis
    const recentMessages = getMessageModel().findByContact(contactId, 50);
    
    // Get conversation highlights (most helpful/informative messages)
    const highlights = recentMessages
      .filter(m => !m.is_system_message && m.content.length > 20)
      .sort((a, b) => b.content.length - a.content.length)
      .slice(0, 5)
      .map(m => m.content.substring(0, 150) + (m.content.length > 150 ? '...' : ''));

    // Calculate additional metrics
    const messagesByMonth = recentMessages.reduce((acc, msg) => {
      const month = new Date(msg.date_parsed).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const enrichedContact = {
      ...contact,
      expertise: expertise.map(e => ({
        skill: e.skill,
        confidence: e.confidence_score,
        evidence_count: e.evidence_count,
        last_mentioned: e.last_mentioned,
        source: e.source
      })),
      statistics: {
        totalMessages: contact.total_messages,
        messagesByMonth,
        avgMessagesPerMonth: Object.values(messagesByMonth).length > 0 
          ? Math.round(Object.values(messagesByMonth).reduce((a, b) => a + b, 0) / Object.values(messagesByMonth).length)
          : 0,
        conversationSpan: contact.first_contact_date && contact.last_contact_date
          ? Math.ceil((new Date(contact.last_contact_date).getTime() - new Date(contact.first_contact_date).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      },
      conversationHighlights: highlights
    };

    res.json({
      success: true,
      data: enrichedContact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact'
    });
  }
};

// Update contact information
export const updateContact: RequestHandler = async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const updates = ContactUpdateSchema.parse(req.body);

    const contact = getContactModel().findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    const updatedContact = getContactModel().update(contactId, updates);

    res.json({
      success: true,
      data: updatedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};

// Search for professional help
export const searchNetwork: RequestHandler = async (req, res) => {
  try {
    const { query, limit } = SearchSchema.parse(req.body);

    // Log the search query
    const searchRecord = getSearchQueryModel().create({
      query_text: query,
      results_count: 0
    });

    // Get all contacts with their expertise and recent messages
    const allContacts = getContactModel().findAll(500); // Get more contacts for better matching
    const searchResults = [];

    for (const contact of allContacts) {
      // Get contact's expertise and messages for analysis
      const expertise = getExpertiseModel().findByContact(contact.id);
      const recentMessages = getMessageModel().findByContact(contact.id, 20);
      
      if (expertise.length === 0 && recentMessages.length < 5) {
        continue; // Skip contacts without enough data
      }

      // Create analysis for relevance calculation
      const mockAnalysis = {
        expertise: expertise.map(e => ({
          skill: e.skill,
          confidence: e.confidence_score,
          evidence: [`Evidence from ${e.evidence_count} conversations`],
          category: 'skill',
          frequency: e.evidence_count
        })),
        keywords: expertise.map(e => ({
          keyword: e.skill,
          frequency: e.evidence_count,
          category: 'skill' as const,
          confidence: e.confidence_score,
          context: [`Used in context of ${e.skill}`]
        })),
        topics: expertise.slice(0, 5).map(e => e.skill),
        sentiment: { overall: 0.5, helpfulness: 0.7, enthusiasm: 0.6 },
        communicationStyle: { responseTime: 'medium' as const, messageLength: 'medium' as const, formality: 'neutral' as const }
      };

      // Calculate relevance score
      const relevanceScore = NLPProcessor.calculateRelevance(query, mockAnalysis);

      if (relevanceScore > 20) { // Minimum relevance threshold
        // Generate match reason
        const topExpertise = expertise
          .sort((a, b) => b.confidence_score - a.confidence_score)
          .slice(0, 3);
        
        const matchReason = topExpertise.length > 0
          ? `Has expertise in ${topExpertise.map(e => e.skill).join(', ')} with high confidence scores.`
          : `Active participant with ${contact.total_messages} messages and strong network presence.`;

        // Get conversation highlights
        const highlights = recentMessages
          .filter(m => !m.is_system_message && m.content.length > 30)
          .slice(0, 3)
          .map(m => m.content.length > 100 ? m.content.substring(0, 100) + '...' : m.content);

        searchResults.push({
          id: contact.id.toString(),
          name: contact.name,
          relevanceScore,
          expertise: expertise.slice(0, 6).map(e => e.skill),
          company: contact.company,
          role: contact.role,
          lastContact: this.formatRelativeTime(contact.last_contact_date),
          relationshipStrength: contact.relationship_strength,
          matchReason,
          conversationHighlights: highlights,
          location: contact.location,
          phoneNumber: contact.phone_number,
          trustLevel: contact.trust_level
        });
      }
    }

    // Sort by relevance and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Update search record with results count
    getSearchQueryModel().updateFeedback(searchRecord.id, 0, '');

    res.json({
      success: true,
      data: {
        query,
        results: sortedResults,
        totalFound: sortedResults.length,
        searchId: searchRecord.id
      }
    });
  } catch (error) {
    console.error('Search network error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search network'
    });
  }
};

// Get network analytics/statistics
export const getNetworkAnalytics: RequestHandler = async (req, res) => {
  try {
    const contactStats = getContactModel().getStats();
    const messageStats = getMessageModel().getStats();
    const topSkills = getExpertiseModel().getTopSkills(20);

    // Calculate network health metrics
    const allContacts = getContactModel().findAll(1000);
    const recentlyActive = allContacts.filter(c => {
      const lastContact = new Date(c.last_contact_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastContact > thirtyDaysAgo;
    }).length;

    const networkHealth = {
      totalContacts: contactStats.total,
      activeContacts: recentlyActive,
      expertiseAreas: topSkills.length,
      avgRelationshipStrength: allContacts.length > 0 
        ? Math.round((allContacts.reduce((sum, c) => sum + c.relationship_strength, 0) / allContacts.length) * 10) / 10
        : 0,
      diversityScore: Math.min(topSkills.length / 20, 1) * 10 // 0-10 scale
    };

    // Distribution analytics
    const trustDistribution = allContacts.reduce((acc, contact) => {
      acc[contact.trust_level] = (acc[contact.trust_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companyDistribution = allContacts
      .filter(c => c.company)
      .reduce((acc, contact) => {
        acc[contact.company!] = (acc[contact.company!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topCompanies = Object.entries(companyDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }));

    res.json({
      success: true,
      data: {
        networkHealth,
        topSkills: topSkills.slice(0, 15),
        trustDistribution,
        topCompanies,
        messageStats,
        trends: {
          growthRate: 12.5, // Would be calculated from historical data
          engagementRate: recentlyActive / contactStats.total * 100,
          responseRate: 85.2 // Would be calculated from message patterns
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
};

// Record search feedback
export const recordSearchFeedback: RequestHandler = async (req, res) => {
  try {
    const searchId = parseInt(req.params.searchId);
    const { contactId, feedback } = req.body;

    if (contactId) {
      getSearchQueryModel().updateFeedback(searchId, parseInt(contactId), feedback || 'clicked');
    }

    res.json({
      success: true,
      message: 'Feedback recorded'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
};

// Utility function for formatting relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}
