// src/types/nav.ts
export type MenuItem = {
  label: string;
  href?: string;
  badge?: string;
  children?: MenuItem[];
};

/* types/index.ts */
/* Keep your existing exports (e.g., MenuItem). Append these analytics types. */

export type Timeframe = "day" | "week" | "month";
export type DepartmentKey = "OPD" | "IPD" | "PHARMACY";

export type KPI = {
  label: string;
  value: number;
  delta?: number;  // % change vs previous period (optional)
  unit?: string;   // e.g. "₹", "visits"
};

export type SeriesPoint = { x: string; y: number };

export type DeptSeries = {
  dept: DepartmentKey;
  points: SeriesPoint[];
};

export type RevenueRow = {
  label: string;       // e.g. "OPD", "IPD", "Pharmacy"
  committed: number;   // expected/committed revenue
  realized: number;    // actual revenue
  expense: number;     // costs
};

export type RevenueSummary = {
  totalCommitted: number;
  totalRealized: number;
  totalExpense: number;
  profit: number;      // realized - expense
  marginPct: number;   // profit / realized
};


/* types/index.ts — append to the bottom (keep your existing exports) */

export type CommitmentStatus = "Planned" | "Approved" | "Fulfilled";
export type Commitment = {
  id: string;
  title: string;
  dept: DepartmentKey | "OTHER";
  amount: number;
  dueOn: string;       // ISO date yyyy-mm-dd
  status: CommitmentStatus;
  notes?: string;
  createdAt: string;   // ISO
  createdBy?: string;
};

/* types/index.ts — append */

export type VisitType = "OPD" | "IPD";

export type IDProofType = "Aadhaar" | "PAN" | "Passport" | "DrivingLicense" | "Other";

