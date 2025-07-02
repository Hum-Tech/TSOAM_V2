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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Download,
  Edit,
  Eye,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  DollarSign,
  Gift,
  Recycle,
  BarChart3,
  Calendar,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { printTable, exportData } from "@/utils/printUtils";

// Types for inventory management
interface InventoryItem {
  id: number;
  itemCode: string;
  serialNumber: string;
  itemName: string;
  category: string;
  brand: string;
  model: string;
  description: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  supplier: string;
  warranty: string;
  location: string;
  assignedTo: string;
  status: "Working" | "Faulty" | "Under Maintenance" | "Missing" | "Disposed";
  condition: "Excellent" | "Good" | "Fair" | "Poor" | "Damaged";
  maintenanceSchedule: string;
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
  qrCode: string;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRecord {
  id: number;
  itemId: number;
  type: "Routine" | "Repair" | "Replacement" | "Inspection";
  description: string;
  cost: number;
  performedBy: string;
  performedDate: string;
  nextDueDate: string;
  status: "Completed" | "Pending" | "In Progress";
}

interface DisposalRecord {
  id: number;
  itemId: number;
  reason: "End of Life" | "Irreparable" | "Obsolete" | "Lost" | "Stolen";
  disposalMethod: "Repair" | "Sell" | "Donate" | "Scrap" | "Return to Supplier";
  disposalDate: string;
  disposalValue: number;
  authorizedBy: string;
  recipient: string;
  notes: string;
}

const categories = [
  "Audio Equipment",
  "Video Equipment",
  "Musical Instruments",
  "Furniture",
  "Office Equipment",
  "Kitchen Equipment",
  "Cleaning Equipment",
  "Security Equipment",
  "Lighting",
  "HVAC",
  "Electronics",
  "Vehicles",
  "Books & Publications",
  "Decorations",
  "Other",
];

const locations = [
  "Main Sanctuary",
  "Fellowship Hall",
  "Pastor's Office",
  "Admin Office",
  "Kitchen",
  "Children's Room",
  "Youth Room",
  "Prayer Room",
  "Storage Room",
  "Parking Lot",
  "Outdoor",
  "Off-site",
];

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Dialog states
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showDisposalDialog, setShowDisposalDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    itemName: "",
    category: "",
    brand: "",
    model: "",
    description: "",
    purchaseDate: "",
    purchasePrice: "",
    supplier: "",
    warranty: "",
    location: "",
    assignedTo: "",
    serialNumber: "",
    notes: "",
    tags: [] as string[],
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    type: "",
    description: "",
    cost: "",
    performedBy: "",
    performedDate: "",
    nextDueDate: "",
  });

  const [disposalForm, setDisposalForm] = useState({
    reason: "",
    disposalMethod: "",
    disposalDate: "",
    disposalValue: "",
    authorizedBy: "",
    recipient: "",
    notes: "",
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    // Mock data - replace with actual API calls
    const mockItems: InventoryItem[] = [
      {
        id: 1,
        itemCode: "AUD-001",
        serialNumber: "YAMAHA123456",
        itemName: "Yamaha Mixer",
        category: "Audio Equipment",
        brand: "Yamaha",
        model: "MG16XU",
        description: "16-channel analog mixer with USB connectivity",
        purchaseDate: "2023-01-15",
        purchasePrice: 85000,
        currentValue: 70000,
        supplier: "Music Store Kenya",
        warranty: "2 years",
        location: "Main Sanctuary",
        assignedTo: "Audio Team",
        status: "Working",
        condition: "Good",
        maintenanceSchedule: "Quarterly",
        lastMaintenance: "2024-10-01",
        nextMaintenance: "2025-01-01",
        notes: "Primary mixer for Sunday services",
        qrCode: "QR001",
        images: [],
        tags: ["audio", "mixer", "main"],
        createdAt: "2023-01-15T10:00:00Z",
        updatedAt: "2024-12-01T10:00:00Z",
      },
      {
        id: 2,
        itemCode: "FUR-001",
        serialNumber: "CHAIR001",
        itemName: "Plastic Chairs",
        category: "Furniture",
        brand: "Tuffoam",
        model: "Standard",
        description: "White plastic chairs for congregation seating",
        purchaseDate: "2022-06-10",
        purchasePrice: 150000,
        currentValue: 120000,
        supplier: "Furniture World",
        warranty: "1 year",
        location: "Main Sanctuary",
        assignedTo: "General Use",
        status: "Working",
        condition: "Good",
        maintenanceSchedule: "As needed",
        lastMaintenance: "2024-08-15",
        nextMaintenance: "2025-06-10",
        notes: "100 pieces purchased",
        qrCode: "QR002",
        images: [],
        tags: ["furniture", "seating"],
        createdAt: "2022-06-10T10:00:00Z",
        updatedAt: "2024-08-15T10:00:00Z",
      },
      {
        id: 3,
        itemCode: "MUS-001",
        serialNumber: "GUITAR2024",
        itemName: "Acoustic Guitar",
        category: "Musical Instruments",
        brand: "Yamaha",
        model: "F280",
        description: "6-string acoustic guitar for worship team",
        purchaseDate: "2024-03-20",
        purchasePrice: 25000,
        currentValue: 22000,
        supplier: "Musical Instruments Ltd",
        warranty: "6 months",
        location: "Main Sanctuary",
        assignedTo: "Worship Team",
        status: "Faulty",
        condition: "Fair",
        maintenanceSchedule: "Monthly",
        lastMaintenance: "2024-11-01",
        nextMaintenance: "2024-12-01",
        notes: "Needs string replacement",
        qrCode: "QR003",
        images: [],
        tags: ["music", "guitar", "worship"],
        createdAt: "2024-03-20T10:00:00Z",
        updatedAt: "2024-11-15T10:00:00Z",
      },
    ];

    setItems(mockItems);

    // Mock maintenance records
    const mockMaintenance: MaintenanceRecord[] = [
      {
        id: 1,
        itemId: 1,
        type: "Routine",
        description: "Quarterly cleaning and calibration",
        cost: 5000,
        performedBy: "Tech Team",
        performedDate: "2024-10-01",
        nextDueDate: "2025-01-01",
        status: "Completed",
      },
      {
        id: 2,
        itemId: 3,
        type: "Repair",
        description: "String replacement needed",
        cost: 2000,
        performedBy: "Music Team",
        performedDate: "",
        nextDueDate: "2024-12-01",
        status: "Pending",
      },
    ];

    setMaintenanceRecords(mockMaintenance);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesLocation =
      locationFilter === "all" || item.location === locationFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Working: { variant: "default" as const, icon: CheckCircle },
      Faulty: { variant: "destructive" as const, icon: AlertTriangle },
      "Under Maintenance": { variant: "default" as const, icon: Wrench },
      Missing: { variant: "destructive" as const, icon: XCircle },
      Disposed: { variant: "secondary" as const, icon: XCircle },
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

  const getConditionBadge = (condition: string) => {
    const conditionColors = {
      Excellent: "bg-green-500",
      Good: "bg-blue-500",
      Fair: "bg-yellow-500",
      Poor: "bg-orange-500",
      Damaged: "bg-red-500",
    };

    return (
      <Badge
        className={`${conditionColors[condition as keyof typeof conditionColors]} text-white`}
      >
        {condition}
      </Badge>
    );
  };

  const handleAddItem = () => {
    if (!itemForm.itemName || !itemForm.category) {
      alert("Please fill in required fields");
      return;
    }

    const itemCount = items.length + 1;
    const itemCode = `${itemForm.category.substring(0, 3).toUpperCase()}-${itemCount.toString().padStart(3, "0")}`;
    const serialNumber =
      itemForm.serialNumber || `SN${Date.now().toString().slice(-6)}`;

    const newItem: InventoryItem = {
      id: itemCount,
      itemCode,
      serialNumber,
      ...itemForm,
      purchasePrice: parseFloat(itemForm.purchasePrice) || 0,
      currentValue: parseFloat(itemForm.purchasePrice) || 0,
      status: "Working",
      condition: "Good",
      maintenanceSchedule: "As needed",
      lastMaintenance: "",
      nextMaintenance: "",
      qrCode: `QR${itemCount.toString().padStart(3, "0")}`,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    setItemForm({
      itemName: "",
      category: "",
      brand: "",
      model: "",
      description: "",
      purchaseDate: "",
      purchasePrice: "",
      supplier: "",
      warranty: "",
      location: "",
      assignedTo: "",
      serialNumber: "",
      notes: "",
      tags: [],
    });
    setShowAddItemDialog(false);
  };

  const handleStatusChange = (item: InventoryItem, newStatus: string) => {
    const updatedItems = items.map((i) =>
      i.id === item.id ? { ...i, status: newStatus as any } : i,
    );
    setItems(updatedItems);

    if (newStatus === "Faulty" || newStatus === "Under Maintenance") {
      setSelectedItem({ ...item, status: newStatus as any });
      setShowMaintenanceDialog(true);
    } else if (newStatus === "Disposed") {
      setSelectedItem({ ...item, status: newStatus as any });
      setShowDisposalDialog(true);
    }
  };

  const handleMaintenanceSubmit = () => {
    if (
      !maintenanceForm.type ||
      !maintenanceForm.description ||
      !selectedItem
    ) {
      alert("Please select an item and fill in required fields");
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: maintenanceRecords.length + 1,
      itemId: selectedItem.id,
      type: maintenanceForm.type as any,
      description: maintenanceForm.description,
      cost: parseFloat(maintenanceForm.cost) || 0,
      performedBy: maintenanceForm.performedBy,
      performedDate: maintenanceForm.performedDate,
      nextDueDate: maintenanceForm.nextDueDate,
      status: "Completed",
    };

    setMaintenanceRecords([...maintenanceRecords, newRecord]);

    // Update item status if it's under maintenance
    if (maintenanceForm.type === "Repair") {
      const updatedItems = items.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status: "Under Maintenance" as any,
              lastMaintenance: maintenanceForm.performedDate,
            }
          : item,
      );
      setItems(updatedItems);
    }

    setMaintenanceForm({
      type: "",
      description: "",
      cost: "",
      performedBy: "",
      performedDate: "",
      nextDueDate: "",
    });
    setShowMaintenanceDialog(false);
    setSelectedItem(null);
    alert("Maintenance record added successfully!");
  };

  const handleDisposalSubmit = () => {
    if (!disposalForm.reason || !disposalForm.disposalMethod || !selectedItem) {
      alert("Please select an item and fill in required fields");
      return;
    }

    const newRecord: DisposalRecord = {
      id: disposalRecords.length + 1,
      itemId: selectedItem.id,
      reason: disposalForm.reason as any,
      disposalMethod: disposalForm.disposalMethod as any,
      disposalDate: disposalForm.disposalDate,
      disposalValue: parseFloat(disposalForm.disposalValue) || 0,
      authorizedBy: disposalForm.authorizedBy,
      recipient: disposalForm.recipient,
      notes: disposalForm.notes,
    };

    setDisposalRecords([...disposalRecords, newRecord]);

    // Update item status to disposed
    const updatedItems = items.map((item) =>
      item.id === selectedItem.id
        ? { ...item, status: "Disposed" as any }
        : item,
    );
    setItems(updatedItems);

    setDisposalForm({
      reason: "",
      disposalMethod: "",
      disposalDate: "",
      disposalValue: "",
      authorizedBy: "",
      recipient: "",
      notes: "",
    });
    setShowDisposalDialog(false);
    setSelectedItem(null);
    alert("Disposal record added successfully!");
  };

  const handleExport = (format: "excel" | "pdf") => {
    const inventoryData = filteredItems.map((item) => ({
      "Item Code": item.itemCode,
      "Serial Number": item.serialNumber,
      "Item Name": item.itemName,
      Category: item.category,
      Brand: item.brand,
      Model: item.model,
      Status: item.status,
      Condition: item.condition,
      Location: item.location,
      "Assigned To": item.assignedTo,
      "Purchase Date": item.purchaseDate,
      "Purchase Price": `KSH ${item.purchasePrice.toLocaleString()}`,
      "Current Value": `KSH ${item.currentValue.toLocaleString()}`,
    }));

    if (format === "excel") {
      exportData(format, {
        filename: `inventory_report_${new Date().toISOString().split("T")[0]}`,
        format,
        title: "TSOAM - Inventory Report",
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        data: inventoryData,
      });
    } else {
      const columns = [
        { key: "Item Code", title: "Item Code" },
        { key: "Serial Number", title: "Serial Number" },
        { key: "Item Name", title: "Item Name" },
        { key: "Category", title: "Category" },
        { key: "Brand", title: "Brand" },
        { key: "Model", title: "Model" },
        { key: "Status", title: "Status" },
        { key: "Condition", title: "Condition" },
        { key: "Location", title: "Location" },
        { key: "Assigned To", title: "Assigned To" },
        { key: "Purchase Date", title: "Purchase Date" },
        {
          key: "Purchase Price",
          title: "Purchase Price",
          align: "right" as const,
        },
        {
          key: "Current Value",
          title: "Current Value",
          align: "right" as const,
        },
      ];

      printTable(inventoryData, columns, "TSOAM - Inventory Report", {
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      });
    }
  };

  const totalItems = items.length;
  const workingItems = items.filter((item) => item.status === "Working").length;
  const faultyItems = items.filter((item) => item.status === "Faulty").length;
  const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage and track all church assets and equipment
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={showMaintenanceDialog}
              onOpenChange={setShowMaintenanceDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Wrench className="h-4 w-4 mr-2" />
                  Record Maintenance
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog
              open={showDisposalDialog}
              onOpenChange={setShowDisposalDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Recycle className="h-4 w-4 mr-2" />
                  Record Disposal
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button
              onClick={() => handleExport("excel")}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => handleExport("pdf")}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Dialog
              open={showAddItemDialog}
              onOpenChange={setShowAddItemDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Tracked assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workingItems}</div>
              <p className="text-xs text-muted-foreground">
                {totalItems > 0
                  ? `${((workingItems / totalItems) * 100).toFixed(1)}% operational`
                  : "No items"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Needs Attention
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faultyItems}</div>
              <p className="text-xs text-muted-foreground">
                Faulty or maintenance required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH {totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current valuation</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="disposal">Disposal Records</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Working">Working</SelectItem>
                      <SelectItem value="Faulty">Faulty</SelectItem>
                      <SelectItem value="Under Maintenance">
                        Under Maintenance
                      </SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.itemCode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.brand} {item.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {getConditionBadge(item.condition)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          KSH {item.currentValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Select
                              onValueChange={(value) =>
                                handleStatusChange(item, value)
                              }
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Working">Working</SelectItem>
                                <SelectItem value="Faulty">Faulty</SelectItem>
                                <SelectItem value="Under Maintenance">
                                  Maintenance
                                </SelectItem>
                                <SelectItem value="Missing">Missing</SelectItem>
                                <SelectItem value="Disposed">
                                  Disposed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceRecords.map((record) => {
                      const item = items.find((i) => i.id === record.itemId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {item?.itemName} ({item?.itemCode})
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.type}</Badge>
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>
                            KSH {record.cost.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {record.performedDate || "Pending"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.status === "Completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disposal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Disposal Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Authorized By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disposalRecords.map((record) => {
                      const item = items.find((i) => i.id === record.itemId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {item?.itemName} ({item?.itemCode})
                          </TableCell>
                          <TableCell>{record.reason}</TableCell>
                          <TableCell>{record.disposalMethod}</TableCell>
                          <TableCell>
                            KSH {record.disposalValue.toLocaleString()}
                          </TableCell>
                          <TableCell>{record.disposalDate}</TableCell>
                          <TableCell>{record.authorizedBy}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport("excel")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Excel Report
                  </Button>
                  <Button variant="outline" onClick={() => handleExport("pdf")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={itemForm.itemName}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, itemName: e.target.value })
                    }
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={itemForm.category}
                    onValueChange={(value) =>
                      setItemForm({ ...itemForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={itemForm.brand}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, brand: e.target.value })
                    }
                    placeholder="Enter brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={itemForm.model}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, model: e.target.value })
                    }
                    placeholder="Enter model"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={itemForm.purchaseDate}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, purchaseDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (KSH)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={itemForm.purchasePrice}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        purchasePrice: e.target.value,
                      })
                    }
                    placeholder="Enter purchase price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={itemForm.supplier}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, supplier: e.target.value })
                    }
                    placeholder="Enter supplier"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty Period</Label>
                  <Input
                    id="warranty"
                    value={itemForm.warranty}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, warranty: e.target.value })
                    }
                    placeholder="e.g., 2 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={itemForm.location}
                    onValueChange={(value) =>
                      setItemForm({ ...itemForm, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={itemForm.assignedTo}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, assignedTo: e.target.value })
                    }
                    placeholder="Enter person/team"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={itemForm.serialNumber}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, serialNumber: e.target.value })
                  }
                  placeholder="Enter serial number (auto-generated if empty)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={itemForm.notes}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <Package className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label
                        htmlFor="inventoryDocuments"
                        className="cursor-pointer"
                      >
                        <span className="text-sm text-blue-600 hover:text-blue-500">
                          Upload purchase receipts, warranty documents, or
                          manuals
                        </span>
                        <input
                          id="inventoryDocuments"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              // Handle file upload here
                              console.log("Files uploaded:", e.target.files);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, Excel, DOC, JPG up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddItemDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Maintenance Dialog */}
        <Dialog
          open={showMaintenanceDialog}
          onOpenChange={setShowMaintenanceDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Maintenance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectItem">Select Item *</Label>
                <Select
                  value={selectedItem?.id.toString() || ""}
                  onValueChange={(value) => {
                    const item = items.find((i) => i.id === parseInt(value));
                    setSelectedItem(item || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items
                      .filter((item) => item.status !== "Disposed")
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.itemCode} - {item.itemName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceType">Type *</Label>
                <Select
                  value={maintenanceForm.type}
                  onValueChange={(value) =>
                    setMaintenanceForm({ ...maintenanceForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Replacement">Replacement</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceDescription">Description *</Label>
                <Textarea
                  id="maintenanceDescription"
                  value={maintenanceForm.description}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the maintenance work"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCost">Cost (KSH)</Label>
                  <Input
                    id="maintenanceCost"
                    type="number"
                    value={maintenanceForm.cost}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        cost: e.target.value,
                      })
                    }
                    placeholder="Enter cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performedBy">Performed By</Label>
                  <Input
                    id="performedBy"
                    value={maintenanceForm.performedBy}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        performedBy: e.target.value,
                      })
                    }
                    placeholder="Enter name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="performedDate">Date Performed</Label>
                  <Input
                    id="performedDate"
                    type="date"
                    value={maintenanceForm.performedDate}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        performedDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Next Due Date</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={maintenanceForm.nextDueDate}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        nextDueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMaintenanceDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleMaintenanceSubmit}>
                  Record Maintenance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Disposal Dialog */}
        <Dialog open={showDisposalDialog} onOpenChange={setShowDisposalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Disposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectItem">Select Item *</Label>
                <Select
                  value={selectedItem?.id.toString() || ""}
                  onValueChange={(value) => {
                    const item = items.find((i) => i.id === parseInt(value));
                    setSelectedItem(item || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items
                      .filter((item) => item.status !== "Disposed")
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.itemCode} - {item.itemName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disposalReason">Reason *</Label>
                  <Select
                    value={disposalForm.reason}
                    onValueChange={(value) =>
                      setDisposalForm({ ...disposalForm, reason: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="End of Life">End of Life</SelectItem>
                      <SelectItem value="Irreparable">Irreparable</SelectItem>
                      <SelectItem value="Obsolete">Obsolete</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                      <SelectItem value="Stolen">Stolen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disposalMethod">Method *</Label>
                  <Select
                    value={disposalForm.disposalMethod}
                    onValueChange={(value) =>
                      setDisposalForm({
                        ...disposalForm,
                        disposalMethod: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Sell">Sell</SelectItem>
                      <SelectItem value="Donate">Donate</SelectItem>
                      <SelectItem value="Scrap">Scrap</SelectItem>
                      <SelectItem value="Return to Supplier">
                        Return to Supplier
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disposalDate">Disposal Date</Label>
                  <Input
                    id="disposalDate"
                    type="date"
                    value={disposalForm.disposalDate}
                    onChange={(e) =>
                      setDisposalForm({
                        ...disposalForm,
                        disposalDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disposalValue">Disposal Value (KSH)</Label>
                  <Input
                    id="disposalValue"
                    type="number"
                    value={disposalForm.disposalValue}
                    onChange={(e) =>
                      setDisposalForm({
                        ...disposalForm,
                        disposalValue: e.target.value,
                      })
                    }
                    placeholder="Enter value"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorizedBy">Authorized By</Label>
                  <Input
                    id="authorizedBy"
                    value={disposalForm.authorizedBy}
                    onChange={(e) =>
                      setDisposalForm({
                        ...disposalForm,
                        authorizedBy: e.target.value,
                      })
                    }
                    placeholder="Enter authorizer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    value={disposalForm.recipient}
                    onChange={(e) =>
                      setDisposalForm({
                        ...disposalForm,
                        recipient: e.target.value,
                      })
                    }
                    placeholder="Enter recipient name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disposalNotes">Notes</Label>
                <Textarea
                  id="disposalNotes"
                  value={disposalForm.notes}
                  onChange={(e) =>
                    setDisposalForm({ ...disposalForm, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDisposalDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleDisposalSubmit}>Record Disposal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
