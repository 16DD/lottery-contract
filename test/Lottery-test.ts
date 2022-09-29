import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { Lottery__factory, LotteryToken__factory } from "../typechain-types/factories/contracts";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

const ADDRESS_NULL = "0x0000000000000000000000000000000000000000";
async function deploy(owner: any) {
	//-token join
	const lotteryToken = await new LotteryToken__factory(owner).deploy();
	//-contract play game with erc20
	const lotteryErc20 = await new Lottery__factory(owner).deploy(lotteryToken.address, parseEther("10"));
	//contract play game with native token
	const lotteryNative = await new Lottery__factory(owner).deploy(ADDRESS_NULL, parseEther("100"));

	return { lotteryToken, lotteryErc20, lotteryNative };
}

describe("Lottery game", async () => {
	it("Join game use erc20 ", async () => {
		const [owner, user] = await ethers.getSigners();
		const { lotteryToken, lotteryErc20 } = await deploy(owner);
		//--mint and approve token
		await lotteryToken.connect(owner).mint(user.address, parseEther("100"));
		await lotteryToken.connect(user).approve(lotteryErc20.address, parseEther("10"));
		//--join game
		await lotteryErc20.connect(user).joinGame(32, {
			value: 0,
		});
		//--stop game
		await lotteryErc20.connect(owner).pickWinnerAndAwarding();
		//--check
		const result = await lotteryErc20.gameResult();
		result._winNumber == 32 ? expect(await lotteryToken.balanceOf(user.address)).to.eq(parseEther("99")) : expect(await lotteryToken.balanceOf(owner.address)).to.eq(parseEther("1000010"));
		
		// feePlay = 10
		// if win => winer = 9 owner = 1 
		// if lose => winer = 0 owner = 10
	
	});

	it("Join game use native token", async () => {
		const [owner, user] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		//--join game
		await lotteryNative.connect(user).joinGame(32, {
			value: parseEther("100"),
		});
		//--stop game
		await lotteryNative.connect(owner).pickWinnerAndAwarding();
		//--check
		const result = await lotteryNative.gameResult();
		const balanceOwner = await owner.getBalance();

		result._winNumber == 32 ? expect(balanceOwner.gt(BigNumber.from("10009"))).to.eq(true) : expect(balanceOwner.gt(BigNumber.from("100099"))).to.eq(true);

		// feePlay = 100
		// if win => winer = 10090 owner = 10010  (not counted gas fee)
		// if lose => winer = 9900 owner = 10100
	});

	it.skip("More than one winner", async () => {
		const [owner, user1, user2, user3] = await ethers.getSigners();
		const { lotteryToken, lotteryErc20 } = await deploy(owner);
		//--mint and approve token
		let users = [user1, user2, user3];
		await Promise.all(users.map(async (usr) => {
			await lotteryToken.mint(usr.address, parseEther("100"));
			await lotteryToken.connect(usr).approve(lotteryErc20.address, parseEther("10"));
		}));
		//--join game
		await lotteryErc20.connect(user1).joinGame(32, {
			value: 0,
		});
		await lotteryErc20.connect(user2).joinGame(32, {
			value: 0,
		});
		await lotteryErc20.connect(user3).joinGame(33, {
			value: 0,
		});
		//--stop game
		await lotteryErc20.connect(owner).pickWinnerAndAwarding();
		//--check
		expect(await lotteryToken.balanceOf(user1.address)).to.eq(parseEther("103.5"))
		expect(await lotteryToken.balanceOf(user2.address)).to.eq(parseEther("103.5"))
		//FeePlay = 10 => //TotalAmount = 30
		//ProtocolFee 10% = 3 => //RewardAmount = 30 - 3 =27
		//Recive amount = 13.5 = user1 = user2
	});

	it("Should be fail when admin join game",async ()=>{
		const [owner] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		await expect(lotteryNative.connect(owner).joinGame(33,{
			value:parseEther("100")
		})).to.reverted;
	})

	it("Should be an error when players join more than 1 time",async()=>{
		const [owner, user] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		await lotteryNative.connect(user).joinGame(33,{
			value:parseEther("100")
		})
		await expect( lotteryNative.connect(user).joinGame(32,{
			value:parseEther("100")
		})).to.reverted
	})

	it("Should be fail if bet number greater than 100",async ()=>{
		const [owner,user] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		await expect(lotteryNative.connect(user).joinGame(200,{
			value:parseEther("100")
		})).to.reverted;
	})

	it.skip("Should only allow 100 player ",async () =>{
		const [owner,user,user1,user2] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		await lotteryNative.connect(user).joinGame(33,{
			value:parseEther("100")
		})
		await lotteryNative.connect(user1).joinGame(31,{
			value:parseEther("100")
		})
		await expect(lotteryNative.connect(user2).joinGame(13,{
			value:parseEther("100")
		})).to.reverted
	})

	it("Should be fail when insufficient", async () => {
		const [owner,user] = await ethers.getSigners();
		const { lotteryErc20 } = await deploy(owner);
		await expect(lotteryErc20.connect(user).joinGame(33)).to.reverted;

	})

	it("Should only allow admin pick winner",async () =>{
		const [owner, user] = await ethers.getSigners();
		const { lotteryToken, lotteryErc20 } = await deploy(owner);
		await lotteryToken.connect(owner).mint(user.address, parseEther("100"));
		await lotteryToken.connect(user).approve(lotteryErc20.address, parseEther("10"));
		await lotteryErc20.connect(user).joinGame(32, {
			value: 0,
		});
		await expect( lotteryErc20.connect(user).pickWinnerAndAwarding()).to.reverted;
	})

	it("Should only allow pick winner when game not end",async () =>{
		const [owner, user] = await ethers.getSigners();
		const { lotteryToken, lotteryErc20 } = await deploy(owner);
		await lotteryToken.connect(owner).mint(user.address, parseEther("100"));
		await lotteryToken.connect(user).approve(lotteryErc20.address, parseEther("10"));
		await lotteryErc20.connect(user).joinGame(32, {
			value: 0,
		});
		await lotteryErc20.connect(owner).pickWinnerAndAwarding();
		await expect( lotteryErc20.connect(owner).pickWinnerAndAwarding()).to.reverted;
	})


	it("Should only allow join when game not end ",async ()=>{
		const [owner,user] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		await lotteryNative.connect(user).joinGame(20,{
			value:parseEther("100")
		})
		await lotteryNative.connect(owner).pickWinnerAndAwarding();
		await expect( lotteryNative.connect(user).joinGame(200,{
			value:parseEther("100")
		})).to.reverted
	})

	it("Should be not allow join game when pause",async()=>{
		const [owner,user] = await ethers.getSigners();
		const { lotteryNative } = await deploy(owner);
		await lotteryNative.connect(owner).pauseGame();
		await expect (lotteryNative.connect(user).joinGame(20,{
			value:parseEther("100")
		})).to.reverted
	})
});
