import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  FileText,
  Shield,
  User,
  AlertTriangle,
  Info,
  Filter,
  Calendar,
} from "lucide-react";

interface SystemLog {
  id: string;
  timestamp: string;
  level: "Info" | "Warning" | "Error" | "Security";
  event: string;
  description: string;
  user: string;
  ipAddress: string;
  module: string;
  action: string;
  details?: string;
}

// Mock system logs data
const mockLogs: SystemLog[] = [
  {
    id: "LOG-2025-001",
    timestamp: "2025-01-16 14:30:25",
    level: "Security",
    event: "User Login",
    description: "Successful login attempt",
    user: "admin@tsoam.org",
    ipAddress: "192.168.1.100",
    module: "Authentication",
    action: "LOGIN_SUCCESS",
    details: "User logged in with OTP verification",
  },
  {
    id: "LOG-2025-002",
    timestamp: "2025-01-16 14:25:10",
    level: "Info",
    event: "Member Added",
    description: "New member registration completed",
    user: "hr@tsoam.org",
    ipAddress: "192.168.1.101",
    module: "Member Management",
    action: "CREATE_MEMBER",
    details: "Member ID: TSOAM2025-248 created",
  },
  {
    id: "LOG-2025-003",
    timestamp: "2025-01-16 14:20:45",
    level: "Warning",
    event: "Failed Login",
    description: "Invalid password attempt",
    user: "unknown@example.com",
    ipAddress: "203.45.67.89",
    module: "Authentication",
    action: "LOGIN_FAILED",
    details: "3 consecutive failed attempts detected",
  },
  {
    id: "LOG-2025-004",
    timestamp: "2025-01-16 14:15:30",
    level: "Info",
    event: "Financial Transaction",
    description: "Offering recorded successfully",
    user: "finance@tsoam.org",
    ipAddress: "192.168.1.102",
    module: "Finance",
    action: "CREATE_TRANSACTION",
    details: "Transaction ID: TXN-2025-156, Amount: KSH 45,000",
  },
  {
    id: "LOG-2025-005",
    timestamp: "2025-01-16 14:10:15",
    level: "Error",
    event: "System Error",
    description: "Database connection timeout",
    user: "system",
    ipAddress: "localhost",
    module: "Database",
    action: "CONNECTION_ERROR",
    details: "Connection pool exhausted, auto-recovery initiated",
  },
  {
    id: "LOG-2025-006",
    timestamp: "2025-01-16 14:05:00",
    level: "Security",
    event: "Permission Change",
    description: "User role updated",
    user: "admin@tsoam.org",
    ipAddress: "192.168.1.100",
    module: "User Management",
    action: "UPDATE_ROLE",
    details: "User hr@tsoam.org role changed from Employee to HR Officer",
  },
  {
    id: "LOG-2025-007",
    timestamp: "2025-01-16 13:55:30",
    level: "Info",
    event: "Backup Completed",
    description: "Automated system backup successful",
    user: "system",
    ipAddress: "localhost",
    module: "Backup",
    action: "BACKUP_SUCCESS",
    details: "Backup size: 245.3 MB, Duration: 3.2 minutes",
  },
  {
    id: "LOG-2025-008",
    timestamp: "2025-01-16 13:50:20",
    level: "Warning",
    event: "Session Timeout",
    description: "User session expired due to inactivity",
    user: "employee@tsoam.org",
    ipAddress: "192.168.1.103",
    module: "Authentication",
    action: "SESSION_TIMEOUT",
    details: "Session duration: 32 minutes",
  },
  {
    id: "LOG-2025-009",
    timestamp: "2025-01-16 13:45:10",
    level: "Security",
    event: "Data Export",
    description: "Member data exported to Excel",
    user: "hr@tsoam.org",
    ipAddress: "192.168.1.101",
    module: "Member Management",
    action: "EXPORT_DATA",
    details: "Exported 1,247 member records",
  },
  {
    id: "LOG-2025-010",
    timestamp: "2025-01-16 13:40:05",
    level: "Info",
    event: "Settings Updated",
    description: "System settings configuration changed",
    user: "admin@tsoam.org",
    ipAddress: "192.168.1.100",
    module: "Settings",
    action: "UPDATE_SETTINGS",
    details: "Email notification settings modified",
  },
];

