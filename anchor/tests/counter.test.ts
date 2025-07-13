import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Crud } from '../target/types/crud'

describe('crud', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Crud as Program<Crud>

  const crudKeypair = Keypair.generate()

  it('Initialize Crud', async () => {
    await program.methods
      .initialize()
      .accounts({
        crud: crudKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([crudKeypair])
      .rpc()

    const currentCount = await program.account.crud.fetch(crudKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Counter', async () => {
    await program.methods.increment().accounts({ crud: crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.crud.fetch(crudKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Counter Again', async () => {
    await program.methods.increment().accounts({ crud: crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.crud.fetch(crudKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Counter', async () => {
    await program.methods.decrement().accounts({ crud
        : crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.crud.fetch(crudKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set counter value', async () => {
    await program.methods.set(42).accounts({ crud: crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.crud.fetch(crudKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the counter account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        crud: crudKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.crud.fetchNullable(crudKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
