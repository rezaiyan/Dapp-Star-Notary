// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }

    string public _name = "Haftasia";
    string public _symbol = "HFS";

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    constructor() ERC721(_name, _symbol) {}

    function createStar(string memory name, uint256 _tokenId) external {
        Star memory newStar = Star(name);
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) external {
        require(ownerOf(_tokenId) == msg.sender, "You can't sell the star you don't own");
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) external payable {
        require(starsForSale[_tokenId] > 0, "The star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value >= starCost, "Insufficient Ether sent");

        _transfer(ownerAddress, msg.sender, _tokenId);
        payable(ownerAddress).transfer(starCost);

        if (msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }

    function lookUpTokenIdToStar(uint256 _tokenId) external view returns (string memory) {
        return tokenIdToStarInfo[_tokenId].name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) external {
        address ownerToken1 = ownerOf(_tokenId1);
        address ownerToken2 = ownerOf(_tokenId2);

        require(ownerToken1 == msg.sender || ownerToken2 == msg.sender, "Sender is not the owner");

        _transfer(ownerToken1, ownerToken2, _tokenId1);
        _transfer(ownerToken2, ownerToken1, _tokenId2);
    }

    function transferStar(address _to, uint256 _tokenId) external {
        require(msg.sender == ownerOf(_tokenId), "Sender is not the owner");
        _transfer(msg.sender, _to, _tokenId);
    }
}
