import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
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
} from "lucide-react";
import { BackupRecovery } from "@/components/BackupRecovery";

export default function Settings() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [otpEnabled, setOtpEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordComplexity, setPasswordComplexity] = useState("medium");
  const [backupFrequency, setBackupFrequency] = useState("daily");

  /**
   * Generate system report in specified format
   * @param format - Report format (PDF or Excel)
   */
  const generateReport = (format: string) => {
    console.log(`Generating ${format} report...`);

    // Simulate report generation process
    setTimeout(() => {
      alert(
        `${format} report generated successfully and is ready for download!`,
      );
    }, 2000);
  };

  /**
   * Perform manual backup
   */
  const performManualBackup = () => {
    console.log("Starting manual backup...");

    // Simulate backup process
    setTimeout(() => {
      alert(
        "Manual backup completed successfully! Backup saved to /var/backups/tsoam/",
      );
    }, 3000);
  };

  /**
   * Test backup and restore functionality
   */
  const testBackupRestore = () => {
    console.log("Testing backup and restore...");
    alert("Backup and restore test completed successfully!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences, security settings, and backup options
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                      value="TSOAM CHURCH INTERNATIONAL"
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Church name cannot be modified
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="africa/nairobi">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/nairobi">
                          Africa/Nairobi (EAT)
                        </SelectItem>
                        <SelectItem value="america/new_york">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="europe/london">
                          Europe/London (GMT)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="ksh">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ksh">
                          Kenyan Shilling (KSH)
                        </SelectItem>
                        <SelectItem value="usd">US Dollar (USD)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select defaultValue="dd/mm/yyyy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5" />
                    Printer & Network Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="defaultPrinter">Default Printer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select printer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hp-laserjet">
                          HP LaserJet Pro
                        </SelectItem>
                        <SelectItem value="canon-pixma">Canon PIXMA</SelectItem>
                        <SelectItem value="epson-workforce">
                          Epson WorkForce
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paperSize">Default Paper Size</Label>
                    <Select defaultValue="a4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="networkSharing" />
                    <Label htmlFor="networkSharing">
                      Enable Network Sharing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="autoConnect" />
                    <Label htmlFor="autoConnect">Auto Connect to Network</Label>
                  </div>
                  <Button>
                    <Wifi className="h-4 w-4 mr-2" />
                    Save Network Settings
                  </Button>
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
                      value={sessionTimeout}
                      onValueChange={setSessionTimeout}
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="otpEnabled"
                      checked={otpEnabled}
                      onCheckedChange={setOtpEnabled}
                    />
                    <Label htmlFor="otpEnabled">
                      Enable One-Time Password (OTP)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="mfaRequired" />
                    <Label htmlFor="mfaRequired">
                      Require MFA for Admin Roles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="loginAttempts" />
                    <Label htmlFor="loginAttempts">
                      Lock Account After Failed Attempts
                    </Label>
                  </div>
                  <Button>
                    <Clock className="h-4 w-4 mr-2" />
                    Save Authentication Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="passwordComplexity">
                      Password Complexity
                    </Label>
                    <Select
                      value={passwordComplexity}
                      onValueChange={setPasswordComplexity}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          Low (8 characters minimum)
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium (8 chars + numbers)
                        </SelectItem>
                        <SelectItem value="high">
                          High (8 chars + numbers + symbols)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">
                      Password Expiry (days)
                    </Label>
                    <Select defaultValue="90">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never expire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="passwordHistory" />
                    <Label htmlFor="passwordHistory">
                      Prevent Password Reuse
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="passwordReset" />
                    <Label htmlFor="passwordReset">
                      Allow Self-Service Password Reset
                    </Label>
                  </div>
                  <Button>
                    <Key className="h-4 w-4 mr-2" />
                    Save Password Policy
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Security Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">
                          Password policy updated
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Admin • 2 hours ago
                        </div>
                      </div>
                      <Badge variant="secondary">Security</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">OTP enabled</div>
                        <div className="text-sm text-muted-foreground">
                          System Admin • 1 day ago
                        </div>
                      </div>
                      <Badge variant="secondary">Authentication</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">
                          Session timeout updated
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Admin • 3 days ago
                        </div>
                      </div>
                      <Badge variant="secondary">Configuration</Badge>
                    </div>
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
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                    <Label htmlFor="autoBackup">Enable Automatic Backup</Label>
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={backupFrequency}
                      onValueChange={setBackupFrequency}
                      disabled={!autoBackup}
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
                      defaultValue="02:00"
                      disabled={!autoBackup}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retentionPeriod">
                      Retention Period (days)
                    </Label>
                    <Select defaultValue="30" disabled={!autoBackup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Backup Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Manual Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an immediate backup of all system data or restore
                      from a previous backup.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" onClick={performManualBackup}>
                      <Download className="h-4 w-4 mr-2" />
                      Create Backup Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={testBackupRestore}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Restore from Backup
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor="backupLocation">Backup Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backupLocation"
                        defaultValue="/var/backups/tsoam"
                        className="flex-1"
                      />
                      <Button variant="outline">Browse</Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last backup: January 15, 2025 at 02:00 AM
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Backup History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Full System Backup</div>
                        <div className="text-sm text-muted-foreground">
                          January 15, 2025 • 2:00 AM • 245.3 MB
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">Success</Badge>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Full System Backup</div>
                        <div className="text-sm text-muted-foreground">
                          January 14, 2025 • 2:00 AM • 243.1 MB
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">Success</Badge>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Full System Backup</div>
                        <div className="text-sm text-muted-foreground">
                          January 13, 2025 • 2:00 AM • 241.8 MB
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">Success</Badge>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                    <Label htmlFor="emailNotifications">
                      Enable Email Notifications
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      defaultValue="smtp.gmail.com"
                      disabled={!emailNotifications}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpPort">Port</Label>
                      <Input
                        id="smtpPort"
                        defaultValue="587"
                        disabled={!emailNotifications}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpSecurity">Security</Label>
                      <Select defaultValue="tls" disabled={!emailNotifications}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      defaultValue="admin@tsoam.com"
                      disabled={!emailNotifications}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      System emails will be sent from @tsoam.com domain
                    </p>
                  </div>
                  <Button disabled={!emailNotifications}>
                    <Mail className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div>
                    <Label htmlFor="notificationFrequency">
                      Notification Frequency
                    </Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Bell className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
