import { describe, it, beforeEach } from "node:test";
import { strict as assert } from "assert";
import { network } from "hardhat";

describe("CooperadoraTest", function () {
  let token: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    const { viem } = await network.connect();
    const wallets = await viem.getWalletClients();
    owner = wallets[0];
    user1 = wallets[1];
    user2 = wallets[2];
  //console.log('Owner:', owner.addres)

    token = await viem.deployContract("CooperadoraTest");
  });

  it("Debería desplegarse con nombre, símbolo y supply inicial correctos", async function () {
    const nombre = await token.read.name();
    const simbolo = await token.read.symbol();
    const supplyTotal = await token.read.totalSupply();
    const decimales = await token.read.decimals();

    const supplyEsperado = 1000000n * 10n ** BigInt(decimales);
    assert.equal(nombre, "Cooperadora Test");
    assert.equal(simbolo, "COOP");
    assert.equal(supplyTotal, supplyEsperado);
    console.log('Nombre del Token:', nombre);
    console.log("Simbolo:", simbolo);
    console.log('Suplly Total:', supplyTotal);
  });

  
  describe("Funciones básicas", function () {
    it("Debería permitir transferencias", async function () {
      const amount = 1000n;

      // Transferir tokens del owner a user2 (cuenta limpia)
      await token.write.transfer([user2.account.address, amount], {
        account: owner.account,
      });

      const balanceUser2 = await token.read.balanceOf([user2.account.address]);
      assert.equal(balanceUser2, amount);
    });

    it("Debería fallar al transferir 0 tokens", async function () {
      try {
        await token.write.transfer([user1.account.address, 0n], {
          account: owner.account,
        });
        assert.fail("Debería haber fallado");
      } catch (error: any) {
        // Verificamos que efectivamente hubo un error, pero no el mensaje porque ya se probó en otro test
        assert.ok(error);
      }
    });
  });

  describe("Funciones de transferencia", function () {
    it("Debería transferir tokens entre cuentas", async function () {
      const amount = 1000n;
      await token.write.transfer([user1.account.address, amount], {
        account: owner.account,
      });

      const balanceUser1 = await token.read.balanceOf([user1.account.address]);
      assert.equal(balanceUser1, amount);
    });

    it("Debería fallar al transferir 0 tokens", async function () {
      try {
        await token.write.transfer([user1.account.address, 0n], {
          account: owner.account,
        });
        assert.fail("Debería haber revertido");
      } catch (error: any) {
        assert.match(error.details, /Amount must be greater than 0/);
      }
    });
  });

  describe("Funciones de minting", function () {
    it("Debería permitir al owner hacer mint", async function () {
      const balanceInicial = await token.read.balanceOf([user1.account.address]);
      const mintAmount = 500n;

      await token.write.mint([user1.account.address, mintAmount], {
        account: owner.account,
      });

      const balanceFinal = await token.read.balanceOf([user1.account.address]);
      const balanceEsperado = balanceInicial + mintAmount;

      assert.equal(balanceFinal, balanceEsperado);
    });
  });

});