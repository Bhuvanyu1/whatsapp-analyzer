// Legacy demo interface (keeping for compatibility)
export interface DemoResponse {
  message: string;
}

// WhatsApp Import interfaces
export interface WhatsAppImportResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    isGroupChat: boolean;
    groupName?: string;
    totalMessages: number;
    uniqueContacts: number;
    dateRange: {
      start: string;
      end: string;
    };
    processing: {
      contactsProcessed: number;
      messagesProcessed: number;
      expertiseExtracted: number;
    };
  };
  error?: string;
}

export interface WhatsAppValidationResponse {
  success: boolean;
  data?: {
    fileName: string;
    fileSize: number;
    isValid: boolean;
    preview: {
      messageCount: number;
      participantCount: number;
      isGroupChat: boolean;
      dateRange: {
        start: Date | null;
        end: Date | null;
      };
    };
  };
  error?: string;
  details?: string[];
}

// Contact interfaces
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
  expertise?: string[]; // For enriched contact data
  expertiseCount?: number;
}

export interface ContactDetails extends Contact {
  expertise: Array<{
    skill: string;
    confidence: number;
    evidence_count: number;
    last_mentioned: string;
    source: 'extracted' | 'manual';
  }>;
  statistics: {
    totalMessages: number;
    messagesByMonth: Record<string, number>;
    avgMessagesPerMonth: number;
    conversationSpan: number;
  };
  conversationHighlights: string[];
}

export interface ContactsResponse {
  success: boolean;
  data?: {
    contacts: Contact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

export interface ContactResponse {
  success: boolean;
  data?: ContactDetails;
  error?: string;
}

// Search interfaces
export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  relevanceScore: number;
  expertise: string[];
  company?: string;
  role?: string;
  lastContact: string;
  relationshipStrength: number;
  matchReason: string;
  conversationHighlights: string[];
  location?: string;
  phoneNumber?: string;
  trustLevel: 'low' | 'medium' | 'high';
}

export interface SearchResponse {
  success: boolean;
  data?: {
    query: string;
    results: SearchResult[];
    totalFound: number;
    searchId: number;
  };
  error?: string;
}

// Analytics interfaces
export interface NetworkAnalytics {
  networkHealth: {
    totalContacts: number;
    activeContacts: number;
    expertiseAreas: number;
    avgRelationshipStrength: number;
    diversityScore: number;
  };
  topSkills: Array<{
    skill: string;
    expert_count: number;
    avg_confidence: number;
  }>;
  trustDistribution: Record<string, number>;
  topCompanies: Array<{
    company: string;
    count: number;
  }>;
  messageStats: {
    total: number;
    lastWeek: number;
    avgPerDay: number;
  };
  trends: {
    growthRate: number;
    engagementRate: number;
    responseRate: number;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data?: NetworkAnalytics;
  error?: string;
}

// Network stats interface
export interface NetworkStats {
  totalContacts: number;
  totalMessages: number;
  expertiseAreas: number;
  totalGroups: number;
  totalKeywords: number;
  lastUpdated: string;
}

export interface NetworkStatsResponse {
  success: boolean;
  data?: NetworkStats;
  error?: string;
}

// Health check interface
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database: boolean;
  timestamp: string;
  stats?: any;
}

// Error interface
export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// Generic success response
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Export data interfaces
export interface ExportResponse {
  success: boolean;
  exportedAt?: string;
  count?: number;
  data?: any;
  error?: string;
}

// Feedback interface
export interface SearchFeedbackRequest {
  contactId?: number;
  feedback?: string;
}
