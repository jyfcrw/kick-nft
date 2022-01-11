import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { TradeStatus } from '../generated/schema'
import { TradeStatusChange } from '../generated/MarketPlace/MarketPlace'
import { createTradeStatusChangeEvent, handleTradeStatusChange } from '../src/mapping'
import { Bytes } from "@graphprotocol/graph-ts"


export function runTests(): void {
    test('Can call mappings with custom events', () => {
      // Initialise
      let tradeStatus = new TradeStatus('1000')
      tradeStatus.save()
  
      
      // Call mappings
      let tradeStatusChange = createTradeStatusChangeEvent(1001, Bytes.fromUTF8('Open'))
  
      handleTradeStatusChange(tradeStatusChange)
  
      assert.fieldEquals('TradeStatus', '1000', 'id', '1000')
      assert.fieldEquals('TradeStatus', '1001', 'status', 'Open')
  
      clearStore()
    })
  
    // test('Next test', () => {
    //   //...
    // })
  }