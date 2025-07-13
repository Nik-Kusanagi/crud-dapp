"use client";

import { 
  getCrudProgram, 
  getCrudProgramId, 
  CrudIDL 
} from "@crud/anchor";
import { Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Message, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { useMemo } from "react";
import { get } from "http";

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

  export function useCrudProgram() {
    const { connection } = useConnection();
    const { cluster } = useCluster();
    const transactionToast = useTransactionToast();
    const provider = useAnchorProvider();
    const programId = useMemo(
      () => getCrudProgramId(cluster.network as Cluster),
      [cluster]  
    );
    const program = getCrudProgram(provider);

    const accounts = useQuery({
      queryKey: ["Crud", "all", { cluster }],
      queryFn: () => program.account.crudEntryState.all(),
    });

    const getProgramAccount = useQuery({
      queryKey: ["get-program-account", { cluster }],
      queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["crudEntry", "create", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [crudEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );
  
    return program.methods.createCrudEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create entry: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}

export function useCrudProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useCrudProgram();
  const programId = new PublicKey(
    ""
  );

  const accountQuery = useQuery({
    queryKey: ["Crud", "fetch", { cluster, account }],
    queryFn: () => program.account.CrudEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["crudEntry", "update", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [crudEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );
     
      return program.methods.updateCrudEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update crud entry: ${error.message}`);
    },
  });

const deleteEntry = useMutation({
  mutationKey: ["crudEntry", "delete", { cluster, account }],
  mutationFn: async (title: string) => {
    return program.methods.deleteCrudEntry(title).rpc();
  },
    onSuccess: (tx) => {
    transactionToast(tx);
    return accounts.refetch();
  },
});

return {
  accountQuery,
  updateEntry,
  deleteEntry,
};
} 