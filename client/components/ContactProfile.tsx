import { useState } from "react";
import { Star, MessageCircle, Calendar, MapPin, Briefcase, TrendingUp, Phone, Mail, Edit, Tag, MoreHorizontal, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactProfileProps {
  contactId: string;
}

export default function ContactProfile({ contactId }: ContactProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Mock contact data - in real app this would come from props or API
  const contact = {
    id: contactId,
    name: "Sarah Chen",
    avatar: "",
    phone: "+1-555-0123",
    email: "sarah.chen@techventure.ai",
    company: "TechVenture AI",
    role: "Senior Data Scientist",
    location: "San Francisco, CA",
    relationshipStrength: 4,
    trustLevel: "high" as const,
    lastContact: "3 days ago",
    firstContact: "2 years ago",
    totalMessages: 247,
    expertise: [
      { skill: "Machine Learning", confidence: 95 },
      { skill: "Python", confidence: 90 },
      { skill: "Data Science", confidence: 92 },
      { skill: "Startup Consulting", confidence: 85 },
      { skill: "AI Strategy", confidence: 88 },
      { skill: "Deep Learning", confidence: 82 }
    ],
    tags: ["Technical Mentor", "AI Expert", "Startup Advisor", "Python Developer"],
    notes: "Met at TechCrunch Disrupt 2022. Very knowledgeable about ML infrastructure and has experience scaling AI products. Always willing to help and provide technical guidance.",
    connectionSource: "Tech Founders WhatsApp Group",
    mutualConnections: 12,
    conversationTopics: [
      { topic: "Machine Learning", frequency: 45 },
      { topic: "Startup Advice", frequency: 32 },
      { topic: "Python Programming", frequency: 28 },
      { topic: "Data Infrastructure", frequency: 23 },
      { topic: "Career Development", frequency: 18 }
    ],
    recentHighlights: [
      {
        date: "3 days ago",
        type: "expertise_shared",
        content: "Shared insights about optimizing ML model performance for production"
      },
      {
        date: "1 week ago",
        type: "introduction",
        content: "Introduced me to her colleague at Google for potential collaboration"
      },
      {
        date: "2 weeks ago",
        type: "advice_given",
        content: "Provided detailed feedback on my startup's data strategy"
      }
    ],
    helpfulQueries: [
      "Machine learning model optimization",
      "Python best practices",
      "AI startup strategy",
      "Data infrastructure scaling"
    ]
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-success";
      case "medium": return "text-warning";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold">{contact.name}</h1>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < contact.relationshipStrength
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>{contact.role} at {contact.company}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{contact.location}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{contact.mutualConnections} mutual connections</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <div>Last contact: {contact.lastContact}</div>
                <div>First contact: {contact.firstContact}</div>
                <div>{contact.totalMessages} total messages</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Relationship Strength</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={contact.relationshipStrength * 20} className="w-20" />
                    <span className="text-sm font-medium">{contact.relationshipStrength}/5</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Messages</span>
                  <span className="font-medium">{contact.totalMessages}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Connection Source</span>
                  <span className="text-sm text-muted-foreground">{contact.connectionSource}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6 px-2">
                    <Tag className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{contact.notes}</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Edit className="h-4 w-4 mr-2" />
                Edit Notes
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.recentHighlights.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expertise Areas</CardTitle>
              <CardDescription>Skills and knowledge domains with confidence levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.expertise.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.skill}</span>
                        <span className="text-sm text-muted-foreground">{item.confidence}%</span>
                      </div>
                      <Progress value={item.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Helpful for These Queries</CardTitle>
              <CardDescription>Based on conversation analysis and expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contact.helpfulQueries.map((query, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-sm">{query}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Topics</CardTitle>
              <CardDescription>Most discussed subjects in your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contact.conversationTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{topic.topic}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={topic.frequency} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{topic.frequency}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Position</CardTitle>
              <CardDescription>Contact's role in your professional network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <p className="text-muted-foreground">Network visualization would appear here</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Interactive network graph showing connections and influence
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
