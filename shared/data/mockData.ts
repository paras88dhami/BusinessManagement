export const quickActions = [
  { key: 'products', label: 'Products' },
  { key: 'billing', label: 'Billing' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'reports', label: 'Reports' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'categories', label: 'Categories' },
  { key: 'emiLoans', label: 'EMI & Loans' },
] as const;

export const recentTransactions = [
  { id: '1', name: 'Customer Payment', date: 'Today', category: 'Sales', amount: '12,500', type: 'in' as const },
  { id: '2', name: 'Supplier Payment', date: 'Today', category: 'Purchase', amount: '3,200', type: 'out' as const },
  { id: '3', name: 'Utility Bill', date: 'Yesterday', category: 'Expense', amount: '2,450', type: 'out' as const },
  { id: '4', name: 'Advance Order', date: 'Yesterday', category: 'Invoice', amount: '8,000', type: 'in' as const },
];

export const parties = [
  { id: '1', name: 'Ram Kumar', subtitle: 'Customer', balance: 'NPR 15,000', direction: 'receivable' as const },
  { id: '2', name: 'Shyam Store', subtitle: 'Supplier', balance: 'NPR 8,500', direction: 'payable' as const },
  { id: '3', name: 'Sita Devi', subtitle: 'Customer', balance: 'NPR 12,000', direction: 'receivable' as const },
  { id: '4', name: 'Pokhara Traders', subtitle: 'Supplier', balance: 'NPR 22,000', direction: 'payable' as const },
];

export const productRows = [
  { id: '1', title: 'Rice Bag 25kg', sku: 'PR-102', price: 'NPR 2,150', stock: '32 units' },
  { id: '2', title: 'Tea Pack Premium', sku: 'PR-205', price: 'NPR 540', stock: '58 units' },
  { id: '3', title: 'Plastic Bucket', sku: 'PR-301', price: 'NPR 320', stock: '16 units' },
  { id: '4', title: 'Delivery Service', sku: 'SR-010', price: 'NPR 800', stock: 'Service' },
];

export const contactRows = [
  { id: '1', name: 'Anita Traders', phone: '+977 9800000001', type: 'Supplier' },
  { id: '2', name: 'Milan Hardware', phone: '+977 9800000002', type: 'Customer' },
  { id: '3', name: 'Kiran Gurung', phone: '+977 9800000003', type: 'Customer' },
  { id: '4', name: 'Puja Collection', phone: '+977 9800000004', type: 'Supplier' },
];

export const reportCards = [
  { id: '1', title: 'Sales Summary', value: 'NPR 4,52,000', helper: 'This month' },
  { id: '2', title: 'Expense Summary', value: 'NPR 1,18,000', helper: 'This month' },
  { id: '3', title: 'Outstanding', value: 'NPR 1,70,000', helper: 'Receivable + Payable' },
  { id: '4', title: 'Net Margin', value: '26%', helper: 'Estimated' },
];

export const accountRows = [
  { id: '1', name: 'Cash in Hand', amount: 'NPR 48,500' },
  { id: '2', name: 'NIC Asia Bank', amount: 'NPR 1,10,200' },
  { id: '3', name: 'eSewa Wallet', amount: 'NPR 12,800' },
  { id: '4', name: 'Khalti Wallet', amount: 'NPR 7,450' },
];

export const billingRows = [
  { id: '1', name: 'INV-1001', date: '24 Mar 2026', amount: 'NPR 8,500', status: 'Paid' },
  { id: '2', name: 'INV-1002', date: '24 Mar 2026', amount: 'NPR 4,200', status: 'Pending' },
  { id: '3', name: 'INV-1003', date: '23 Mar 2026', amount: 'NPR 12,300', status: 'Paid' },
  { id: '4', name: 'INV-1004', date: '22 Mar 2026', amount: 'NPR 2,750', status: 'Draft' },
];

export const categoryRows = [
  { id: '1', title: 'Groceries', total: '18 items' },
  { id: '2', title: 'Household', total: '10 items' },
  { id: '3', title: 'Services', total: '6 items' },
  { id: '4', title: 'Snacks', total: '12 items' },
];

export const settingRows = [
  { id: '1', title: 'Business Profile', subtitle: 'Name, tax info, address' },
  { id: '2', title: 'Language', subtitle: 'English, Nepali, Hindi' },
  { id: '3', title: 'Notifications', subtitle: 'Reminders and alerts' },
  { id: '4', title: 'Security', subtitle: 'PIN and session control' },
];

export const emiRows = [
  { id: '1', title: 'Delivery Bike Loan', amount: 'NPR 9,500 / month', status: 'Due in 3 days' },
  { id: '2', title: 'Shop Renovation EMI', amount: 'NPR 12,000 / month', status: 'Paid this month' },
  { id: '3', title: 'POS Device Installment', amount: 'NPR 2,800 / month', status: 'Overdue' },
];

export const inventoryRows = [
  { id: '1', title: 'Low Stock Items', value: '7 products', helper: 'Needs reorder' },
  { id: '2', title: 'Total SKUs', value: '146', helper: 'Active items' },
  { id: '3', title: 'Out of Stock', value: '3', helper: 'Unavailable now' },
  { id: '4', title: 'Warehouse Value', value: 'NPR 8,45,000', helper: 'Estimated cost' },
];

export const posProducts = [
  { id: '1', title: 'Tea Pack', price: 'NPR 540' },
  { id: '2', title: 'Rice Bag', price: 'NPR 2,150' },
  { id: '3', title: 'Soft Drink', price: 'NPR 120' },
  { id: '4', title: 'Soap Bar', price: 'NPR 95' },
  { id: '5', title: 'Shampoo', price: 'NPR 420' },
  { id: '6', title: 'Bucket', price: 'NPR 320' },
  { id: '7', title: 'Delivery', price: 'NPR 800' },
  { id: '8', title: 'Notebook', price: 'NPR 85' },
];
