import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  Printer,
  Save,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface WelfareApplication {
  id: string;
  applicantName: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  applicationDate: string;
  requestType: "Financial" | "Medical" | "Emergency" | "Food" | "Educational";
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  description: string;
  requestedAmount?: number;
  currentSituation: string;
  employmentStatus: string;
  monthlyIncome?: number;
  familySize: number;
  dependents: number;
  medicalConditions?: string;
  previousAssistance: boolean;
  documents: string[];
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Completed";
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  amountApproved?: number;
  disbursementDate?: string;
  createdBy: string;
  lastUpdated: string;
}

const churchDetails = {
  name: "THE SEED OF ABRAHAM MINISTRY",
  address: "P.O. Box 12345, Nairobi, Kenya",
  phone: "+254 700 123 456",
  email: "info@tsoam.org",
  website: "www.tsoam.org",
  logo: "https://cdn.builder.io/api/v1/image/assets%2F0627183da1a04fa4b6c5a1ab36b4780e%2F24ea526264444b8ca043118a01335902",
};

export default function WelfareEnhanced() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<WelfareApplication[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<WelfareApplication | null>(null);
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("applications");

  const [newApplication, setNewApplication] = useState<
    Partial<WelfareApplication>
  >({
    requestType: "Financial",
    urgencyLevel: "Medium",
    familySize: 1,
    dependents: 0,
    employmentStatus: "Unemployed",
    previousAssistance: false,
    documents: [],
  });

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockApplications: WelfareApplication[] = [
      {
        id: "WEL001",
        applicantName: "Mary Wanjiku",
        idNumber: "12345678",
        phoneNumber: "+254700123456",
        email: "mary.wanjiku@email.com",
        address: "Nairobi, Kenya",
        emergencyContact: "John Wanjiku",
        emergencyPhone: "+254700654321",
        applicationDate: "2024-01-15",
        requestType: "Medical",
        urgencyLevel: "High",
        description: "Emergency medical treatment for child",
        requestedAmount: 50000,
        currentSituation:
          "My child needs urgent medical attention but I cannot afford the medical bills.",
        employmentStatus: "Part-time",
        monthlyIncome: 15000,
        familySize: 4,
        dependents: 3,
        medicalConditions: "Child has pneumonia",
        previousAssistance: false,
        documents: ["medical_report.pdf", "id_copy.pdf"],
        status: "Approved",
        reviewedBy: "Pastor James",
        reviewDate: "2024-01-16",
        reviewNotes: "Approved for emergency medical assistance",
        amountApproved: 45000,
        disbursementDate: "2024-01-17",
        createdBy: "mary.wanjiku@email.com",
        lastUpdated: "2024-01-17",
      },
      {
        id: "WEL002",
        applicantName: "Peter Mwangi",
        idNumber: "87654321",
        phoneNumber: "+254700987654",
        email: "peter.mwangi@email.com",
        address: "Kiambu, Kenya",
        emergencyContact: "Grace Mwangi",
        emergencyPhone: "+254700456789",
        applicationDate: "2024-01-20",
        requestType: "Financial",
        urgencyLevel: "Medium",
        description: "Rent assistance due to job loss",
        requestedAmount: 30000,
        currentSituation:
          "Lost my job last month and unable to pay rent. Landlord has issued eviction notice.",
        employmentStatus: "Unemployed",
        monthlyIncome: 0,
        familySize: 3,
        dependents: 2,
        previousAssistance: true,
        documents: ["eviction_notice.pdf", "id_copy.pdf"],
        status: "Under Review",
        createdBy: "peter.mwangi@email.com",
        lastUpdated: "2024-01-20",
      },
    ];

    setApplications(mockApplications);
  };

  const generateApplicationPDF = (application: WelfareApplication) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Header with church logo and details
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(churchDetails.name, pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(churchDetails.address, pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 5;
    doc.text(
      `Tel: ${churchDetails.phone} | Email: ${churchDetails.email}`,
      pageWidth / 2,
      yPosition,
      { align: "center" },
    );
    yPosition += 15;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("WELFARE ASSISTANCE APPLICATION", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // Application details header
    doc.setFontSize(12);
    doc.text(`Application ID: ${application.id}`, margin, yPosition);
    doc.text(
      `Date: ${application.applicationDate}`,
      pageWidth - margin - 50,
      yPosition,
    );
    yPosition += 10;

    // Status badge
    doc.setFillColor(
      application.status === "Approved" ? 34 : 255,
      application.status === "Approved" ? 197 : 193,
      application.status === "Approved" ? 94 : 7,
    );
    doc.rect(margin, yPosition, 30, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(application.status, margin + 15, yPosition + 5, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
    yPosition += 20;

    // Personal Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PERSONAL INFORMATION", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const personalInfo = [
      [`Full Name:`, application.applicantName],
      [`ID Number:`, application.idNumber],
      [`Phone Number:`, application.phoneNumber],
      [`Email:`, application.email],
      [`Address:`, application.address],
      [`Emergency Contact:`, application.emergencyContact],
      [`Emergency Phone:`, application.emergencyPhone],
    ];

    personalInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 40, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Request Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("REQUEST INFORMATION", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const requestInfo = [
      [`Request Type:`, application.requestType],
      [`Urgency Level:`, application.urgencyLevel],
      [
        `Requested Amount:`,
        `KSh ${application.requestedAmount?.toLocaleString() || "N/A"}`,
      ],
      [`Employment Status:`, application.employmentStatus],
      [
        `Monthly Income:`,
        `KSh ${application.monthlyIncome?.toLocaleString() || "0"}`,
      ],
      [`Family Size:`, application.familySize.toString()],
      [`Dependents:`, application.dependents.toString()],
    ];

    requestInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 40, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Description Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION OF REQUEST", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descriptionLines = doc.splitTextToSize(
      application.description,
      pageWidth - 2 * margin,
    );
    doc.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 5 + 10;

    // Current Situation Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CURRENT SITUATION", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const situationLines = doc.splitTextToSize(
      application.currentSituation,
      pageWidth - 2 * margin,
    );
    doc.text(situationLines, margin, yPosition);
    yPosition += situationLines.length * 5 + 15;

    // Medical Conditions (if applicable)
    if (application.medicalConditions) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("MEDICAL CONDITIONS", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const medicalLines = doc.splitTextToSize(
        application.medicalConditions,
        pageWidth - 2 * margin,
      );
      doc.text(medicalLines, margin, yPosition);
      yPosition += medicalLines.length * 5 + 15;
    }

    // Review Information (if reviewed)
    if (application.reviewedBy) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REVIEW INFORMATION", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const reviewInfo = [
        [`Reviewed By:`, application.reviewedBy],
        [`Review Date:`, application.reviewDate || ""],
        [
          `Amount Approved:`,
          `KSh ${application.amountApproved?.toLocaleString() || "0"}`,
        ],
        [`Disbursement Date:`, application.disbursementDate || "Pending"],
      ];

      reviewInfo.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 40, yPosition);
        yPosition += 6;
      });

      if (application.reviewNotes) {
        yPosition += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Review Notes:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(
          application.reviewNotes,
          pageWidth - 2 * margin,
        );
        doc.text(notesLines, margin, yPosition);
        yPosition += notesLines.length * 5;
      }
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This document is an official record of the welfare assistance application.",
      pageWidth / 2,
      footerY,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} by ${user?.name || "System"}`,
      pageWidth / 2,
      footerY + 5,
      { align: "center" },
    );

    // Save the PDF
    doc.save(`TSOAM_Welfare_Application_${application.id}.pdf`);
  };

  const exportApplicationsToExcel = () => {
    const exportData = applications.map((app) => ({
      "Application ID": app.id,
      "Applicant Name": app.applicantName,
      "ID Number": app.idNumber,
      "Phone Number": app.phoneNumber,
      Email: app.email,
      Address: app.address,
      "Request Type": app.requestType,
      "Urgency Level": app.urgencyLevel,
      "Requested Amount": app.requestedAmount || 0,
      "Employment Status": app.employmentStatus,
      "Monthly Income": app.monthlyIncome || 0,
      "Family Size": app.familySize,
      Dependents: app.dependents,
      Status: app.status,
      "Application Date": app.applicationDate,
      "Reviewed By": app.reviewedBy || "",
      "Amount Approved": app.amountApproved || 0,
      "Disbursement Date": app.disbursementDate || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Welfare Applications");

    // Add church header
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [churchDetails.name],
        ["WELFARE ASSISTANCE APPLICATIONS REPORT"],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [],
      ],
      { origin: "A1" },
    );

    XLSX.writeFile(
      wb,
      `TSOAM_Welfare_Applications_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const handleSubmitApplication = () => {
    const applicationData: WelfareApplication = {
      ...newApplication,
      id: `WEL${String(applications.length + 1).padStart(3, "0")}`,
      applicationDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      createdBy: user?.email || "",
      lastUpdated: new Date().toISOString(),
      documents: [],
    } as WelfareApplication;

    setApplications([...applications, applicationData]);
    setShowNewApplication(false);
    setNewApplication({
      requestType: "Financial",
      urgencyLevel: "Medium",
      familySize: 1,
      dependents: 0,
      employmentStatus: "Unemployed",
      previousAssistance: false,
      documents: [],
    });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phoneNumber.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesUrgency =
      urgencyFilter === "all" || app.urgencyLevel === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "secondary" as const,
      "Under Review": "default" as const,
      Approved: "default" as const,
      Rejected: "destructive" as const,
      Completed: "default" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      Low: "secondary" as const,
      Medium: "default" as const,
      High: "destructive" as const,
      Critical: "destructive" as const,
    };
    return variants[urgency as keyof typeof variants] || "secondary";
  };

  return (
    <Layout>
      <PageHeader
        title="Welfare Assistance Management"
        description="Manage welfare applications and assistance programs"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={exportApplicationsToExcel}
              variant="outline"
              className="hidden sm:flex"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setShowNewApplication(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) =>
                      app.status === "Pending" || app.status === "Under Review",
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Amount Approved
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh{" "}
                {applications
                  .filter((app) => app.amountApproved)
                  .reduce((sum, app) => sum + (app.amountApproved || 0), 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Cases
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter((app) => app.urgencyLevel === "Critical")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={urgencyFilter}
                    onValueChange={setUrgencyFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgency</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Welfare Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {application.applicantName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {application.phoneNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{application.requestType}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getUrgencyBadge(application.urgencyLevel)}
                          >
                            {application.urgencyLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          KSh{" "}
                          {application.requestedAmount?.toLocaleString() ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{application.applicationDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowViewDialog(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                generateApplicationPDF(application)
                              }
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={exportApplicationsToExcel}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All Applications
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Monthly Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Summary Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Application Dialog */}
        <Dialog open={showNewApplication} onOpenChange={setShowNewApplication}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Welfare Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicantName">Full Name *</Label>
                    <Input
                      id="applicantName"
                      value={newApplication.applicantName || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          applicantName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input
                      id="idNumber"
                      value={newApplication.idNumber || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          idNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={newApplication.phoneNumber || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newApplication.email || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={newApplication.address || ""}
                    onChange={(e) =>
                      setNewApplication({
                        ...newApplication,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={newApplication.emergencyContact || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          emergencyContact: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      value={newApplication.emergencyPhone || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          emergencyPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Request Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="requestType">Request Type *</Label>
                    <Select
                      value={newApplication.requestType}
                      onValueChange={(value) =>
                        setNewApplication({
                          ...newApplication,
                          requestType: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                    <Select
                      value={newApplication.urgencyLevel}
                      onValueChange={(value) =>
                        setNewApplication({
                          ...newApplication,
                          urgencyLevel: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requestedAmount">Requested Amount</Label>
                    <Input
                      id="requestedAmount"
                      type="number"
                      value={newApplication.requestedAmount || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          requestedAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="familySize">Family Size *</Label>
                    <Input
                      id="familySize"
                      type="number"
                      value={newApplication.familySize || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          familySize: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dependents">Number of Dependents *</Label>
                    <Input
                      id="dependents"
                      type="number"
                      value={newApplication.dependents || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          dependents: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={newApplication.monthlyIncome || ""}
                      onChange={(e) =>
                        setNewApplication({
                          ...newApplication,
                          monthlyIncome: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Employment Status */}
              <div>
                <Label htmlFor="employmentStatus">Employment Status *</Label>
                <Select
                  value={newApplication.employmentStatus}
                  onValueChange={(value) =>
                    setNewApplication({
                      ...newApplication,
                      employmentStatus: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description of Request *</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your request in detail..."
                  value={newApplication.description || ""}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Current Situation */}
              <div>
                <Label htmlFor="currentSituation">Current Situation *</Label>
                <Textarea
                  id="currentSituation"
                  placeholder="Please describe your current situation..."
                  value={newApplication.currentSituation || ""}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      currentSituation: e.target.value,
                    })
                  }
                />
              </div>

              {/* Medical Conditions (if applicable) */}
              <div>
                <Label htmlFor="medicalConditions">
                  Medical Conditions (if applicable)
                </Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="Please describe any relevant medical conditions..."
                  value={newApplication.medicalConditions || ""}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      medicalConditions: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewApplication(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitApplication}>
                  Submit Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Application Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Application Details - {selectedApplication?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedApplication.applicantName}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedApplication.requestType} Request
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadge(selectedApplication.status)}>
                      {selectedApplication.status}
                    </Badge>
                    <Badge
                      variant={getUrgencyBadge(
                        selectedApplication.urgencyLevel,
                      )}
                    >
                      {selectedApplication.urgencyLevel}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>ID Number:</strong>{" "}
                        {selectedApplication.idNumber}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedApplication.phoneNumber}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedApplication.email}
                      </p>
                      <p>
                        <strong>Address:</strong> {selectedApplication.address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Requested Amount:</strong> KSh{" "}
                        {selectedApplication.requestedAmount?.toLocaleString() ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Employment:</strong>{" "}
                        {selectedApplication.employmentStatus}
                      </p>
                      <p>
                        <strong>Monthly Income:</strong> KSh{" "}
                        {selectedApplication.monthlyIncome?.toLocaleString() ||
                          "0"}
                      </p>
                      <p>
                        <strong>Family Size:</strong>{" "}
                        {selectedApplication.familySize}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{selectedApplication.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Current Situation</h4>
                  <p className="text-sm">
                    {selectedApplication.currentSituation}
                  </p>
                </div>

                {selectedApplication.reviewedBy && (
                  <div>
                    <h4 className="font-semibold mb-2">Review Information</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Reviewed By:</strong>{" "}
                        {selectedApplication.reviewedBy}
                      </p>
                      <p>
                        <strong>Review Date:</strong>{" "}
                        {selectedApplication.reviewDate}
                      </p>
                      <p>
                        <strong>Amount Approved:</strong> KSh{" "}
                        {selectedApplication.amountApproved?.toLocaleString() ||
                          "0"}
                      </p>
                      {selectedApplication.reviewNotes && (
                        <p>
                          <strong>Notes:</strong>{" "}
                          {selectedApplication.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => generateApplicationPDF(selectedApplication)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewDialog(false)}
                  >
                    Close
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
