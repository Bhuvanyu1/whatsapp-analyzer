import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppImportResponse } from "@shared/api";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  parsedData?: {
    totalMessages: number;
    uniqueContacts: number;
    dateRange: { start: string; end: string };
    groupName?: string;
    isGroupChat: boolean;
  };
}

export default function WhatsAppUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = useCallback((fileList: File[]) => {
    const validFiles = fileList.filter(file => 
      file.type === "text/plain" || file.name.endsWith('.txt')
    );

    if (validFiles.length !== fileList.length) {
      console.warn("Some files were rejected. Only .txt files are supported.");
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Process files
    newFiles.forEach(file => processFile(file, fileList.find(f => f.name === file.name)!));
  }, []);

  const processFile = async (fileInfo: UploadedFile, file: File) => {
    try {
      // Update status to uploading
      updateFile(fileInfo.id, { status: "uploading", progress: 20 });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('whatsappFile', file);

      // Upload and process file
      updateFile(fileInfo.id, { status: "processing", progress: 50 });
      
      const response = await fetch('/api/whatsapp/import', {
        method: 'POST',
        body: formData
      });

      const result: WhatsAppImportResponse = await response.json();
      
      if (result.success && result.data) {
        const parsedData = {
          totalMessages: result.data.totalMessages,
          uniqueContacts: result.data.uniqueContacts,
          dateRange: {
            start: result.data.dateRange.start,
            end: result.data.dateRange.end
          },
          groupName: result.data.groupName,
          isGroupChat: result.data.isGroupChat
        };
        
        updateFile(fileInfo.id, { 
          status: "completed", 
          progress: 100,
          parsedData 
        });
      } else {
        updateFile(fileInfo.id, { 
          status: "error", 
          error: result.error || "Failed to process file" 
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      updateFile(fileInfo.id, { 
        status: "error", 
        error: "Failed to upload file. Please check your connection and try again." 
      });
    }
  };

  const updateFile = (id: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed": return "text-success";
      case "error": return "text-destructive";
      case "processing": return "text-warning";
      case "uploading": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "error": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalStats = files
    .filter(f => f.status === "completed" && f.parsedData)
    .reduce((acc, file) => ({
      messages: acc.messages + (file.parsedData?.totalMessages || 0),
      contacts: acc.contacts + (file.parsedData?.uniqueContacts || 0),
      files: acc.files + 1
    }), { messages: 0, contacts: 0, files: 0 });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import WhatsApp Chats
          </CardTitle>
          <CardDescription>
            Upload your WhatsApp chat exports (.txt files) to build your professional network intelligence
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/30 hover:border-primary/50"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Upload className="h-full w-full" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragOver ? "Drop files here" : "Drag & drop WhatsApp exports"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or <span className="text-primary font-medium">browse</span> to select files
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Supports .txt files from WhatsApp export feature
              </div>
            </div>
          </div>

          {/* Help Section */}
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>How to export WhatsApp chats:</strong><br />
              1. Open WhatsApp and select a chat<br />
              2. Tap the three dots menu → More → Export chat<br />
              3. Choose "Without Media" and save the .txt file<br />
              4. Upload the file here to analyze your network
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Files</CardTitle>
            <CardDescription>
              {files.length} file{files.length > 1 ? 's' : ''} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => (
                <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{file.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Badge variant="outline" className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                    </div>
                    
                    {(file.status === "uploading" || file.status === "processing") && (
                      <Progress value={file.progress} className="mt-2" />
                    )}
                    
                    {file.status === "error" && file.error && (
                      <p className="text-sm text-destructive mt-1">{file.error}</p>
                    )}
                    
                    {file.status === "completed" && file.parsedData && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Messages:</span>
                          <span className="ml-1 font-medium">{file.parsedData.totalMessages.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contacts:</span>
                          <span className="ml-1 font-medium">{file.parsedData.uniqueContacts}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-1 font-medium">
                            {file.parsedData.isGroupChat ? "Group" : "Individual"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-1 font-medium text-xs">
                            {file.parsedData.dateRange.start.split('T')[0]} - {file.parsedData.dateRange.end.split('T')[0]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {totalStats.files > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Summary</CardTitle>
            <CardDescription>Total data processed from all uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{totalStats.files}</div>
                <div className="text-sm text-muted-foreground">Files Processed</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto text-success mb-2" />
                <div className="text-2xl font-bold">{totalStats.messages.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Messages Analyzed</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto text-warning mb-2" />
                <div className="text-2xl font-bold">{totalStats.contacts}</div>
                <div className="text-sm text-muted-foreground">Contacts Found</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">Ready</div>
                <div className="text-sm text-muted-foreground">For Analysis</div>
              </div>
            </div>
            
            {totalStats.files > 0 && (
              <div className="mt-6 flex justify-center">
                <Button size="lg" onClick={() => window.location.reload()}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
