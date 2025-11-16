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
  created_at?: string;
  updated_at?: string;
  matchedOrder?: Order;
}
