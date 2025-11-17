/**
 * Extract partner and token from Steam trade URL
 */
function parseTradeUrl(tradeUrl) {
  try {
    const url = new URL(tradeUrl);
    const partner = url.searchParams.get('partner');
    const token = url.searchParams.get('token');

    if (!partner || !token) {
      throw new Error('Invalid trade URL: missing partner or token');
    }

    return { partner, token };
  } catch (error) {
    throw new Error('Invalid trade URL format');
  }
}

/**
 * Convert partner ID to SteamID64
 */
function partnerToSteamID64(partner) {
  return '7656119' + (parseInt(partner) + 7960265728);
}

/**
 * Get trade offer state name
 */
function getTradeOfferStateName(state) {
  const states = {
    1: 'Invalid',
    2: 'Active',
    3: 'Accepted',
    4: 'Countered',
    5: 'Expired',
    6: 'Canceled',
    7: 'Declined',
    8: 'InvalidItems',
    9: 'ConfirmationNeed',
    10: 'CanceledBySecondFactor',
    11: 'InEscrow'
  };

  return states[state] || 'Unknown';
}

/**
 * Check if trade offer is in final state
 */
function isTradeOfferFinalized(state) {
  // States: 3 (Accepted), 5 (Expired), 6 (Canceled), 7 (Declined), 8 (InvalidItems)
  return [3, 5, 6, 7, 8].includes(state);
}

/**
 * Validate Steam API key
 */
function isValidApiKey(apiKey) {
  return apiKey && apiKey.length === 32;
}

/**
 * Format Steam error message
 */
function formatSteamError(error) {
  if (error.eresult) {
    const eresultNames = {
      1: 'OK',
      2: 'Fail',
      5: 'Timeout',
      10: 'Busy',
      11: 'Invalid',
      15: 'AccessDenied',
      16: 'Timeout',
      17: 'Banned',
      18: 'AccountNotFound',
      20: 'InvalidPassword',
      25: 'LoggedInElsewhere',
      26: 'SessionReplaced',
      63: 'AccountLocked',
      65: 'AccountLogonDenied',
      84: 'RateLimitExceeded'
    };

    const eresultName = eresultNames[error.eresult] || 'Unknown';
    return `Steam error (${error.eresult}): ${eresultName}`;
  }

  return error.message || 'Unknown Steam error';
}

module.exports = {
  parseTradeUrl,
  partnerToSteamID64,
  getTradeOfferStateName,
  isTradeOfferFinalized,
  isValidApiKey,
  formatSteamError
};
