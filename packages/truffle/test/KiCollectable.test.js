const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

const KiCollectable = artifacts.require('KiCollectable')

const TOKEN_BASE_URI = 'https://ipfs.io/ipfs/',
      TOKEN_NAME = 'KiCollectable',
      TOKEN_SYMBOL = 'KCB'

const URL_ONE = 'valid_url_one/metadata.json',
      URL_TWO = 'valid_url_two/metadata.json',
      URL_THREE = 'valid_url_three/metadata.json',
      URL_FOUR = 'valid_url_four/metadata.json',
      URL_FIVE = 'valid_url_five/metadata.json'

function getTokenIdFromTx(tx) {
  return tx.logs[0].args.tokenId
}

contract('KiCollectable', accounts => {
  let kiCollectable

  const [accountOne, accountTwo] = accounts

  before(async () => {
    kiCollectable = await KiCollectable.deployed();
  })

  it('has a token name', async () => {
    const tokenName = await kiCollectable.name.call()
    assert.equal(tokenName, TOKEN_NAME)
  })

  it('has a token symbol', async () => {
    const tokenSymbol = await kiCollectable.symbol.call()
    assert.equal(tokenSymbol, TOKEN_SYMBOL)
  })

  it('should mint a token by valid URL', async () => {
    const accountOneBalanceBefore = await kiCollectable.balanceOf.call(accountOne)
    assert.equal(accountOneBalanceBefore.toNumber(), 0)

    const tx = await kiCollectable.mintToken(accountOne, URL_ONE, { from: accountOne })

    const firstTokenId = tx.logs[0].args.tokenId
    const firstTokenOwner = await kiCollectable.ownerOf.call(firstTokenId)
    const firstTokenURI = await kiCollectable.tokenURI.call(firstTokenId)
    const accountOneBalanceAfter = await kiCollectable.balanceOf.call(accountOne)
    assert.equal(firstTokenOwner, accountOne)
    assert.equal(firstTokenURI, TOKEN_BASE_URI + URL_ONE)
    assert.equal(accountOneBalanceAfter.toNumber(), 1)
    expectEvent.inLogs(tx.logs, 'Transfer', { from: constants.ZERO_ADDRESS, to: accountOne, tokenId: firstTokenId });
  })

  it('support ERC165 functions', async () => {
    const interfaceIdOfERC721 = '0x80ac58cd'
    const interfaceIdOfERC165 = '0x01ffc9a7'
    const metaDataOfERC721 = '0x5b5e139f'
    assert.equal(await kiCollectable.supportsInterface.call(interfaceIdOfERC721), true)
    assert.equal(await kiCollectable.supportsInterface.call(interfaceIdOfERC165), true)
    assert.equal(await kiCollectable.supportsInterface.call(metaDataOfERC721), true)
  })
})

contract('KiCollectable with Enumerable', accounts => {
  let kiCollectable
  
  const [
    accountOne,
    accountTwo,
    accountThree
  ] = accounts

  before(async () => {
    kiCollectable = await KiCollectable.deployed();

    // fixtures
    await kiCollectable.mintToken(accountOne, URL_ONE, { from: accountOne })
    await kiCollectable.mintToken(accountTwo, URL_TWO, { from: accountTwo })
    await kiCollectable.mintToken(accountThree, URL_THREE, { from: accountThree })
    await kiCollectable.mintToken(accountThree, URL_FOUR, { from: accountThree })
  })


  it('check totalSupply of contract', async () => {
    const totalSupply = await kiCollectable.totalSupply.call()

    assert.equal(totalSupply, 4)
  })

  it('can not get token id by index out of bound globally', async () => {
    const indexOutOfBoundGlobally = 5
    await expectRevert(
      kiCollectable.tokenByIndex.call(indexOutOfBoundGlobally),
      'ERC721Enumerable: global index out of bounds'
    )
  })

  it('check the second token owned by accountTwo', async () => {
    const secondTokenIndex = 1
    const secondTokenId = await kiCollectable.tokenByIndex.call(secondTokenIndex)
    const secondTokenOwner = await kiCollectable.ownerOf.call(secondTokenId)
    
    assert.equal(secondTokenOwner, accountTwo)
  })

  it('can not get token id of accountTwo by index out of bound', async () => {
    const indexOutOfBound = 2
    await expectRevert(
      kiCollectable.tokenOfOwnerByIndex.call(accountTwo, indexOutOfBound),
      'ERC721Enumerable: owner index out of bounds'
    )
  })

  it('check URI of the second token of accountThree', async () => {
    const secondTokenIndexOfAccountThree = 1
    const secondTokenIdOfAccountThree = await kiCollectable.tokenOfOwnerByIndex.call(accountThree, secondTokenIndexOfAccountThree)
    const secondTokenURIOfAccountThree = await kiCollectable.tokenURI.call(secondTokenIdOfAccountThree)

    assert.equal(secondTokenURIOfAccountThree, TOKEN_BASE_URI + URL_FOUR)
  })
})


