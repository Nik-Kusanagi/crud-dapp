'use client'

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useCrudProgram } from '../cluster/cluster-ui';
import { CrudCreate, CrudList } from './crud-ui';

export default function CrudFeature() {
  const { publicKey } = useWallet();
  const { programId } = useCrudProgram();

  return publicKey ? (
    <div>
      <AppHero title="My Solana Crud" subtitle={"Create your Crud Here!"}>
        <p className='mb-6'>
          <ExplorerLink 
            path={`account/${programId}`} 
            label={ellipsify(publicKey.toString())} 
          />        
        </p>
        <CrudCreate />
      </AppHero>
      <CrudList />
    </div>
    ) : (
      <div className='max-w-4x1 mx-auto'>
        <div className='hero py-[64px]'>
          <div className='hero-content text-center'>
            <WalletButton />
          </div>
        </div>
      </div>
  );
}
