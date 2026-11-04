import React from 'react';
import SellEggPage from './SellEggPage';

/**
 * WithdrawPage: Unified P2P Liquidation & Cashout Interface
 * As specified in PROJECT.md and DISPATCH.md, provides the unified liquidation
 * and withdrawal experience matching SellEggPage with active route /withdraw.
 */
export default function WithdrawPage(props) {
  return <SellEggPage {...props} currentRoute="/withdraw" />;
}

export { SellEggPage };
