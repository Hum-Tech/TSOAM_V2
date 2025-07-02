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
import {
  Plus,
  Search,
  Download,
  Edit,
  Eye,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  FileText,
  MoreHorizontal,
  UserX,
  UserMinus,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { printTable, exportData } from "@/utils/printUtils";

/**
 * Interface for Full Members (those who have completed the transition process)
 */
interface Member {
  id: string;
  memberId: string; // TSOAM2025-001
  titheNumber: string; // T2025-001
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  membershipStatus: "Active" | "Inactive";
  yearOfJoining: number;
  visitDate: string; // Original visit date
  membershipDate: string; // Date became full member
  baptized: boolean;
  baptismDate: string;
  bibleStudyCompleted: boolean;
  bibleStudyCompletionDate: string;
  employmentStatus: "Employed" | "Jobless" | "Business Class";
  previousChurchName?: string;
  reasonForLeavingPreviousChurch?:
    | "Suspension"
    | "Termination"
    | "Self-Evolution"
    | "Relocation"
    | "Other";
  reasonDetails?: string;
  howHeardAboutUs:
    | "Friend"
    | "Relative"
    | "Word of Mouth"
    | "Website"
    | "Crusade"
    | "Roadshow"
    | "Matatu"
    | "Social Media"
    | "Flyer"
    | "Personal Identification";
  serviceGroups: string[]; // Multiple service groups
  bornAgain: boolean;
  churchFeedback?: string;
  prayerRequests?: string;
  transferredFromNewMemberId: string;
  createdAt: string;
}

/**
 * Available service groups (can be selected multiple)
 */
const SERVICE_GROUPS = [
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
];

// Mock data for full members (these have already completed the transition process)
const mockMembers: Member[] = [
  {
    id: "1",
    memberId: "TSOAM2025-001",
    titheNumber: "T2025-001",
    fullName: "John Kamau",
    email: "john.kamau@email.com",
    phone: "+254 712 345 678",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    maritalStatus: "Married",
    address: "Nairobi, Kenya",
    emergencyContactName: "Mary Kamau",
    emergencyContactPhone: "+254 722 123 456",
    membershipStatus: "Active",
    yearOfJoining: 2024,
    visitDate: "2024-01-15", // When they first visited
    membershipDate: "2024-07-20", // When they became full member (6+ months later)
    baptized: true,
    baptismDate: "2024-05-10",
    bibleStudyCompleted: true,
    bibleStudyCompletionDate: "2024-06-15",
    employmentStatus: "Employed",
    previousChurchName: "Grace Chapel",
    reasonForLeavingPreviousChurch: "Relocation",
    reasonDetails: "Moved to Nairobi for work",
    howHeardAboutUs: "Friend",
    serviceGroups: ["Choir", "Men Ministry"],
    bornAgain: true,
    churchFeedback: "Wonderful fellowship and teaching",
    prayerRequests: "Career advancement and family health",
    transferredFromNewMemberId: "NM-001",
    createdAt: "2024-07-20T10:00:00Z",
  },
  {
    id: "2",
    memberId: "TSOAM2025-002",
    titheNumber: "T2025-002",
    fullName: "Mary Wanjiku",
    email: "mary.wanjiku@email.com",
    phone: "+254 721 456 789",
    dateOfBirth: "1990-07-22",
    gender: "Female",
    maritalStatus: "Single",
    address: "Nakuru, Kenya",
    emergencyContactName: "Grace Wanjiku",
    emergencyContactPhone: "+254 733 789 012",
    membershipStatus: "Active",
    yearOfJoining: 2024,
    visitDate: "2024-02-10",
    membershipDate: "2024-08-15",
    baptized: true,
    baptismDate: "2024-06-20",
    bibleStudyCompleted: true,
    bibleStudyCompletionDate: "2024-07-30",
    employmentStatus: "Business Class",
    previousChurchName: "Faith Church",
    reasonForLeavingPreviousChurch: "Self-Evolution",
    reasonDetails: "Seeking deeper spiritual growth",
    howHeardAboutUs: "Social Media",
    serviceGroups: ["Ushering", "Women Ministry", "Evangelism Team"],
    bornAgain: true,
    churchFeedback: "Love the youth programs and community outreach",
    prayerRequests: "Business success and wisdom",
    transferredFromNewMemberId: "NM-002",
    createdAt: "2024-08-15T14:30:00Z",
  },
  {
    id: "3",
    memberId: "TSOAM2025-003",
    titheNumber: "T2025-003",
    fullName: "Peter Mwangi",
    email: "peter.mwangi@email.com",
    phone: "+254 733 567 890",
    dateOfBirth: "1988-11-10",
    gender: "Male",
    maritalStatus: "Married",
    address: "Mombasa, Kenya",
    emergencyContactName: "Jane Mwangi",
    emergencyContactPhone: "+254 744 678 901",
    membershipStatus: "Active",
    yearOfJoining: 2024,
    visitDate: "2024-01-05",
    membershipDate: "2024-07-10",
    baptized: true,
    baptismDate: "2024-04-25",
    bibleStudyCompleted: true,
    bibleStudyCompletionDate: "2024-06-05",
    employmentStatus: "Jobless",
    previousChurchName: "New Life Church",
    reasonForLeavingPreviousChurch: "Termination",
    reasonDetails: "Disagreement on church doctrine",
    howHeardAboutUs: "Relative",
    serviceGroups: ["Youth Group", "Prayer Team"],
    bornAgain: true,
    churchFeedback: "Appreciate the biblical teaching",
    prayerRequests: "Job opportunity and financial stability",
    transferredFromNewMemberId: "NM-003",
    createdAt: "2024-07-10T09:15:00Z",
  },
];

export default function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members] = useState(mockMembers);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] =
    useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [statusChangeAction, setStatusChangeAction] = useState<
    "suspend" | "excommunicate" | "reactivate" | null
  >(null);
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [filterEmployment, setFilterEmployment] = useState("All");

  /**
   * Filter members based on search term and filters
   */
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.titheNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || member.membershipStatus === filterStatus;
    const matchesEmployment =
      filterEmployment === "All" ||
      member.employmentStatus === filterEmployment;

    return matchesSearch && matchesStatus && matchesEmployment;
  });

  /**
   * Get status badge for member
   */
  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Active" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  /**
   * Get employment status badge
   */
  const getEmploymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      Employed: "bg-green-100 text-green-800",
      Jobless: "bg-red-100 text-red-800",
      "Business Class": "bg-blue-100 text-blue-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  /**
   * Calculate member tenure
   */
  const calculateTenure = (membershipDate: string) => {
    const start = new Date(membershipDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""}, ${diffMonths % 12} month${diffMonths % 12 !== 1 ? "s" : ""}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }
  };

  /**
   * Export members data with comprehensive demographics
   */
  const handleExport = (format: "pdf" | "excel" | "csv") => {
    const memberData = filteredMembers.map((member) => ({
      "Member ID": member.memberId,
      "Tithe Number": member.titheNumber,
      "Full Name": member.fullName,
      "Date of Birth": member.dateOfBirth,
      Age: member.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(member.dateOfBirth).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25),
          )
        : "N/A",
      Gender: member.gender,
      "Marital Status": member.maritalStatus,
      Email: member.email,
      Phone: member.phone,
      Address: member.address,
      "Emergency Contact": member.emergencyContactName,
      "Emergency Phone": member.emergencyContactPhone,
      "Membership Status": member.membershipStatus,
      "Original Visit Date": member.visitDate,
      "Membership Date": member.membershipDate,
      "Member Since": calculateTenure(member.membershipDate),
      "Year of Joining": member.yearOfJoining,
      "Employment Status": member.employmentStatus,
      Baptized: member.baptized ? "Yes" : "No",
      "Baptism Date": member.baptismDate || "N/A",
      "Bible Study Completed": member.bibleStudyCompleted ? "Yes" : "No",
      "Bible Study Completion Date": member.bibleStudyCompletionDate || "N/A",
      "Service Groups": member.serviceGroups.join(", "),
      "Previous Church": member.previousChurchName || "N/A",
      "Reason for Leaving Previous Church":
        member.reasonForLeavingPreviousChurch || "N/A",
      "How Heard About Church": member.howHeardAboutUs || "N/A",
      "Born Again": member.bornAgain ? "Yes" : "No",
      "Church Feedback": member.churchFeedback || "N/A",
      "Prayer Requests": member.prayerRequests || "N/A",
      "Transferred From New Member ID":
        member.transferredFromNewMemberId || "N/A",
      "Created Date": new Date(member.createdAt).toLocaleDateString(),
    }));

    exportData(format, {
      filename: `TSOAM_Members_Demographics_${new Date().toISOString().split("T")[0]}`,
      format,
      title: "The Seed of Abraham Ministry (TSOAM)",
      subtitle: "Full Members Demographics Report",
      description: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      data: memberData,
      logoUrl: "/logo.png", // Church logo for PDF
      churchName: "The Seed of Abraham Ministry (TSOAM)",
      reportType: "Member Demographics",
      totalCount: filteredMembers.length,
      activeCount: filteredMembers.filter(
        (m) => m.membershipStatus === "Active",
      ).length,
      summary: {
        "Total Members": filteredMembers.length,
        "Active Members": filteredMembers.filter(
          (m) => m.membershipStatus === "Active",
        ).length,
        "Baptized Members": filteredMembers.filter((m) => m.baptized).length,
        "Employed Members": filteredMembers.filter(
          (m) => m.employmentStatus === "Employed",
        ).length,
        "Male Members": filteredMembers.filter((m) => m.gender === "Male")
          .length,
        "Female Members": filteredMembers.filter((m) => m.gender === "Female")
          .length,
      },
    });
  };

  /**
   * Handle member status changes (suspend, excommunicate, reactivate)
   */
  const handleStatusChange = () => {
    if (!selectedMember || !statusChangeAction || !statusChangeReason.trim()) {
      alert("Please provide a reason for the status change");
      return;
    }

    let newStatus: "Active" | "Inactive" | "Suspended" | "Excommunicated";
    let actionDescription: string;

    switch (statusChangeAction) {
      case "suspend":
        newStatus = "Suspended";
        actionDescription = "suspended";
        break;
      case "excommunicate":
        newStatus = "Excommunicated";
        actionDescription = "excommunicated";
        break;
      case "reactivate":
        newStatus = "Active";
        actionDescription = "reactivated";
        break;
      default:
        return;
    }

    // Update member status
    const updatedMembers = members.map((member) =>
      member.id === selectedMember.id
        ? { ...member, membershipStatus: newStatus }
        : member,
    );

    setMembers(updatedMembers);

    // If excommunicated, also remove from new members (as per requirements)
    if (statusChangeAction === "excommunicate") {
      // In a real app, this would also remove from new_members table
      console.log(
        `Member ${selectedMember.fullName} has been excommunicated and removed from all records`,
      );
    }

    // Reset state
    setIsStatusChangeDialogOpen(false);
    setSelectedMember(null);
    setStatusChangeAction(null);
    setStatusChangeReason("");

    alert(
      `Member ${selectedMember.fullName} has been ${actionDescription} successfully.`,
    );
  };

  /**
   * Print members table
   */
  const handlePrint = () => {
    const printData = filteredMembers.map((member) => ({
      ...member,
      yearOfJoining: member.yearOfJoining.toString(), // Remove comma formatting
    }));

    const columns = [
      { key: "memberId", title: "Member ID" },
      { key: "titheNumber", title: "Tithe Number" },
      { key: "fullName", title: "Full Name" },
      { key: "phone", title: "Mobile Phone" },
      { key: "membershipStatus", title: "Status" },
      { key: "employmentStatus", title: "Employment" },
      { key: "yearOfJoining", title: "Year Joined" },
    ];

    printTable(printData, columns, "Full Members Report");
  };

  // Calculate statistics
  const activeMembers = members.filter(
    (m) => m.membershipStatus === "Active",
  ).length;
  const totalMembers = members.length;
  const employedMembers = members.filter(
    (m) => m.employmentStatus === "Employed",
  ).length;
  const thisYearMembers = members.filter(
    (m) => m.yearOfJoining === new Date().getFullYear(),
  ).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Member Management
            </h1>
            <p className="text-muted-foreground">
              Manage full church members who have completed the transition
              process
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <FileText className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalMembers}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Members
                  </div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{activeMembers}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{employedMembers}</div>
                  <div className="text-sm text-muted-foreground">Employed</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{thisYearMembers}</div>
                  <div className="text-sm text-muted-foreground">
                    Joined This Year
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Full Members Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, member ID, or tithe number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterEmployment}
                onValueChange={setFilterEmployment}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Employment</SelectItem>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Jobless">Jobless</SelectItem>
                  <SelectItem value="Business Class">Business Class</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Service Groups</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.memberId} • {member.titheNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined: {member.yearOfJoining}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.email}</div>
                        <div className="text-muted-foreground">
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member.membershipStatus)}
                    </TableCell>
                    <TableCell>
                      {getEmploymentBadge(member.employmentStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.serviceGroups.slice(0, 2).map((group) => (
                          <Badge
                            key={group}
                            variant="outline"
                            className="text-xs"
                          >
                            {group}
                          </Badge>
                        ))}
                        {member.serviceGroups.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.serviceGroups.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {calculateTenure(member.membershipDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {member.membershipStatus !== "Active" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMember(member);
                                  setStatusChangeAction("reactivate");
                                  setIsStatusChangeDialogOpen(true);
                                }}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            {member.membershipStatus === "Active" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMember(member);
                                  setStatusChangeAction("suspend");
                                  setIsStatusChangeDialogOpen(true);
                                }}
                                className="text-yellow-600"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {member.membershipStatus !== "Excommunicated" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMember(member);
                                  setStatusChangeAction("excommunicate");
                                  setIsStatusChangeDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Excommunicate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Member Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="membership">Membership</TabsTrigger>
                    <TabsTrigger value="service">Service</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <p className="text-sm">{selectedMember.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p className="text-sm">{selectedMember.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Date of Birth
                        </Label>
                        <p className="text-sm">{selectedMember.dateOfBirth}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Marital Status
                        </Label>
                        <p className="text-sm">
                          {selectedMember.maritalStatus}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedMember.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{selectedMember.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <p className="text-sm">{selectedMember.address}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Emergency Contact
                        </Label>
                        <p className="text-sm">
                          {selectedMember.emergencyContactName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Emergency Phone
                        </Label>
                        <p className="text-sm">
                          {selectedMember.emergencyContactPhone}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="membership" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Member ID</Label>
                        <p className="text-sm font-mono">
                          {selectedMember.memberId}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Tithe Number
                        </Label>
                        <p className="text-sm font-mono">
                          {selectedMember.titheNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Membership Status
                        </Label>
                        <p className="text-sm">
                          {getStatusBadge(selectedMember.membershipStatus)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Year of Joining
                        </Label>
                        <p className="text-sm">
                          {selectedMember.yearOfJoining}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Original Visit Date
                        </Label>
                        <p className="text-sm">{selectedMember.visitDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Membership Date
                        </Label>
                        <p className="text-sm">
                          {selectedMember.membershipDate}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Baptism Date
                        </Label>
                        <p className="text-sm">{selectedMember.baptismDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Bible Study Completed
                        </Label>
                        <p className="text-sm">
                          {selectedMember.bibleStudyCompletionDate}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Employment Status
                        </Label>
                        <p className="text-sm">
                          {getEmploymentBadge(selectedMember.employmentStatus)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Born Again
                        </Label>
                        <p className="text-sm">
                          {selectedMember.bornAgain ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="service" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Service Groups
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedMember.serviceGroups.map((group) => (
                          <Badge key={group} variant="default">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Church Feedback
                      </Label>
                      <p className="text-sm">
                        {selectedMember.churchFeedback ||
                          "No feedback provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Prayer Requests
                      </Label>
                      <p className="text-sm">
                        {selectedMember.prayerRequests || "No prayer requests"}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Previous Church
                        </Label>
                        <p className="text-sm">
                          {selectedMember.previousChurchName || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Reason for Leaving
                        </Label>
                        <p className="text-sm">
                          {selectedMember.reasonForLeavingPreviousChurch ||
                            "Not specified"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">
                          Additional Details
                        </Label>
                        <p className="text-sm">
                          {selectedMember.reasonDetails ||
                            "No additional details"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          How They Heard About Us
                        </Label>
                        <p className="text-sm">
                          {selectedMember.howHeardAboutUs}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Member Since
                        </Label>
                        <p className="text-sm">
                          {calculateTenure(selectedMember.membershipDate)}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      defaultValue={selectedMember.fullName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="membershipStatus">Membership Status</Label>
                    <Select defaultValue={selectedMember.membershipStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select defaultValue={selectedMember.employmentStatus}>
                      <SelectTrigger>
                        <SelectValue />
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
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={selectedMember.phone} />
                  </div>
                </div>

                <div>
                  <Label>Service Groups</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {SERVICE_GROUPS.map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox
                          id={group}
                          defaultChecked={selectedMember.serviceGroups.includes(
                            group,
                          )}
                        />
                        <Label htmlFor={group} className="text-sm">
                          {group}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setIsEditDialogOpen(false)}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog
          open={isStatusChangeDialogOpen}
          onOpenChange={setIsStatusChangeDialogOpen}
        >
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {statusChangeAction === "suspend" && "Suspend Member"}
                {statusChangeAction === "excommunicate" &&
                  "Excommunicate Member"}
                {statusChangeAction === "reactivate" && "Reactivate Member"}
              </DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium">Member Details</h4>
                  <div className="text-sm space-y-1 mt-2">
                    <div>
                      <strong>Name:</strong> {selectedMember.fullName}
                    </div>
                    <div>
                      <strong>Member ID:</strong> {selectedMember.memberId}
                    </div>
                    <div>
                      <strong>Current Status:</strong>{" "}
                      {selectedMember.membershipStatus}
                    </div>
                  </div>
                </div>

                {statusChangeAction === "excommunicate" && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Excommunicating a member will permanently remove them from
                      both the members list and new members records. This action
                      cannot be undone.
                    </p>
                  </div>
                )}

                {statusChangeAction === "suspend" && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Note</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Suspending a member will temporarily restrict their
                      membership privileges. They can be reactivated later.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="statusReason">
                    Reason for{" "}
                    {statusChangeAction === "suspend"
                      ? "suspension"
                      : statusChangeAction === "excommunicate"
                        ? "excommunication"
                        : "reactivation"}{" "}
                    *
                  </Label>
                  <Textarea
                    id="statusReason"
                    placeholder={`Please provide a detailed reason for this ${statusChangeAction}...`}
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsStatusChangeDialogOpen(false);
                      setSelectedMember(null);
                      setStatusChangeAction(null);
                      setStatusChangeReason("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStatusChange}
                    variant={
                      statusChangeAction === "excommunicate"
                        ? "destructive"
                        : statusChangeAction === "suspend"
                          ? "default"
                          : "default"
                    }
                  >
                    {statusChangeAction === "suspend" && "Suspend Member"}
                    {statusChangeAction === "excommunicate" &&
                      "Excommunicate Member"}
                    {statusChangeAction === "reactivate" && "Reactivate Member"}
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