const logLevels = ["All", "Info", "Warning", "Error", "Security"];
const modules = [
  "All",
  "Authentication",
  "Member Management",
  "Finance",
  "User Management",
  "Backup",
  "Settings",
  "Database",
];

export default function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs] = useState(mockLogs);
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterModule, setFilterModule] = useState("All");
  const [dateRange, setDateRange] = useState("today");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = filterLevel === "All" || log.level === filterLevel;
    const matchesModule = filterModule === "All" || log.module === filterModule;

    return matchesSearch && matchesLevel && matchesModule;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Security":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "Error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "Info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, string> = {
      Security: "destructive",
      Error: "destructive",
      Warning: "secondary",
      Info: "default",
    };

    return <Badge variant={variants[level] as any}>{level}</Badge>;
  };

  const securityLogs = logs.filter((log) => log.level === "Security");
  const errorLogs = logs.filter((log) => log.level === "Error");
  const todayLogs = logs.filter((log) =>
    log.timestamp.startsWith(new Date().toISOString().split("T")[0]),
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Logs</h1>
          <p className="text-muted-foreground">
            Track system events, user actions, and security logs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{logs.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Logs
                  </div>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {securityLogs.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Security Events
                  </div>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{errorLogs.length}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{todayLogs.length}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="export">Export Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>System Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {logLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterModule} onValueChange={setFilterModule}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.event}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {log.user}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.module}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {log.details}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-500" />
                          <span className="font-semibold">{log.event}</span>
                          <Badge variant="destructive">{log.level}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{log.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">User:</span> {log.user}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span>{" "}
                          {log.ipAddress}
                        </div>
                        <div>
                          <span className="font-medium">Module:</span>{" "}
                          {log.module}
                        </div>
                        <div>
                          <span className="font-medium">Action:</span>{" "}
                          {log.action}
                        </div>
                      </div>
                      {log.details && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Details:</span>{" "}
                          {log.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errorLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-semibold">{log.event}</span>
                          <Badge variant="destructive">{log.level}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{log.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Module:</span>{" "}
                          {log.module}
                        </div>
                        <div>
                          <span className="font-medium">Action:</span>{" "}
                          {log.action}
                        </div>
                        <div>
                          <span className="font-medium">User:</span> {log.user}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span>{" "}
                          {log.ipAddress}
                        </div>
                      </div>
                      {log.details && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <span className="font-medium text-red-800">
                            Error Details:
                          </span>{" "}
                          <span className="text-red-700">{log.details}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export System Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Export Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV Format</SelectItem>
                        <SelectItem value="excel">Excel Format</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="json">JSON Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Log Level Filter</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select levels to include" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="security">Security Only</SelectItem>
                        <SelectItem value="errors">Errors Only</SelectItem>
                        <SelectItem value="warnings">Warnings Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Export Logs
                    </Button>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {logs.filter((l) => l.level === "Info").length}
                        </div>
                        <div className="text-sm text-blue-600">Info Logs</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">
                          {logs.filter((l) => l.level === "Warning").length}
                        </div>
                        <div className="text-sm text-yellow-600">Warnings</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">
                          {logs.filter((l) => l.level === "Error").length}
                        </div>
                        <div className="text-sm text-red-600">Errors</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {logs.filter((l) => l.level === "Security").length}
                        </div>
                        <div className="text-sm text-purple-600">Security</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Most Active Users</h4>
                      <div className="space-y-2">
                        {[...new Set(logs.map((log) => log.user))].map(
                          (user) => (
                            <div
                              key={user}
                              className="flex justify-between text-sm"
                            >
                              <span>{user}</span>
                              <span className="font-medium">
                                {logs.filter((log) => log.user === user).length}{" "}
                                actions
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
