import { useState } from "react";
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Shield,
  Database,
  Bell,
  User,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    newInsights: true,
    networkUpdates: false,
    weeklyReports: true,
    securityAlerts: true,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Configure your WhatsApp Network Intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Your last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Your company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Your job title" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Processing Preferences</CardTitle>
                <CardDescription>
                  Configure how AI analyzes your conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-detect expertise</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically identify skills and expertise from
                      conversations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relationship strength scoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Calculate connection strength based on conversation
                      frequency
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smart contact suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered recommendations for professional queries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Local Processing:</strong> All your data is processed
                locally on your device. Nothing is sent to external servers or
                cloud services.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Data Privacy</CardTitle>
                <CardDescription>
                  Control how your conversation data is handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Encrypt local database</Label>
                    <p className="text-sm text-muted-foreground">
                      Use encryption for stored conversation data (recommended)
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-delete processed files</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically delete uploaded WhatsApp files after
                      processing
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anonymous usage analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app with anonymous usage statistics
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
                <CardDescription>
                  Configure how long data is kept
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Conversation history retention</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="forever">Keep forever</option>
                    <option value="2years">2 years</option>
                    <option value="1year">1 year</option>
                    <option value="6months">6 months</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Search history retention</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="forever">Keep forever</option>
                    <option value="1year">1 year</option>
                    <option value="6months">6 months</option>
                    <option value="3months">3 months</option>
                    <option value="never">Don't save</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Import, export, and manage your network data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Network Data
                  </Button>

                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Search History
                  </Button>

                  <Button variant="outline" className="justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>

                  <Button variant="outline" className="justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>

                  <div className="border border-destructive/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Clear all conversation data
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This will permanently delete all imported WhatsApp
                          conversations
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Data
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reset application</p>
                        <p className="text-sm text-muted-foreground">
                          Delete all data and reset app to initial state
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset App
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
                <CardDescription>
                  Current usage and available space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Conversation data:</span>
                    <span>245 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Search indexes:</span>
                    <span>18 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AI models:</span>
                    <span>127 MB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total used:</span>
                    <span>390 MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New insights discovered</Label>
                    <p className="text-sm text-muted-foreground">
                      When AI discovers new expertise or connections
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newInsights}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        newInsights: checked,
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Network updates</Label>
                    <p className="text-sm text-muted-foreground">
                      When contacts are added or updated
                    </p>
                  </div>
                  <Switch
                    checked={notifications.networkUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        networkUpdates: checked,
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of network activity and insights
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        weeklyReports: checked,
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Important security and privacy notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        securityAlerts: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Timing</CardTitle>
                <CardDescription>
                  Configure when to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quiet hours start</Label>
                    <Input type="time" defaultValue="22:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet hours end</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Weekly report day</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="monday">Monday</option>
                    <option value="friday">Friday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
