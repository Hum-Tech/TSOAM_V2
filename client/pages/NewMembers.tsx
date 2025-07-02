import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Download,
  UserPlus,
  Clock,
  CheckCircle,
  Calendar,
  Users,
  ArrowRight,
  AlertCircle,
  FileText,
  Eye,
  Phone,
  Mail,
  MapPin,
  Heart,
} from "lucide-react";
import { printTable, exportData } from "@/utils/printUtils";

// Types
interface Visitor {
  id: number;
  visitorId: string;
  fullName: string;
  phoneNumber: string;
  purposeOfVisit: string;
  currentChurch: string;
  howHeardAboutUs: string;
  whatLikedMost: string;
  prayerRequests: string[];
  visitDate: string;
  followUpRequired: boolean;
  followUpNotes: string;
}

interface NewMember {
  id: number;
  visitorId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  visitDate: string;
  daysAsNewMember: number;
  baptized: boolean;
  baptismDate?: string;
  bibleStudyCompleted: boolean;
  bibleStudyCompletionDate?: string;
  employmentStatus: "Employed" | "Jobless" | "Business Class";
  previousChurchName: string;
  reasonForLeavingPreviousChurch:
    | "Suspension"
    | "Termination"
    | "Self-Evolution"
    | "Relocation"
    | "Other";
  reasonDetails: string;
  howHeardAboutUs: string;
  purposeOfVisit: string;
  bornAgain: boolean;
  churchFeedback: string;
  prayerRequests: string;
  serviceGroups: number[];
  eligibleForMembership: boolean;
  isActive: boolean;
}

interface ServiceGroup {
  id: number;
  name: string;
  description: string;
}

const prayerRequestOptions = [
  "Healing",
  "Financial Breakthrough",
  "Job/Employment",
  "Family Unity",
  "Spiritual Growth",
  "Protection",
  "Academic Success",
  "Business Success",
  "Marriage/Relationship",
  "Other",
];

const purposeOfVisitOptions = [
  "Sunday Service",
  "Prayer Meeting",
  "Counseling",
  "Bible Study",
  "Youth Service",
  "Special Event",
  "Other",
];

const howHeardOptions = [
  "Friend",
  "Relative",
  "Word of Mouth",
  "Website",
  "Crusade",
  "Roadshow",
  "Matatu",
  "Social Media",
  "Flyer",
  "Personal Identification",
];