export type Patient = {
  _id?: string;
  cardNo: string;                // SMH-YYYYMMDD-XXXXXX
  fullName: string;
  gender: "Male" | "Female" | "Other";
  dob: string;                   // ISO yyyy-mm-dd
  age?: number;                  // computed server-side too
  phone: string;                 // Indian 10-digit
  idProofType?: IDProofType;
  idProofNo?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Visit = {
  _id?: string;
  patient: string;               // patient _id
  cardNo: string;
  visitType: VisitType;
  doctorId?: string;
  doctorName?: string;           // denormalised for convenience
  complaints: string;            // ailment text
  createdAt?: string;
};

// export type Doctor = {
//   _id: string;
//   name: string;
//   dept: string;                  // e.g. "General Medicine"
//   active: boolean;
// };

// types/index.ts — append
export type ToastKind = "success" | "error" | "info" | "warning";
export type ToastMessage = { id: string; kind: ToastKind; title: string; description?: string; duration?: number };

// types/index.ts — Reception Payments
export type PaymentMethod = "CASH" | "CARD" | "UPI";

export type Payment = {
  _id?: string;
  cardNo: string;
  patientId: string;
  patientName: string;
  visitId?: string | null;
  visitType?: "OPD" | "IPD" | null;
  doctorId?: string | null;
  doctorName?: string | null;
  ailment?: string;
  method: PaymentMethod;
  amount: number;
  upiId?: string;        // optional if method = UPI
  notes?: string;
  createdAt?: string;
};

export type PaymentPreview = {
  cardNo: string;
  patientId: string;
  patientName: string;
  phone: string;
  age?: number;
  gender: "Male" | "Female" | "Other";
  // latest visit snapshot (if any)
  visitId?: string | null;
  visitType?: "OPD" | "IPD" | null;
  doctorId?: string | null;
  doctorName?: string | null;
  complaints?: string;
};

// types/index.ts — Doctor & Attendance
export type Doctor = {
  _id: string;
  name: string;
  dept: string;
  specialty?: string;
  phone?: string;
  email?: string;
  fee?: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorCreateInput = {
  name: string;
  dept: string;
  specialty?: string;
  phone?: string;
  email?: string;
  fee?: number | null;
  active?: boolean;
};

export type DoctorAttendance = {
  _id: string;
  doctorId: Doctor | string;
  date: string;       // midnight date
  checkInAt?: string | null;
  checkOutAt?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// -------- Analytics types --------
export type MoneyByKey = { key: string; amount: number };
export type CountByKey = { key: string; count: number };

export type ReceptionAnalytics = {
  patients: {
    today: number; week: number; month: number; year: number; overall: number;
    opd: number; ipd: number;
  };
  topDoctors: Array<{ doctorId: string; name: string; patients: number }>; // sorted desc
  amountCollected: {
    today: number; week: number; month: number;
    byVisitType: CountByKey[];      // [{key:"OPD", count: ...}, {key:"IPD", count: ...}]
    byMethod: MoneyByKey[];         // [{key:"CASH", amount: ...}, {key:"UPI", amount: ...}, {key:"CARD", amount: ...}]
  };
};

export type AdminFinancials = {
  revenue: {
    today: number; week: number; month: number; year: number; overall: number;
    byDept: MoneyByKey[];          // e.g., OPD/IPD/Pharmacy/Lab/Imaging
  };
  costs: {
    salaries: number; consumables: number; maintenance: number; utilities: number; misc: number;
    total: number;
  };
  investments: number;              // capex
  profit: { today: number; week: number; month: number; year: number; overall: number };
};

// --- Period filter for analytics ---
export type Period = "day" | "week" | "month" | "year" | "overall";


export type TopDoctor = { doctorId: string; name: string; patients: number };

// Reception-like slice reused in Admin summary
export type ReceptionSlice = {
  patients: {
    // NEW registrations in the range (admin wants everything)
    total: number;
    opd: number;
    ipd: number;
  };
  amount: {
    total: number;
    byMethod: MoneyByKey[]; // CASH / UPI / CARD
  };
  topDoctors: TopDoctor[];
};

// Existing AdminFinancials extended for filtered view
export type AdminAnalytics = {
  period: Period;
  range: { from: string; to: string | null }; // ISO strings (to can be null for 'overall')
  revenue: {
    total: number;            // total revenue in range
    byDept: MoneyByKey[];     // OPD/IPD/Pharmacy/Lab/Imaging/Other
  };
  costs: {
    salaries: number; consumables: number; maintenance: number; utilities: number; misc: number; total: number;
  };
  investments: number;
  profit: number;             // revenue.total - costs.total - investments
  // Reception detail embedded for admin view:
  reception: ReceptionSlice;
};

// --- Payments report types ---
// export type PaymentMethod = "CASH" | "UPI" | "CARD";
// export type VisitType = "OPD" | "IPD";

export type PaymentRecord = {
  _id: string;
  cardNo: string;
  patientId: string;
  patientName: string;
  phone?: string;
  idProofNo?: string;
  visitId?: string;
  visitType: VisitType;
  doctorId?: string;
  doctorName?: string;
  complaints?: string;              // ailment
  amount: number;
  method: PaymentMethod;
  lengthOfStayDays?: number | null; // IPD only (if available)
  createdAt: string;                // ISO
};

export type PaymentSearchQuery = {
  q?: string;                       // name/phone/idProof/cardNo free-text
  visitType?: VisitType | "ALL";
  method?: PaymentMethod | "ALL";
  doctorId?: string;
  from?: string;                    // ISO date (start, inclusive)
  to?: string;                      // ISO date (end, exclusive)
  page?: number;                    // 1-based
  limit?: number;                   // page size
  sort?: "createdAt_desc" | "createdAt_asc" | "amount_desc" | "amount_asc";
};

export type PaymentSearchResult = {
  items: PaymentRecord[];
  page: number;
  pages: number;
  total: number;                    // number of records matching
  amountTotals: {
    day: number; week: number; month: number; year: number; overall: number;
    inRange: number;                // total for current filter range
  };
};






