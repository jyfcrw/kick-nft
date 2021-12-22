const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

const MarketPlace = artifacts.require('MarketPlace')
const KiCollectable = artifacts.require('KiCollectable')

const URL_ONE = 'valid_url_one/metadata.json',
      URL_TWO = 'valid_url_two/metadata.json',
      URL_THREE = 'valid_url_three/metadata.json'
      URL_FOUR = 'valid_url_four/metadata.json'

function getTokenIdFromTx(tx) {
  return tx.logs[0].args.tokenId
}

function getTradeIdFromTx(tx) {
  return tx.logs[0].args.id
}

contract('MarketPlace with OpenTrade', accounts => {
  let marketPlace
  let kiCollectable

  let firstTokenId,
      secondTokenId,
      thirdTokenId

const firstTokenTargetPrice = web3.utils.toWei('1', 'ether'),
      secondTokenTargetPrice = web3.utils.toWei('1.5', 'ether')
    
  const [
    accountOne,
    accountTwo,
    accountThree
  ] = accounts 

  before(async () => {
    marketPlace = await MarketPlace.deployed()
    kiCollectable = await KiCollectable.deployed()
  
    firstTokenId = await kiCollectable.mintToken(accountOne, URL_ONE, { from: accountOne }).then(getTokenIdFromTx)
    secondTokenId = await kiCollectable.mintToken(accountTwo, URL_TWO, { from: accountTwo }).then(getTokenIdFromTx)
    thirdTokenId = await kiCollectable.mintToken(accountThree, URL_THREE, { from: accountThree }).then(getTokenIdFromTx)
  })
  
  it('should open trade for the first token of accountOne', async () => {
    const firstTokenOwnerBefore = await kiCollectable.ownerOf.call(firstTokenId)
    const totalTradeOfAccountOneBefore = await marketPlace.totalTradeOf.call(accountOne)
    assert.equal(firstTokenOwnerBefore, accountOne)
    assert.equal(totalTradeOfAccountOneBefore, 0)

    await kiCollectable.approve(marketPlace.address, firstTokenId, { from: accountOne })
    const tx = await marketPlace.openTrade(firstTokenId, firstTokenTargetPrice, { from: accountOne })
    
    const firstTradeId = getTradeIdFromTx(tx)
    const firstTradeStatusInEvent = tx.logs[0].args.status
    const firstTokenOwnerAfter = await kiCollectable.ownerOf.call(firstTokenId)
    const totalTradeOfAccountOneAfter = await marketPlace.totalTradeOf.call(accountOne)
    const firstTradeData = await marketPlace.getTrade.call(firstTradeId)
    const firstTradePoster = firstTradeData[0],
          firstTradeTokenId = firstTradeData[1],
          firstTradePrice = firstTradeData[2],
          firstTradeStatus = firstTradeData[3]

    assert.equal(firstTokenOwnerAfter, marketPlace.address)
    assert.equal(totalTradeOfAccountOneAfter, 1)
    assert.equal(firstTradePoster, accountOne)
    assert.equal(firstTradeTokenId.toNumber(), firstTokenId.toNumber())
    assert.equal(firstTradePrice, firstTokenTargetPrice)
    assert.equal(web3.utils.hexToUtf8(firstTradeStatus), 'Open')
    assert.equal(firstTradeStatus, firstTradeStatusInEvent)
  })

  it('can not open trade for token of accountTwo by accountThree', async () => {
    const secondTokenOwnerBefore = await kiCollectable.ownerOf.call(secondTokenId)
    const totalTradeOfAccountThreeBefore = await marketPlace.totalTradeOf.call(accountThree)
    assert.equal(secondTokenOwnerBefore, accountTwo)
    assert.equal(totalTradeOfAccountThreeBefore.toNumber(), 0)

    await kiCollectable.approve(marketPlace.address, secondTokenId, { from: accountTwo })
    await expectRevert(
      marketPlace.openTrade(secondTokenId, secondTokenTargetPrice, { from: accountThree }),
      'You can only sell your owned token'
    )

    const secondTokenOwnerAfter = await kiCollectable.ownerOf.call(secondTokenId)
    const totalTradeOfAccountThreeAfter = await marketPlace.totalTradeOf.call(accountThree)
    assert.equal(secondTokenOwnerAfter, accountTwo)
    assert.equal(totalTradeOfAccountThreeAfter.toNumber(), 0)
  })
})



