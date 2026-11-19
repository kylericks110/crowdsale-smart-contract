# LeadCoin V2 | Apollo Engineering Foundation

**Status: research prototype only. Not deployed, audited, marketed, or authorized for sale.**

This is a clean-room modernization candidate built alongside the historical Leadcoin crowdsale code. The legacy `master` branch remains unchanged. GitHub identifies the historical repository as a fork of `LeadcoinNetwork/crowdsale-smart-contract`; this work does **not** establish ownership of the original LeadCoin brand, token, smart contract, tokenholder balances, or treasury.

## Apollo Advantage design principles

- **Predictable:** a configurable genesis supply minted exactly once to the declared treasury. No later token issuance.
- **Holder protection:** no owner, arbitrary third-party token burning, freeze, blacklist, transaction tax, or upgrade backdoor.
- **Wallet-friendly:** standard ERC-20 transfers and EIP-2612 signed approvals using OpenZeppelin contracts.
- **Verifiable:** public constructor inputs, deterministic tests, readable code, and immutable supply metadata.
- **Compliance-first:** no public crowdsale, yield promises, revenue shares, payout rights, or trading-profit claims are encoded.
- **No unsafe migration:** existing historical LDC is not automatically interchangeable with this V2 prototype.

### Contracts

- `src/LeadCoinV2.sol`: standalone ERC-20 + ERC-2612 permit with one-time supply mint to a deployment-chosen treasury.
- `test/LeadCoinV2.t.sol`: unit, negative-permission, fuzz and permit-replay tests.
- `THREAT_MODEL.md`: explicit risk assumptions and mitigations.
- `LAUNCH_GATES.md`: required controls before deployment or token distribution.

### Development

Requires [Foundry](https://book.getfoundry.sh/) and Git. The OpenZeppelin release is intentionally version-pinned.

```bash
cd apollo-v2
forge install --no-git OpenZeppelin/openzeppelin-contracts@v5.7.0
forge build
forge test -vvv
```

No private keys, RPC endpoints or wallets are required to compile or run local tests.

### Supply and allocation

`LeadCoinV2(address treasury_, uint256 supply_)` receives an arbitrary positive initial supply in the token's smallest units (18 decimals). For example, 1,000,000 tokens is `1_000_000 * 10**18` units. **The example in tests is not an approved token supply or tokenomics decision.** There is no vesting/distribution contract yet. Real allocations and the treasury's multisig controls require separate product, legal and security approval.

### Scope limits

This does not interact with Apollo Signals brokerage accounts, trading returns, payouts, futures contracts, or client funds. Consumer product access and accounting, if approved, should be modeled in independent systems and never treated as guaranteed token value.

The old repository's README asserts that its *historical* crowdsale was audited. This new implementation has **not** been independently audited; third-party library audit history is not a project audit.

**License/provenance:** This new implementation is independently authored in a fork containing third-party legacy code. Preserve upstream history and notices; conduct trademark, copyright and licensing review before any release.
