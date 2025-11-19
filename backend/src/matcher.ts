import * as fuzzball from 'fuzzball';
import { Order, Transaction, MatchedOrder, MatchResult } from './types';

/**
 * Fuzzy matching algorithm for orders and transactions using fuzzball library
 *
 * Matching Strategy:
 * 1. Customer name similarity (using fuzzball's token_sort_ratio for handling word order)
 * 2. Order ID similarity (using fuzzball's ratio for character-level matching)
 * 3. Item name similarity
 * 4. Price match (exact or very close)
 * 5. Date proximity (transaction date should be on or after order date)
 *
 * Weighted scoring system:
 * - Customer name: 30%
 * - Order ID: 35%
 * - Item: 20%
 * - Price: 10%
 * - Date validity: 5%
 */

interface MatchScore {
  transactionIndex: number;
  score: number;
  coreScore: number; // Score from customer + orderId + item only
}

const MATCH_THRESHOLD = 60; // 60% similarity threshold
const AUTO_APPROVE_THRESHOLD = 0.9; // 90% of core fields (customer + orderId + item)

/**
 * Check if transaction date is valid relative to order date
 * For missing/invalid dates, we give partial credit (2.5 out of 5 points)
 * This is lenient because data is manually entered and may have errors
 */
function isDateValid(orderDate: string, txnDate: string): number {
  if (!orderDate || !txnDate) {
    // Missing date - give partial credit
    return 2.5;
  }

  const order = new Date(orderDate);
  const txn = new Date(txnDate);

  // Check if dates are valid
  if (isNaN(order.getTime()) || isNaN(txn.getTime())) {
    // Invalid date format - give partial credit
    return 2.5;
  }

  // Transaction should be on or after order date, within 90 days
  const daysDiff = (txn.getTime() - order.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff >= 0 && daysDiff <= 90) {
    return 5; // Valid date sequence
  } else if (daysDiff < 0 && daysDiff >= -7) {
    return 2.5; // Slightly before order (minor error tolerance)
  } else {
    return 0; // Invalid date sequence
  }
}

/**
 * Calculate match score between an order and a transaction
 * Returns object with total score and core score (customer + orderId + item)
 */
function calculateMatchScore(order: Order, transaction: Transaction): { totalScore: number; coreScore: number } {
  // Customer name similarity (30%) - token_sort_ratio handles "Brian Bell" vs "Bell Brian"
  const customerScore = fuzzball.token_sort_ratio(order.customer || '', transaction.customer || '') * 0.3;

  // Order ID similarity (35%) - ratio for character-level matching
  const orderIdScore = fuzzball.ratio(order.orderId || '', transaction.orderId || '') * 0.35;

  // Item similarity (20%)
  const itemScore = fuzzball.token_sort_ratio(order.item || '', transaction.item || '') * 0.2;

  // Core score is the sum of customer, orderId, and item (max 85 points)
  const coreScore = customerScore + orderIdScore + itemScore;

  // Price similarity (10%)
  const orderPrice = order.price || 0;
  const txnPrice = transaction.price || 0;
  const priceDiff = Math.abs(orderPrice - txnPrice);
  const priceScore = priceDiff === 0 ? 10 :
                     orderPrice > 0 && priceDiff / orderPrice <= 0.1 ? 5 : 0;

  // Date validity (5%)
  const dateScore = isDateValid(order.date, transaction.date);

  const totalScore = coreScore + priceScore + dateScore;

  return { totalScore, coreScore };
}

/**
 * Validate input data
 * Throws error with specific message for different validation failures
 */
export function validateInputData(orders: Order[], transactions: Transaction[]): void {
  if (!Array.isArray(orders)) {
    throw new Error('INVALID_INPUT: orders must be an array');
  }

  if (!Array.isArray(transactions)) {
    throw new Error('INVALID_INPUT: transactions must be an array');
  }

  if (orders.length === 0 && transactions.length === 0) {
    throw new Error('EMPTY_INPUT: both orders and transactions are empty');
  }

  // Validate each order has required fields
  orders.forEach((order, index) => {
    if (!order.orderId) {
      throw new Error(`MISSING_FIELD: order at index ${index} is missing orderId`);
    }
  });

  // Validate each transaction has required fields
  transactions.forEach((txn, index) => {
    if (!txn.orderId) {
      throw new Error(`MISSING_FIELD: transaction at index ${index} is missing orderId`);
    }
  });
}

/**
 * Match transactions to orders using fuzzy matching
 */
export function matchOrders(orders: Order[], transactions: Transaction[]): MatchResult {
  // Validate input
  validateInputData(orders, transactions);

  const matched: MatchedOrder[] = [];
  const usedTransactionIndices = new Set<number>();

  // For each order, find all matching transactions
  for (const order of orders) {
    const matches: MatchScore[] = [];

    // Calculate match score for each unused transaction
    transactions.forEach((txn, index) => {
      if (usedTransactionIndices.has(index)) return;

      const { totalScore, coreScore } = calculateMatchScore(order, txn);

      if (totalScore >= MATCH_THRESHOLD) {
        matches.push({ transactionIndex: index, score: totalScore, coreScore });
      }
    });

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Get all transactions that match this order with their individual scores
    const matchedTxns: Transaction[] = [];
    for (const match of matches) {
      const txn = transactions[match.transactionIndex];
      // Attach the individual match score to each transaction
      matchedTxns.push({
        ...txn,
        matchScore: Math.round(match.score)
      } as Transaction);
      usedTransactionIndices.add(match.transactionIndex);
    }

    if (matchedTxns.length > 0) {
      matched.push({
        order,
        txns: matchedTxns,
        matchScore: matches.length > 0 ? Math.round(matches[0].score) : 0
      });
    }
  }

  // Find unmatched orders
  const matchedOrderIds = new Set(matched.map(m => m.order.orderId));
  const unmatchedOrders = orders.filter(o => !matchedOrderIds.has(o.orderId));

  // Find unmatched transactions
  const unmatchedTransactions = transactions.filter((_, index) => !usedTransactionIndices.has(index));

  return {
    matched,
    unmatchedOrders,
    unmatchedTransactions
  };
}

/**
 * Determine if a transaction should be auto-approved based on total score vs core threshold
 * Auto-approve if total score (including price + date bonuses) >= 90% of max core (76.5 points)
 */
export function shouldAutoApprove(order: Order, transaction: Transaction): boolean {
  const { totalScore } = calculateMatchScore(order, transaction);
  const maxCoreScore = 85; // 30% + 35% + 20% = 85%
  const threshold = maxCoreScore * AUTO_APPROVE_THRESHOLD; // 76.5 points
  return totalScore >= threshold;
}
