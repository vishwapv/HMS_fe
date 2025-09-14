// Hamburger Menu types
export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
}

export interface HamburgerMenuProps {
  menuItems?: MenuItem[];
  onMenuItemClick?: (href: string) => void;
}


// Other common types for your application
export interface Case {
  id: string;
  type: 'OPD' | 'IPD' | 'Emergency' | 'Surgery';
  patientName: string;
  date: Date;
  diagnosis: string;
  charges: {
    consultation: number;
    medication: number;
    procedure: number;
    room: number;
    total: number;
  };
  status: 'Open' | 'Closed' | 'Billed' | 'Paid';
}

export interface FinancialRecord {
  id: string;
  caseId: string;
  date: Date;
  amount: number;
  type: 'Revenue' | 'Expense';
  category: string;
  description: string;
}

// Add more types as needed for your application