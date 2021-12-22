// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MarketPlace
 * @dev Implements the simple market place. 
 * Seller can open a sell order, then buyers can directly buy it.
 */
contract MarketPlace is Ownable {
    using Counters for Counters.Counter;

    event TradeStatusChange(uint256 id, bytes32 status);

    struct Trade {
        address poster;
        uint256 item;
        uint256 price;
        bytes32 status; // Open, Executed, Cancelled
    }

    // Mapping index number to trade
    mapping(uint256 => Trade) private _trades;

    // Mapping owner address to trade count
    mapping(address => uint256) private _totals;

    // Mapping from owner to list of owned trade IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTrades;

    // NFT Contract for trading
    IERC721 private _itemToken;

    // Trade index number counter
    Counters.Counter private _tradeIdCounter;

    constructor() {}

    /**
     * @dev Set the item token contract.
     * @param itemTokenAddress The address of the ERC721 contract.
     */
    function setItemToken(address itemTokenAddress) public onlyOwner {
        require(itemTokenAddress != address(0), "item token address should not be plain");
        _itemToken = IERC721(itemTokenAddress);
    }

    /**
     * @dev Returns the total count of all trades.
     */
    function totalTrade() public view returns (uint256) {
        return _tradeIdCounter.current();
    }

    /**
     * @dev Returns the trade count for the nft owner.
     * @param poster The address of the nft owner.
     */
    function totalTradeOf(address poster) public view returns (uint256) {
        return _totals[poster];
    }

    /**
     * @dev Returns the trade id with then specified index number of the poster.
     * @param poster The address of the nft owner.
     * @param index The index number.
     */
    function tradeOfPosterByIndex(address poster, uint256 index) public view returns (uint256) {
        require(index < totalTradeOf(poster), "poster index out of bounds");
        return _ownedTrades[poster][index];
    }

    /**
     * @dev Returns the details for a trade.
     * @param tradeId The id for the trade.
     */
    function getTrade(uint256 tradeId) public view returns(address, uint256, uint256, bytes32) {
        Trade memory trade = _trades[tradeId];
        return (trade.poster, trade.item, trade.price, trade.status);
    }

    /**
     * @dev Opens a new trade. Puts item in escrow.
     * @param itemId The id for the item to trade.
     * @param price The amount of currency for which to trade the item.
     */
    function openTrade(uint256 itemId, uint256 price) public {
        require(_itemToken.ownerOf(itemId) == msg.sender, "You can only sell your owned token");

        uint256 tradeId = _tradeIdCounter.current();
        _tradeIdCounter.increment();

        _itemToken.transferFrom(msg.sender, address(this), itemId);

        _trades[tradeId] = Trade({
            poster: msg.sender,
            item: itemId,
            price: price,
            status: "Open"
        });

        _ownedTrades[msg.sender][_totals[msg.sender]] = tradeId;
        _totals[msg.sender]++;

        emit TradeStatusChange(tradeId, "Open");
    }

    /**
     * @dev Executes a trade.
     * @param tradeId The id of an existing trade
     */
    function executeTrade(uint256 tradeId) public payable {
        Trade memory trade = _trades[tradeId];
        require(trade.status == "Open", "Trade is not Open");

        require(msg.value >= trade.price, "The amount paid is not enough");

        address payable poster = payable(trade.poster);
        poster.transfer(trade.price);

        _itemToken.transferFrom(address(this), msg.sender, trade.item);
        _trades[tradeId].status = "Executed";

        emit TradeStatusChange(tradeId, "Executed");
    }

    /**
     * @dev Cancels a trade by the poster.
     * @param tradeId The id for the trade to be cancelled.
     */
    function cancelTrade(uint256 tradeId) public {
        Trade memory trade = _trades[tradeId];
        require(
            msg.sender == trade.poster,
            "Trade can be cancelled only by poster"
        );
        require(trade.status == "Open", "Trade is not Open");
        _itemToken.transferFrom(address(this), trade.poster, trade.item);
        _trades[tradeId].status = "Cancelled";

        emit TradeStatusChange(tradeId, "Cancelled");
    }
}