contract('KiCollectable with Transfer and Approve', accounts => {
  let kiCollectable
  let firstTokenId,
      secondTokenId,
      thirdTokenId,
      fourthTokenId,
      fifthTokenId

  const [
    accountOne,
    accountTwo,
    accountThree,
    accountFour,
    accountFive
  ] = accounts

  before(async () => {
    kiCollectable = await KiCollectable.deployed();

    // fixtures: mint 5 tokens
    firstTokenId = await kiCollectable.mintToken(accountOne, URL_ONE, { from: accountOne }).then(getTokenIdFromTx)
    secondTokenId = await kiCollectable.mintToken(accountTwo, URL_TWO, { from: accountTwo }).then(getTokenIdFromTx)
    thirdTokenId = await kiCollectable.mintToken(accountThree, URL_THREE, { from: accountThree }).then(getTokenIdFromTx)
    fourthTokenId = await kiCollectable.mintToken(accountFour, URL_FOUR, { from: accountFour }).then(getTokenIdFromTx)
    fifthTokenId = await kiCollectable.mintToken(accountFive, URL_FIVE, { from: accountFive }).then(getTokenIdFromTx)
  })

  it('can not tranfser token from accountOne to address zero', async () => {
    const firstTokenOwnerBefore = await kiCollectable.ownerOf.call(firstTokenId)
    assert.equal(firstTokenOwnerBefore, accountOne)

    await expectRevert(
      kiCollectable.transferFrom(accountOne, constants.ZERO_ADDRESS, firstTokenId, { from: accountOne }),
      'ERC721: transfer to the zero address'
    )
  })

  it('can not tranfser token of accountThree from accountOne to accountTwo', async () => {
    const thirdTokenOwnerBefore = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerBefore, accountThree)

    await expectRevert(
      kiCollectable.transferFrom(accountOne, accountTwo, thirdTokenId, { from: accountOne }),
      'ERC721: transfer caller is not owner nor approved'
    )

    const thirdTokenOwnerAfter = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerAfter, accountThree)
  })

  it('should tranfser token from accountTwo to accountOne', async () => {
    const secondTokenOwnerBefore = await kiCollectable.ownerOf.call(secondTokenId)
    assert.equal(secondTokenOwnerBefore, accountTwo)
    
    await kiCollectable.transferFrom(accountTwo, accountOne, secondTokenId, { from: accountTwo })

    const secondTokenOwnerAfter = await kiCollectable.ownerOf.call(secondTokenId)
    assert.equal(secondTokenOwnerAfter, accountOne)
  })

  it('should tranfser token from accountFive to accountOne by safe transfer method', async () => {
    const fifthTokenOwnerBefore = await kiCollectable.ownerOf.call(fifthTokenId)
    assert.equal(fifthTokenOwnerBefore, accountFive)
    
    await kiCollectable.safeTransferFrom(accountFive, accountOne, fifthTokenId, { from: accountFive })

    const fifthTokenOwnerAfter = await kiCollectable.ownerOf.call(fifthTokenId)
    assert.equal(fifthTokenOwnerAfter, accountOne)
  })
  
  it('should approve and transfer token of accountThree to accountOne', async () => {
    const thirdTokenOwnerBefore = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerBefore, accountThree)

    const approvedAccountBefore = await kiCollectable.getApproved.call(thirdTokenId)
    assert.equal(approvedAccountBefore, constants.ZERO_ADDRESS)
    
    await kiCollectable.approve(accountOne, thirdTokenId, { from: accountThree })

    const approvedAccountAfter = await kiCollectable.getApproved.call(thirdTokenId)
    assert.equal(approvedAccountAfter, accountOne)

    await kiCollectable.transferFrom(accountThree, accountOne, thirdTokenId, { from: accountOne })

    const thirdTokenOwnerAfter = await kiCollectable.ownerOf.call(thirdTokenId)
    assert.equal(thirdTokenOwnerAfter, accountOne)
  })

  it('should approve all tokens of accountFour to accountOne and transfer', async () => {
    const fourthTokenOwnerBefore = await kiCollectable.ownerOf.call(fourthTokenId)
    assert.equal(fourthTokenOwnerBefore, accountFour)

    const isApprovedBefore = await kiCollectable.isApprovedForAll.call(accountFour, accountOne)
    assert.isNotOk(isApprovedBefore)

    await kiCollectable.setApprovalForAll(accountOne, true, { from: accountFour })

    const isApprovedAfter = await kiCollectable.isApprovedForAll.call(accountFour, accountOne)
    assert.isOk(isApprovedAfter)

    await kiCollectable.transferFrom(accountFour, accountOne, fourthTokenId, { from: accountOne })

    const fourthTokenOwnerAfter = await kiCollectable.ownerOf.call(fourthTokenId)
    assert.equal(fourthTokenOwnerAfter, accountOne)
  })
})
