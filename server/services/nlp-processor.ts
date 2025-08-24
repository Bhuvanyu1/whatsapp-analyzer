import * as natural from 'natural';
import nlp from 'compromise';
import { removeStopwords, eng } from 'stopwords';
import { ParsedMessage } from './whatsapp-parser.js';

export interface ExtractedKeyword {
  keyword: string;
  frequency: number;
  category: 'skill' | 'technology' | 'industry' | 'role' | 'company' | 'general';
  confidence: number;
  context: string[];
}

export interface InferredExpertise {
  skill: string;
  confidence: number;
  evidence: string[];
  category: string;
  frequency: number;
}

export interface ContactAnalysis {
  keywords: ExtractedKeyword[];
  expertise: InferredExpertise[];
  topics: string[];
  sentiment: {
    overall: number; // -1 to 1
    helpfulness: number; // 0 to 1
    enthusiasm: number; // 0 to 1
  };
  communicationStyle: {
    responseTime: 'fast' | 'medium' | 'slow';
    messageLength: 'short' | 'medium' | 'long';
    formality: 'informal' | 'neutral' | 'formal';
  };
}

export class NLPProcessor {
  private static readonly SKILL_KEYWORDS = [
    // Programming & Technology
    'javascript', 'python', 'react', 'node', 'typescript', 'java', 'c++', 'sql', 'mongodb', 'postgresql',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'devops', 'ci/cd', 'git', 'api', 'rest',
    'graphql', 'microservices', 'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android', 'flutter',
    'machine learning', 'ai', 'data science', 'analytics', 'blockchain', 'web3', 'crypto',
    
    // Business & Management
    'product management', 'project management', 'agile', 'scrum', 'marketing', 'sales', 'business development',
    'strategy', 'consulting', 'operations', 'finance', 'accounting', 'investment', 'venture capital',
    'fundraising', 'startup', 'entrepreneur', 'leadership', 'team management',
    
    // Design & Creative
    'ui design', 'ux design', 'graphic design', 'branding', 'photoshop', 'figma', 'sketch',
    'illustration', 'animation', 'video editing', 'content creation',
    
    // Other Professional Skills
    'legal', 'law', 'compliance', 'hr', 'recruiting', 'education', 'research', 'writing', 'editing',
    'translation', 'healthcare', 'medicine', 'engineering', 'architecture', 'real estate'
  ];

  private static readonly TECHNOLOGY_PATTERNS = [
    /\b(?:using|with|in|on|via|through)\s+([\w\s]{2,20}?)(?:\s+(?:to|for|and|or|but)|\.|,|$)/gi,
    /\b(?:built|created|developed|worked)\s+(?:with|using|in|on)\s+([\w\s]{2,20}?)(?:\s+(?:to|for|and|or|but)|\.|,|$)/gi,
    /\b(?:expert|experienced|skilled)\s+(?:in|with|at)\s+([\w\s]{2,20}?)(?:\s+(?:to|for|and|or|but)|\.|,|$)/gi
  ];

