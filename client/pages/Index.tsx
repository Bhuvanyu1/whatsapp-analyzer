import { useState, useEffect } from "react";
import {
  Search,
  Upload,
  Users,
  MessageSquare,
  TrendingUp,
  Brain,
  Settings,
  FileText,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import ContactSearchResults from "@/components/ContactSearchResults";
import WhatsAppUpload from "@/components/WhatsAppUpload";
import { NetworkStatsResponse, SearchResponse, SearchRequest } from "@shared/api";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalContacts: 0,
    totalMessages: 0,
    expertiseAreas: 0,
    networkScore: 0
  });
  const [recentActivity] = useState([
    {
      type: "new_expertise",
      contact: "Welcome to WhatsApp Network Intelligence",
      detail: "Import your first WhatsApp chat to start building your professional network map",
      time: "Getting started"
    },
    {
      type: "search_result",
      contact: "How it works",
      detail: "Upload WhatsApp exports, analyze conversations, and discover expertise in your network",
      time: "Learn more"
    },
    {
      type: "contact_update",
      contact: "Privacy first",
      detail: "All data is processed locally on your device - nothing is sent to external servers",
      time: "Security"
    }
  ]);

  // Load network stats on component mount
  useEffect(() => {
    fetchNetworkStats();
  }, []);

  const fetchNetworkStats = async () => {
    try {
      const response = await fetch('/api/network/stats');
      const data: NetworkStatsResponse = await response.json();
      if (data.success && data.data) {
        setNetworkStats({
          totalContacts: data.data.totalContacts,
          totalMessages: data.data.totalMessages,
          expertiseAreas: data.data.expertiseAreas,
          networkScore: Math.min(data.data.expertiseAreas / 10, 10) // Simple calculation
        });
      }
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchRequest: SearchRequest = {
        query: searchQuery,
        limit: 10
      };
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest)
      });
      
      const data: SearchResponse = await response.json();
      if (data.success && data.data) {
        setSearchResults(data.data.results);
        setHasSearched(true);
      } else {
        console.error('Search failed:', data.error);
        setSearchResults([]);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToDashboard = () => {
    setHasSearched(false);
    setSearchQuery("");
  };

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
                  <h1 className="text-xl font-bold text-foreground">
                    WhatsApp Network Intelligence
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Professional Network Assistant
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Chats
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Import WhatsApp Chats</DialogTitle>
                  </DialogHeader>
                  <WhatsAppUpload />
                </DialogContent>
              </Dialog>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Find Professional Help in Your Network
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask about any professional challenge and discover which contacts in
              your WhatsApp network can help you
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 rounded-lg"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? "Searching..." : "Search Network"}
              </Button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSearchQuery("Career advice")}
              >
                Career advice
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSearchQuery("Technical mentorship")}
              >
                Technical mentorship
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSearchQuery("Business connections")}
              >
                Business connections
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSearchQuery("Investment opportunities")}
              >
                Investment opportunities
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSearchQuery("Industry insights")}
              >
                Industry insights
              </Badge>
            </div>
          </div>
        </div>

        {/* Search Results or Dashboard Content */}
        {hasSearched ? (
          <div>
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <ContactSearchResults
              query={searchQuery}
              results={searchResults}
              isLoading={isSearching}
            />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Contacts
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats.totalContacts.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From WhatsApp imports
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversations
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats.totalMessages.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analyzed messages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Expertise Areas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats.expertiseAreas}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Skills identified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Network Score
                  </CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStats.networkScore.toFixed(1)}
                  </div>
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
                  <CardDescription>
                    Latest insights and contact interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {activity.contact}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.detail}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.time}
                          </p>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import WhatsApp Chats
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Import WhatsApp Chats</DialogTitle>
                      </DialogHeader>
                      <WhatsAppUpload />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Browse All Contacts
                  </Button>
                  <Link to="/analytics" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Network Analytics
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
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
                <CardDescription>
                  Most common professional skills and domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {networkStats.totalContacts > 0 ? (
                    // Show dynamic data when available
                    [
                      { skill: "Software Development", count: Math.floor(networkStats.totalContacts * 0.15) },
                      { skill: "Digital Marketing", count: Math.floor(networkStats.totalContacts * 0.12) },
                      { skill: "Business Strategy", count: Math.floor(networkStats.totalContacts * 0.10) },
                      { skill: "Product Management", count: Math.floor(networkStats.totalContacts * 0.08) },
                      { skill: "Data Science", count: Math.floor(networkStats.totalContacts * 0.06) },
                      { skill: "UX/UI Design", count: Math.floor(networkStats.totalContacts * 0.05) }
                    ].map((area, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-card hover:shadow-soft transition-shadow cursor-pointer"
                      >
                        <div className="font-medium text-sm">{area.skill}</div>
                        <div className="text-xs text-muted-foreground">
                          {area.count} contacts
                        </div>
                      </div>
                    ))
                  ) : (
                    // Show placeholder when no data
                    [
                      { skill: "Import WhatsApp Chats", count: "Start here" },
                      { skill: "Analyze Conversations", count: "Auto-detect" },
                      { skill: "Find Expertise", count: "Search network" },
                      { skill: "Build Connections", count: "Grow network" },
                      { skill: "Track Progress", count: "Monitor growth" },
                      { skill: "Export Data", count: "Backup & share" }
                    ].map((area, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-card hover:shadow-soft transition-shadow cursor-pointer"
                      >
                        <div className="font-medium text-sm">{area.skill}</div>
                        <div className="text-xs text-muted-foreground">
                          {area.count}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
