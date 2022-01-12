pragma solidity ^0.6.11;

interface IZkVerfiy {
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[1] memory input
        ) external returns (bool r);
}

contract DarkSpaceCore {
    
    IZkVerfiy zkVerifier;
    
    struct Location {
        uint lastTime;
        bool isOccupied;
    }
    mapping(uint => Location) locationMap;
    mapping(address => bool) playerInitialized;
    
    constructor(address _zkVerifier) public {
        zkVerifier = IZkVerfiy(_zkVerifier);
    }
    

   function initializePlayer(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input
    ) public  {
       
        require(
            !playerInitialized[msg.sender],
            "Player is already initialized"
        );

        uint256 _location = _input[0];

        require(!locationMap[_location].isOccupied,"Location is already occupied");
        
        require(locationMap[_location].lastTime < block.timestamp - 5 minutes, "Location recently used!");
        
        require(zkVerifier.verifyProof(_a, _b, _c, _input),"Failed init proof check" );
        
        locationMap[_location].lastTime = block.timestamp;
        locationMap[_location].isOccupied = true;
        playerInitialized[msg.sender] =true;
       
       

        // Initialize player data
        //isPlayerInitialized[msg.sender] = true;
        // playerIds.push(msg.sender);

        // Initialize planet information
        //_initializePlanet(_location, true);
        //planets[_location].owner = msg.sender;
        //planets[_location].population = 75000;
        //_updateWorldRadius();

        //emit PlayerInitialized(msg.sender, _location);
    }


    function isPlayerInitialized() public view returns (bool) {
        return playerInitialized[msg.sender];
    }

}