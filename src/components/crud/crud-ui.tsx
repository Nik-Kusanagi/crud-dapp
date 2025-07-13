'use client';

import { Keypair, PublicKey } from "@solana/web3.js";
// import { useMemo } from 'react';
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { 
  useCrudProgram, 
  useCrudProgramAccount, 
} from "./crud-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function CrudCreate() {
  const { createEntry } = useCrudProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");  
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSumit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if(!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <div>
      <input 
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
       />
       <textarea 
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
        />
        <br></br>
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={handleSumit}
          disabled={createEntry.isPending || !isFormValid}
        >
          Create Crud Dapp Solana {createEntry.isPending && "..."}
        </button>  
    </div>
  );
}

export function CrudList() {
  const { accounts, getProgramAccount } = useCrudProgram();

  
  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure yo have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
      <div className={"space-y-6"}>
        {accounts.isLoading ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : accounts.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.data?.map((account) => (
              <CrudCard
                key={account.publicKey.toString()} 
                account={account.publicKey} 
              />
          ))}
      </div>
    ) : (
      <div className="text-center">
        <h2 className={"text-2x1"}>No accounts</h2>
        No accounts found. Create one above to get started.
      </div>
    )}
  </div>
  );
}

function CrudCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";

  const handleSumit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };
  
  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 
            className="card-title justifiy-center text-3x1 cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around">
            <textarea 
              placeholder="Update message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full max-w-xs"             
            />
            <button
              className="btn btn-xs lg:btn-md btn-primary"
              onClick={handleSumit}
              disabled={updateEntry.isPending || !isFormValid}
            >
              Update Crud Entry {updateEntry.isPending && "..."}
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account.toString()}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                deleteEntry.mutateAsync(title);
                }
              }
              disabled={deleteEntry.isPending}
             >
              Close              
              </button>
             </div>
        </div>
      </div>
    </div>
  );  
}