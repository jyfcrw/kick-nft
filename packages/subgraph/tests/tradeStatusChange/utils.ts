import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as/assembly/index"
import { TradeStatusChange } from "../../generated/MarketPlace/MarketPlace"

export function createTradeStatusChangeEvent(
  tradeId: i32,
  status: String
): TradeStatusChange {
  let mockEvent = newMockEvent()
  let tradeStatusChange : TradeStatusChange = changetype<TradeStatusChange>(mockEvent)

  tradeStatusChange.parameters = new Array()
  let tradeIdParam = new ethereum.EventParam('id', ethereum.Value.fromI32(tradeId))
  let statusParam = new ethereum.EventParam('status', ethereum.Value.fromBytes(Bytes.fromUTF8(status)))
  let timestampParam = new ethereum.EventParam('timestamp', new ethereum.Value(ethereum.ValueKind.INT, mockEvent.block.timestamp.toU64()))

  tradeStatusChange.parameters.push(tradeIdParam)
  tradeStatusChange.parameters.push(statusParam)
  tradeStatusChange.parameters.push(timestampParam)

  return tradeStatusChange
}