  private static readonly HELP_PATTERNS = [
    /\b(?:can help|happy to help|let me help|i'll help|help you)\b/gi,
    /\b(?:experience|expertise|background|worked on|familiar with)\b/gi,
    /\b(?:i know|i've done|i've worked|i specialize|my specialty)\b/gi,
    /\b(?:advice|suggestion|recommendation|tip|guidance)\b/gi
  ];

  private static readonly COMPANY_PATTERNS = [
    /\b(?:at|with|from|in)\s+([\w\s]{2,30}?)(?:\s+(?:company|corp|inc|ltd|llc)|$)/gi,
    /\b(?:work|working|worked|job|position|role)\s+(?:at|with|for)\s+([\w\s]{2,30}?)(?:\s|$)/gi
  ];

  static analyzeContact(messages: ParsedMessage[]): ContactAnalysis {
    const allText = messages
      .filter(m => !m.isSystemMessage)
      .map(m => m.content)
      .join(' ');

    const keywords = this.extractKeywords(allText);
    const expertise = this.inferExpertise(allText, messages);
    const topics = this.extractTopics(allText);
    const sentiment = this.analyzeSentiment(messages);
    const communicationStyle = this.analyzeCommunicationStyle(messages);

    return {
      keywords,
      expertise,
      topics,
      sentiment,
      communicationStyle
    };
  }

  private static extractKeywords(text: string): ExtractedKeyword[] {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    
    // Remove stopwords and filter
    const filteredTokens = removeStopwords(tokens, eng);
    
    // Count frequency
    const frequency: Record<string, number> = {};
    filteredTokens.forEach(token => {
      if (token.length > 2) {
        frequency[token] = (frequency[token] || 0) + 1;
      }
    });

    // Extract multi-word phrases
    const phrases = this.extractPhrases(text);
    phrases.forEach(phrase => {
      frequency[phrase] = (frequency[phrase] || 0) + 1;
    });

    // Convert to keyword objects with categorization
    const keywords: ExtractedKeyword[] = [];
    
    for (const [keyword, freq] of Object.entries(frequency)) {
      if (freq >= 2) { // Minimum frequency threshold
        const category = this.categorizeKeyword(keyword);
        const confidence = Math.min(freq / 10, 1); // Normalize confidence
        const context = this.extractContext(text, keyword);
        
        keywords.push({
          keyword,
          frequency: freq,
          category,
          confidence,
          context
        });
      }
    }

    return keywords
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50); // Top 50 keywords
  }

