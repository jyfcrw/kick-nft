const MarketPlace = artifacts.require("MarketPlace")
const KiCollectable = artifacts.require("KiCollectable")

contract("MarketPlace", accounts => {
  let marketPlace
  let kiCollectable

  before(async () => {
    marketPlace = await MarketPlace.deployed();
    kiCollectable = await KiCollectable.deployed();
  
    await kiCollectable.mintToken(accounts[0], "bafyreieeknpu6qrmzxvzbpulcqwaoq3p42jpzxrslulsxzf723i4hni22i/metadata.json")
    await kiCollectable.mintToken(accounts[0], "bafyreidvrwg2xwmj66ycrshqb6olgnzejpmyfimocep2varcugcqk23enu/metadata.json")
  })
  
  it("should open trade for the first nft", async () => {
    const tokenId = 0
    const totalTrade1 = await marketPlace.totalTrade.call()
    const tradeId = totalTrade1

    const balance1 = await kiCollectable.balanceOf(accounts[0])
    assert.equal(balance1.toNumber(), 2)
    
    await kiCollectable.approve(marketPlace.address, tokenId, { from: accounts[0] })
    await marketPlace.openTrade(tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0] })

    const balance2 = await kiCollectable.balanceOf(accounts[0])
    assert.equal(balance2.toNumber(), 1)
    
    const totalTrade2 = await marketPlace.totalTrade.call()
    assert.equal(totalTrade2.toNumber(), 1)

    const tradeData = await marketPlace.getTrade(tradeId, { from: accounts[0] })
    const status1 = web3.utils.hexToUtf8(tradeData[3])

    assert.equal(status1, 'Open')
  })

  it("should execute trade for the first nft by account_1", async () => {
    const tradeId = 0

    const balance1 = await kiCollectable.balanceOf(accounts[1])
    assert.equal(balance1.toNumber(), 0)

    const ethBalance1 = await web3.eth.getBalance(accounts[0])

    const tradeData1 = await marketPlace.getTrade(tradeId, { from: accounts[0] })
    const price = tradeData1[2]
    await marketPlace.executeTrade(tradeId, { from: accounts[1], value: price })

    const tradeData2 = await marketPlace.getTrade(tradeId, { from: accounts[0] })
    const status1 = web3.utils.hexToUtf8(tradeData2[3])
    assert.equal(status1, 'Executed')

    const ethBalance2 = await web3.eth.getBalance(accounts[0])
    assert.equal(
      web3.utils.toBN(ethBalance1)
        .add(web3.utils.toBN(web3.utils.toWei('1', 'ether')))
        .toString(),
      ethBalance2
    )

    const balance2 = await kiCollectable.balanceOf(accounts[1])
    assert.equal(balance2.toNumber(), 1)
  })

  it("should cancel trade for the second nft", async () => {
    const tokenId = 1
    const balance1 = await kiCollectable.balanceOf(accounts[0])
    const totalTrade1 = await marketPlace.totalTrade.call()
    const tradeId = totalTrade1

    await kiCollectable.approve(marketPlace.address, tokenId, { from: accounts[0] })
    await marketPlace.openTrade(tokenId, web3.utils.toWei('1', 'ether'), { from: accounts[0] })

    const balance2 = await kiCollectable.balanceOf(accounts[0])
    assert.equal(balance2.toNumber(), balance1.toNumber() - 1)

    const totalTrade2 = await marketPlace.totalTrade.call()
    assert.equal(totalTrade2.toNumber(), totalTrade1.toNumber() + 1)

    await marketPlace.cancelTrade(tradeId, { from: accounts[0] })
    
    const tradeData = await marketPlace.getTrade(tradeId, { from: accounts[0] })
    const status1 = web3.utils.hexToUtf8(tradeData[3])

    assert.equal(status1, 'Cancelled')
    
    const balance3 = await kiCollectable.balanceOf(accounts[0])
    assert.equal(balance3.toNumber(), balance1.toNumber())
  })
})