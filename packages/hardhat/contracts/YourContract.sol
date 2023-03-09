//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
//import "hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract is ERC20 {

    // State Variables
    address public immutable owner;

    bool public gameOn;
    
    bool public openToCollect;

    uint8 public round; 

    mapping( uint8 => uint8 ) public bestPref;

    mapping( uint8 => uint8 ) public counter;

    mapping( uint8 => mapping ( address => uint8) ) public preferences;
    uint8[] public prefCount = [0,0,0,0];

    uint8[4] public indexOfDisplay;

    event Register(address indexed from);
    
    function register() public {
        emit Register(msg.sender);
    }

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) ERC20("Preference","PREF") {
        owner = _owner;
    }

    function startGame( uint8 a, uint8 b, uint8 c, uint8 d ) public isOwner {
        require(!gameOn, "Game is already on");
        indexOfDisplay = [a,b,c,d];
        gameOn = true;
        round = 1;
    }

    function endRound() public isOwner {
        require(!openToCollect, "Round has ended");
        uint8 highestPref;

        for (uint8 i=0; i<4; i++) {
            if (prefCount[i] > highestPref) {
                bestPref[round] = i+1;
                highestPref = prefCount[i];
            }
        }

        prefCount = [0,0,0,0];
        openToCollect = true;
    }

    function startNextRound( uint8 a, uint8 b, uint8 c, uint8 d ) public isOwner {
        require(openToCollect, "Round not over yet");
        indexOfDisplay = [a,b,c,d];
        round++;
        openToCollect = false;
    }

    function collect() public {
        require(openToCollect, "Round not over");
        require(bestPref[round] != 0, "no best pref");
        require(preferences[round][msg.sender]==bestPref[round], "not the best pref");
        preferences[round][msg.sender]=0;
        _mint(msg.sender, 1 ether);
    }

    function setPreference(uint8 pref) public {
        require(gameOn, "Game is not on");
        require(!openToCollect, "Round has ended");
        require(preferences[round][msg.sender]==0, "already set");
        require(pref>0 && pref<5, "invalid preference");
        preferences[round][msg.sender] = pref;
        prefCount[pref-1]++;
        counter[round]++;
        register();
    }

    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    

    /**
     * Function that allows the contract to receive ETH
     */
    //receive() external payable {}
}
