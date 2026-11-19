// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {LeadCoinV2} from "../src/LeadCoinV2.sol";

// Foundry cheatcode interface. Kept local to avoid an additional test dependency.
interface Vm {
    function prank(address sender) external;
    function expectRevert() external;
    function expectRevert(bytes4 selector) external;
    function addr(uint256 privateKey) external returns (address);
    function sign(uint256 privateKey, bytes32 digest) external returns (uint8, bytes32, bytes32);
}

contract LeadCoinV2Test {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    uint256 private constant GENESIS = 1_000_000 ether;
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    LeadCoinV2 private token;
    address private treasury = address(0xA11CE);
    address private alice = address(0xB0B);
    address private bob = address(0xCAFE);

    function setUp() public {
        token = new LeadCoinV2(treasury, GENESIS);
    }

    function test_GenesisMintIsExact() public view {
        require(token.totalSupply() == GENESIS, "incorrect supply");
        require(token.balanceOf(treasury) == GENESIS, "treasury not funded");
        require(token.balanceOf(alice) == 0, "unexpected alice balance");
        require(token.genesisSupply() == GENESIS, "immutable supply mismatch");
        require(token.genesisTreasury() == treasury, "immutable treasury mismatch");
        require(token.decimals() == 18, "incorrect decimals");
        require(keccak256(bytes(token.symbol())) == keccak256("LDC"), "incorrect symbol");
    }

    function test_ZeroTreasuryRejected() public {
        vm.expectRevert(LeadCoinV2.ZeroTreasury.selector);
        new LeadCoinV2(address(0), GENESIS);
    }

    function test_ZeroSupplyRejected() public {
        vm.expectRevert(LeadCoinV2.ZeroGenesisSupply.selector);
        new LeadCoinV2(treasury, 0);
    }

    function test_TransfersConserveSupply() public {
        vm.prank(treasury);
        require(token.transfer(alice, 100 ether), "transfer rejected");
        require(token.totalSupply() == GENESIS, "supply changed");
        require(token.balanceOf(alice) == 100 ether, "alice balance mismatch");
        require(token.balanceOf(treasury) == GENESIS - 100 ether, "treasury balance mismatch");
    }

    function testFuzz_TransfersConserveSupply(uint96 input) public {
        uint256 amount = uint256(input) % (GENESIS + 1);
        vm.prank(treasury);
        require(token.transfer(alice, amount), "fuzz transfer rejected");
        require(token.balanceOf(alice) == amount, "fuzz beneficiary balance mismatch");
        require(token.balanceOf(treasury) == GENESIS - amount, "fuzz treasury balance mismatch");
        require(token.totalSupply() == GENESIS, "fuzz supply changed");
    }

    function test_TransferFromRequiresAllowance() public {
        vm.prank(treasury);
        require(token.approve(alice, 50 ether), "approval failed");

        vm.prank(alice);
        require(token.transferFrom(treasury, bob, 20 ether), "transferFrom failed");

        require(token.balanceOf(bob) == 20 ether, "spender transfer balance mismatch");
        require(token.allowance(treasury, alice) == 30 ether, "allowance mismatch");
        require(token.totalSupply() == GENESIS, "allowance changed supply");
    }

    function test_CannotSpendWithoutAllowance() public {
        vm.prank(alice);
        vm.expectRevert();
        token.transferFrom(treasury, bob, 1);
    }

    function test_NoExternalMintOrForcedBurn() public {
        (bool minted,) = address(token).call(abi.encodeWithSignature("mint(address,uint256)", alice, 1));
        require(!minted, "unexpected mint entrypoint");

        (bool burned,) = address(token).call(abi.encodeWithSignature("burnFrom(address,uint256)", treasury, 1));
        require(!burned, "unexpected forced burn entrypoint");

        (bool ownerCall,) = address(token).call(abi.encodeWithSignature("owner()"));
        require(!ownerCall, "unexpected privileged owner entrypoint");
        require(token.totalSupply() == GENESIS, "supply changed through admin call");
    }

    function test_PermitCanAuthorizeWithoutAnApprovalTransaction() public {
        uint256 signerKey = 0xD00D;
        address holder = vm.addr(signerKey);
        vm.prank(treasury);
        token.transfer(holder, 200 ether);

        uint256 deadline = block.timestamp + 1 days;
        uint256 amount = 55 ether;
        bytes32 digest = keccak256(
            abi.encodePacked(
                hex"1901",
                token.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(PERMIT_TYPEHASH, holder, alice, amount, token.nonces(holder), deadline))
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        token.permit(holder, alice, amount, deadline, v, r, s);

        require(token.allowance(holder, alice) == amount, "permit allowance mismatch");
        require(token.nonces(holder) == 1, "permit nonce not incremented");

        vm.expectRevert();
        token.permit(holder, alice, amount, deadline, v, r, s);
    }
}
