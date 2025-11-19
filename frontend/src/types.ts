export type Order = {
  id?: number;
  customer: string;
  orderId: string;
  date: string;
  item: string;
  price: number;
}

export type Transaction = {
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

export type MatchedOrder = {
  order: Order;
  txns: Transaction[];
  matchScore?: number;
}

export type MatchResult = {
  matched: MatchedOrder[];
  unmatchedOrders: Order[];
  unmatchedTransactions: Transaction[];
  message?: string;
  autoApprovedCount?: number;
  pendingCount?: number;
  rejectedCount?: number;
}

export type PendingTransaction = {
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
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
  matchedOrder?: Order;
}
