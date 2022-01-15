import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import {
  MarketPlace,
  TradeStatusChange
} from "../generated/MarketPlace/MarketPlace"
import {
  Trade,
  // Status,
  TradeChange,
} from "../generated/schema"

export function handleTradeStatusChange(event: TradeStatusChange): void {
  let tradeEntity = Trade.load(event.params.id.toString())
  if (tradeEntity === null) {
    const contract = MarketPlace.bind(event.address)
    const tradeData = contract.getTrade(event.params.id)
    tradeEntity = new Trade(event.params.id.toString())
    tradeEntity.poster = <Bytes>tradeData.value0
    tradeEntity.item = <BigInt>tradeData.value1
    tradeEntity.price = <BigInt>tradeData.value2
  }

  let tradeChangeEntity = new TradeChange(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  tradeChangeEntity.trade = tradeEntity.id
  tradeChangeEntity.status = event.params.status.toString()
  tradeChangeEntity.timestamp = event.block.timestamp.toI32()
  tradeChangeEntity.save()

  tradeEntity.status = tradeChangeEntity.status
  tradeEntity.save()
}

// export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  // if (!entity) {
    // entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    // entity.count = BigInt.fromI32(0)
  // }

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  // entity.previousOwner = event.params.previousOwner
  // entity.newOwner = event.params.newOwner

  // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.owner(...)
  // - contract.totalTrade(...)
  // - contract.totalTradeOf(...)
  // - contract.tradeOfPosterByIndex(...)
  // - contract.getTrade(...)
// }

