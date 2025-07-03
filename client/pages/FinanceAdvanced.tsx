import React, { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Filter,
  Receipt,
  Building,
  BookOpen,
  Calculator,
  Target,
  PieChart,
  BarChart3,
  Euro,
  CreditCard,
  Banknote,
  Printer,
  Save,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Types for advanced accounting
interface AccountEntry {
  id: string;
  date: string;
  account: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  category: string;
  subCategory: string;
}

interface BalanceSheetItem {
  account: string;
  code: string;
  currentYear: number;
  previousYear: number;
  category: "assets" | "liabilities" | "equity";
  subCategory: string;
}

interface ProfitLossItem {
  account: string;
  code: string;
  currentPeriod: number;
  previousPeriod: number;
  budget: number;
  variance: number;
  category: "income" | "expense";
  subCategory: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  notes: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// TSOAM Service Summary Form interface
interface TSOAMServiceForm {
  id: string;
  date: string;
  theme: string;
  serviceType: string;
  minister: string;
  sermonTitle: string;
  attendance: {
    men: number;
    women: number;
    children: number;
    newComers: number;
    newConverts: number;
    cars: number;
  };
  sundaySchool: {
    teacher: string;
    attendance: number;
    offering: number;
    topic: string;
  };
  offerings: {
    wOffering: number;
    tithe: number;
    thanksgiving: number;
    sacrifice: number;
    till: number;
    sSchool: number;
    targeted: number;
    others: number;
  };
  cheques: Array<{
    number: string;
    amount: number;
    details: string;
  }>;
  foreignCurrency: number;
  otherAmounts: number;
  officials: {
    residentPastor: {
      name: string;
      date: string;
      signed: boolean;
    };
    churchAccountant: {
      name: string;
      date: string;
      signed: boolean;
    };
  };
  titheRecords: Array<{
    name: string;
    mode: string;
    amount: number;
  }>;
  expenses: Array<{
    particulars: string;
    unit: number;
    amount: number;
  }>;
  mpesaTill: number;
  comments: string;
}

// Original transaction and expense interfaces
interface Transaction {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string;
  status: "Pending" | "Completed" | "Cancelled";
  notes?: string;
}

interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  supplier: string;
  receiptNumber: string;
  status: "Pending" | "Approved" | "Paid";
  notes?: string;
}

// Service categories and types
const OFFERING_TYPES = [
  "Sunday Service Offering",
  "Wednesday Offering",
  "Tithe",
  "Thanksgiving",
  "Special Offering",
  "Building Fund",
  "Missions",
  "Others",
];

const EXPENSE_CATEGORIES = [
  "Utilities",
  "Office Supplies",
  "Maintenance",
  "Transportation",
  "Catering",
  "Equipment",
  "Ministry Expenses",
  "Others",
];

export default function FinanceAdvanced() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions");
  const [ledgerEntries, setLedgerEntries] = useState<AccountEntry[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetItem[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLossItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [tsoamForms, setTsoamForms] = useState<TSOAMServiceForm[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showTSOAMForm, setShowTSOAMForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "Income",
    category: "",
    description: "",
    amount: 0,
    currency: "KSH",
    paymentMethod: "Cash",
    reference: "",
    status: "Completed",
    notes: "",
  });

  const [newExpense, setNewExpense] = useState<Partial<ExpenseRecord>>({
    category: "",
    description: "",
    amount: 0,
    currency: "KSH",
    supplier: "",
    receiptNumber: "",
    status: "Pending",
    notes: "",
  });

  const [newTSOAMForm, setNewTSOAMForm] = useState<Partial<TSOAMServiceForm>>({
    date: new Date().toISOString().split("T")[0],
    theme: "",
    serviceType: "Sunday Service",
    minister: "",
    sermonTitle: "",
    attendance: {
      men: 0,
      women: 0,
      children: 0,
      newComers: 0,
      newConverts: 0,
      cars: 0,
    },
    sundaySchool: {
      teacher: "",
      attendance: 0,
      offering: 0,
      topic: "",
    },
    offerings: {
      wOffering: 0,
      tithe: 0,
      thanksgiving: 0,
      sacrifice: 0,
      till: 0,
      sSchool: 0,
      targeted: 0,
      others: 0,
    },
    cheques: [],
    foreignCurrency: 0,
    otherAmounts: 0,
    officials: {
      residentPastor: { name: "", date: "", signed: false },
      churchAccountant: { name: "", date: "", signed: false },
    },
    titheRecords: [],
    expenses: [],
    mpesaTill: 0,
    comments: "",
  });

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: "TXN001",
        date: "2024-01-15",
        type: "Income",
        category: "Sunday Service Offering",
        description: "Sunday Service Collection",
        amount: 15000,
        currency: "KSH",
        paymentMethod: "Cash",
        reference: "SS001",
        status: "Completed",
        notes: "Regular Sunday service offering",
      },
      {
        id: "TXN002",
        date: "2024-01-14",
        type: "Income",
        category: "Tithe",
        description: "Monthly Tithe Collection",
        amount: 25000,
        currency: "KSH",
        paymentMethod: "Mixed",
        reference: "TT001",
        status: "Completed",
        notes: "January tithe collection",
      },
    ];

    // Sample expenses
    const sampleExpenses: ExpenseRecord[] = [
      {
        id: "EXP001",
        date: "2024-01-16",
        category: "Utilities",
        description: "Electricity bill payment",
        amount: 8500,
        currency: "KSH",
        supplier: "Kenya Power",
        receiptNumber: "KP001234",
        status: "Paid",
        notes: "Monthly electricity bill",
      },
    ];

    // Sample ledger entries
    const sampleEntries: AccountEntry[] = [
      {
        id: "1",
        date: "2024-01-15",
        account: "Cash and Bank",
        accountCode: "1001",
        description: "Sunday Service Offering",
        debit: 15000,
        credit: 0,
        balance: 15000,
        reference: "SS001",
        category: "assets",
        subCategory: "current",
      },
      {
        id: "2",
        date: "2024-01-16",
        account: "Utilities Expense",
        accountCode: "5001",
        description: "Electricity bill payment",
        debit: 8500,
        credit: 0,
        balance: 8500,
        reference: "EXP001",
        category: "expenses",
        subCategory: "operating",
      },
    ];

    // Sample balance sheet
    const sampleBalanceSheet: BalanceSheetItem[] = [
      {
        account: "Cash and Cash Equivalents",
        code: "1110",
        currentYear: 150000,
        previousYear: 120000,
        category: "assets",
        subCategory: "current",
      },
      {
        account: "Accounts Receivable",
        code: "1120",
        currentYear: 25000,
        previousYear: 18000,
        category: "assets",
        subCategory: "current",
      },
      {
        account: "Property, Plant & Equipment",
        code: "1210",
        currentYear: 500000,
        previousYear: 500000,
        category: "assets",
        subCategory: "noncurrent",
      },
    ];

    // Sample P&L
    const sampleProfitLoss: ProfitLossItem[] = [
      {
        account: "Tithes and Offerings",
        code: "4100",
        currentPeriod: 180000,
        previousPeriod: 165000,
        budget: 200000,
        variance: -20000,
        category: "income",
        subCategory: "regular",
      },
      {
        account: "Salaries and Wages",
        code: "5110",
        currentPeriod: 96000,
        previousPeriod: 90000,
        budget: 100000,
        variance: 4000,
        category: "expense",
        subCategory: "personnel",
      },
    ];

    setTransactions(sampleTransactions);
    setExpenses(sampleExpenses);
    setLedgerEntries(sampleEntries);
    setBalanceSheet(sampleBalanceSheet);
    setProfitLoss(sampleProfitLoss);
  };

  // Handler functions
  const handleAddTransaction = () => {
    if (
      !newTransaction.category ||
      !newTransaction.amount ||
      !newTransaction.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const transaction: Transaction = {
      ...newTransaction,
      id: `TXN${String(transactions.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
    } as Transaction;

    setTransactions([transaction, ...transactions]);

    // Reset form
    setNewTransaction({
      type: "Income",
      category: "",
      description: "",
      amount: 0,
      currency: "KSH",
      paymentMethod: "Cash",
      reference: "",
      status: "Completed",
      notes: "",
    });
    setShowNewTransaction(false);
    alert("Transaction added successfully!");
  };

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.supplier) {
      alert("Please fill in all required fields");
      return;
    }

    const expense: ExpenseRecord = {
      ...newExpense,
      id: `EXP${String(expenses.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
    } as ExpenseRecord;

    setExpenses([expense, ...expenses]);

    // Reset form
    setNewExpense({
      category: "",
      description: "",
      amount: 0,
      currency: "KSH",
      supplier: "",
      receiptNumber: "",
      status: "Pending",
      notes: "",
    });
    setShowNewExpense(false);
    alert("Expense added successfully!");
  };

  const handleSubmitTSOAMForm = () => {
    if (
      !newTSOAMForm.theme ||
      !newTSOAMForm.minister ||
      !newTSOAMForm.sermonTitle
    ) {
      alert("Please fill in the required fields");
      return;
    }

    const form: TSOAMServiceForm = {
      ...newTSOAMForm,
      id: `SSF${String(tsoamForms.length + 1).padStart(3, "0")}`,
    } as TSOAMServiceForm;

    setTsoamForms([form, ...tsoamForms]);
    setShowTSOAMForm(false);
    alert("TSOAM Service Summary Form submitted successfully!");
  };

  const generateTSOAMFormPDF = (form: TSOAMServiceForm) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE SUMMARY FORM (SSF)", 105, 20, { align: "center" });
    doc.text("TSOAM", 105, 30, { align: "center" });

    // Theme and Service Info
    let yPos = 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`THEME: ${form.theme}`, 20, yPos);
    doc.text("ATTENDANCE - SUMMARY", 120, yPos);
    yPos += 10;

    doc.text(`DATE: ${form.date}`, 20, yPos);
    doc.text(`MEN: ${form.attendance.men}`, 120, yPos);
    doc.text(`NEW COMERS: ${form.attendance.newComers}`, 160, yPos);
    yPos += 8;

    doc.text(`SERVICE TYPE: ${form.serviceType}`, 20, yPos);
    doc.text(`WOMEN: ${form.attendance.women}`, 120, yPos);
    doc.text(`NEW CONVERTS: ${form.attendance.newConverts}`, 160, yPos);
    yPos += 8;

    doc.text(`MINISTER: ${form.minister}`, 20, yPos);
    doc.text(`CHILDREN: ${form.attendance.children}`, 120, yPos);
    yPos += 8;

    doc.text(`SERMON TITLE: ${form.sermonTitle}`, 20, yPos);
    doc.text(
      `TOTALS: ${form.attendance.men + form.attendance.women + form.attendance.children}`,
      120,
      yPos,
    );
    yPos += 8;

    doc.text(`CARS: ${form.attendance.cars}`, 120, yPos);
    yPos += 15;

    // Sunday School Section
    doc.setFont("helvetica", "bold");
    doc.text("SUNDAY SCHOOL", 20, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");

    doc.text(`Teacher: ${form.sundaySchool.teacher}`, 20, yPos);
    yPos += 6;
    doc.text(`Attendance: ${form.sundaySchool.attendance}`, 20, yPos);
    doc.text(
      `Offering: KSh ${form.sundaySchool.offering.toLocaleString()}`,
      80,
      yPos,
    );
    doc.text(`Topic: ${form.sundaySchool.topic}`, 140, yPos);
    yPos += 15;

    // Offering Section
    doc.setFont("helvetica", "bold");
    doc.text("OFFERING", 20, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");

    const offerings = [
      [
        `W.OFFERING: KSh ${form.offerings.wOffering.toLocaleString()}`,
        `TITHE: KSh ${form.offerings.tithe.toLocaleString()}`,
      ],
      [
        `THANKSGIVING: KSh ${form.offerings.thanksgiving.toLocaleString()}`,
        `SACRIFICE: KSh ${form.offerings.sacrifice.toLocaleString()}`,
      ],
      [
        `TILL: KSh ${form.offerings.till.toLocaleString()}`,
        `S.SCHOOL: KSh ${form.offerings.sSchool.toLocaleString()}`,
      ],
      [
        `TARGETED: KSh ${form.offerings.targeted.toLocaleString()}`,
        `OTHERS: KSh ${form.offerings.others.toLocaleString()}`,
      ],
    ];

    offerings.forEach(([left, right]) => {
      doc.text(left, 20, yPos);
      doc.text(right, 110, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Totals
    const totalCash = Object.values(form.offerings).reduce(
      (sum, val) => sum + val,
      0,
    );
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL SUMMARY AMOUNT`, 20, yPos);
    yPos += 8;
    doc.text(`Cash (a-h): KSh ${totalCash.toLocaleString()}`, 20, yPos);
    doc.text("CHEQUES", 110, yPos);
    yPos += 8;

    // Cheques
    if (form.cheques && form.cheques.length > 0) {
      form.cheques.forEach((cheque, index) => {
        doc.setFont("helvetica", "normal");
        doc.text(`CHQ. No: ${cheque.number}`, 20, yPos);
        doc.text(`Amount: KSh ${cheque.amount.toLocaleString()}`, 80, yPos);
        doc.text(`Details: ${cheque.details}`, 140, yPos);
        yPos += 6;
      });
    }

    yPos += 10;

    // Other amounts
    doc.text(
      `Foreign Currency: KSh ${form.foreignCurrency.toLocaleString()}`,
      20,
      yPos,
    );
    yPos += 6;
    doc.text(
      `Other Amounts: KSh ${form.otherAmounts.toLocaleString()}`,
      20,
      yPos,
    );
    yPos += 8;

    const grandTotal =
      totalCash +
      (form.cheques?.reduce((sum, chq) => sum + chq.amount, 0) || 0) +
      form.foreignCurrency +
      form.otherAmounts;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: KSh ${grandTotal.toLocaleString()}`, 20, yPos);
    yPos += 15;

    // Officials Section
    doc.text("OFFICIALS", 20, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");

    doc.text("RESIDENT PASTOR", 20, yPos);
    doc.text("Church Accountant", 120, yPos);
    yPos += 8;

    doc.text(`NAME: ${form.officials.residentPastor.name}`, 20, yPos);
    doc.text(`NAME: ${form.officials.churchAccountant.name}`, 120, yPos);
    yPos += 6;

    doc.text(`DATE: ${form.officials.residentPastor.date}`, 20, yPos);
    doc.text(`DATE: ${form.officials.churchAccountant.date}`, 120, yPos);
    yPos += 6;

    doc.text("SIGN: _______________", 20, yPos);
    doc.text("SIGN: _______________", 120, yPos);
    yPos += 8;

    doc.text("STAMP", 20, yPos);

    // Save PDF
    doc.save(`TSOAM_Service_Summary_${form.id}_${form.date}.pdf`);
  };

  // Export functions for advanced reports
  const exportBalanceSheet = (format: "excel" | "pdf") => {
    if (format === "excel") {
      const ws = XLSX.utils.json_to_sheet(balanceSheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");
      XLSX.writeFile(
        wb,
        `TSOAM_Balance_Sheet_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } else {
      generateBalanceSheetPDF();
    }
  };

  const exportProfitLoss = (format: "excel" | "pdf") => {
    if (format === "excel") {
      const ws = XLSX.utils.json_to_sheet(profitLoss);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
      XLSX.writeFile(
        wb,
        `TSOAM_Profit_Loss_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } else {
      generateProfitLossPDF();
    }
  };

  const exportLedger = (format: "excel" | "pdf") => {
    const filteredEntries = ledgerEntries;

    if (format === "excel") {
      const ws = XLSX.utils.json_to_sheet(filteredEntries);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "General Ledger");
      XLSX.writeFile(
        wb,
        `TSOAM_Ledger_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } else {
      generateLedgerPDF(filteredEntries);
    }
  };

  const generateBalanceSheetPDF = () => {
    const doc = new jsPDF();

    // Add church logo and header
    doc.setFontSize(20);
    doc.text("THE SEED OF ABRAHAM MINISTRY", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.text("BALANCE SHEET", 105, 30, { align: "center" });
    doc.setFontSize(12);
    doc.text(`As of ${new Date().toLocaleDateString()}`, 105, 40, {
      align: "center",
    });

    // Assets section
    let yPos = 60;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("ASSETS", 20, yPos);
    yPos += 10;

    const assetItems = balanceSheet.filter(
      (item) => item.category === "assets",
    );
    assetItems.forEach((item) => {
      doc.setFont(undefined, "normal");
      doc.text(item.account, 25, yPos);
      doc.text(item.currentYear.toLocaleString(), 150, yPos, {
        align: "right",
      });
      yPos += 8;
    });

    const totalAssets = assetItems.reduce(
      (sum, item) => sum + item.currentYear,
      0,
    );
    doc.setFont(undefined, "bold");
    doc.text("Total Assets", 25, yPos);
    doc.text(totalAssets.toLocaleString(), 150, yPos, { align: "right" });
    yPos += 20;

    // Liabilities section
    doc.text("LIABILITIES", 20, yPos);
    yPos += 10;

    const liabilityItems = balanceSheet.filter(
      (item) => item.category === "liabilities",
    );
    liabilityItems.forEach((item) => {
      doc.setFont(undefined, "normal");
      doc.text(item.account, 25, yPos);
      doc.text(item.currentYear.toLocaleString(), 150, yPos, {
        align: "right",
      });
      yPos += 8;
    });

    const totalLiabilities = liabilityItems.reduce(
      (sum, item) => sum + item.currentYear,
      0,
    );
    doc.setFont(undefined, "bold");
    doc.text("Total Liabilities", 25, yPos);
    doc.text(totalLiabilities.toLocaleString(), 150, yPos, { align: "right" });
    yPos += 20;

    // Equity section
    doc.text("EQUITY", 20, yPos);
    yPos += 10;

    const equityItems = balanceSheet.filter(
      (item) => item.category === "equity",
    );
    equityItems.forEach((item) => {
      doc.setFont(undefined, "normal");
      doc.text(item.account, 25, yPos);
      doc.text(item.currentYear.toLocaleString(), 150, yPos, {
        align: "right",
      });
      yPos += 8;
    });

    const totalEquity = equityItems.reduce(
      (sum, item) => sum + item.currentYear,
      0,
    );
    doc.setFont(undefined, "bold");
    doc.text("Total Equity", 25, yPos);
    doc.text(totalEquity.toLocaleString(), 150, yPos, { align: "right" });

    doc.save(
      `TSOAM_Balance_Sheet_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const generateProfitLossPDF = () => {
    const doc = new jsPDF();

    // Add church header
    doc.setFontSize(20);
    doc.text("THE SEED OF ABRAHAM MINISTRY", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.text("PROFIT & LOSS STATEMENT", 105, 30, { align: "center" });
    doc.setFontSize(12);
    doc.text(
      `For the period ending ${new Date().toLocaleDateString()}`,
      105,
      40,
      { align: "center" },
    );

    let yPos = 60;

    // Income section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("INCOME", 20, yPos);
    yPos += 10;

    const incomeItems = profitLoss.filter((item) => item.category === "income");
    incomeItems.forEach((item) => {
      doc.setFont(undefined, "normal");
      doc.text(item.account, 25, yPos);
      doc.text(item.currentPeriod.toLocaleString(), 150, yPos, {
        align: "right",
      });
      yPos += 8;
    });

    const totalIncome = incomeItems.reduce(
      (sum, item) => sum + item.currentPeriod,
      0,
    );
    doc.setFont(undefined, "bold");
    doc.text("Total Income", 25, yPos);
    doc.text(totalIncome.toLocaleString(), 150, yPos, { align: "right" });
    yPos += 20;

    // Expenses section
    doc.text("EXPENSES", 20, yPos);
    yPos += 10;

    const expenseItems = profitLoss.filter(
      (item) => item.category === "expense",
    );
    expenseItems.forEach((item) => {
      doc.setFont(undefined, "normal");
      doc.text(item.account, 25, yPos);
      doc.text(item.currentPeriod.toLocaleString(), 150, yPos, {
        align: "right",
      });
      yPos += 8;
    });

    const totalExpenses = expenseItems.reduce(
      (sum, item) => sum + item.currentPeriod,
      0,
    );
    doc.setFont(undefined, "bold");
    doc.text("Total Expenses", 25, yPos);
    doc.text(totalExpenses.toLocaleString(), 150, yPos, { align: "right" });
    yPos += 15;

    // Net income
    const netIncome = totalIncome - totalExpenses;
    doc.setFontSize(16);
    doc.text("NET INCOME", 25, yPos);
    doc.text(netIncome.toLocaleString(), 150, yPos, { align: "right" });

    doc.save(`TSOAM_Profit_Loss_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const generateLedgerPDF = (entries: AccountEntry[]) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("THE SEED OF ABRAHAM MINISTRY", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.text("GENERAL LEDGER", 105, 30, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, {
      align: "center",
    });

    // Create table data
    const tableData = entries.map((entry) => [
      entry.date,
      entry.description,
      entry.reference,
      entry.debit > 0 ? entry.debit.toLocaleString() : "",
      entry.credit > 0 ? entry.credit.toLocaleString() : "",
      entry.balance.toLocaleString(),
    ]);

    // Add table
    (doc as any).autoTable({
      head: [
        ["Date", "Description", "Reference", "Debit", "Credit", "Balance"],
      ],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`TSOAM_Ledger_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Invoice generation
  const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Header with logo
    doc.setFontSize(20);
    doc.text("THE SEED OF ABRAHAM MINISTRY", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.text("INVOICE", 105, 35, { align: "center" });

    // Invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 55);
    doc.text(`Date: ${invoice.date}`, 20, 65);
    doc.text(`Due Date: ${invoice.dueDate}`, 20, 75);

    // Client details
    doc.setFont(undefined, "bold");
    doc.text("Bill To:", 20, 95);
    doc.setFont(undefined, "normal");
    doc.text(invoice.client, 20, 105);
    doc.text(invoice.clientEmail, 20, 115);
    doc.text(invoice.clientAddress, 20, 125);

    // Items table
    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      `KSh ${item.unitPrice.toLocaleString()}`,
      `KSh ${item.amount.toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      head: [["Description", "Qty", "Unit Price", "Amount"]],
      body: tableData,
      startY: 140,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: KSh ${invoice.subtotal.toLocaleString()}`, 140, finalY);
    doc.text(`Tax: KSh ${invoice.tax.toLocaleString()}`, 140, finalY + 10);
    doc.setFont(undefined, "bold");
    doc.text(`Total: KSh ${invoice.total.toLocaleString()}`, 140, finalY + 20);

    if (invoice.notes) {
      doc.setFont(undefined, "normal");
      doc.text("Notes:", 20, finalY + 40);
      doc.text(invoice.notes, 20, finalY + 50);
    }

    doc.save(`TSOAM_Invoice_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <Layout>
      <PageHeader
        title="Church Finance Management"
        description="Complete financial management with TSOAM Service Summary Forms"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowNewTransaction(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            <Button onClick={() => setShowNewExpense(true)} variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button onClick={() => setShowTSOAMForm(true)} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              TSOAM Form
            </Button>
            <Button onClick={() => setShowNewInvoice(true)} variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh{" "}
                {transactions
                  .filter((t) => t.type === "Income")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.type === "Income").length}{" "}
                transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh{" "}
                {expenses
                  .reduce((sum, exp) => sum + exp.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} expense records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh{" "}
                {(
                  transactions
                    .filter((t) => t.type === "Income")
                    .reduce((sum, t) => sum + t.amount, 0) -
                  expenses.reduce((sum, exp) => sum + exp.amount, 0)
                ).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TSOAM Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tsoamForms.length}</div>
              <p className="text-xs text-muted-foreground">
                Service summary forms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="ledger">General Ledger</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="profit-loss">P&L Statement</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="tsoam-forms">TSOAM Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category} • {transaction.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +KSh {transaction.amount.toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {expenses.slice(0, 10).map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {expense.supplier}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            -KSh {expense.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant={
                              expense.status === "Paid"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {expense.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ledger" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Ledger</CardTitle>
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => exportLedger("excel")}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      onClick={() => exportLedger("pdf")}
                      variant="outline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.reference}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0
                            ? `KSh ${entry.debit.toLocaleString()}`
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0
                            ? `KSh ${entry.credit.toLocaleString()}`
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          KSh {entry.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance-sheet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportBalanceSheet("excel")}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => exportBalanceSheet("pdf")}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Assets */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">ASSETS</h3>
                    <div className="space-y-2">
                      {balanceSheet
                        .filter((item) => item.category === "assets")
                        .map((item) => (
                          <div key={item.code} className="flex justify-between">
                            <span>{item.account}</span>
                            <span>KSh {item.currentYear.toLocaleString()}</span>
                          </div>
                        ))}
                      <div className="border-t pt-2 font-bold flex justify-between">
                        <span>Total Assets</span>
                        <span>
                          KSh{" "}
                          {balanceSheet
                            .filter((item) => item.category === "assets")
                            .reduce((sum, item) => sum + item.currentYear, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">LIABILITIES</h3>
                    <div className="space-y-2">
                      {balanceSheet
                        .filter((item) => item.category === "liabilities")
                        .map((item) => (
                          <div key={item.code} className="flex justify-between">
                            <span>{item.account}</span>
                            <span>KSh {item.currentYear.toLocaleString()}</span>
                          </div>
                        ))}
                      <div className="border-t pt-2 font-bold flex justify-between">
                        <span>Total Liabilities</span>
                        <span>
                          KSh{" "}
                          {balanceSheet
                            .filter((item) => item.category === "liabilities")
                            .reduce((sum, item) => sum + item.currentYear, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Equity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">EQUITY</h3>
                    <div className="space-y-2">
                      {balanceSheet
                        .filter((item) => item.category === "equity")
                        .map((item) => (
                          <div key={item.code} className="flex justify-between">
                            <span>{item.account}</span>
                            <span>KSh {item.currentYear.toLocaleString()}</span>
                          </div>
                        ))}
                      <div className="border-t pt-2 font-bold flex justify-between">
                        <span>Total Equity</span>
                        <span>
                          KSh{" "}
                          {balanceSheet
                            .filter((item) => item.category === "equity")
                            .reduce((sum, item) => sum + item.currentYear, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit-loss" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportProfitLoss("excel")}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => exportProfitLoss("pdf")}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">
                        Current Period
                      </TableHead>
                      <TableHead className="text-right">
                        Previous Period
                      </TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">INCOME</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    {profitLoss
                      .filter((item) => item.category === "income")
                      .map((item) => (
                        <TableRow key={item.code}>
                          <TableCell className="pl-6">{item.account}</TableCell>
                          <TableCell className="text-right">
                            KSh {item.currentPeriod.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            KSh {item.previousPeriod.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            KSh {item.budget.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-right ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            KSh {item.variance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">EXPENSES</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    {profitLoss
                      .filter((item) => item.category === "expense")
                      .map((item) => (
                        <TableRow key={item.code}>
                          <TableCell className="pl-6">{item.account}</TableCell>
                          <TableCell className="text-right">
                            KSh {item.currentPeriod.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            KSh {item.previousPeriod.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            KSh {item.budget.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-right ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            KSh {item.variance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <Button onClick={() => setShowNewInvoice(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No invoices created yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.client}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>{invoice.dueDate}</TableCell>
                            <TableCell className="text-right">
                              KSh {invoice.total.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invoice.status === "paid"
                                    ? "default"
                                    : invoice.status === "overdue"
                                      ? "destructive"
                                      : invoice.status === "sent"
                                        ? "secondary"
                                        : "outline"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateInvoicePDF(invoice)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedInvoice(invoice)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tsoam-forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>TSOAM Service Summary Forms</CardTitle>
                <Button onClick={() => setShowTSOAMForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New TSOAM Form
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tsoamForms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No TSOAM Service Summary Forms created yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Form ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Service Type</TableHead>
                          <TableHead>Minister</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Total Offering</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tsoamForms.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell>{form.id}</TableCell>
                            <TableCell>{form.date}</TableCell>
                            <TableCell>{form.serviceType}</TableCell>
                            <TableCell>{form.minister}</TableCell>
                            <TableCell>
                              {form.attendance.men +
                                form.attendance.women +
                                form.attendance.children}
                            </TableCell>
                            <TableCell>
                              KSh{" "}
                              {Object.values(form.offerings)
                                .reduce((sum, val) => sum + val, 0)
                                .toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateTSOAMFormPDF(form)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => exportBalanceSheet("pdf")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Balance Sheet
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => exportProfitLoss("pdf")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Profit & Loss
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => exportLedger("pdf")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    General Ledger
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => exportBalanceSheet("excel")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <PieChart className="h-4 w-4 mr-2" />
                    Financial Analysis
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Trend Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Transaction Dialog */}
        <Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as "Income" | "Expense",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTransaction.type === "Income" &&
                        OFFERING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      {newTransaction.type === "Expense" &&
                        EXPENSE_CATEGORIES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  placeholder="Transaction description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (KSh)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={newTransaction.paymentMethod}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        paymentMethod: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={newTransaction.reference}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      reference: e.target.value,
                    })
                  }
                  placeholder="REF001"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newTransaction.notes}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTransaction(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTransaction}>Add Transaction</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expenseCategory">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier/Vendor</Label>
                  <Input
                    id="supplier"
                    value={newExpense.supplier}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, supplier: e.target.value })
                    }
                    placeholder="Supplier name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expenseDescription">Description</Label>
                <Input
                  id="expenseDescription"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  placeholder="Expense description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expenseAmount">Amount (KSh)</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        amount: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input
                    id="receiptNumber"
                    value={newExpense.receiptNumber}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        receiptNumber: e.target.value,
                      })
                    }
                    placeholder="Receipt #"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expenseNotes">Notes</Label>
                <Textarea
                  id="expenseNotes"
                  value={newExpense.notes}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewExpense(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* TSOAM Service Summary Form Dialog */}
        <Dialog open={showTSOAMForm} onOpenChange={setShowTSOAMForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>TSOAM Service Summary Form (SSF)</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Service Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTSOAMForm.date}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Input
                      id="theme"
                      value={newTSOAMForm.theme}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          theme: e.target.value,
                        })
                      }
                      placeholder="Service theme"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={newTSOAMForm.serviceType}
                      onValueChange={(value) =>
                        setNewTSOAMForm({ ...newTSOAMForm, serviceType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sunday Service">
                          Sunday Service
                        </SelectItem>
                        <SelectItem value="Wednesday Service">
                          Wednesday Service
                        </SelectItem>
                        <SelectItem value="Special Service">
                          Special Service
                        </SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="minister">Minister</Label>
                    <Input
                      id="minister"
                      value={newTSOAMForm.minister}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          minister: e.target.value,
                        })
                      }
                      placeholder="Minister name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="sermonTitle">Sermon Title</Label>
                    <Input
                      id="sermonTitle"
                      value={newTSOAMForm.sermonTitle}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          sermonTitle: e.target.value,
                        })
                      }
                      placeholder="Sermon title"
                    />
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Attendance Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="men">Men</Label>
                    <Input
                      id="men"
                      type="number"
                      value={newTSOAMForm.attendance?.men || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          attendance: {
                            ...newTSOAMForm.attendance!,
                            men: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="women">Women</Label>
                    <Input
                      id="women"
                      type="number"
                      value={newTSOAMForm.attendance?.women || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          attendance: {
                            ...newTSOAMForm.attendance!,
                            women: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="children">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      value={newTSOAMForm.attendance?.children || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          attendance: {
                            ...newTSOAMForm.attendance!,
                            children: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="newComers">New Comers</Label>
                    <Input
                      id="newComers"
                      type="number"
                      value={newTSOAMForm.attendance?.newComers || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          attendance: {
                            ...newTSOAMForm.attendance!,
                            newComers: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="newConverts">New Converts</Label>
                    <Input
                      id="newConverts"
                      type="number"
                      value={newTSOAMForm.attendance?.newConverts || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          attendance: {
                            ...newTSOAMForm.attendance!,
                            newConverts: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cars">Cars</Label>
                    <Input
                      id="cars"
                      type="number"
                      value={newTSOAMForm.attendance?.cars || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          attendance: {
                            ...newTSOAMForm.attendance!,
                            cars: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Offerings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Offerings</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="wOffering">W.Offering (KSh)</Label>
                    <Input
                      id="wOffering"
                      type="number"
                      value={newTSOAMForm.offerings?.wOffering || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            wOffering: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tithe">Tithe (KSh)</Label>
                    <Input
                      id="tithe"
                      type="number"
                      value={newTSOAMForm.offerings?.tithe || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            tithe: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="thanksgiving">Thanksgiving (KSh)</Label>
                    <Input
                      id="thanksgiving"
                      type="number"
                      value={newTSOAMForm.offerings?.thanksgiving || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            thanksgiving: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sacrifice">Sacrifice (KSh)</Label>
                    <Input
                      id="sacrifice"
                      type="number"
                      value={newTSOAMForm.offerings?.sacrifice || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            sacrifice: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="till">Till (KSh)</Label>
                    <Input
                      id="till"
                      type="number"
                      value={newTSOAMForm.offerings?.till || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            till: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sSchool">S.School (KSh)</Label>
                    <Input
                      id="sSchool"
                      type="number"
                      value={newTSOAMForm.offerings?.sSchool || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            sSchool: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="targeted">Targeted (KSh)</Label>
                    <Input
                      id="targeted"
                      type="number"
                      value={newTSOAMForm.offerings?.targeted || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            targeted: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="others">Others (KSh)</Label>
                    <Input
                      id="others"
                      type="number"
                      value={newTSOAMForm.offerings?.others || 0}
                      onChange={(e) =>
                        setNewTSOAMForm({
                          ...newTSOAMForm,
                          offerings: {
                            ...newTSOAMForm.offerings!,
                            others: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Officials */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Officials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Resident Pastor</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Pastor Name"
                        value={
                          newTSOAMForm.officials?.residentPastor.name || ""
                        }
                        onChange={(e) =>
                          setNewTSOAMForm({
                            ...newTSOAMForm,
                            officials: {
                              ...newTSOAMForm.officials!,
                              residentPastor: {
                                ...newTSOAMForm.officials!.residentPastor,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <Input
                        type="date"
                        value={
                          newTSOAMForm.officials?.residentPastor.date || ""
                        }
                        onChange={(e) =>
                          setNewTSOAMForm({
                            ...newTSOAMForm,
                            officials: {
                              ...newTSOAMForm.officials!,
                              residentPastor: {
                                ...newTSOAMForm.officials!.residentPastor,
                                date: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Church Accountant</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Accountant Name"
                        value={
                          newTSOAMForm.officials?.churchAccountant.name || ""
                        }
                        onChange={(e) =>
                          setNewTSOAMForm({
                            ...newTSOAMForm,
                            officials: {
                              ...newTSOAMForm.officials!,
                              churchAccountant: {
                                ...newTSOAMForm.officials!.churchAccountant,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <Input
                        type="date"
                        value={
                          newTSOAMForm.officials?.churchAccountant.date || ""
                        }
                        onChange={(e) =>
                          setNewTSOAMForm({
                            ...newTSOAMForm,
                            officials: {
                              ...newTSOAMForm.officials!,
                              churchAccountant: {
                                ...newTSOAMForm.officials!.churchAccountant,
                                date: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTSOAMForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitTSOAMForm}>Submit Form</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Invoice Dialog */}
        <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client Name</Label>
                  <Input id="client" placeholder="Client name" />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea id="clientAddress" placeholder="Client address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input id="invoiceDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" placeholder="INV-001" />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <Label>Invoice Items</Label>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-5 gap-2">
                    <Input placeholder="Description" />
                    <Input placeholder="Qty" type="number" />
                    <Input placeholder="Unit Price" type="number" />
                    <Input placeholder="Amount" type="number" disabled />
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewInvoice(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowNewInvoice(false)}>
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
