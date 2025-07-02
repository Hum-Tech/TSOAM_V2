import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Download,
  User,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Building,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  UserCheck,
  UserX,
  UserMinus,
  Ban,
  PrinterIcon,
  RefreshCw,
  Calculator,
} from "lucide-react";
import { printTable, exportData } from "@/utils/printUtils";
import { cn } from "@/lib/utils";

// Enhanced Types for HR Management
interface Employee {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  nationalId: string;
  kraPin: string;
  nhifNumber: string;
  nssfNumber: string;
  department: string;
  position: string;
  employmentType: "Full-time" | "Part-time" | "Volunteer";
  employmentStatus: "Active" | "Suspended" | "Terminated" | "On Leave";
  hireDate: string;
  contractEndDate?: string;
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  education: string;
  skills: string[];
  performanceRating: number;
  lastReviewDate: string;
  nextReviewDate: string;
  leaveBalance: {
    annual: number;
    sick: number;
    maternity: number;
    paternity: number;
  };
  disciplinaryRecords: DisciplinaryRecord[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeaveRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType:
    | "Annual"
    | "Sick"
    | "Maternity"
    | "Paternity"
    | "Emergency"
    | "Study"
    | "Compassionate";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  attachments: string[];
}

interface PayrollRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  period: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  grossSalary: number;
  paye: number;
  sha: number;
  nssf: number;
  housingLevy: number;
  loan: number;
  otherDeductions: number;
  netSalary: number;
  processedDate: string;
  processedBy: string;
}

interface DisciplinaryRecord {
  id: number;
  type: "Warning" | "Suspension" | "Termination" | "Counseling";
  reason: string;
  date: string;
  actionTaken: string;
  issuedBy: string;
}

interface PerformanceReview {
  id: number;
  employeeId: string;
  reviewPeriod: string;
  goals: string[];
  achievements: string[];
  areasOfImprovement: string[];
  rating: number;
  comments: string;
  reviewDate: string;
  reviewedBy: string;
  nextReviewDate: string;
}

