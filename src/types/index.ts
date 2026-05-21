import type { Product, Category, Supplier, StockMovement, Alert, User, Order } from '@prisma/client';

export type { Product, Category, Supplier, StockMovement, Alert, User, Order };

export type ProductWithRelations = Product & {
  category?: Category | null;
  supplier?: Supplier | null;
  _count?: { orderItems: number; movements: number; alerts: number };
};

export type MovementWithRelations = StockMovement & {
  product: Product;
  user: Pick<User, 'id' | 'name' | 'email'>;
};

export type AlertWithProduct = Alert & {
  product?: Product | null;
};

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
  totalSuppliers: number;
  totalInventoryValue: number;
  monthlyMovements: number;
  unreadAlerts: number;
}

export interface StockChartData {
  name: string;
  stock: number;
  minStock: number;
}

export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}

export interface MovementChartData {
  date: string;
  in: number;
  out: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'REORDER' | 'SYSTEM';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: UserRole[];
}
