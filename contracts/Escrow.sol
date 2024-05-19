//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    // this is from the RealEstate contract which inherits from ERC721. "I" in IERC721 is for Interface
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;

    mapping(uint256 => bool) public inspectionStatus;
    mapping(uint256 => mapping(address => bool)) public approvals;

    modifier onlySeller() {
        require(msg.sender == seller, "Only the seller can call this method");
        _;
    }

    modifier onlyBuyer(uint256 _nftID) {
        require(
            msg.sender == buyer[_nftID],
            "Only the buyer can call this method"
        );
        _;
    }

    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "Only the inspector can call this method"
        );
        _;
    }

    modifier hasBalanceToPayEscrowAmount(uint _nftID) {
        require(msg.value >= escrowAmount[_nftID], "Not enough balance");
        _;
    }

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    // used by the seller
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // the seller is listing a property. The escrow is responsible to now transfer the nft for the property from the seller's wallet to the escrow's wallet.
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // used by the buyer
    function depositEarnestAmount(
        uint256 _nftID
    ) public payable onlyBuyer(_nftID) hasBalanceToPayEscrowAmount(_nftID) {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {} // this is a special function used to handle plain Ether transfers sent to the contract
    // It is a way for a contract to accept Ether without any data (i.e., when the transaction does not specify any function to call).

    // used by a verifying entity to inspect the property
    function updateInspectionStatus(uint256 _nftID) public onlyInspector {
        inspectionStatus[_nftID] = true;
    }
    function getInspectionStatus(uint256 _nftID) public view returns (bool) {
        return inspectionStatus[_nftID];
    }

    // Used by all parties involved to approve the sale of the property
    function approveSale(uint256 _nftID) public {
        approvals[_nftID][msg.sender] = true;
    }

    // called by seller
    // require inspection status to be true
    // require sale to be authorized by buyer, seller, and inspector
    // require funds to
    function finalizeSale(uint256 _nftID) public onlySeller {
        require(inspectionStatus[_nftID], "Property not inspected");
        require(approvals[_nftID][buyer[_nftID]], "Sale not approved by buyer");
        require(approvals[_nftID][seller], "Sale not approved by seller");
        require(approvals[_nftID][inspector], "Sale not approved by inspector");
        require(
            address(this).balance >= purchasePrice[_nftID],
            "insufficient balance"
        );

        // transfer the funds to the seller
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        // transfer the nft to the buyer
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);

        isListed[_nftID] = false;
    }

    function cancelSale(uint256 _nftID) public onlyBuyer(_nftID) {
        payable(buyer[_nftID]).transfer(address(this).balance);
    }
}
