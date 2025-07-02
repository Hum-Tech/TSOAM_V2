import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Bell,
  Printer,
  Wifi,
  Save,
  Download,
  Upload,
  Clock,
  Key,
  Mail,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface SystemSettings {
  [key: string]: {
    value: string;
    editable: boolean;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  // Load settings and check connection
  useEffect(() => {
    loadSettings();
    checkConnection();
    loadNetworkInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error("Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(
          data.database === "connected" ? "connected" : "error",
        );
      } else {
        setConnectionStatus("error");
      }
    } catch (error) {
      setConnectionStatus("error");
    }
  };

  const loadNetworkInfo = async () => {
    try {
      const response = await fetch("/api/network-info");
      if (response.ok) {
        const data = await response.json();
        setNetworkInfo(data);
      }
    } catch (error) {
      console.error("Failed to load network info:", error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    if (!settings[key]?.editable) {
      toast({
        title: "Error",
        description: "This setting cannot be modified",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        setSettings((prev) => ({
          ...prev,
          [key]: { ...prev[key], value },
        }));
        toast({
          title: "Success",
          description: "Setting updated successfully",
        });
      } else {
        throw new Error("Failed to update setting");
      }
    } catch (error) {
      console.error("Failed to update setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const performBackup = async (includeDemo: boolean = false) => {
    setBackupLoading(true);
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ include_demo: includeDemo }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Backup Successful",
          description: `Backup created: ${result.filename} (${Math.round(result.size / 1024)} KB, ${result.records} records)`,
        });
      } else {
        throw new Error("Backup failed");
      }
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setBackupFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid JSON backup file",
        variant: "destructive",
      });
    }
  };

  const performRestore = async () => {
    if (!backupFile) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to restore",
        variant: "destructive",
      });
      return;
    }

    setRestoreLoading(true);
    try {
      const fileContent = await backupFile.text();
      const backupData = JSON.parse(fileContent);

      const response = await fetch("/api/admin/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backupData }),
      });

      if (response.ok) {
        toast({
          title: "Restore Successful",
          description: "Data has been restored successfully",
        });
        setRestoreDialogOpen(false);
        setBackupFile(null);
      } else {
        throw new Error("Restore failed");
      }
    } catch (error) {
      console.error("Restore failed:", error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore data. Please check the backup file.",
        variant: "destructive",
      });
    } finally {
      setRestoreLoading(false);
    }
  };

  const cleanDemoData = async () => {
    try {
      const response = await fetch("/api/admin/clean-demo-data", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Demo Data Cleaned",
          description: "All demo data has been removed successfully",
        });
      } else {
        throw new Error("Failed to clean demo data");
      }
    } catch (error) {
      console.error("Failed to clean demo data:", error);
      toast({
        title: "Error",
        description: "Failed to clean demo data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure system preferences, security settings, and backup options"
          icon={SettingsIcon}
        />

        {/* Connection Status Alert */}
        <Alert
          className={
            connectionStatus === "connected"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {connectionStatus === "connected" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : connectionStatus === "error" ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          <AlertTitle>
            Database Connection:{" "}
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "error"
                ? "Error"
                : "Checking..."}
          </AlertTitle>
          <AlertDescription>
            {connectionStatus === "connected"
              ? "MySQL database is connected and operational"
              : connectionStatus === "error"
                ? "Unable to connect to MySQL database. Please check your configuration."
                : "Checking database connection..."}
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="churchName">Church Name</Label>
                    <Input
                      id="churchName"
                      value={
                        settings.church_name?.value ||
                        "TSOAM CHURCH INTERNATIONAL"
                      }
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Church name cannot be modified
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone?.value || "Africa/Nairobi"}
                      onValueChange={(value) =>
                        updateSetting("timezone", value)
                      }
                      disabled={!settings.timezone?.editable}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Nairobi">
                          Africa/Nairobi (EAT)
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London (GMT)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={settings.currency?.value || "KSH"}
                      onValueChange={(value) =>
                        updateSetting("currency", value)
                      }
                      disabled={!settings.currency?.editable}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KSH">
                          Kenyan Shilling (KSH)
                        </SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.date_format?.value || "DD/MM/YYYY"}
                      onValueChange={(value) =>
                        updateSetting("date_format", value)
                      }
                      disabled={!settings.date_format?.editable}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emailDomain">Email Domain</Label>
                    <Input
                      id="emailDomain"
                      value={settings.email_domain?.value || "tsoam.com"}
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      System emails will be sent from @tsoam.com domain
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      value={settings.smtp_server?.value || "smtp.gmail.com"}
                      onChange={(e) =>
                        updateSetting("smtp_server", e.target.value)
                      }
                      disabled={!settings.smtp_server?.editable}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.smtp_port?.value || "587"}
                      onChange={(e) =>
                        updateSetting("smtp_port", e.target.value)
                      }
                      disabled={!settings.smtp_port?.editable}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={settings.email_notifications?.value === "true"}
                      onCheckedChange={(checked) =>
                        updateSetting("email_notifications", checked.toString())
                      }
                      disabled={!settings.email_notifications?.editable}
                    />
                    <Label htmlFor="emailNotifications">
                      Enable Email Notifications
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (minutes)
                    </Label>
                    <Select
                      value={settings.session_timeout?.value || "30"}
                      onValueChange={(value) =>
                        updateSetting("session_timeout", value)
                      }
                      disabled={!settings.session_timeout?.editable}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Status</AlertTitle>
                    <AlertDescription>
                      All security features are active. User sessions are
                      automatically secured.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Clean Demo Data</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Remove all demo/test data from the system. This action
                      cannot be undone.
                    </p>
                    <Button
                      variant="outline"
                      onClick={cleanDemoData}
                      className="w-full"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Clean Demo Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backup">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Automatic Backup Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoBackup"
                      checked={settings.auto_backup?.value === "true"}
                      onCheckedChange={(checked) =>
                        updateSetting("auto_backup", checked.toString())
                      }
                      disabled={!settings.auto_backup?.editable}
                    />
                    <Label htmlFor="autoBackup">Enable Automatic Backup</Label>
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={settings.backup_frequency?.value || "daily"}
                      onValueChange={(value) =>
                        updateSetting("backup_frequency", value)
                      }
                      disabled={
                        !settings.backup_frequency?.editable ||
                        settings.auto_backup?.value !== "true"
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupTime">Backup Time</Label>
                    <Input
                      id="backupTime"
                      type="time"
                      value={settings.backup_time?.value || "02:00"}
                      onChange={(e) =>
                        updateSetting("backup_time", e.target.value)
                      }
                      disabled={
                        !settings.backup_time?.editable ||
                        settings.auto_backup?.value !== "true"
                      }
                    />
                  </div>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Backup Schedule</AlertTitle>
                    <AlertDescription>
                      {settings.auto_backup?.value === "true"
                        ? `Automatic backups are scheduled ${settings.backup_frequency?.value || "daily"} at ${settings.backup_time?.value || "02:00"}`
                        : "Automatic backups are currently disabled"}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Manual Backup & Restore
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Create Backup</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create an immediate backup of all system data.
                    </p>
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => performBackup(false)}
                        disabled={backupLoading}
                      >
                        {backupLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Create Backup (Real Data Only)
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => performBackup(true)}
                        disabled={backupLoading}
                      >
                        {backupLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Create Backup (Include Demo Data)
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Restore from Backup</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Restore data from a previous backup file.
                    </p>
                    <Dialog
                      open={restoreDialogOpen}
                      onOpenChange={setRestoreDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Restore from Backup
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restore Data from Backup</DialogTitle>
                          <DialogDescription>
                            Select a backup file to restore. This will replace
                            existing data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="backupFile">Backup File</Label>
                            <Input
                              id="backupFile"
                              type="file"
                              accept=".json"
                              onChange={handleFileUpload}
                              className="mt-1"
                            />
                          </div>
                          {backupFile && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Warning</AlertTitle>
                              <AlertDescription>
                                This will replace existing data with the backup
                                data. This action cannot be undone.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setRestoreDialogOpen(false)}
                            disabled={restoreLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={performRestore}
                            disabled={!backupFile || restoreLoading}
                          >
                            {restoreLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            Restore Data
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="newMemberNotif">
                        New Member Registration
                      </Label>
                      <Switch id="newMemberNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="appointmentNotif">
                        Appointment Reminders
                      </Label>
                      <Switch id="appointmentNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="financeNotif">
                        Financial Transactions
                      </Label>
                      <Switch id="financeNotif" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="eventNotif">Event Notifications</Label>
                      <Switch id="eventNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="backupNotif">Backup Status</Label>
                      <Switch id="backupNotif" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="securityNotif">Security Alerts</Label>
                      <Switch id="securityNotif" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Network Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="networkSharing"
                      checked={settings.network_sharing?.value === "true"}
                      onCheckedChange={(checked) =>
                        updateSetting("network_sharing", checked.toString())
                      }
                      disabled={!settings.network_sharing?.editable}
                    />
                    <Label htmlFor="networkSharing">
                      Enable Network Sharing
                    </Label>
                  </div>
                  <Alert>
                    <Wifi className="h-4 w-4" />
                    <AlertTitle>Network Status</AlertTitle>
                    <AlertDescription>
                      {settings.network_sharing?.value === "true"
                        ? "Network sharing is enabled. Other computers can access this system."
                        : "Network sharing is disabled. Only local access is allowed."}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Network Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {networkInfo ? (
                    <div className="space-y-3">
                      <div>
                        <Label>Server Port</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                          {networkInfo.server_port}
                        </p>
                      </div>
                      <div>
                        <Label>Local Access URL</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                          {networkInfo.local_url}
                        </p>
                      </div>
                      {networkInfo.network_interfaces?.length > 0 && (
                        <div>
                          <Label>Network Access URLs</Label>
                          <div className="space-y-1 mt-1">
                            {networkInfo.network_interfaces.map(
                              (iface: any, index: number) => (
                                <p
                                  key={index}
                                  className="text-sm font-mono bg-muted p-2 rounded"
                                >
                                  {iface.url} ({iface.interface})
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      <Alert>
                        <Wifi className="h-4 w-4" />
                        <AlertTitle>Network Access</AlertTitle>
                        <AlertDescription>
                          Share these URLs with other computers on your network
                          to access the system.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Loading network information...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
