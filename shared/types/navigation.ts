export type RouteName =
  | 'home'
  | 'ledger'
  | 'transactions'
  | 'pos'
  | 'more'
  | 'profile'
  | 'accounts'
  | 'products'
  | 'inventory'
  | 'reports'
  | 'categories'
  | 'settings'
  | 'contacts'
  | 'billing'
  | 'emiLoans';

export interface ScreenProps {
  route: RouteName;
  onNavigate: (route: RouteName) => void;
}