contract('MarketPlace More', accounts => {
  let marketPlace
  let kiCollectable

  let firstTokenId,
      secondTokenId,
      thirdTokenId,
      fourthTokenId

  const firstTokenTargetPrice = web3.utils.toWei('1', 'ether'),
      secondTokenTargetPrice = web3.utils.toWei('1.5', 'ether'),
      thirdTokenTargetPrice = web3.utils.toWei('0.5', 'ether'),
      fourthTokenTargetPrice = web3.utils.toWei('3', 'ether')

  let firstTradeId,
      secondTradeId,
      thirdTradeId,
      fourthTradeId

  const [
    accountOne,
    accountTwo,
    accountThree,
    accountFour,
    accountFive,
  ] = accounts 

  before(async () => {
    marketPlace = await MarketPlace.deployed();
    kiCollectable = await KiCollectable.deployed();
  
    // fixtures: mint 4 tokens
    firstTokenId = await kiCollectable.mintToken(accountOne, URL_ONE, { from: accountOne }).then(getTokenIdFromTx)
    secondTokenId = await kiCollectable.mintToken(accountTwo, URL_TWO, { from: accountTwo }).then(getTokenIdFromTx)
    thirdTokenId = await kiCollectable.mintToken(accountThree, URL_THREE, { from: accountThree }).then(getTokenIdFromTx)
    fourthTokenId = await kiCollectable.mintToken(accountThree, URL_FOUR, { from: accountThree }).then(getTokenIdFromTx)

    // fixtures: open 4 trades
    await kiCollectable.approve(marketPlace.address, firstTokenId, { from: accountOne })
    await kiCollectable.approve(marketPlace.address, secondTokenId, { from: accountTwo })
    await kiCollectable.approve(marketPlace.address, thirdTokenId, { from: accountThree })
    await kiCollectable.approve(marketPlace.address, fourthTokenId, { from: accountThree })
    firstTradeId = await marketPlace.openTrade(firstTokenId, firstTokenTargetPrice, { from: accountOne }).then(getTradeIdFromTx)
    secondTradeId = await marketPlace.openTrade(secondTokenId, secondTokenTargetPrice, { from: accountTwo }).then(getTradeIdFromTx)
    thirdTradeId = await marketPlace.openTrade(thirdTokenId, thirdTokenTargetPrice, { from: accountThree }).then(getTradeIdFromTx)
    fourthTradeId = await marketPlace.openTrade(fourthTokenId, fourthTokenTargetPrice, { from: accountThree }).then(getTradeIdFromTx)
  })

  it('check total count of all trades', async () => {
    const totalTrade = await marketPlace.totalTrade.call()
    assert.equal(totalTrade.toNumber(), 4)
  })

  it('check total count of trades of accountThree', async () => {
    const totalTradeOfAccountThree = await marketPlace.totalTradeOf.call(accountThree)
    assert.equal(totalTradeOfAccountThree.toNumber(), 2)
  })
  
  it('check trade id of the second number of trades of accountThree', async () => {
    const secondTradeIndexOfAccountThree = 1
    const tradeId = await marketPlace.tradeOfPosterByIndex.call(accountThree, secondTradeIndexOfAccountThree)
    assert.equal(tradeId.toNumber(), fourthTokenId.toNumber())
  })

  it('check trade data of the first trade', async () => {
    const firstTradeData = await marketPlace.getTrade.call(firstTradeId)
    const firstTradePoster = firstTradeData[0],
          firstTradeTokenId = firstTradeData[1],
          firstTradePrice = firstTradeData[2],
          firstTradeStatus = firstTradeData[3]

    assert.equal(firstTradePoster, accountOne)
    assert.equal(firstTradeTokenId.toNumber(), firstTokenId.toNumber())
    assert.equal(firstTradePrice, firstTokenTargetPrice)
    assert.equal(web3.utils.hexToUtf8(firstTradeStatus), 'Open')
  })

  it('should execute the second trade by accountFour', async () => {
    const secondTokenOwnerBefore = await kiCollectable.ownerOf.call(secondTokenId)
    const ethBalanceOfAccountFourBefore = await web3.eth.getBalance(accountFour)
    const ethBalanceOfAccountTwoBefore = await web3.eth.getBalance(accountTwo)

    assert.equal(secondTokenOwnerBefore, marketPlace.address)
    assert.isOk(web3.utils.toBN(ethBalanceOfAccountFourBefore).gt(web3.utils.toBN(secondTokenTargetPrice)))
    
    const tx = await marketPlace.executeTrade(secondTradeId, { from: accountFour, value: secondTokenTargetPrice })
    
    const secondTokenOwnerAfter = await kiCollectable.ownerOf.call(secondTokenId)
    const ethBalanceOfAccountTwoAfter = await web3.eth.getBalance(accountTwo)
    
    assert.equal(secondTokenOwnerAfter, accountFour)
    assert.equal(
      web3.utils.toBN(ethBalanceOfAccountTwoBefore).add(web3.utils.toBN(secondTokenTargetPrice)).toString(),
      ethBalanceOfAccountTwoAfter
    )
    
    const secondTradeStatusInEvent = tx.logs[0].args.status
    const secondTradeData = await marketPlace.getTrade.call(secondTradeId)
    const secondTradeStatus = secondTradeData[3]
    assert.equal(web3.utils.hexToUtf8(secondTradeStatus), 'Executed')
    assert.equal(secondTradeStatus, secondTradeStatusInEvent)
  })

  it('can not execute the third trade when send less value', async () => {
    const thirdTokenOwnerBefore = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerBefore, marketPlace.address)

    const lessValue = web3.utils.toWei('0.001', 'ether')
    assert.isOk(web3.utils.toBN(thirdTokenTargetPrice).gt(web3.utils.toBN(lessValue)))

    await expectRevert(
      marketPlace.executeTrade(thirdTradeId, { from: accountFour, value: lessValue }),
      'The amount paid is not enough'
    )

    const thirdTokenOwnerAfter = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerAfter, marketPlace.address)
    const thirdTradeData = await marketPlace.getTrade.call(thirdTradeId)
    const thirdTradeStatus = thirdTradeData[3]
    assert.equal(web3.utils.hexToUtf8(thirdTradeStatus), 'Open')
  })

  it('should cancel the first trade', async () => {
    const balanceOfAccountOneBefore = await kiCollectable.balanceOf.call(accountOne)
    const firstTokenOwnerBefore = await kiCollectable.ownerOf.call(firstTokenId)
    assert.equal(balanceOfAccountOneBefore, 0)
    assert.equal(firstTokenOwnerBefore, marketPlace.address)

    const tx = await marketPlace.cancelTrade(firstTradeId, { from: accountOne })
    
    const firstTradeStatusInEvent = tx.logs[0].args.status
    const firstTradeData = await marketPlace.getTrade.call(firstTradeId)
    const firstTradeStatus = firstTradeData[3]
    assert.equal(web3.utils.hexToUtf8(firstTradeStatus), 'Cancelled')
    assert.equal(firstTradeStatus, firstTradeStatusInEvent)

    const balanceOfAccountOneAfter = await kiCollectable.balanceOf.call(accountOne)
    const firstTokenOwnerAfter = await kiCollectable.ownerOf.call(firstTokenId)
    assert.equal(balanceOfAccountOneAfter, 1)
    assert.equal(firstTokenOwnerAfter, accountOne)
  })

  it('should cancel the third trade by accountOne', async () => {
    const thirdTokenOwnerBefore = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerBefore, marketPlace.address)

    await expectRevert(
      marketPlace.cancelTrade(thirdTradeId, { from: accountOne }),
      'Trade can be cancelled only by poster'
    )
    
    const thirdTradeData = await marketPlace.getTrade.call(thirdTradeId)
    const thirdTradeStatus = thirdTradeData[3]
    const thirdTokenOwnerAfter = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(web3.utils.hexToUtf8(thirdTradeStatus), 'Open')
    assert.equal(thirdTokenOwnerAfter, marketPlace.address)
  })

  it('can not execute the trade when status is not open', async () => {
    // firstly, cancel the third trade.
    await marketPlace.cancelTrade(thirdTradeId, { from: accountThree })
    const threeTradeData = await marketPlace.getTrade.call(thirdTradeId)
    const threeTradeStatus = threeTradeData[3]
    assert.equal(web3.utils.hexToUtf8(threeTradeStatus), 'Cancelled')

    // then, try to execute the third trade
    await expectRevert(
      marketPlace.executeTrade(thirdTradeId, { from: accountFive, value: thirdTokenTargetPrice }),
      'Trade is not Open',
    )
  })

  it('can not cancel the trade when status is not open', async () => {
    // firstly, execute the fourth trade.
    await marketPlace.executeTrade(fourthTradeId, { from: accountFive, value: fourthTokenTargetPrice })
    const fourthTradeData = await marketPlace.getTrade.call(fourthTradeId)
    const fourthTradeStatus = fourthTradeData[3]
    assert.equal(web3.utils.hexToUtf8(fourthTradeStatus), 'Executed')

    // then, try to execute the third trade
    await expectRevert(
      marketPlace.cancelTrade(fourthTradeId, { from: accountThree }),
      'Trade is not Open',
    )
  })
})