export default function HR() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<
    PerformanceReview[]
  >([]);

  // Dialog states
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showLeaveRequestDialog, setShowLeaveRequestDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showProcessPayrollDialog, setShowProcessPayrollDialog] =
    useState(false);
  const [payrollProcessing, setPayrollProcessing] = useState(false);
  const [showEmployeeDetailDialog, setShowEmployeeDetailDialog] =
    useState(false);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationalId: "",
    kraPin: "",
    nhifNumber: "",
    nssfNumber: "",
    department: "",
    position: "",
    employmentType: "",
    hireDate: "",
    basicSalary: "",
    housingAllowance: "",
    transportAllowance: "",
    medicalAllowance: "",
    otherAllowance: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    education: "",
    skills: "",
    documents: [] as File[],
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveType: "",
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
    attachments: [] as File[],
  });

  const [statusChangeForm, setStatusChangeForm] = useState({
    newStatus: "",
    reason: "",
    effectiveDate: "",
    notes: "",
  });

  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = () => {
    // Mock data - replace with actual API calls
    const mockEmployees: Employee[] = [
      {
        id: 1,
        employeeId: "TSOAM-EMP-001",
        fullName: "John Kamau",
        email: "john.kamau@tsoam.org",
        phone: "+254712345678",
        address: "123 Nairobi Street, Nairobi",
        dateOfBirth: "1985-03-15",
        gender: "Male",
        maritalStatus: "Married",
        nationalId: "12345678",
        kraPin: "A123456789X",
        nhifNumber: "NH123456",
        nssfNumber: "NS123456",
        department: "Administration",
        position: "Administrator",
        employmentType: "Full-time",
        employmentStatus: "Active",
        hireDate: "2020-01-15",
        basicSalary: 80000,
        allowances: {
          housing: 20000,
          transport: 10000,
          medical: 5000,
          other: 5000,
        },
        bankDetails: {
          bankName: "KCB Bank",
          accountNumber: "1234567890",
          branchCode: "001",
        },
        emergencyContact: {
          name: "Mary Kamau",
          relationship: "Wife",
          phone: "+254723456789",
        },
        education: "Bachelor's Degree in Business Administration",
        skills: ["Leadership", "Administration", "Communication"],
        performanceRating: 4.5,
        lastReviewDate: "2024-06-15",
        nextReviewDate: "2025-06-15",
        leaveBalance: {
          annual: 21,
          sick: 30,
          maternity: 90,
          paternity: 14,
        },
        disciplinaryRecords: [],
        isActive: true,
        createdAt: "2020-01-15T10:00:00Z",
        updatedAt: "2024-12-01T10:00:00Z",
      },
      {
        id: 2,
        employeeId: "TSOAM-EMP-002",
        fullName: "Grace Wanjiku",
        email: "grace.wanjiku@tsoam.org",
        phone: "+254798765432",
        address: "456 Mombasa Road, Nairobi",
        dateOfBirth: "1990-08-22",
        gender: "Female",
        maritalStatus: "Single",
        nationalId: "87654321",
        kraPin: "B987654321Y",
        nhifNumber: "NH654321",
        nssfNumber: "NS654321",
        department: "Finance",
        position: "Accountant",
        employmentType: "Full-time",
        employmentStatus: "Active",
        hireDate: "2021-03-01",
        basicSalary: 75000,
        allowances: {
          housing: 18000,
          transport: 8000,
          medical: 5000,
          other: 2000,
        },
        bankDetails: {
          bankName: "Equity Bank",
          accountNumber: "0987654321",
          branchCode: "002",
        },
        emergencyContact: {
          name: "Peter Wanjiku",
          relationship: "Brother",
          phone: "+254734567890",
        },
        education: "Bachelor's Degree in Accounting",
        skills: ["Accounting", "Financial Analysis", "Excel"],
        performanceRating: 4.2,
        lastReviewDate: "2024-08-01",
        nextReviewDate: "2025-08-01",
        leaveBalance: {
          annual: 18,
          sick: 25,
          maternity: 90,
          paternity: 0,
        },
        disciplinaryRecords: [],
        isActive: true,
        createdAt: "2021-03-01T10:00:00Z",
        updatedAt: "2024-12-01T10:00:00Z",
      },
      {
        id: 3,
        employeeId: "TSOAM-VOL-001",
        fullName: "David Mwangi",
        email: "david.mwangi@tsoam.org",
        phone: "+254745678901",
        address: "789 Kiambu Road, Kiambu",
        dateOfBirth: "1988-11-10",
        gender: "Male",
        maritalStatus: "Married",
        nationalId: "11223344",
        kraPin: "C112233445Z",
        nhifNumber: "NH112233",
        nssfNumber: "NS112233",
        department: "Youth Ministry",
        position: "Youth Coordinator",
        employmentType: "Volunteer",
        employmentStatus: "Active",
        hireDate: "2022-01-01",
        basicSalary: 0,
        allowances: {
          housing: 0,
          transport: 5000,
          medical: 0,
          other: 2000,
        },
        bankDetails: {
          bankName: "Co-operative Bank",
          accountNumber: "1122334455",
          branchCode: "003",
        },
        emergencyContact: {
          name: "Ruth Mwangi",
          relationship: "Wife",
          phone: "+254756789012",
        },
        education: "Diploma in Theology",
        skills: ["Youth Ministry", "Counseling", "Public Speaking"],
        performanceRating: 4.0,
        lastReviewDate: "2024-09-01",
        nextReviewDate: "2025-09-01",
        leaveBalance: {
          annual: 0,
          sick: 7,
          maternity: 0,
          paternity: 7,
        },
        disciplinaryRecords: [],
        isActive: true,
        createdAt: "2022-01-01T10:00:00Z",
        updatedAt: "2024-12-01T10:00:00Z",
      },
    ];

    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: 1,
        employeeId: "TSOAM-EMP-001",
        employeeName: "John Kamau",
        leaveType: "Annual",
        startDate: "2025-02-01",
        endDate: "2025-02-07",
        days: 7,
        reason: "Family vacation",
        status: "Pending",
        appliedDate: "2025-01-15",
        attachments: [],
      },
      {
        id: 2,
        employeeId: "TSOAM-EMP-002",
        employeeName: "Grace Wanjiku",
        leaveType: "Sick",
        startDate: "2025-01-10",
        endDate: "2025-01-12",
        days: 3,
        reason: "Medical treatment",
        status: "Approved",
        appliedDate: "2025-01-09",
        reviewedBy: "HR Manager",
        reviewedDate: "2025-01-09",
        reviewNotes: "Medical certificate provided",
        attachments: ["medical_certificate.pdf"],
      },
    ];

    setEmployees(mockEmployees);
    setLeaveRequests(mockLeaveRequests);
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || employee.employmentStatus === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { variant: "default" as const, icon: CheckCircle },
      Suspended: { variant: "destructive" as const, icon: UserMinus },
      Terminated: { variant: "destructive" as const, icon: UserX },
      "On Leave": { variant: "secondary" as const, icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || CheckCircle;

    return (
      <Badge
        variant={config?.variant || "secondary"}
        className="flex items-center gap-1"
      >
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getEmploymentTypeBadge = (type: string) => {
    const typeColors = {
      "Full-time": "bg-green-500 text-white",
      "Part-time": "bg-blue-500 text-white",
      Volunteer: "bg-purple-500 text-white",
    };

    return (
      <Badge
        className={
          typeColors[type as keyof typeof typeColors] ||
          "bg-gray-500 text-white"
        }
      >
        {type}
      </Badge>
    );
  };

  const handleAddEmployee = async () => {
    if (
      !employeeForm.fullName ||
      !employeeForm.email ||
      !employeeForm.department
    ) {
      alert("Please fill in required fields");
      return;
    }

    const employeeCount = employees.length + 1;
    const employeeId =
      employeeForm.employmentType === "Volunteer"
        ? `TSOAM-VOL-${employeeCount.toString().padStart(3, "0")}`
        : `TSOAM-EMP-${employeeCount.toString().padStart(3, "0")}`;

    const newEmployee: Employee = {
      id: employeeCount,
      employeeId,
      fullName: employeeForm.fullName,
      email: employeeForm.email,
      phone: employeeForm.phone,
      address: employeeForm.address,
      dateOfBirth: employeeForm.dateOfBirth,
      gender: employeeForm.gender as "Male" | "Female",
      maritalStatus: employeeForm.maritalStatus as any,
      nationalId: employeeForm.nationalId,
      kraPin: employeeForm.kraPin,
      nhifNumber: employeeForm.nhifNumber,
      nssfNumber: employeeForm.nssfNumber,
      department: employeeForm.department,
      position: employeeForm.position,
      employmentType: employeeForm.employmentType as any,
      employmentStatus: "Active",
      hireDate: employeeForm.hireDate,
      basicSalary: parseFloat(employeeForm.basicSalary) || 0,
      allowances: {
        housing: parseFloat(employeeForm.housingAllowance) || 0,
        transport: parseFloat(employeeForm.transportAllowance) || 0,
        medical: parseFloat(employeeForm.medicalAllowance) || 0,
        other: parseFloat(employeeForm.otherAllowance) || 0,
      },
      bankDetails: {
        bankName: employeeForm.bankName,
        accountNumber: employeeForm.accountNumber,
        branchCode: employeeForm.branchCode,
      },
      emergencyContact: {
        name: employeeForm.emergencyContactName,
        relationship: employeeForm.emergencyContactRelationship,
        phone: employeeForm.emergencyContactPhone,
      },
      education: employeeForm.education,
      skills: employeeForm.skills.split(",").map((s) => s.trim()),
      performanceRating: 0,
      lastReviewDate: "",
      nextReviewDate: "",
      leaveBalance: {
        annual:
          employeeForm.employmentType === "Full-time"
            ? 21
            : employeeForm.employmentType === "Part-time"
              ? 14
              : 0,
        sick: employeeForm.employmentType === "Volunteer" ? 7 : 30,
        maternity: 90,
        paternity: 14,
      },
      disciplinaryRecords: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEmployees([...employees, newEmployee]);

    // Upload documents if any
    if (employeeForm.documents && employeeForm.documents.length > 0) {
      try {
        const formData = new FormData();
        employeeForm.documents.forEach((file, index) => {
          formData.append("documents", file);
          formData.append(
            "document_types",
            index === 0
              ? "CV"
              : index === 1
                ? "ID"
                : index === 2
                  ? "Certificate"
                  : "Other",
          );
        });

        const response = await fetch(
          `/api/hr/employees/${newEmployee.id}/documents`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          console.error("Failed to upload documents");
        }
      } catch (error) {
        console.error("Document upload error:", error);
      }
    }

    // Reset form
    setEmployeeForm({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      nationalId: "",
      kraPin: "",
      nhifNumber: "",
      nssfNumber: "",
      department: "",
      position: "",
      employmentType: "",
      hireDate: "",
      basicSalary: "",
      housingAllowance: "",
      transportAllowance: "",
      medicalAllowance: "",
      otherAllowance: "",
      bankName: "",
      accountNumber: "",
      branchCode: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      education: "",
      skills: "",
      documents: [] as File[],
    });

    setShowAddEmployeeDialog(false);
    alert(
      `Employee ${newEmployee.fullName} added successfully with ID: ${employeeId}${employeeForm.documents.length > 0 ? ` and ${employeeForm.documents.length} document(s) uploaded` : ""}`,
    );
  };

  const handleLeaveRequest = () => {
    if (!leaveForm.employeeId || !leaveForm.leaveType || !leaveForm.reason) {
      alert("Please fill in required fields");
      return;
    }

    const employee = employees.find(
      (e) => e.employeeId === leaveForm.employeeId,
    );
    if (!employee) {
      alert("Employee not found");
      return;
    }

    const startDate = new Date(leaveForm.startDate);
    const endDate = new Date(leaveForm.endDate);
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    const newLeaveRequest: LeaveRequest = {
      id: leaveRequests.length + 1,
      employeeId: leaveForm.employeeId,
      employeeName: employee.fullName,
      leaveType: leaveForm.leaveType as any,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      days,
      reason: leaveForm.reason,
      status: "Pending",
      appliedDate: new Date().toISOString().split("T")[0],
      attachments: leaveForm.attachments.map((f) => f.name),
    };

    setLeaveRequests([...leaveRequests, newLeaveRequest]);

    // Reset form
    setLeaveForm({
      employeeId: "",
      leaveType: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
      attachments: [],
    });

    setShowLeaveRequestDialog(false);
    alert("Leave request submitted successfully!");
  };

  const handleStatusChange = () => {
    if (
      !selectedEmployee ||
      !statusChangeForm.newStatus ||
      !statusChangeForm.reason
    ) {
      alert("Please fill in required fields");
      return;
    }

    const updatedEmployees = employees.map((emp) =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            employmentStatus: statusChangeForm.newStatus as any,
            updatedAt: new Date().toISOString(),
          }
        : emp,
    );

    setEmployees(updatedEmployees);

    // Add disciplinary record if suspended or terminated
    if (
      statusChangeForm.newStatus === "Suspended" ||
      statusChangeForm.newStatus === "Terminated"
    ) {
      const disciplinaryRecord: DisciplinaryRecord = {
        id: Date.now(),
        type:
          statusChangeForm.newStatus === "Suspended"
            ? "Suspension"
            : "Termination",
        reason: statusChangeForm.reason,
        date:
          statusChangeForm.effectiveDate ||
          new Date().toISOString().split("T")[0],
        actionTaken:
          statusChangeForm.notes ||
          `Employee ${statusChangeForm.newStatus.toLowerCase()}`,
        issuedBy: "HR Manager", // In real app, this would be current user
      };

      const updatedEmployee = updatedEmployees.find(
        (e) => e.id === selectedEmployee.id,
      );
      if (updatedEmployee) {
        updatedEmployee.disciplinaryRecords.push(disciplinaryRecord);
      }
    }

    // Reset form and close dialog
    setStatusChangeForm({
      newStatus: "",
      reason: "",
      effectiveDate: "",
      notes: "",
    });
    setShowStatusChangeDialog(false);
    setSelectedEmployee(null);

    alert(
      `Employee status changed to ${statusChangeForm.newStatus} successfully!`,
    );
  };

  // Process payroll for all employees
  const handleProcessPayroll = async () => {
    setPayrollProcessing(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const activeEmployeeIds = employees
        .filter((emp) => emp.employmentStatus === "Active")
        .map((emp) => emp.id);

      const response = await fetch("/api/hr/payroll/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_ids: activeEmployeeIds,
          pay_period: currentMonth,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `Payroll processed successfully for ${result.processedCount} employees!`,
        );
        setShowProcessPayrollDialog(false);

        // Refresh payroll data
        const payrollResponse = await fetch(
          `/api/hr/payroll?pay_period=${currentMonth}`,
        );
        if (payrollResponse.ok) {
          const payrollData = await payrollResponse.json();
          setPayrollRecords(payrollData.data || []);
        }
      } else {
        alert(`Payroll processing failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Payroll processing error:", error);
      alert("Failed to process payroll. Please try again.");
    } finally {
      setPayrollProcessing(false);
    }
  };

  const generatePayslip = (employee: Employee) => {
    const grossSalary =
      employee.basicSalary +
      Object.values(employee.allowances).reduce((a, b) => a + b, 0);

    // Kenya tax calculations
    const paye = calculatePAYE(grossSalary);
    const sha = grossSalary * 0.0275; // 2.75% SHA
    const nssf = Math.min(grossSalary * 0.06, 2160); // 6% capped at KSH 2,160
    const housingLevy = grossSalary * 0.015; // 1.5% Housing Levy

    const totalDeductions = paye + sha + nssf + housingLevy;
    const netSalary = grossSalary - totalDeductions;

    const payslipData = {
      employee,
      period: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      basicSalary: employee.basicSalary,
      allowances: Object.values(employee.allowances).reduce((a, b) => a + b, 0),
      grossSalary,
      paye,
      sha,
      nssf,
      housingLevy,
      totalDeductions,
      netSalary,
      generatedDate: new Date().toLocaleDateString(),
    };

    // Generate and print payslip
    printPayslip(payslipData);
  };

  const calculatePAYE = (grossSalary: number): number => {
    // Kenya PAYE calculation for 2024/2025
    let paye = 0;
    const monthlyIncome = grossSalary;

    if (monthlyIncome <= 24000) {
      paye = monthlyIncome * 0.1; // 10%
    } else if (monthlyIncome <= 32333) {
      paye = 2400 + (monthlyIncome - 24000) * 0.25; // 25%
    } else if (monthlyIncome <= 500000) {
      paye = 2400 + 2083.25 + (monthlyIncome - 32333) * 0.3; // 30%
    } else if (monthlyIncome <= 800000) {
      paye = 2400 + 2083.25 + 140300.1 + (monthlyIncome - 500000) * 0.325; // 32.5%
    } else {
      paye =
        2400 + 2083.25 + 140300.1 + 97500 + (monthlyIncome - 800000) * 0.35; // 35%
    }

    // Personal relief
    paye -= 2400;
    return Math.max(0, paye);
  };

  const printPayslip = (payslipData: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Payslip - ${payslipData.employee.fullName}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; color: #2c5282; }
              .payslip-title { font-size: 18px; margin-top: 10px; }
              .employee-info { margin: 20px 0; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #f8f9fa; }
              .total-row { font-weight: bold; background-color: #e9ecef; }
              .amount { text-align: right; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="company-name">The Seed of Abraham Ministry (TSOAM)</div>
              <div>P.O. Box 12345, Nairobi, Kenya</div>
              <div>Email: admin@tsoam.org | Phone: +254 700 000 000</div>
              <div class="payslip-title">PAYSLIP FOR ${payslipData.period.toUpperCase()}</div>
          </div>

          <div class="employee-info">
              <table class="table">
                  <tr>
                      <td><strong>Employee Name:</strong></td>
                      <td>${payslipData.employee.fullName}</td>
                      <td><strong>Employee ID:</strong></td>
                      <td>${payslipData.employee.employeeId}</td>
                  </tr>
                  <tr>
                      <td><strong>Department:</strong></td>
                      <td>${payslipData.employee.department}</td>
                      <td><strong>Position:</strong></td>
                      <td>${payslipData.employee.position}</td>
                  </tr>
                  <tr>
                      <td><strong>KRA PIN:</strong></td>
                      <td>${payslipData.employee.kraPin}</td>
                      <td><strong>NSSF No:</strong></td>
                      <td>${payslipData.employee.nssfNumber}</td>
                  </tr>
                  <tr>
                      <td><strong>Bank:</strong></td>
                      <td>${payslipData.employee.bankDetails.bankName}</td>
                      <td><strong>Account No:</strong></td>
                      <td>${payslipData.employee.bankDetails.accountNumber}</td>
                  </tr>
              </table>
          </div>

          <table class="table">
              <thead>
                  <tr>
                      <th>EARNINGS</th>
                      <th class="amount">AMOUNT (KSH)</th>
                      <th>DEDUCTIONS</th>
                      <th class="amount">AMOUNT (KSH)</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Basic Salary</td>
                      <td class="amount">${payslipData.basicSalary.toLocaleString()}</td>
                      <td>P.A.Y.E</td>
                      <td class="amount">${payslipData.paye.toLocaleString()}</td>
                  </tr>
                  <tr>
                      <td>Housing Allowance</td>
                      <td class="amount">${payslipData.employee.allowances.housing.toLocaleString()}</td>
                      <td>S.H.A</td>
                      <td class="amount">${payslipData.sha.toLocaleString()}</td>
                  </tr>
                  <tr>
                      <td>Transport Allowance</td>
                      <td class="amount">${payslipData.employee.allowances.transport.toLocaleString()}</td>
                      <td>N.S.S.F</td>
                      <td class="amount">${payslipData.nssf.toLocaleString()}</td>
                  </tr>
                  <tr>
                      <td>Medical Allowance</td>
                      <td class="amount">${payslipData.employee.allowances.medical.toLocaleString()}</td>
                      <td>Housing Levy</td>
                      <td class="amount">${payslipData.housingLevy.toLocaleString()}</td>
                  </tr>
                  <tr>
                      <td>Other Allowances</td>
                      <td class="amount">${payslipData.employee.allowances.other.toLocaleString()}</td>
                      <td></td>
                      <td class="amount"></td>
                  </tr>
                  <tr class="total-row">
                      <td><strong>GROSS PAY</strong></td>
                      <td class="amount"><strong>${payslipData.grossSalary.toLocaleString()}</strong></td>
                      <td><strong>TOTAL DEDUCTIONS</strong></td>
                      <td class="amount"><strong>${payslipData.totalDeductions.toLocaleString()}</strong></td>
                  </tr>
                  <tr class="total-row" style="background-color: #28a745; color: white;">
                      <td colspan="3"><strong>NET PAY</strong></td>
                      <td class="amount"><strong>${payslipData.netSalary.toLocaleString()}</strong></td>
                  </tr>
              </tbody>
          </table>

          <div class="footer">
              <p>This is a computer-generated payslip and does not require a signature.</p>
              <p>Generated on: ${payslipData.generatedDate}</p>
              <p>© 2025 The Seed of Abraham Ministry. All rights reserved.</p>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(payslipHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const printLeaveForm = (leaveRequest?: LeaveRequest) => {
    const formData = leaveRequest || leaveForm;
    const employee = employees.find(
      (e) => e.employeeId === formData.employeeId,
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const leaveFormHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Leave Application Form</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; color: #2c5282; }
              .form-title { font-size: 18px; margin-top: 10px; }
              .form-section { margin: 20px 0; }
              .field { margin: 10px 0; }
              .field label { font-weight: bold; display: inline-block; width: 150px; }
              .field input { border: none; border-bottom: 1px solid #000; margin-left: 10px; }
              .signature-section { margin-top: 50px; }
              .signature-box { display: inline-block; width: 200px; border-bottom: 1px solid #000; margin: 0 20px; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="company-name">The Seed of Abraham Ministry (TSOAM)</div>
              <div>P.O. Box 12345, Nairobi, Kenya</div>
              <div class="form-title">LEAVE APPLICATION FORM</div>
          </div>

          <div class="form-section">
              <div class="field">
                  <label>Employee Name:</label>
                  <span>${employee?.fullName || "_________________________"}</span>
              </div>
              <div class="field">
                  <label>Employee ID:</label>
                  <span>${formData.employeeId || "_________________________"}</span>
              </div>
              <div class="field">
                  <label>Department:</label>
                  <span>${employee?.department || "_________________________"}</span>
              </div>
              <div class="field">
                  <label>Position:</label>
                  <span>${employee?.position || "_________________________"}</span>
              </div>
          </div>

          <div class="form-section">
              <div class="field">
                  <label>Leave Type:</label>
                  <span>${formData.leaveType || "_________________________"}</span>
              </div>
              <div class="field">
                  <label>Start Date:</label>
                  <span>${typeof formData.startDate === "string" ? formData.startDate : formData.startDate.toISOString().split("T")[0]}</span>
              </div>
              <div class="field">
                  <label>End Date:</label>
                  <span>${typeof formData.endDate === "string" ? formData.endDate : formData.endDate.toISOString().split("T")[0]}</span>
              </div>
              <div class="field">
                  <label>Number of Days:</label>
                  <span>${leaveRequest?.days || Math.ceil(((typeof formData.endDate === "string" ? new Date(formData.endDate) : formData.endDate).getTime() - (typeof formData.startDate === "string" ? new Date(formData.startDate) : formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}</span>
              </div>
              <div class="field">
                  <label>Reason for Leave:</label>
                  <div style="margin-top: 10px; border: 1px solid #000; padding: 10px; min-height: 60px;">
                      ${formData.reason || ""}
                  </div>
              </div>
          </div>

          <div class="signature-section">
              <div style="margin: 30px 0;">
                  <span>Employee Signature: </span>
                  <span class="signature-box"></span>
                  <span style="margin-left: 40px;">Date: </span>
                  <span class="signature-box"></span>
              </div>

              <div style="margin: 30px 0;">
                  <span>Supervisor Approval: </span>
                  <span class="signature-box"></span>
                  <span style="margin-left: 40px;">Date: </span>
                  <span class="signature-box"></span>
              </div>

              <div style="margin: 30px 0;">
                  <span>HR Approval: </span>
                  <span class="signature-box"></span>
                  <span style="margin-left: 40px;">Date: </span>
                  <span class="signature-box"></span>
              </div>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #6c757d;">
              <p>This form must be submitted at least 7 days before the leave commencement date.</p>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(leaveFormHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExport = (
    format: "excel" | "pdf",
    type: "employees" | "leave" | "payroll",
  ) => {
    let data: any[] = [];
    let filename = "";
    let title = "";

    switch (type) {
      case "employees":
        data = filteredEmployees.map((emp) => ({
          "Employee ID": emp.employeeId,
          "Full Name": emp.fullName,
          Email: emp.email,
          Department: emp.department,
          Position: emp.position,
          "Employment Type": emp.employmentType,
          Status: emp.employmentStatus,
          "Basic Salary": `KSH ${emp.basicSalary.toLocaleString()}`,
          "Hire Date": emp.hireDate,
        }));
        filename = `employees_${new Date().toISOString().split("T")[0]}`;
        title = "TSOAM - Employee Records";
        break;
      case "leave":
        data = leaveRequests.map((leave) => ({
          "Employee ID": leave.employeeId,
          "Employee Name": leave.employeeName,
          "Leave Type": leave.leaveType,
          "Start Date": leave.startDate,
          "End Date": leave.endDate,
          Days: leave.days,
          Status: leave.status,
          "Applied Date": leave.appliedDate,
        }));
        filename = `leave_requests_${new Date().toISOString().split("T")[0]}`;
        title = "TSOAM - Leave Requests";
        break;
      case "payroll":
        data = payrollRecords.map((payroll) => ({
          "Employee ID": payroll.employeeId,
          "Employee Name": payroll.employeeName,
          Period: payroll.period,
          "Basic Salary": `KSH ${payroll.basicSalary.toLocaleString()}`,
          "Gross Salary": `KSH ${payroll.grossSalary.toLocaleString()}`,
          PAYE: `KSH ${payroll.paye.toLocaleString()}`,
          NSSF: `KSH ${payroll.nssf.toLocaleString()}`,
          "Net Salary": `KSH ${payroll.netSalary.toLocaleString()}`,
        }));
        filename = `payroll_${new Date().toISOString().split("T")[0]}`;
        title = "TSOAM - Payroll Records";
        break;
    }

    if (format === "excel") {
      exportData(format, {
        filename,
        format,
        title,
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        data,
      });
    } else {
      printTable(
        data,
        title,
        `Generated on ${new Date().toLocaleDateString()}`,
      );
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (e) => e.employmentStatus === "Active",
  ).length;
  const pendingLeaves = leaveRequests.filter(
    (l) => l.status === "Pending",
  ).length;
  const monthlyPayroll = employees.reduce(
    (total, emp) =>
      total +
      emp.basicSalary +
      Object.values(emp.allowances).reduce((a, b) => a + b, 0),
    0,
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Human Resources</h1>
            <p className="text-muted-foreground">
              Comprehensive HR management system for TSOAM
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport("excel", "employees")}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Dialog
              open={showAddEmployeeDialog}
              onOpenChange={setShowAddEmployeeDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">All staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Leaves
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Payroll
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH {monthlyPayroll.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total monthly cost
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="leave">Leave Management</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            {/* Employee Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Administration">
                        Administration
                      </SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Youth Ministry">
                        Youth Ministry
                      </SelectItem>
                      <SelectItem value="Worship">Worship</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Employees Table */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.employeeId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {employee.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {employee.position}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          {getEmploymentTypeBadge(employee.employmentType)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(employee.employmentStatus)}
                        </TableCell>
                        <TableCell>
                          KSH {employee.basicSalary.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowEmployeeDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generatePayslip(employee)}
                            >
                              <PrinterIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowStatusChangeDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
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

          <TabsContent value="leave" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Leave Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage employee leave requests and approvals
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport("excel", "leave")}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog
                  open={showLeaveRequestDialog}
                  onOpenChange={setShowLeaveRequestDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Leave Request
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {leave.employeeName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {leave.employeeId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>
                          <div>
                            <div>
                              {leave.startDate} to {leave.endDate}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {leave.days} days
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              leave.status === "Approved"
                                ? "default"
                                : leave.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{leave.appliedDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => printLeaveForm(leave)}
                            >
                              <PrinterIcon className="h-4 w-4" />
                            </Button>
                            {leave.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Payroll Management</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and manage employee payslips
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport("excel", "payroll")}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Payroll
                </Button>
                <Button onClick={() => setShowProcessPayrollDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Payslip Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {employees
                    .filter((e) => e.employmentStatus === "Active")
                    .map((employee) => (
                      <Card
                        key={employee.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {employee.fullName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {employee.employeeId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {employee.department}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => generatePayslip(employee)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <PrinterIcon className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track employee performance and conduct reviews
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Performance management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Employee Dialog */}
        <Dialog
          open={showAddEmployeeDialog}
          onOpenChange={setShowAddEmployeeDialog}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
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
                      value={employeeForm.fullName}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={employeeForm.email}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={employeeForm.phone}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input
                      id="nationalId"
                      value={employeeForm.nationalId}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          nationalId: e.target.value,
                        })
                      }
                      placeholder="Enter national ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={employeeForm.gender}
                      onValueChange={(value) =>
                        setEmployeeForm({ ...employeeForm, gender: value })
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
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={employeeForm.dateOfBirth}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={employeeForm.address}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter physical address"
                    rows={2}
                  />
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Employment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={employeeForm.department}
                      onValueChange={(value) =>
                        setEmployeeForm({ ...employeeForm, department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administration">
                          Administration
                        </SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Youth Ministry">
                          Youth Ministry
                        </SelectItem>
                        <SelectItem value="Worship">Worship</SelectItem>
                        <SelectItem value="Children Ministry">
                          Children Ministry
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={employeeForm.position}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          position: e.target.value,
                        })
                      }
                      placeholder="Enter job position"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select
                      value={employeeForm.employmentType}
                      onValueChange={(value) =>
                        setEmployeeForm({
                          ...employeeForm,
                          employmentType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={employeeForm.hireDate}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          hireDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Salary & Benefits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary (KSH)</Label>
                    <Input
                      id="basicSalary"
                      type="number"
                      value={employeeForm.basicSalary}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          basicSalary: e.target.value,
                        })
                      }
                      placeholder="Enter basic salary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="housingAllowance">
                      Housing Allowance (KSH)
                    </Label>
                    <Input
                      id="housingAllowance"
                      type="number"
                      value={employeeForm.housingAllowance}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          housingAllowance: e.target.value,
                        })
                      }
                      placeholder="Enter housing allowance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transportAllowance">
                      Transport Allowance (KSH)
                    </Label>
                    <Input
                      id="transportAllowance"
                      type="number"
                      value={employeeForm.transportAllowance}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          transportAllowance: e.target.value,
                        })
                      }
                      placeholder="Enter transport allowance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalAllowance">
                      Medical Allowance (KSH)
                    </Label>
                    <Input
                      id="medicalAllowance"
                      type="number"
                      value={employeeForm.medicalAllowance}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          medicalAllowance: e.target.value,
                        })
                      }
                      placeholder="Enter medical allowance"
                    />
                  </div>
                </div>
              </div>

              {/* Government Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Government Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kraPin">KRA PIN</Label>
                    <Input
                      id="kraPin"
                      value={employeeForm.kraPin}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          kraPin: e.target.value,
                        })
                      }
                      placeholder="Enter KRA PIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nhifNumber">NHIF Number</Label>
                    <Input
                      id="nhifNumber"
                      value={employeeForm.nhifNumber}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          nhifNumber: e.target.value,
                        })
                      }
                      placeholder="Enter NHIF number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nssfNumber">NSSF Number</Label>
                    <Input
                      id="nssfNumber"
                      value={employeeForm.nssfNumber}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          nssfNumber: e.target.value,
                        })
                      }
                      placeholder="Enter NSSF number"
                    />
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Employee Documents</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documents">
                        Upload Documents (CV, ID, Certificates, Licenses)
                      </Label>
                      <Input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setEmployeeForm({
                            ...employeeForm,
                            documents: files,
                          });
                        }}
                      />
                      <div className="text-xs text-muted-foreground">
                        Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size:
                        10MB per file.
                      </div>
                      {employeeForm.documents &&
                        employeeForm.documents.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              Selected files:
                            </div>
                            {employeeForm.documents.map((file, index) => (
                              <div
                                key={index}
                                className="text-xs text-muted-foreground flex items-center gap-2"
                              >
                                <FileText className="h-3 w-3" />
                                {file.name} (
                                {(file.size / 1024 / 1024).toFixed(2)} MB)
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddEmployeeDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee}>Add Employee</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Leave Request Dialog */}
        <Dialog
          open={showLeaveRequestDialog}
          onOpenChange={setShowLeaveRequestDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveEmployee">Employee *</Label>
                <Select
                  value={leaveForm.employeeId}
                  onValueChange={(value) =>
                    setLeaveForm({ ...leaveForm, employeeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((e) => e.employmentStatus === "Active")
                      .map((employee) => (
                        <SelectItem
                          key={employee.employeeId}
                          value={employee.employeeId}
                        >
                          {employee.fullName} - {employee.employeeId}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={leaveForm.leaveType}
                  onValueChange={(value) =>
                    setLeaveForm({ ...leaveForm, leaveType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual">Annual Leave</SelectItem>
                    <SelectItem value="Sick">Sick Leave</SelectItem>
                    <SelectItem value="Maternity">Maternity Leave</SelectItem>
                    <SelectItem value="Paternity">Paternity Leave</SelectItem>
                    <SelectItem value="Emergency">Emergency Leave</SelectItem>
                    <SelectItem value="Study">Study Leave</SelectItem>
                    <SelectItem value="Compassionate">
                      Compassionate Leave
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={leaveForm.startDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setLeaveForm({
                        ...leaveForm,
                        startDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={leaveForm.endDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setLeaveForm({
                        ...leaveForm,
                        endDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveReason">Reason for Leave *</Label>
                <Textarea
                  id="leaveReason"
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  placeholder="Explain the reason for leave"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveRequestDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => printLeaveForm()}>
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print Form
                </Button>
                <Button onClick={handleLeaveRequest}>Submit Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employee Status Change Dialog */}
        <Dialog
          open={showStatusChangeDialog}
          onOpenChange={setShowStatusChangeDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Employee Status</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Employee Details</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Name:</strong> {selectedEmployee.fullName}
                    </div>
                    <div>
                      <strong>Employee ID:</strong>{" "}
                      {selectedEmployee.employeeId}
                    </div>
                    <div>
                      <strong>Current Status:</strong>{" "}
                      {selectedEmployee.employmentStatus}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newStatus">New Status *</Label>
                  <Select
                    value={statusChangeForm.newStatus}
                    onValueChange={(value) =>
                      setStatusChangeForm({
                        ...statusChangeForm,
                        newStatus: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(statusChangeForm.newStatus === "Suspended" ||
                  statusChangeForm.newStatus === "Terminated") && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This action will change the employee's status and create a
                      disciplinary record.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="statusReason">Reason *</Label>
                  <Textarea
                    id="statusReason"
                    value={statusChangeForm.reason}
                    onChange={(e) =>
                      setStatusChangeForm({
                        ...statusChangeForm,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Provide detailed reason for status change"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={statusChangeForm.effectiveDate}
                    onChange={(e) =>
                      setStatusChangeForm({
                        ...statusChangeForm,
                        effectiveDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statusNotes">Additional Notes</Label>
                  <Textarea
                    id="statusNotes"
                    value={statusChangeForm.notes}
                    onChange={(e) =>
                      setStatusChangeForm({
                        ...statusChangeForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Any additional information"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowStatusChangeDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStatusChange}
                    variant={
                      statusChangeForm.newStatus === "Terminated"
                        ? "destructive"
                        : "default"
                    }
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Employee Detail Dialog */}
        <Dialog
          open={showEmployeeDetailDialog}
          onOpenChange={setShowEmployeeDetailDialog}
        >
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                    <TabsTrigger value="salary">Salary</TabsTrigger>
                    <TabsTrigger value="leave">Leave</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <p className="text-sm">{selectedEmployee.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Employee ID
                        </Label>
                        <p className="text-sm">{selectedEmployee.employeeId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedEmployee.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{selectedEmployee.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p className="text-sm">{selectedEmployee.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Date of Birth
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.dateOfBirth}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <p className="text-sm">{selectedEmployee.address}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="employment" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Department
                        </Label>
                        <p className="text-sm">{selectedEmployee.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Position</Label>
                        <p className="text-sm">{selectedEmployee.position}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Employment Type
                        </Label>
                        {getEmploymentTypeBadge(
                          selectedEmployee.employmentType,
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        {getStatusBadge(selectedEmployee.employmentStatus)}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Hire Date</Label>
                        <p className="text-sm">{selectedEmployee.hireDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Performance Rating
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.performanceRating}/5.0
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="salary" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Basic Salary
                        </Label>
                        <p className="text-sm">
                          KSH {selectedEmployee.basicSalary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Housing Allowance
                        </Label>
                        <p className="text-sm">
                          KSH{" "}
                          {selectedEmployee.allowances.housing.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Transport Allowance
                        </Label>
                        <p className="text-sm">
                          KSH{" "}
                          {selectedEmployee.allowances.transport.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Medical Allowance
                        </Label>
                        <p className="text-sm">
                          KSH{" "}
                          {selectedEmployee.allowances.medical.toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">
                          Total Monthly Package
                        </Label>
                        <p className="text-lg font-semibold text-green-600">
                          KSH{" "}
                          {(
                            selectedEmployee.basicSalary +
                            Object.values(selectedEmployee.allowances).reduce(
                              (a, b) => a + b,
                              0,
                            )
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="leave" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Annual Leave Balance
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.leaveBalance.annual} days
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Sick Leave Balance
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.leaveBalance.sick} days
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Maternity Leave
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.leaveBalance.maternity} days
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Paternity Leave
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.leaveBalance.paternity} days
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => generatePayslip(selectedEmployee)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Generate Payslip
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Process Payroll Dialog */}
        <Dialog
          open={showProcessPayrollDialog}
          onOpenChange={setShowProcessPayrollDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Monthly Payroll</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium">Payroll Processing</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  This will process payroll for all active employees for the
                  current month ({new Date().toISOString().slice(0, 7)}).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Employees to be processed:</h4>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {employees
                    .filter((emp) => emp.employmentStatus === "Active")
                    .map((emp) => (
                      <div
                        key={emp.id}
                        className="flex justify-between items-center py-1 text-sm"
                      >
                        <span>
                          {emp.fullName} ({emp.employeeId})
                        </span>
                        <span className="text-green-600">
                          KSH {emp.basicSalary.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowProcessPayrollDialog(false)}
                  disabled={payrollProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessPayroll}
                  disabled={payrollProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {payrollProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Process Payroll
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
