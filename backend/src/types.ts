export interface Order {
  id?: number;
  customer: string;
  orderId: string;
  date: string;
  item: string;
  price: number;
}

export interface Transaction {
  id?: number;
  customer: string;
  orderId: string;
  date: string;
  item: string;
  price: number;
  txnType: string;
  txnAmount: number;
  matchScore?: number; // Individual match score when matched
}

export interface MatchedOrder {
  order: Order;
  txns: Transaction[];
  matchScore?: number;
}

export interface MatchResult {
  matched: MatchedOrder[];
  unmatchedOrders: Order[];
  unmatchedTransactions: Transaction[];
}

export interface PendingTransaction {
  id?: number;
  customer: string;
  orderId: string;
  date: string;
  item: string;
  price: number;
  txnType: string;
  txnAmount: number;
  matched_order_id?: number;
  matchScore?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  // Populated from join
  matchedOrder?: Order;
}
