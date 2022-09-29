# Lottery Contract

Lottery contract cho phép mọi người tham gia trò chơi xổ số sử dụng ERC20 hoặc Native Token, mỗi người chơi tham gia sẽ bỏ ra một lượng tiền để đặt cược vào một trong những con số từ 00-99. Sau khi trò chơi kết thúc người chơi trúng thưởng sẽ nhận về toàn bộ số tiền các người chơi khác đặt cược, nếu không có người chiến thắng toàn bộ phần thưởng sẽ chuyển về admin.

Scripts test contract:

```shell
npx hardhat test
```

Scripts deploy contract:

```shell
npx hardhat deploy --tags Lottery --network matic-testnet
```

Note: phải thêm .env

Scripts verify contract:

```shell
npx hardhat verify --network matic-testnet
```

# Paramters

playFee : phí để tham gia trò chơi.

token : địa chỉ token dùng để làm phí của trò chơi.

luckyNumber: số trúng thưởng, được chọn bằng cách lấy (block.timestamp % 100) để lấy ra hai chữ số cuối .

winners: danh sách những người trúng thưởng.

players: danh sách những người đã tham gia.

betNumberToPlayers: ánh xạ từ số đặt cược tới những người đã đặt cược vào số đó .

playerToBetNumber: ánh xạ từ người chơi tới số đặt cược của người đó.

isEnded: trạng thái của trò chơi.

# Functions

joinGame: người chơi sẽ gọi hàm để tham gia trò chơi.

pickWinnerAndAwarding: admin sẽ gọi hàm để chọn ra người chiến thắng và trao thưởng. Nếu có nhiều hơn 1 người chiến thắng phần thưởng sẽ được chia đều cho những người trúng thưởng.

# Contract Address On Polygon Mumbai

Xem tại file address_deploy.json
