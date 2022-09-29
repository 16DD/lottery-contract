// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./utils/SafeTransfer.sol";

contract Lottery is SafeTransfer, Ownable, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct GameInfo {
        uint256 playFee; 
        address token; 
        uint8 luckyNumber;
        address[] winners; 
        EnumerableSet.AddressSet players; //list player joined
        mapping(uint8 => EnumerableSet.AddressSet) betNumberToPlayers; //bet number -> list players
        mapping(address => uint8) playerToBetNumber; //player bet number
        bool isEnded;
    }

    GameInfo gameInfo;

    modifier whenNotEnded() {
        require(!gameInfo.isEnded,"Lottery: game ended");
        _;
    }
    event Joined(address user, uint8 betNumber);
    event Finalized(uint8 luckyNumber, address[] winner, uint256 totalAmount);

    constructor(address _token, uint256 _playFee){
        gameInfo.token = _token;
        gameInfo.playFee = _playFee;
    }

    function pauseGame()  public onlyOwner {
         _pause();
    }

     function unPauseGame()  public onlyOwner {
         _unpause();
    }

    function gameDetail() public view returns(address _token, uint256 _playFee, address[] memory _players, bool _isEnded) {
        _token = gameInfo.token;
        _playFee = gameInfo.playFee;
        _players = new address[](gameInfo.players.length());
        for (uint256 i = 0; i < gameInfo.players.length(); i++) {
            _players[i] = gameInfo.players.at(i);
        }
        _isEnded = gameInfo.isEnded;
    }

    function gameResult() public view returns(uint8 _luckyNumber, address[] memory _winners) {
        require(gameInfo.isEnded,"Lottery: game is not over");
        _luckyNumber = gameInfo.luckyNumber;
        _winners = gameInfo.winners;
    }

     function betNumberOfPlayer(address _player) public view returns(uint8 _betNumber) {
        require(gameInfo.players.contains(_player),"Lottery: player have not joined");
        _betNumber = gameInfo.playerToBetNumber[_player];
    }

    function joinGame(uint8 _betNumber) public payable whenNotEnded whenNotPaused {
        require(_validation(_betNumber),"Lottery: can not join");

        if (gameInfo.token != address(0)) {
            _safeTransferFrom(gameInfo.token,msg.sender, address(this), gameInfo.playFee);
        }
        else {
            uint256 amountRemaining = msg.value - gameInfo.playFee;
            if(amountRemaining > 0 ) {
                _safeTransferETH(msg.sender,amountRemaining);
            }
        }

        gameInfo.players.add(msg.sender);
        gameInfo.betNumberToPlayers[_betNumber].add(msg.sender);
        gameInfo.playerToBetNumber[msg.sender] = _betNumber;
         
        emit Joined(msg.sender, _betNumber);
    }
    
    function pickWinnerAndAwarding() public whenNotEnded onlyOwner {
        uint8 _luckyNumber = uint8(block.timestamp % 100);
        uint256 totalWinner = gameInfo.betNumberToPlayers[_luckyNumber].length();
        uint256 totalAmount = (gameInfo.token == address(0)? address(this).balance : IERC20(gameInfo.token).balanceOf(address(this)));
        
       if (totalWinner == 0 ) {
            safeTokenTransfer(gameInfo.token, payable(owner()), totalAmount);
        }
        else {
            uint256 protocolFee =((totalAmount*10) / 100);
            uint256 rewardAmount = (totalAmount - protocolFee) / totalWinner;
           
            safeTokenTransfer(gameInfo.token, payable(owner()), protocolFee);
            for(uint256 i = 0; i < totalWinner; i++) {
                address winner = gameInfo.betNumberToPlayers[_luckyNumber].at(i);
                gameInfo.winners.push(winner);
                safeTokenTransfer(gameInfo.token, payable(winner), rewardAmount);
            }
        }
        gameInfo.luckyNumber= _luckyNumber;
        gameInfo.isEnded=true;
        emit Finalized(gameInfo.luckyNumber, gameInfo.winners, totalAmount);
    }


    function _validation(uint8 _betNumber) internal view returns(bool) {
        uint256 amountFee = gameInfo.token == address(0) ? msg.value : IERC20(gameInfo.token).balanceOf(msg.sender);
        return (
            (gameInfo.players.length() < 100) && //There are max 100 players at the same time.
            (_betNumber < 100) && //Betting number from 00 -> 99.
            (!gameInfo.players.contains(msg.sender)) && //1 player can bet only 1 time.
            (msg.sender != owner()) && //Admin cannot be a player.
            (amountFee >= gameInfo.playFee) 
        );
    } 


}
