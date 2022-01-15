import { clearStore, test, assert, log, createMockedFunction } from 'matchstick-as/assembly/index'
import { Bytes, BigInt, ethereum, Address } from "@graphprotocol/graph-ts"

import { createTradeStatusChangeEvent } from "./utils"
import { Trade, TradeChange } from '../../generated/schema'
import { handleTradeStatusChange } from '../../src/mapping'

export { handleTradeStatusChange }

test('Can handle sample trade status change event', () => {
  let trade = new Trade('10')
  trade.poster = changetype<Bytes>(Bytes.fromHexString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2A'))
  trade.price = BigInt.fromString('100000000000')
  trade.item = BigInt.fromI32(1)

  const tradeChangeId = '10000000'
  let tradeChange = new TradeChange(tradeChangeId)
  tradeChange.trade = trade.id
  tradeChange.timestamp = <i32>1642253522739
  tradeChange.status = 'Open'
  tradeChange.save()

  trade.status = tradeChange.status
  trade.save()

  assert.fieldEquals('TradeChange', tradeChangeId, 'id', tradeChangeId)
  assert.fieldEquals('TradeChange', tradeChangeId, 'trade', trade.id)
  assert.fieldEquals('TradeChange', tradeChangeId, 'status', 'Open')

  clearStore()
})

test('Can handle open trade status change event', () => {
  const tradeId = 10
  const tokenId = 1
  const poster = "0x90cBa2Bbb19ecc291A12066Fd8329D65FA1f1947"
  let tradeStatusChange = createTradeStatusChangeEvent(tradeId, 'Open')

  createMockedFunction(tradeStatusChange.address, "getTrade", "getTrade(uint256):(address,uint256,uint256,bytes32)")
    .withArgs([ethereum.Value.fromUnsignedBigInt(tradeStatusChange.params.id)])
    .returns([
      ethereum.Value.fromAddress(Address.fromString(poster)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000000)),
      ethereum.Value.fromBytes(Bytes.fromUTF8('Open')),
    ])

  handleTradeStatusChange(tradeStatusChange)

  const tradeChangeId = `${tradeStatusChange.block.hash.toHex()}-${tradeStatusChange.logIndex.toString()}`

  assert.fieldEquals('TradeChange', tradeChangeId, 'trade', tradeId.toString())
  assert.fieldEquals('TradeChange', tradeChangeId, 'status', 'Open')

  assert.fieldEquals('Trade', tradeId.toString(), 'id', tradeId.toString())
  assert.fieldEquals('Trade', tradeId.toString(), 'status', 'Open')

  clearStore()
})

test('Can handle executed trade status change event', () => {
  const tradeId = 10
  let trade = new Trade(tradeId.toString())
  trade.poster = changetype<Bytes>(Bytes.fromHexString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2A'))
  trade.price = BigInt.fromString('100000000000')
  trade.item = BigInt.fromI32(1)
  trade.status = 'Open'
  trade.save()

  let tradeStatusChange = createTradeStatusChangeEvent(tradeId, 'Executed')

  handleTradeStatusChange(tradeStatusChange)

  const tradeChangeId = `${tradeStatusChange.block.hash.toHex()}-${tradeStatusChange.logIndex.toString()}`

  assert.fieldEquals('TradeChange', tradeChangeId, 'trade', tradeId.toString())
  assert.fieldEquals('TradeChange', tradeChangeId, 'status', 'Executed')

  assert.fieldEquals('Trade', tradeId.toString(), 'id', tradeId.toString())
  assert.fieldEquals('Trade', tradeId.toString(), 'status', 'Executed')

  clearStore()
})
