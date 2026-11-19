# Apollo LeadCoin V2 | Threat model

## Assets to protect
- Holder balances, allowances and signatures
- One-time genesis supply and distribution integrity
- Treasury custody, signing keys, and user expectations
- Clear separation from historical LeadCoin tokens and Apollo Signals client accounts

## Controls implemented in this prototype
1. Immutable genesis treasury and supply metadata; no mint method after construction.
2. No owner privileges, proxy upgradeability, blacklist, transfer pause, forced burn, fees or crowdsale.
3. OpenZeppelin ERC20 / ERC20Permit used as pinned dependency; EIP-2612 standard nonces and domain separation.
4. Test coverage for prohibited mint/burn entrypoints, constructor validation, supply conservation, allowances and permit replay.

## Residual risks / blockers
- Genesis treasury receives the entire supply. A compromised treasury can transfer it all. Use a separately-reviewed multisignature custody setup and transfer policy.
- EIP-2612 signatures can approve a spender: users must understand approvals; a compromised spender may move permitted tokens.
- Tokens are transferable; phishing, key theft and transfer to wrong addresses are not prevented by this contract.
- A token ticker and name are not proof of rights to the historic LeadCoin brand or existing on-chain assets.
- Token economics, issuer obligations, disclosure, AML/KYC, sanctions, money transmission, U.S. state and federal securities/commodities analyses are not complete.
- We have not compiled, fuzzed, or audited code in a trusted independent environment yet. CI is only a first gate.
- No ownership recovery, vesting, distribution, governance, redemption or client payout contracts are implemented.
- Contract deployment/verification on any public chain is deliberately excluded.

## Verification requirements
Run `forge build`, `forge test`, negative tests and third-party static analysis. Audit dependency versions, inspect source-build reproducibility, add invariant tests, independent review and testnet rehearsal before a separate production authorization.
