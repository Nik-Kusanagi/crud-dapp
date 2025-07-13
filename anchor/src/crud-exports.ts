// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CrudIDL from '../target/idl/crud.json'
import type { Crud } from '../target/types/crud'

// Re-export the generated IDL and type
export { Crud, CrudIDL }

// The programId is imported from the program IDL.
export const CRUD_PROGRAM_ID = new PublicKey(CrudIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getCounterProgram(provider: AnchorProvider, address?: PublicKey): Program<Crud> {
  return new Program({ ...CrudIDL, address: address ? address.toBase58() : CrudIDL.address } as Crud, provider)
}

// This is a helper function to get the program ID for the Journal program depending on the cluster.
export function getCrudProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Crud program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return CRUD_PROGRAM_ID
  }
}
