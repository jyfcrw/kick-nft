const KiCollectable = artifacts.require("KiCollectable")
const MarketPlace = artifacts.require("MarketPlace")

module.exports = function(deployer) {
  deployer.then(async () => {
    const kiCollectable = await deployer.deploy(KiCollectable)
    console.log('KiCollectable contract deployed at', kiCollectable.address)
    
    const marketPlace = await deployer.deploy(MarketPlace)
    console.log('MarketPlace contract deployed at', marketPlace.address)

    await marketPlace.setItemToken(kiCollectable.address)
  })
};