export default function NewMembers() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [newMembers, setNewMembers] = useState<NewMember[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Search and filter states
  const [visitorsSearchTerm, setVisitorsSearchTerm] = useState("");
  const [newMembersSearchTerm, setNewMembersSearchTerm] = useState("");

  // Dialog states
  const [showVisitorDialog, setShowVisitorDialog] = useState(false);
  const [showNewMemberDialog, setShowNewMemberDialog] = useState(false);
  const [selectedNewMember, setSelectedNewMember] = useState<NewMember | null>(
    null,
  );
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // Form states
  const [visitorForm, setVisitorForm] = useState({
    fullName: "",
    phoneNumber: "",
    purposeOfVisit: "",
    currentChurch: "",
    howHeardAboutUs: "",
    whatLikedMost: "",
    prayerRequests: [] as string[],
    followUpRequired: false,
    followUpNotes: "",
  });

  const [newMemberForm, setNewMemberForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    employmentStatus: "",
    previousChurchName: "",
    reasonForLeavingPreviousChurch: "",
    reasonDetails: "",
    howHeardAboutUs: "",
    purposeOfVisit: "",
    bornAgain: false,
    churchFeedback: "",
    prayerRequests: "",
    serviceGroups: [] as number[],
    baptized: false,
    baptismDate: "",
    bibleStudyCompleted: false,
    bibleStudyCompletionDate: "",
  });

  const [transferForm, setTransferForm] = useState({
    serviceGroups: [] as string[],
  });

  useEffect(() => {
    loadData();

    // Check for automatic transfers every 24 hours (only in production)
    const transferInterval = setInterval(
      checkForAutoTransfers,
      24 * 60 * 60 * 1000,
    );

    // Also check once when component mounts (after 10 seconds to let app initialize)
    const initialCheck = setTimeout(() => {
      // Only run auto-transfer in production or when explicitly enabled
      if (window.location.hostname !== "localhost") {
        checkForAutoTransfers();
      }
    }, 10000);

    return () => {
      clearInterval(transferInterval);
      clearTimeout(initialCheck);
    };
  }, []);

  // Automatic transfer function
  const checkForAutoTransfers = async () => {
    // Skip auto-transfer in development environment
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("dev")
    ) {
      console.log("Auto-transfer skipped in development environment");
      return;
    }

    try {
      const response = await fetch("/api/members/eligible-for-transfer");

      if (!response.ok) {
        console.error("Failed to fetch eligible members:", response.statusText);
        return;
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const eligibleMembers = result.data;
        console.log(
          `Found ${eligibleMembers.length} members eligible for automatic transfer`,
        );

        // Process automatic transfers for eligible members
        for (const member of eligibleMembers) {
          try {
            const transferResponse = await fetch("/api/members/transfer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                newMemberId: member.id,
                serviceGroups: ["Prayer Team"], // Default service group for auto-transfers
              }),
            });

            if (!transferResponse.ok) {
              console.error(
                `Transfer failed for ${member.full_name}:`,
                transferResponse.statusText,
              );
              continue;
            }

            const transferResult = await transferResponse.json();

            if (transferResult.success) {
              console.log(
                `Automatically transferred member: ${member.full_name} (${transferResult.memberId})`,
              );

              // Update local state
              setNewMembers((prev) => prev.filter((m) => m.id !== member.id));

              // Trigger dashboard refresh
              localStorage.setItem("dashboard_refresh", Date.now().toString());
            }
          } catch (transferError) {
            console.error(
              `Failed to auto-transfer member ${member.full_name}:`,
              transferError,
            );
          }
        }

        if (eligibleMembers.length > 0) {
          // Show notification about auto-transfers
          const transferCount = eligibleMembers.length;
          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50";
          notification.innerHTML = `
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Automatically transferred ${transferCount} eligible member${transferCount > 1 ? "s" : ""} to full membership!</span>
            </div>
          `;
          document.body.appendChild(notification);

          setTimeout(() => {
            document.body.removeChild(notification);
          }, 5000);
        }
      } else {
        console.log("No eligible members found for auto-transfer");
      }
    } catch (error) {
      console.error("Failed to check for auto-transfers:", error);
      // Don't show error to user for auto-transfer background process
      // This is expected when database is not available
    }
  };

  const loadData = () => {
    // Load service groups
    const mockServiceGroups: ServiceGroup[] = [
      { id: 1, name: "Choir", description: "Church choir and worship team" },
      { id: 2, name: "Ushering", description: "Church ushers and hospitality" },
      { id: 3, name: "Youth", description: "Youth ministry and activities" },
      {
        id: 4,
        name: "Prayer Team",
        description: "Intercessory prayer ministry",
      },
      { id: 5, name: "Media", description: "Audio/visual and media ministry" },
      {
        id: 6,
        name: "Cleaning",
        description: "Church cleaning and maintenance",
      },
      { id: 7, name: "Security", description: "Church security team" },
      {
        id: 8,
        name: "Children Ministry",
        description: "Sunday school and children programs",
      },
    ];
    setServiceGroups(mockServiceGroups);

    // Load visitors
    const mockVisitors: Visitor[] = [
      {
        id: 1,
        visitorId: "V2025-001",
        fullName: "Alice Johnson",
        phoneNumber: "+254712345678",
        purposeOfVisit: "Sunday Service",
        currentChurch: "Methodist Church",
        howHeardAboutUs: "Friend",
        whatLikedMost: "The worship and teaching",
        prayerRequests: ["Healing", "Financial Breakthrough"],
        visitDate: "2025-01-15",
        followUpRequired: true,
        followUpNotes: "Interested in joining choir",
      },
      {
        id: 2,
        visitorId: "V2025-002",
        fullName: "Robert Mwangi",
        phoneNumber: "+254798765432",
        purposeOfVisit: "Prayer Meeting",
        currentChurch: "Catholic Church",
        howHeardAboutUs: "Social Media",
        whatLikedMost: "The prayer atmosphere",
        prayerRequests: ["Spiritual Growth", "Family Unity"],
        visitDate: "2025-01-14",
        followUpRequired: false,
        followUpNotes: "",
      },
    ];
    setVisitors(mockVisitors);

    // Load new members
    const mockNewMembers: NewMember[] = [
      {
        id: 1,
        visitorId: "VISIT-2024-001",
        fullName: "John Doe",
        phoneNumber: "+254723456789",
        email: "john@example.com",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        maritalStatus: "Married",
        address: "123 Nairobi Street, Nairobi",
        emergencyContactName: "Jane Doe",
        emergencyContactPhone: "+254734567890",
        visitDate: "2024-07-15",
        daysAsNewMember: 183,
        baptized: true,
        baptismDate: "2024-09-01",
        bibleStudyCompleted: true,
        bibleStudyCompletionDate: "2024-10-15",
        employmentStatus: "Employed",
        previousChurchName: "St. Paul's Cathedral",
        reasonForLeavingPreviousChurch: "Relocation",
        reasonDetails: "Moved to a new area",
        howHeardAboutUs: "Friend",
        purposeOfVisit: "Sunday Service",
        bornAgain: true,
        churchFeedback: "Very welcoming community",
        prayerRequests: "Business success",
        serviceGroups: [1, 4],
        eligibleForMembership: true,
        isActive: true,
      },
      {
        id: 2,
        visitorId: "VISIT-2024-002",
        fullName: "Mary Smith",
        phoneNumber: "+254745678901",
        email: "mary@example.com",
        dateOfBirth: "1988-12-20",
        gender: "Female",
        maritalStatus: "Single",
        address: "456 Mombasa Road, Nairobi",
        emergencyContactName: "Paul Smith",
        emergencyContactPhone: "+254756789012",
        visitDate: "2024-09-01",
        daysAsNewMember: 136,
        baptized: false,
        bibleStudyCompleted: true,
        bibleStudyCompletionDate: "2024-11-30",
        employmentStatus: "Business Class",
        previousChurchName: "PCEA Church",
        reasonForLeavingPreviousChurch: "Self-Evolution",
        reasonDetails: "Seeking spiritual growth",
        howHeardAboutUs: "Website",
        purposeOfVisit: "Bible Study",
        bornAgain: true,
        churchFeedback: "Great teachings",
        prayerRequests: "Academic success",
        serviceGroups: [2, 8],
        eligibleForMembership: false,
        isActive: true,
      },
    ];
    setNewMembers(mockNewMembers);
  };

  const handleVisitorSubmit = () => {
    if (!visitorForm.fullName || !visitorForm.phoneNumber) {
      alert("Please fill in required fields");
      return;
    }

    const visitorCount = visitors.length + 1;
    const visitorId = `V2025-${visitorCount.toString().padStart(3, "0")}`;

    const newVisitor: Visitor = {
      id: visitorCount,
      visitorId,
      ...visitorForm,
      visitDate: new Date().toISOString().split("T")[0],
    };

    setVisitors([...visitors, newVisitor]);
    setVisitorForm({
      fullName: "",
      phoneNumber: "",
      purposeOfVisit: "",
      currentChurch: "",
      howHeardAboutUs: "",
      whatLikedMost: "",
      prayerRequests: [],
      followUpRequired: false,
      followUpNotes: "",
    });
    setShowVisitorDialog(false);
  };

  const handleNewMemberSubmit = () => {
    if (
      !newMemberForm.fullName ||
      !newMemberForm.phoneNumber ||
      !newMemberForm.gender
    ) {
      alert("Please fill in required fields");
      return;
    }

    const memberCount = newMembers.length + 1;
    const visitorId = `VISIT-2025-${memberCount.toString().padStart(3, "0")}`;

    const newMember: NewMember = {
      id: memberCount,
      visitorId,
      ...newMemberForm,
      visitDate: new Date().toISOString().split("T")[0],
      daysAsNewMember: 0,
      eligibleForMembership: false,
      isActive: true,
      serviceGroups: newMemberForm.serviceGroups,
      gender: newMemberForm.gender as "Male" | "Female",
      maritalStatus: newMemberForm.maritalStatus as any,
      employmentStatus: newMemberForm.employmentStatus as any,
      reasonForLeavingPreviousChurch:
        newMemberForm.reasonForLeavingPreviousChurch as any,
    };

    setNewMembers([...newMembers, newMember]);
    setNewMemberForm({
      fullName: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      employmentStatus: "",
      previousChurchName: "",
      reasonForLeavingPreviousChurch: "",
      reasonDetails: "",
      howHeardAboutUs: "",
      purposeOfVisit: "",
      bornAgain: false,
      churchFeedback: "",
      prayerRequests: "",
      serviceGroups: [],
      baptized: false,
      baptismDate: "",
      bibleStudyCompleted: false,
      bibleStudyCompletionDate: "",
    });
    setShowNewMemberDialog(false);
  };

  const handleTransferToFullMembership = async () => {
    if (!selectedNewMember) {
      alert("No member selected for transfer");
      return;
    }

    if (!selectedNewMember.id) {
      alert("Invalid member data. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      // Get selected service groups from form
      const selectedServiceGroups = transferForm.serviceGroups || [];

      const response = await fetch("/api/members/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newMemberId: selectedNewMember.id,
          serviceGroups: selectedServiceGroups,
        }),
      });

      // Check if response is ok before trying to read body
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clone response to avoid body stream issues
      const responseClone = response.clone();
      let result;

      try {
        result = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try with the cloned response
        console.warn(
          "JSON parsing failed, trying with cloned response:",
          jsonError,
        );
        result = await responseClone.json();
      }

      if (result.success) {
        // Update new member as transferred
        const updatedNewMembers = newMembers.map((member) =>
          member.id === selectedNewMember.id
            ? { ...member, isActive: false }
            : member,
        );
        setNewMembers(updatedNewMembers);

        // Trigger dashboard refresh
        localStorage.setItem("dashboard_refresh", Date.now().toString());

        setShowTransferDialog(false);
        setSelectedNewMember(null);
        setTransferForm({ serviceGroups: [] });

        const demoMessage = result.demo
          ? "\n\n(Demo Mode - Database Offline)"
          : "";
        alert(
          `Member successfully transferred to full membership!\nMember ID: ${result.memberId}\nTithe Number: ${result.titheNumber}${demoMessage}`,
        );
      } else {
        alert(`Transfer failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Transfer error:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to transfer member. Please try again.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("body stream already read")) {
        errorMessage = "Request processing error. Please try again.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage = `Server error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(
    (visitor) =>
      visitor.fullName
        .toLowerCase()
        .includes(visitorsSearchTerm.toLowerCase()) ||
      visitor.visitorId
        .toLowerCase()
        .includes(visitorsSearchTerm.toLowerCase()),
  );

  const filteredNewMembers = newMembers.filter(
    (member) =>
      member.isActive &&
      (member.fullName
        .toLowerCase()
        .includes(newMembersSearchTerm.toLowerCase()) ||
        member.visitorId
          .toLowerCase()
          .includes(newMembersSearchTerm.toLowerCase())),
  );

  const eligibleMembers = filteredNewMembers.filter(
    (member) => member.eligibleForMembership,
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">New Members Management</h1>
            <p className="text-muted-foreground">
              Manage visitors register and new member registration
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitors.length}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Members</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newMembers.filter((m) => m.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">In process</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eligible for Transfer
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eligibleMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready for full membership
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Follow-ups Required
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visitors.filter((v) => v.followUpRequired).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Visitors to follow up
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visitors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visitors">Visitors Register</TabsTrigger>
            <TabsTrigger value="new-members">Register New Member</TabsTrigger>
          </TabsList>

          {/* Visitors Register Tab */}
          <TabsContent value="visitors" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search visitors..."
                    value={visitorsSearchTerm}
                    onChange={(e) => setVisitorsSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    exportData("excel", {
                      data: filteredVisitors.map((v) => ({
                        "Visitor ID": v.visitorId,
                        "Full Name": v.fullName,
                        Phone: v.phoneNumber,
                        Purpose: v.purposeOfVisit,
                        "Current Church": v.currentChurch,
                        "How Heard": v.howHeardAboutUs,
                        "Visit Date": v.visitDate,
                        "Follow Up": v.followUpRequired ? "Yes" : "No",
                      })),
                      filename: `visitors_register_${new Date().toISOString().split("T")[0]}`,
                      title: "Visitors Register",
                    })
                  }
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog
                  open={showVisitorDialog}
                  onOpenChange={setShowVisitorDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Visitor
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Visitors Register</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Record information for church visitors
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Follow Up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-medium">
                          {visitor.visitorId}
                        </TableCell>
                        <TableCell>{visitor.fullName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {visitor.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{visitor.purposeOfVisit}</TableCell>
                        <TableCell>
                          {new Date(visitor.visitDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {visitor.followUpRequired ? (
                            <Badge variant="default">Required</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Members Tab */}
          <TabsContent value="new-members" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search new members..."
                    value={newMembersSearchTerm}
                    onChange={(e) => setNewMembersSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    exportData("excel", {
                      data: filteredNewMembers.map((m) => ({
                        "Visitor ID": m.visitorId,
                        "Full Name": m.fullName,
                        Phone: m.phoneNumber,
                        Email: m.email,
                        Employment: m.employmentStatus,
                        "Days as New Member": m.daysAsNewMember,
                        Baptized: m.baptized ? "Yes" : "No",
                        "Bible Study": m.bibleStudyCompleted ? "Yes" : "No",
                        Eligible: m.eligibleForMembership ? "Yes" : "No",
                      })),
                      filename: `new_members_${new Date().toISOString().split("T")[0]}`,
                      title: "New Members",
                    })
                  }
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog
                  open={showNewMemberDialog}
                  onOpenChange={setShowNewMemberDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register New Member
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>New Members</CardTitle>
                <p className="text-sm text-muted-foreground">
                  People who have decided to join the church and are in the
                  process of becoming full members
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Eligible</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNewMembers.map((member) => {
                      const progressPercentage = Math.min(
                        (member.daysAsNewMember / 180) * 100,
                        100,
                      );
                      const requirementsMet = [
                        member.daysAsNewMember >= 180,
                        member.baptized,
                        member.bibleStudyCompleted,
                      ].filter(Boolean).length;

                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.visitorId}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.fullName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.employmentStatus}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {member.phoneNumber}
                              </div>
                              {member.email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{progressPercentage.toFixed(0)}%</span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="w-[100px]"
                              />
                              <div className="text-xs text-muted-foreground">
                                {requirementsMet}/3 requirements met
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.daysAsNewMember}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.daysAsNewMember >= 180
                                  ? "6+ months"
                                  : `${Math.ceil((180 - member.daysAsNewMember) / 30)} months left`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.eligibleForMembership ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {member.eligibleForMembership && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedNewMember(member);
                                    setShowTransferDialog(true);
                                  }}
                                >
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Transfer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Record Visitor Dialog */}
        <Dialog open={showVisitorDialog} onOpenChange={setShowVisitorDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Visitor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visitorName">Full Name *</Label>
                    <Input
                      id="visitorName"
                      value={visitorForm.fullName}
                      onChange={(e) =>
                        setVisitorForm({
                          ...visitorForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visitorPhone">Phone Number *</Label>
                    <Input
                      id="visitorPhone"
                      value={visitorForm.phoneNumber}
                      onChange={(e) =>
                        setVisitorForm({
                          ...visitorForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
                    <Select
                      value={visitorForm.purposeOfVisit}
                      onValueChange={(value) =>
                        setVisitorForm({
                          ...visitorForm,
                          purposeOfVisit: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {purposeOfVisitOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentChurch">Current Church</Label>
                    <Input
                      id="currentChurch"
                      value={visitorForm.currentChurch}
                      onChange={(e) =>
                        setVisitorForm({
                          ...visitorForm,
                          currentChurch: e.target.value,
                        })
                      }
                      placeholder="Enter current church"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="howHeard">How did you hear about us?</Label>
                  <Select
                    value={visitorForm.howHeardAboutUs}
                    onValueChange={(value) =>
                      setVisitorForm({ ...visitorForm, howHeardAboutUs: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {howHeardOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatLiked">
                    What did you like most about our church?
                  </Label>
                  <Textarea
                    id="whatLiked"
                    value={visitorForm.whatLikedMost}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        whatLikedMost: e.target.value,
                      })
                    }
                    placeholder="Share your thoughts..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prayer Requests (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {prayerRequestOptions.map((request) => (
                      <div
                        key={request}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={request}
                          checked={visitorForm.prayerRequests.includes(request)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setVisitorForm({
                                ...visitorForm,
                                prayerRequests: [
                                  ...visitorForm.prayerRequests,
                                  request,
                                ],
                              });
                            } else {
                              setVisitorForm({
                                ...visitorForm,
                                prayerRequests:
                                  visitorForm.prayerRequests.filter(
                                    (r) => r !== request,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={request} className="text-sm">
                          {request}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followUp"
                    checked={visitorForm.followUpRequired}
                    onCheckedChange={(checked) =>
                      setVisitorForm({
                        ...visitorForm,
                        followUpRequired: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="followUp">Follow-up required</Label>
                </div>

                {visitorForm.followUpRequired && (
                  <div className="space-y-2">
                    <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                    <Textarea
                      id="followUpNotes"
                      value={visitorForm.followUpNotes}
                      onChange={(e) =>
                        setVisitorForm({
                          ...visitorForm,
                          followUpNotes: e.target.value,
                        })
                      }
                      placeholder="Add follow-up notes..."
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowVisitorDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleVisitorSubmit}>Record Visitor</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Register New Member Dialog */}
        <Dialog
          open={showNewMemberDialog}
          onOpenChange={setShowNewMemberDialog}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newMemberForm.fullName}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={newMemberForm.gender}
                      onValueChange={(value) =>
                        setNewMemberForm({ ...newMemberForm, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newMemberForm.dateOfBirth}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select
                      value={newMemberForm.maritalStatus}
                      onValueChange={(value) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          maritalStatus: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={newMemberForm.phoneNumber}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMemberForm.email}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newMemberForm.address}
                    onChange={(e) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter physical address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergencyContactName"
                      value={newMemberForm.emergencyContactName}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          emergencyContactName: e.target.value,
                        })
                      }
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      value={newMemberForm.emergencyContactPhone}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          emergencyContactPhone: e.target.value,
                        })
                      }
                      placeholder="Enter emergency contact phone"
                    />
                  </div>
                </div>
              </div>

              {/* Church Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Church Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select
                      value={newMemberForm.employmentStatus}
                      onValueChange={(value) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          employmentStatus: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employed">Employed</SelectItem>
                        <SelectItem value="Jobless">Jobless</SelectItem>
                        <SelectItem value="Business Class">
                          Business Class
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousChurch">Previous Church</Label>
                    <Input
                      id="previousChurch"
                      value={newMemberForm.previousChurchName}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          previousChurchName: e.target.value,
                        })
                      }
                      placeholder="Enter previous church name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonForLeaving">
                    Reason for Leaving Previous Church
                  </Label>
                  <Select
                    value={newMemberForm.reasonForLeavingPreviousChurch}
                    onValueChange={(value) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        reasonForLeavingPreviousChurch: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Suspension">Suspension</SelectItem>
                      <SelectItem value="Termination">Termination</SelectItem>
                      <SelectItem value="Self-Evolution">
                        Self-Evolution
                      </SelectItem>
                      <SelectItem value="Relocation">Relocation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newMemberForm.reasonForLeavingPreviousChurch === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="reasonDetails">Reason Details</Label>
                    <Textarea
                      id="reasonDetails"
                      value={newMemberForm.reasonDetails}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          reasonDetails: e.target.value,
                        })
                      }
                      placeholder="Provide details..."
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Service Groups */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Groups</h3>
                <div className="grid grid-cols-2 gap-2">
                  {serviceGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={newMemberForm.serviceGroups.includes(group.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewMemberForm({
                              ...newMemberForm,
                              serviceGroups: [
                                ...newMemberForm.serviceGroups,
                                group.id,
                              ],
                            });
                          } else {
                            setNewMemberForm({
                              ...newMemberForm,
                              serviceGroups: newMemberForm.serviceGroups.filter(
                                (id) => id !== group.id,
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`group-${group.id}`} className="text-sm">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spiritual Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Spiritual Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bornAgain"
                      checked={newMemberForm.bornAgain}
                      onCheckedChange={(checked) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          bornAgain: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="bornAgain">Born Again</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="baptized"
                      checked={newMemberForm.baptized}
                      onCheckedChange={(checked) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          baptized: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="baptized">Baptized</Label>
                  </div>
                </div>

                {newMemberForm.baptized && (
                  <div className="space-y-2">
                    <Label htmlFor="baptismDate">Baptism Date</Label>
                    <Input
                      id="baptismDate"
                      type="date"
                      value={newMemberForm.baptismDate}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          baptismDate: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bibleStudy"
                    checked={newMemberForm.bibleStudyCompleted}
                    onCheckedChange={(checked) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        bibleStudyCompleted: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="bibleStudy">Bible Study Completed</Label>
                </div>

                {newMemberForm.bibleStudyCompleted && (
                  <div className="space-y-2">
                    <Label htmlFor="bibleStudyDate">
                      Bible Study Completion Date
                    </Label>
                    <Input
                      id="bibleStudyDate"
                      type="date"
                      value={newMemberForm.bibleStudyCompletionDate}
                      onChange={(e) =>
                        setNewMemberForm({
                          ...newMemberForm,
                          bibleStudyCompletionDate: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewMemberDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleNewMemberSubmit}>
                  Register New Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transfer to Full Membership Dialog */}
        <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer to Full Membership</DialogTitle>
            </DialogHeader>
            {selectedNewMember && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Member Details</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Name:</strong> {selectedNewMember.fullName}
                    </div>
                    <div>
                      <strong>Days as New Member:</strong>{" "}
                      {selectedNewMember.daysAsNewMember}
                    </div>
                    <div>
                      <strong>Baptized:</strong>{" "}
                      {selectedNewMember.baptized ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Bible Study:</strong>{" "}
                      {selectedNewMember.bibleStudyCompleted ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Service Groups</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Choir",
                      "Ushering",
                      "Youth Group",
                      "Women Ministry",
                      "Men Ministry",
                      "Children Ministry",
                      "Prayer Team",
                      "Media Team",
                      "Evangelism Team",
                      "Hospitality Team",
                    ].map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox
                          id={group}
                          checked={transferForm.serviceGroups.includes(group)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTransferForm({
                                ...transferForm,
                                serviceGroups: [
                                  ...transferForm.serviceGroups,
                                  group,
                                ],
                              });
                            } else {
                              setTransferForm({
                                ...transferForm,
                                serviceGroups:
                                  transferForm.serviceGroups.filter(
                                    (sg) => sg !== group,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={group} className="text-sm">
                          {group}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTransferDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleTransferToFullMembership}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Transfer to Full Membership
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
