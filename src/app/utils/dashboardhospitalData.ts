export const hospitalData = {
  dashboard: {
    totalPatients: 1200,
    activeAdmissions: 350,
    monthlyRevenue: 550000,
    expenses: 320000,
    netProfit: 230000,
    occupancyRate: 85,
    averageStayDays: 4.5,
    satisfactionScore: 4.2
  },
  
  patientManagement: {
    monthlyAdmissions: [100, 120, 130, 115, 140, 125, 150, 160, 170, 165, 155, 180],
    discharges: [80, 85, 90, 70, 60, 75, 85, 95, 90, 100, 105, 110],
    appointments: {
      scheduled: 450,
      completed: 420,
      cancelled: 30,
      pending: 180
    },
    patientsByDepartment: [
      { department: "Emergency", count: 180, color: "#ef4444" },
      { department: "Cardiology", count: 150, color: "#3b82f6" },
      { department: "Surgery", count: 120, color: "#10b981" },
      { department: "Pediatrics", count: 100, color: "#f59e0b" },
      { department: "Orthopedics", count: 85, color: "#8b5cf6" }
    ]
  },
  
  financialOperations: {
    monthlyBilling: [45000, 48000, 47000, 50000, 52000, 53000, 55000, 56000, 58000, 60000, 62000, 64000],
    insuranceClaims: [12000, 15000, 13000, 16000, 17000, 18000, 19000, 20000, 21000, 22000, 23000, 24000],
    paymentsProcessed: [43000, 46000, 45000, 49000, 51000, 52000, 54000, 55000, 57000, 59000, 61000, 63000],
    accountsReceivable: {
      current: 125000,
      days30: 45000,
      days60: 22000,
      days90plus: 15000
    },
    revenueBySource: [
      { source: "Insurance", amount: 280000, percentage: 51, color: "#3b82f6" },
      { source: "Self-Pay", amount: 165000, percentage: 30, color: "#10b981" },
      { source: "Medicare", amount: 77000, percentage: 14, color: "#f59e0b" },
      { source: "Other", amount: 28000, percentage: 5, color: "#8b5cf6" }
    ]
  },
  
  monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

export const kpiCards = [
  {
    title: "Total Patients",
    value: "1,200",
    change: "+8.5%",
    icon: "👥",
    color: "bg-blue-500"
  },
  {
    title: "Monthly Revenue",
    value: "550K",
    change: "+12.3%",
    icon: "💰",
    color: "bg-green-500"
  },
  {
    title: "Active Admissions",
    value: "350",
    change: "+5.2%",
    icon: "🏥",
    color: "bg-purple-500"
  },
  {
    title: "Occupancy Rate",
    value: "85%",
    change: "+2.1%",
    icon: "📊",
    color: "bg-orange-500"
  }
];