  private static extractPhrases(text: string): string[] {
    const doc = nlp(text);
    const phrases: string[] = [];
    
    // Extract noun phrases
    doc.nouns().forEach(noun => {
      const phrase = noun.text().toLowerCase();
      if (phrase.length > 4 && phrase.split(' ').length <= 3) {
        phrases.push(phrase);
      }
    });

    // Extract skill-related phrases with patterns
    this.TECHNOLOGY_PATTERNS.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/\b(?:using|with|in|on|via|through|built|created|developed|worked|expert|experienced|skilled)\s+/gi, '')
            .replace(/\s+(?:to|for|and|or|but).*$/gi, '')
            .trim()
            .toLowerCase();
          if (cleaned.length > 2) {
            phrases.push(cleaned);
          }
        });
      }
    });

    return phrases;
  }

  private static categorizeKeyword(keyword: string): 'skill' | 'technology' | 'industry' | 'role' | 'company' | 'general' {
    const lowerKeyword = keyword.toLowerCase();
    
    // Check against known skill keywords
    if (this.SKILL_KEYWORDS.some(skill => 
      lowerKeyword.includes(skill) || skill.includes(lowerKeyword)
    )) {
      return lowerKeyword.includes('management') || lowerKeyword.includes('manager') ? 'role' : 'skill';
    }

    // Technology indicators
    if (lowerKeyword.match(/\b(js|css|html|api|sdk|framework|library|database|server|cloud)\b/)) {
      return 'technology';
    }

    // Role indicators
    if (lowerKeyword.match(/\b(manager|director|lead|senior|junior|intern|ceo|cto|cfo|developer|engineer|designer)\b/)) {
      return 'role';
    }

    // Industry indicators
    if (lowerKeyword.match(/\b(healthcare|finance|education|retail|manufacturing|consulting|tech|startup)\b/)) {
      return 'industry';
    }

    // Company indicators (usually proper nouns or contains company-like words)
    if (lowerKeyword.match(/\b(corp|inc|ltd|llc|company|technologies|solutions|systems)\b/) ||
        (keyword.charAt(0) === keyword.charAt(0).toUpperCase() && keyword.length > 4)) {
      return 'company';
    }

    return 'general';
  }

  private static extractContext(text: string, keyword: string): string[] {
    const sentences = text.split(/[.!?]+/);
    const context: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        const trimmed = sentence.trim();
        if (trimmed.length > 10 && trimmed.length < 200) {
          context.push(trimmed);
        }
      }
    });

    return context.slice(0, 3); // Max 3 context examples
  }

  private static inferExpertise(text: string, messages: ParsedMessage[]): InferredExpertise[] {
    const expertise: Map<string, InferredExpertise> = new Map();
    
    // Look for help-offering patterns
    messages.forEach(message => {
      if (this.HELP_PATTERNS.some(pattern => pattern.test(message.content))) {
        const skills = this.extractSkillsFromHelpContext(message.content);
        skills.forEach(skill => {
          if (expertise.has(skill)) {
            const existing = expertise.get(skill)!;
            existing.confidence += 0.3;
            existing.frequency += 1;
            existing.evidence.push(message.content.substring(0, 100) + '...');
          } else {
            expertise.set(skill, {
              skill,
              confidence: 0.7,
              evidence: [message.content.substring(0, 100) + '...'],
              category: this.categorizeKeyword(skill),
              frequency: 1
            });
          }
        });
      }
    });

    // Analyze overall text for expertise indicators
    const keywords = this.extractKeywords(text);
    keywords.forEach(keyword => {
      if (keyword.category === 'skill' || keyword.category === 'technology') {
        const skill = keyword.keyword;
        if (expertise.has(skill)) {
          const existing = expertise.get(skill)!;
          existing.confidence += keyword.confidence * 0.5;
          existing.frequency += keyword.frequency;
        } else {
          expertise.set(skill, {
            skill,
            confidence: keyword.confidence * 0.6,
            evidence: keyword.context,
            category: keyword.category,
            frequency: keyword.frequency
          });
        }
      }
    });

    // Normalize confidence scores and filter
    const result = Array.from(expertise.values())
      .map(exp => ({
        ...exp,
        confidence: Math.min(exp.confidence, 1.0)
      }))
      .filter(exp => exp.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Top 20 expertise areas

    return result;
  }

  private static extractSkillsFromHelpContext(text: string): string[] {
    const skills: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Look for explicit skill mentions in help context
    this.SKILL_KEYWORDS.forEach(skill => {
      if (lowerText.includes(skill)) {
        skills.push(skill);
      }
    });

    // Extract from patterns like "I can help with X"
    const helpPatterns = [
      /\b(?:help|assist|support)\s+(?:with|you|in)\s+([\w\s]{2,30}?)(?:\s|$|\.)/gi,
      /\b(?:i know|familiar with|experience in|good at)\s+([\w\s]{2,30}?)(?:\s|$|\.)/gi
    ];

    helpPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.replace(/\b(?:help|assist|support|with|you|in|i know|familiar|experience|good at)\s+/gi, '')
            .trim()
            .toLowerCase();
          if (skill.length > 2 && skill.length < 30) {
            skills.push(skill);
          }
        });
      }
    });

    return skills;
  }

  private static extractTopics(text: string): string[] {
    const doc = nlp(text);
    const topics: string[] = [];
    
    // Extract main topics using noun phrases
    doc.topics().forEach(topic => {
      const topicText = topic.text().toLowerCase();
      if (topicText.length > 3) {
        topics.push(topicText);
      }
    });

    // Count frequency and return top topics
    const topicFreq: Record<string, number> = {};
    topics.forEach(topic => {
      topicFreq[topic] = (topicFreq[topic] || 0) + 1;
    });

    return Object.entries(topicFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  private static analyzeSentiment(messages: ParsedMessage[]): ContactAnalysis['sentiment'] {
    const analyzer = new natural.SentimentAnalyzer('English', 
      natural.PorterStemmer, ['negation']);
    
    let totalSentiment = 0;
    let helpfulnessScore = 0;
    let enthusiasmScore = 0;
    let messageCount = 0;

    messages.forEach(message => {
      if (!message.isSystemMessage && message.content.length > 5) {
        const tokens = natural.WordTokenizer.prototype.tokenize(message.content);
        if (tokens) {
          const score = analyzer.getSentiment(tokens);
          totalSentiment += score;
          
          // Check for helpfulness indicators
          if (/\b(help|assist|support|advice|suggest|recommend)\b/i.test(message.content)) {
            helpfulnessScore += 1;
          }
          
          // Check for enthusiasm indicators
          if (/[!]{1,3}|great|awesome|excited|love|amazing/i.test(message.content)) {
            enthusiasmScore += 1;
          }
          
          messageCount++;
        }
      }
    });

    return {
      overall: messageCount > 0 ? totalSentiment / messageCount : 0,
      helpfulness: messageCount > 0 ? Math.min(helpfulnessScore / messageCount, 1) : 0,
      enthusiasm: messageCount > 0 ? Math.min(enthusiasmScore / messageCount, 1) : 0
    };
  }

  private static analyzeCommunicationStyle(messages: ParsedMessage[]): ContactAnalysis['communicationStyle'] {
    const userMessages = messages.filter(m => !m.isSystemMessage);
    
    if (userMessages.length === 0) {
      return {
        responseTime: 'medium',
        messageLength: 'medium',
        formality: 'neutral'
      };
    }

    // Analyze message length
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    const messageLength = avgLength < 50 ? 'short' : avgLength > 150 ? 'long' : 'medium';

    // Analyze formality based on patterns
    const formalPatterns = /\b(please|thank you|regards|sincerely|would|could|may i)\b/gi;
    const informalPatterns = /\b(hey|hi|yeah|yep|cool|awesome|lol|haha)\b/gi;
    
    const formalCount = userMessages.reduce((count, m) => 
      count + (m.content.match(formalPatterns) || []).length, 0);
    const informalCount = userMessages.reduce((count, m) => 
      count + (m.content.match(informalPatterns) || []).length, 0);
    
    const formality = formalCount > informalCount ? 'formal' : 
                     informalCount > formalCount ? 'informal' : 'neutral';

    // Response time analysis would require timestamp analysis between users
    // For now, we'll set it based on message frequency
    const responseTime = userMessages.length > 50 ? 'fast' : 
                        userMessages.length > 20 ? 'medium' : 'slow';

    return {
      responseTime,
      messageLength,
      formality
    };
  }

  // Semantic search matching
  static calculateRelevance(query: string, contactAnalysis: ContactAnalysis): number {
    const queryTokens = new natural.WordTokenizer().tokenize(query.toLowerCase()) || [];
    const queryKeywords = removeStopwords(queryTokens, eng);
    
    let relevanceScore = 0;
    
    // Match against expertise
    contactAnalysis.expertise.forEach(exp => {
      queryKeywords.forEach(queryToken => {
        if (exp.skill.toLowerCase().includes(queryToken) || 
            queryToken.includes(exp.skill.toLowerCase())) {
          relevanceScore += exp.confidence * 2; // Expertise has high weight
        }
      });
    });

    // Match against keywords
    contactAnalysis.keywords.forEach(keyword => {
      queryKeywords.forEach(queryToken => {
        if (keyword.keyword.toLowerCase().includes(queryToken) || 
            queryToken.includes(keyword.keyword.toLowerCase())) {
          relevanceScore += keyword.confidence * (keyword.category === 'skill' ? 1.5 : 1);
        }
      });
    });

    // Match against topics
    contactAnalysis.topics.forEach(topic => {
      queryKeywords.forEach(queryToken => {
        if (topic.includes(queryToken)) {
          relevanceScore += 0.5;
        }
      });
    });

    // Use TF-IDF or similar for more sophisticated matching
    const tfidf = new natural.TfIdf();
    const contactText = [
      ...contactAnalysis.expertise.map(e => e.skill),
      ...contactAnalysis.keywords.map(k => k.keyword),
      ...contactAnalysis.topics
    ].join(' ');
    
    tfidf.addDocument(contactText);
    tfidf.addDocument(query);
    
    const similarity = natural.JaroWinklerDistance(
      contactText.toLowerCase(), 
      query.toLowerCase()
    );
    
    relevanceScore += similarity * 2;

    // Normalize to 0-100 scale
    return Math.min(Math.round(relevanceScore * 10), 100);
  }
}

export default NLPProcessor;
