pragma solidity ^0.6.11;
 
interface IZkVerfiy {
   function verifyProof(
           uint[2] memory a,
           uint[2][2] memory b,
           uint[2] memory c,
           uint[1] memory input
       ) external returns (bool r);
}
 
 interface IMoveVerfiy {
   function verifyProof(
           uint[2] memory a,
           uint[2][2] memory b,
           uint[2] memory c,
           uint[2] memory input
       ) external returns (bool r);
}
contract DarkSpaceCore {
 
   IZkVerfiy zkVerifier;
IMoveVerfiy moveVerifier;
   struct Location {
       uint lastTime;
       bool isOccupied;
   }
   struct Planet {
       uint32 planetResourceType;
       uint32 population;
       uint256 resourcesLeft;
       uint32 pendingHarvest;
   }
 
   struct Player {
       uint32 resources;
       uint256 location;
       uint256 lastMovedTs;
       bool harvesting;
      
   }
 
   mapping(uint => Location) locationMap;
   mapping(uint => Planet) planetLocationMap;
   mapping(address => Player) playerAddressMap;
   bool planetsInit;
 
   constructor(address _zkVerifier, address _moveVerifier) public {
       zkVerifier = IZkVerfiy(_zkVerifier);
       moveVerifier= IMoveVerfiy(_moveVerifier);
   }
 
 
  function initializePlayer(
       uint256[2] memory _a,
       uint256[2][2] memory _b,
       uint256[2] memory _c,
       uint256[1] memory _input
   ) public  {
 
       require(
           playerAddressMap[msg.sender].location == 0,
           "Player is already initialized"
       );
 
       uint256 _location = _input[0];
 
       require(!locationMap[_location].isOccupied, "Location is already occupied");
 
       require(locationMap[_location].lastTime < block.timestamp - 5 minutes, "Location recently used!");
 
       require(zkVerifier.verifyProof(_a, _b, _c, _input),"Failed init proof check" );
 
       locationMap[_location].lastTime = block.timestamp;
      
       locationMap[_location].isOccupied = true;
 
       //playerLocationMap[msg.sender] =_location;
       playerAddressMap[msg.sender].location=_location;
       playerAddressMap[msg.sender].lastMovedTs =block.timestamp;
      
      // location is not plaent
       if(planetLocationMap[_location].planetResourceType==0){
           return;
       }
 
       playerAddressMap[msg.sender].harvesting=true;   
       planetLocationMap[_location].population+=1;
 
       planetLocationMap[_location].pendingHarvest += planetLocationMap[_location].planetResourceType;
      
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
 
function movePlayer(
       uint256[2] memory _a,
       uint256[2][2] memory _b,
       uint256[2] memory _c,
       uint256[2] memory _input
   ) public  {
 
       require( playerAddressMap[msg.sender].lastMovedTs  < block.timestamp - 30 seconds, "Are you gonna keep on moving?");
      
       //require(locationMap[_location].lastTime < block.timestamp - 5 minutes, "Location recently used!");
       //require(!locationMap[_location].isOccupied,"Location is already occupied");
       uint256 _oldLocation = _input[0];
       uint256 _newLocation = _input[1];
       //unit32 _resourceToHarvest = _input[2];
       require(moveVerifier.verifyProof(_a, _b, _c, _input),"Failed move proof check" );
      
       playerAddressMap[msg.sender].location=_newLocation;
       playerAddressMap[msg.sender].lastMovedTs =block.timestamp;
 
       // player again on same planet hence add same resource type to pendingHarvest
       if(_oldLocation==_newLocation && playerAddressMap[msg.sender].harvesting==true){
            planetLocationMap[_oldLocation].pendingHarvest += planetLocationMap[_oldLocation].planetResourceType;
            return;
       }
 
       // player left a planet then transfer pending harvest to player
       // make pending harvest as 0
       if(planetLocationMap[_oldLocation].planetResourceType!=0){
            playerAddressMap[msg.sender].resources +=planetLocationMap[_oldLocation].pendingHarvest;
            planetLocationMap[_oldLocation].pendingHarvest=0; 
            planetLocationMap[_oldLocation].population-=1; 
            playerAddressMap[msg.sender].harvesting=false; 
       }
      
       // player move to a new planet
       if(planetLocationMap[_newLocation].planetResourceType!=0){
             playerAddressMap[msg.sender].harvesting=true;   
             planetLocationMap[_newLocation].population+=1;
             planetLocationMap[_newLocation].pendingHarvest += planetLocationMap[_newLocation].planetResourceType;
       }
 
      
       // if not a planet
       locationMap[_newLocation].lastTime = block.timestamp;
       locationMap[_newLocation].isOccupied = true;
      
   }
 
 
   function isPlayerInitialized(address player) public view returns (bool) {
       return playerAddressMap[player].location!=0;
   }
 
   function getPlayerData() public view returns (uint32,uint256,uint256,bool) {
      uint32 resources =playerAddressMap[msg.sender].resources;
       uint256 location =playerAddressMap[msg.sender].location;
       uint256 lastMovedTs =playerAddressMap[msg.sender].lastMovedTs;
       bool harvesting =playerAddressMap[msg.sender].harvesting;
       return (resources,location,lastMovedTs,harvesting );
   }
 
 function initializePlanets() public {
     require(!planetsInit,"already initialized");
     planetLocationMap[0x266b29bf96dfa0b6e9e7c877f91d950b85ec632180c93a10c82dc5acba821101].planetResourceType=1;
     planetLocationMap[0x266b29bf96dfa0b6e9e7c877f91d950b85ec632180c93a10c82dc5acba821101].resourcesLeft=100;


     planetLocationMap[0x105bb1ae3a8c33c2794db19ba79b1d74cfcc0edaebeb01923867af864a0da744].planetResourceType=1;
     planetLocationMap[0x105bb1ae3a8c33c2794db19ba79b1d74cfcc0edaebeb01923867af864a0da744].resourcesLeft=100;

     planetLocationMap[0x24054239755d657c8a10a3c95eaaafae3aa88f9b4bd31602b5737bf36c791d3b].planetResourceType=1;
     planetLocationMap[0x24054239755d657c8a10a3c95eaaafae3aa88f9b4bd31602b5737bf36c791d3b].resourcesLeft=100;

    planetsInit=true;
 }
}
