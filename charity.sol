// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlockCharity {
   
    struct Donation {
        uint donorId;
        uint ngoId;
        string disasterId;
        uint amount;
        uint timestamp;
    }

    struct NGO {
        uint ngoId;
        string name;
        string documentHash; // KYC document (stored in IPFS)
        bool isVerified;
        bool kycPending;
        address wallet;
    }

    struct Reward {
        uint donorId;
        uint totalDonations;
        uint rewardPoints;
    }

   
    mapping(uint => Donation[]) public ngoDonations;
    mapping(address => uint) public balances;
    mapping(uint => NGO) public ngos;
    mapping(uint => Reward) public donorRewards;

    address public admin;
    uint public ngoCount = 0;

   
    event DonationReceived(address indexed donor, uint donorId, uint ngoId, string disasterId, uint amount);
    event NGORegistered(uint ngoId, string name, address wallet);
    event KYCSubmitted(uint ngoId, string documentHash);
    event NGOVerified(uint ngoId, bool verifiedStatus);
    event RewardUpdated(uint donorId, uint newPoints);

    
    constructor() {
        admin = msg.sender;

        // Preload your college NGO for demo
        ngoCount++;
        ngos[ngoCount] = NGO({
            ngoId: ngoCount,
            name: "Air Humanitarian Homes - Bangalore",
            documentHash: "pending",
            isVerified: false,
            kycPending: true,
            wallet: msg.sender
        });

        emit NGORegistered(ngoCount, "Air Humanitarian Homes - Bangalore", msg.sender);
    }

    // -------------------------------
    // 🏢 NGO REGISTRATION + KYC
    // -------------------------------
    function registerNGO(string calldata _name) external {
        ngoCount++;
        ngos[ngoCount] = NGO({
            ngoId: ngoCount,
            name: _name,
            documentHash: "",
            isVerified: false,
            kycPending: true,
            wallet: msg.sender
        });

        emit NGORegistered(ngoCount, _name, msg.sender);
    }

    function submitKYC(uint _ngoId, string calldata _documentHash) external {
        require(msg.sender == ngos[_ngoId].wallet, "Only NGO wallet can upload KYC");
        ngos[_ngoId].documentHash = _documentHash;
        ngos[_ngoId].kycPending = true;
        emit KYCSubmitted(_ngoId, _documentHash);
    }

    function verifyKYC(uint _ngoId, bool _status) external {
        require(msg.sender == admin, "Only admin can verify KYC");
        require(_ngoId > 0 && _ngoId <= ngoCount, "Invalid NGO ID");

        ngos[_ngoId].isVerified = _status;
        ngos[_ngoId].kycPending = false;
        emit NGOVerified(_ngoId, _status);
    }

    // -------------------------------
    // 💰 DONATION LOGIC
    // -------------------------------
    function donate(uint donorId, uint ngoId, string calldata disasterId) external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        require(ngos[ngoId].isVerified, "NGO not verified");

        Donation memory newDonation = Donation({
            donorId: donorId,
            ngoId: ngoId,
            disasterId: disasterId,
            amount: msg.value,
            timestamp: block.timestamp
        });

        ngoDonations[ngoId].push(newDonation);
        balances[msg.sender] += msg.value;

        // Reward system: 1 point per ether
        uint points = msg.value / 1 ether;
        donorRewards[donorId].donorId = donorId;
        donorRewards[donorId].totalDonations += msg.value;
        donorRewards[donorId].rewardPoints += points;

        emit RewardUpdated(donorId, donorRewards[donorId].rewardPoints);
        emit DonationReceived(msg.sender, donorId, ngoId, disasterId, msg.value);
    }

    
    function getDonationsCount(uint ngoId) external view returns (uint) {
        return ngoDonations[ngoId].length;
    }

    function getDonation(uint ngoId, uint index)
        external
        view
        returns (uint donorId, uint ngoIdOut, string memory disasterId, uint amount, uint timestamp)
    {
        require(index < ngoDonations[ngoId].length, "Invalid index");
        Donation memory d = ngoDonations[ngoId][index];
        return (d.donorId, d.ngoId, d.disasterId, d.amount, d.timestamp);
    }

    function getNGODetails(uint ngoId)
        external
        view
        returns (string memory name, string memory documentHash, bool isVerified, bool kycPending, address wallet)
    {
        require(ngoId > 0 && ngoId <= ngoCount, "Invalid NGO ID");
        NGO memory n = ngos[ngoId];
        return (n.name, n.documentHash, n.isVerified, n.kycPending, n.wallet);
    }

    function getDonorRewards(uint donorId)
        external
        view
        returns (uint totalDonations, uint rewardPoints)
    {
        Reward memory r = donorRewards[donorId];
        return (r.totalDonations, r.rewardPoints);
    }

    function withdraw(address payable to, uint amount) external {
        require(msg.sender == admin || msg.sender == to, "Not authorized");
        require(amount <= address(this).balance, "Insufficient balance");
        to.transfer(amount);
    }

    function contractBalance() external view returns (uint) {
        return address(this).balance;
    }
}
