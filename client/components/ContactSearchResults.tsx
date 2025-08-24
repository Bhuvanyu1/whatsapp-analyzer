import { useState } from "react";
import { Star, MessageCircle, Calendar, MapPin, Briefcase, TrendingUp, ExternalLink, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
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
  trustLevel: "high" | "medium" | "low";
}

interface ContactSearchResultsProps {
  query: string;
  results: Contact[];
  isLoading?: boolean;
}

export default function ContactSearchResults({ query, results, isLoading = false }: ContactSearchResultsProps) {
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No matches found</h3>
            <p className="text-sm">
              Try adjusting your search or importing more WhatsApp chats to expand your network
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-success";
      case "medium": return "text-warning";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Search Results for: <span className="text-primary">"{query}"</span>
          </h2>
          <p className="text-muted-foreground">Found {results.length} relevant contacts in your network</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Filter Results
          </Button>
          <Button variant="outline" size="sm">
            Sort by Relevance
          </Button>
        </div>
      </div>

      {results.map((contact) => (
        <Card key={contact.id} className="hover:shadow-medium transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              {/* Contact Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(contact.relationshipStrength)
                                ? "text-yellow-400 fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className={getTrustLevelColor(contact.trustLevel)}>
                        {contact.trustLevel} trust
                      </Badge>
                    </div>
                    
                    {contact.role && contact.company && (
                      <div className="flex items-center text-muted-foreground mb-2">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span className="text-sm">{contact.role} at {contact.company}</span>
                      </div>
                    )}
                    
                    {contact.location && (
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{contact.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Last contact: {contact.lastContact}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">{contact.relevanceScore}% match</span>
                  </div>
                  <Progress value={contact.relevanceScore} className="w-20" />
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {contact.expertise.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {contact.expertise.length > 4 && (
                  <Badge variant="outline">
                    +{contact.expertise.length - 4} more
                  </Badge>
                )}
              </div>

              {/* Match Reason */}
              <div className="bg-accent/50 rounded-lg p-3 mb-4">
                <p className="text-sm">
                  <span className="font-medium text-accent-foreground">Why this contact matches:</span>{" "}
                  <span className="text-accent-foreground">{contact.matchReason}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedContact(
                    expandedContact === contact.id ? null : contact.id
                  )}
                >
                  {expandedContact === contact.id ? "Hide Details" : "View Details"}
                </Button>
                
                <div className="flex items-center space-x-2">
                  {contact.phoneNumber && (
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  )}
                  <Button size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedContact === contact.id && (
              <div className="border-t bg-muted/20 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conversation Highlights */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Conversation Highlights
                    </h4>
                    <div className="space-y-2">
                      {contact.conversationHighlights.map((highlight, index) => (
                        <div key={index} className="text-sm p-2 bg-background rounded border-l-2 border-primary">
                          "{highlight}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Expertise */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      All Expertise Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {contact.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Relationship strength: {contact.relationshipStrength}/5 • Trust level: {contact.trustLevel}
                  </div>
                  <Button variant="link" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
