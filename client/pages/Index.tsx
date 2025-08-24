import { useState } from "react";
import { Search, Upload, Users, MessageSquare, TrendingUp, Brain, Settings, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">WhatsApp Network Intelligence</h1>
                  <p className="text-sm text-muted-foreground">Professional Network Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Chats
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">Find Professional Help in Your Network</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask about any professional challenge and discover which contacts in your WhatsApp network can help you
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="e.g., I need help with digital marketing strategy for my startup..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg border-2 focus:border-primary rounded-xl shadow-soft"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 rounded-lg">
                Search Network
              </Button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                Career advice
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                Technical mentorship
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                Business connections
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                Investment opportunities
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                Industry insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +23 from last import
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,632</div>
              <p className="text-xs text-muted-foreground">
                Analyzed messages
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expertise Areas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                Skills identified
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.7</div>
              <p className="text-xs text-muted-foreground">
                Professional diversity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Network Activity</CardTitle>
              <CardDescription>Latest insights and contact interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "new_expertise",
                    contact: "Sarah Chen",
                    detail: "AI/ML expertise identified from recent conversations",
                    time: "2 hours ago"
                  },
                  {
                    type: "search_result",
                    contact: "Marcus Rodriguez",
                    detail: "Recommended for 'startup funding' query",
                    time: "5 hours ago"
                  },
                  {
                    type: "contact_update",
                    contact: "Dr. Priya Sharma",
                    detail: "Added healthcare consulting expertise",
                    time: "1 day ago"
                  },
                  {
                    type: "new_import",
                    contact: "Tech Founders Group",
                    detail: "15 new contacts from group chat import",
                    time: "2 days ago"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.contact}</p>
                      <p className="text-sm text-muted-foreground">{activity.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import WhatsApp Chats
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Browse All Contacts
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Network Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Network Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Top Expertise Areas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top Expertise Areas in Your Network</CardTitle>
            <CardDescription>Most common professional skills and domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { skill: "Software Development", count: 47 },
                { skill: "Digital Marketing", count: 32 },
                { skill: "Business Strategy", count: 28 },
                { skill: "Product Management", count: 24 },
                { skill: "Data Science", count: 19 },
                { skill: "UX/UI Design", count: 17 },
                { skill: "Sales", count: 15 },
                { skill: "Finance", count: 13 },
                { skill: "HR/Recruiting", count: 11 },
                { skill: "Legal", count: 8 },
                { skill: "Healthcare", count: 7 },
                { skill: "Education", count: 6 }
              ].map((area, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card hover:shadow-soft transition-shadow cursor-pointer">
                  <div className="font-medium text-sm">{area.skill}</div>
                  <div className="text-xs text-muted-foreground">{area.count} contacts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
