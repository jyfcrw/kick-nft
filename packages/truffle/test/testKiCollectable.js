const KiCollectable = artifacts.require("KiCollectable")

contract("KiCollectable", accounts => {
  it("should mint a token by valid URL", async () => {
    const instance = await KiCollectable.deployed()
    const validURL = "bafyreieeknpu6qrmzxvzbpulcqwaoq3p42jpzxrslulsxzf723i4hni22i/metadata.json"
    const receipt = await instance.mintToken(accounts[0], validURL)
    assert.isNotNull(receipt)

    const balance = await instance.balanceOf.call(accounts[0])
    assert.equal(balance.valueOf(), 1)
  });
})