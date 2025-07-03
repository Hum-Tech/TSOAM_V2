import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Heart,
  Activity,
  Bell,
  Plus,
  FileText,
  Package,
  Settings,
  Shield,
  CreditCard,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";
import { RecentActivitiesEnhanced } from "@/components/RecentActivitiesEnhanced";

// Real-time data refresh utility
const triggerDashboardRefresh = () => {
  localStorage.setItem("dashboard_refresh", Date.now().toString());
};

// System log utility
const logSystemActivity = async (action: string, details: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for logging

    await fetch("/api/system-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        module: "Dashboard",
        details,
        severity: "Info",
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (error) {
    // Silently fail logging to prevent disrupting user experience
    if (error.name !== "AbortError") {
      console.warn("System activity logging unavailable:", error.message);
    }
  }
};

interface DashboardData {
  monthlyFinancialData: any[];
  offeringTypeData: any[];
  membershipGrowthData: any[];
  membershipStats: {
    total_full_members: number;
    total_new_members: number;
    eligible_for_transfer: number;
  };
  baptismDemographicsData: any[];
  eventAttendanceData: any[];
  systemAlertsData: any[];
  isLoading: boolean;
  lastUpdated: Date;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("6months");

  // Check if user has permission to view dashboard
  if (!user?.permissions?.dashboard) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to view the dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator for access.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Real-time dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    monthlyFinancialData: [],
    offeringTypeData: [],
    membershipGrowthData: [],
    membershipStats: {
      total_full_members: 0,
      total_new_members: 0,
      eligible_for_transfer: 0,
    },
    baptismDemographicsData: [],
    eventAttendanceData: [],
    systemAlertsData: [],
    isLoading: true,
    lastUpdated: new Date(),
  });

  // Fetch real-time data from API
  const fetchDashboardData = async () => {
    setDashboardData((prev) => ({ ...prev, isLoading: true }));

    try {
      // Create safer fetch function with timeout and fallback
      const safeFetch = async (url: string, fallback: any) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(url, {
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return await response.json();
          } else {
            console.warn(`API endpoint ${url} returned ${response.status}`);
            return fallback;
          }
        } catch (error) {
          console.warn(`Failed to fetch ${url}:`, error.message);
          return fallback;
        }
      };

      const [financial, membership, baptisms, events, alerts] =
        await Promise.all([
          safeFetch("/api/dashboard/financial", {
            monthly: [
              {
                month: "Jan",
                offerings: 45000,
                tithes: 32000,
                expenses: 28000,
                welfare: 5000,
              },
              {
                month: "Feb",
                offerings: 52000,
                tithes: 38000,
                expenses: 31000,
                welfare: 7000,
              },
              {
                month: "Mar",
                offerings: 48000,
                tithes: 35000,
                expenses: 29000,
                welfare: 6000,
              },
            ],
            offerings: [
              {
                name: "Sunday Offering",
                amount: 125000,
                count: 12,
                value: 45.5,
              },
              { name: "Tithe", amount: 105000, count: 8, value: 38.2 },
              {
                name: "Special Offering",
                amount: 45000,
                count: 4,
                value: 16.3,
              },
            ],
          }),
          safeFetch("/api/dashboard/membership", {
            growth: [
              { month: "Jan", fullMembers: 245, newMembers: 12 },
              { month: "Feb", fullMembers: 252, newMembers: 15 },
              { month: "Mar", fullMembers: 258, newMembers: 18 },
            ],
            stats: {
              total_full_members: 258,
              total_new_members: 18,
              eligible_for_transfer: 8,
            },
          }),
          safeFetch("/api/dashboard/baptisms", {
            demographics: [
              { ageGroup: "18-25", count: 12, male: 5, female: 7 },
              { ageGroup: "26-35", count: 18, male: 8, female: 10 },
              { ageGroup: "36-50", count: 15, male: 7, female: 8 },
            ],
          }),
          safeFetch("/api/dashboard/events", {
            attendance: [
              { event: "Sunday Service", attendance: 180, capacity: 200 },
              { event: "Bible Study", attendance: 45, capacity: 60 },
              { event: "Youth Meeting", attendance: 32, capacity: 40 },
            ],
          }),
          safeFetch("/api/dashboard/alerts", {
            recent: [
              {
                type: "info",
                message: "Running in offline mode with demo data",
                time: "2 min ago",
              },
              {
                type: "warning",
                message: "Database connection unavailable",
                time: "5 min ago",
              },
            ],
          }),
        ]);

      setDashboardData({
        monthlyFinancialData: financial.monthly || [],
        offeringTypeData: financial.offerings || [],
        membershipGrowthData: membership.growth || [],
        membershipStats: membership.stats || {
          total_full_members: 0,
          total_new_members: 0,
          eligible_for_transfer: 0,
        },
        baptismDemographicsData: baptisms.demographics || [],
        eventAttendanceData: events.attendance || [],
        systemAlertsData: alerts.recent || [],
        isLoading: false,
        lastUpdated: new Date(),
      });

      // Log dashboard access (non-blocking)
      logSystemActivity(
        "Dashboard Access",
        `User ${user?.name} accessed dashboard`,
      ).catch(() => {}); // Silently handle logging failures
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setDashboardData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  // Listen for real-time updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dashboard_refresh") {
        fetchDashboardData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const {
    monthlyFinancialData,
    offeringTypeData,
    membershipGrowthData,
    membershipStats,
    baptismDemographicsData,
    eventAttendanceData,
    systemAlertsData,
    isLoading,
    lastUpdated,
  } = dashboardData;

  // Calculate key metrics with null checks
  const currentMonth =
    monthlyFinancialData.length > 0
      ? monthlyFinancialData[monthlyFinancialData.length - 1]
      : null;
  const previousMonth =
    monthlyFinancialData.length > 1
      ? monthlyFinancialData[monthlyFinancialData.length - 2]
      : null;

  const offeringsGrowth =
    currentMonth && previousMonth && previousMonth.offerings > 0
      ? (
          ((currentMonth.offerings - previousMonth.offerings) /
            previousMonth.offerings) *
          100
        ).toFixed(1)
      : "0.0";

  const memberGrowth =
    membershipGrowthData.length > 1
      ? (
          (((membershipGrowthData[membershipGrowthData.length - 1]
            ?.fullMembers || 0) -
            (membershipGrowthData[membershipGrowthData.length - 2]
              ?.fullMembers || 0)) /
            (membershipGrowthData[membershipGrowthData.length - 2]
              ?.fullMembers || 1)) *
          100
        ).toFixed(1)
      : "0.0";

  // Safe data access
  const currentOfferings = currentMonth?.offerings || 0;
  const currentTithes = currentMonth?.tithes || 0;
  const currentExpenses = currentMonth?.expenses || 0;
  const currentWelfare = currentMonth?.welfare || 0;
  const totalFullMembers = membershipStats.total_full_members;
  const totalNewMembers = membershipStats.total_new_members;
  const eligibleForTransfer = membershipStats.eligible_for_transfer;
  const totalMembers = totalFullMembers + totalNewMembers;

  // Role-based dashboard filtering
  const getVisibleMetrics = () => {
    switch (user?.role) {
      case "Finance Officer":
        return ["financial"];
      case "HR Officer":
        return ["hr", "members"];
      case "User":
        return ["basic", "events"];
      case "Admin":
        return ["financial", "members", "hr", "events", "system"];
      default:
        return ["basic"];
    }
  };

  const visibleMetrics = getVisibleMetrics();

  // Export functions
  const exportDashboardData = async (format: "pdf" | "excel") => {
    logSystemActivity(
      "Data Export",
      `${format.toUpperCase()} export initiated`,
    ).catch(() => {}); // Non-blocking logging

    if (format === "excel") {
      try {
        const workbook = XLSX.utils.book_new();

        // Financial Summary
        const financialSummary = [
          {
            Metric: "Monthly Offerings",
            Value: `KSH ${currentOfferings.toLocaleString()}`,
          },
          {
            Metric: "Monthly Tithes",
            Value: `KSH ${currentTithes.toLocaleString()}`,
          },
          {
            Metric: "Monthly Expenses",
            Value: `KSH ${currentExpenses.toLocaleString()}`,
          },
          {
            Metric: "Welfare Fund",
            Value: `KSH ${currentWelfare.toLocaleString()}`,
          },
          { Metric: "Total Members", Value: totalMembers.toString() },
        ];

        const ws1 = XLSX.utils.json_to_sheet(financialSummary);
        XLSX.utils.book_append_sheet(workbook, ws1, "Summary");

        if (monthlyFinancialData.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(monthlyFinancialData);
          XLSX.utils.book_append_sheet(workbook, ws2, "Financial Trends");
        }

        if (membershipGrowthData.length > 0) {
          const ws3 = XLSX.utils.json_to_sheet(membershipGrowthData);
          XLSX.utils.book_append_sheet(workbook, ws3, "Membership Growth");
        }

        XLSX.writeFile(
          workbook,
          `TSOAM_Dashboard_${new Date().toISOString().split("T")[0]}.xlsx`,
        );

        logSystemActivity(
          "Export Success",
          "Excel dashboard export completed",
        ).catch(() => {}); // Non-blocking logging
      } catch (error) {
        console.error("Excel export failed:", error);
        logSystemActivity(
          "Export Failed",
          `Excel export error: ${error}`,
        ).catch(() => {}); // Non-blocking logging
      }
    }
  };

  const manualRefresh = async () => {
    logSystemActivity("Manual Refresh", "Dashboard manually refreshed").catch(
      () => {},
    ); // Non-blocking logging
    await fetchDashboardData();
  };

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        description={
          <div className="flex items-center gap-4">
            <span>
              Welcome back, {user?.name} - {user?.role}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={manualRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => exportDashboardData("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </>
        }
      />

      {/* Key Performance Indicators */}
      {(visibleMetrics.includes("financial") ||
        visibleMetrics.includes("basic")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {visibleMetrics.includes("financial") && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        KSH {currentOfferings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Monthly Offerings
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {parseFloat(offeringsGrowth) > 0 ? (
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        <span
                          className={
                            parseFloat(offeringsGrowth) > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {offeringsGrowth}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        KSH {currentTithes.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Monthly Tithes
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Target: KSH 250,000
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalFullMembers}</div>
                  <div className="text-sm text-muted-foreground">
                    Full Members
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalNewMembers}</div>
                  <div className="text-sm text-muted-foreground">
                    New Members
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <Clock className="h-3 w-3 text-orange-600 mr-1" />
                    <span className="text-orange-600">
                      {eligibleForTransfer} eligible
                    </span>
                  </div>
                </div>
                <UserPlus className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    KSH {currentWelfare.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Welfare Fund
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Available for assistance
                  </div>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Finance Actions */}
            {visibleMetrics.includes("financial") && (
              <>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate("/finance")}
                >
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span className="text-xs">Add Transaction</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate("/finance")}
                >
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <span className="text-xs">Record Expense</span>
                </Button>
              </>
            )}

            {/* HR Actions */}
            {visibleMetrics.includes("hr") && (
              <>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate("/hr")}
                >
                  <Briefcase className="h-6 w-6 text-purple-600" />
                  <span className="text-xs">Add Employee</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate("/hr")}
                >
                  <FileText className="h-6 w-6 text-orange-600" />
                  <span className="text-xs">Leave Request</span>
                </Button>
              </>
            )}

            {/* Member Management */}
            {visibleMetrics.includes("members") && (
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => navigate("/members")}
              >
                <UserPlus className="h-6 w-6 text-blue-600" />
                <span className="text-xs">Add Member</span>
              </Button>
            )}

            {/* Inventory Actions */}
            {user?.permissions?.inventory && (
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => navigate("/inventory")}
              >
                <Package className="h-6 w-6 text-indigo-600" />
                <span className="text-xs">Add Item</span>
              </Button>
            )}

            {/* Welfare Actions */}
            {user?.permissions?.welfare && (
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => navigate("/welfare")}
              >
                <Heart className="h-6 w-6 text-red-500" />
                <span className="text-xs">New Request</span>
              </Button>
            )}

            {/* Event Actions */}
            {user?.permissions?.events && (
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => navigate("/events")}
              >
                <Calendar className="h-6 w-6 text-green-600" />
                <span className="text-xs">Add Event</span>
              </Button>
            )}

            {/* Messaging */}
            {user?.permissions?.messaging && (
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => navigate("/messaging")}
              >
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <span className="text-xs">Send Message</span>
              </Button>
            )}

            {/* Admin Actions */}
            {user?.role === "Admin" && (
              <>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate("/users")}
                >
                  <Shield className="h-6 w-6 text-red-600" />
                  <span className="text-xs">User Management</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="h-6 w-6 text-gray-600" />
                  <span className="text-xs">Settings</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivitiesEnhanced userId={user?.id} role={user?.role} />
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Financial Trends */}
        {visibleMetrics.includes("financial") && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : monthlyFinancialData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyFinancialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `KSH ${Number(value).toLocaleString()}`,
                        "",
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="offerings"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="tithes"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No financial data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Baptism Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Baptism Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : baptismDemographicsData.length > 0 ? (
              <div className="space-y-4">
                {baptismDemographicsData.map((demo: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">
                        {demo.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {demo.count}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${demo.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No baptism data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {visibleMetrics.includes("system") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {systemAlertsData.length > 0 ? (
              <div className="space-y-2">
                {systemAlertsData
                  .slice(0, 5)
                  .map((alert: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {alert.type === "error" && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {alert.type === "warning" && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {alert.type === "success" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {alert.type === "info" && (
                          <Activity className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-sm">{alert.message}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {alert.time}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent alerts
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
