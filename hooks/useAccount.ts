import { AccountService } from "@/lib/services/account";
import { CreateAccountParams, LoginParams } from "@/types/account";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";

export const useSignUp = () => {
const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: CreateAccountParams) => await AccountService.createAccount(email, password),
    onSuccess: () => {
      toast.success('Cuenta creada exitosamente');
      queryClient.invalidateQueries(['account']);
    },
    onError: (error: Error) => {
      toast.error((error as Error).message);
    },
  })
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: LoginParams) => await AccountService.login(email, password),
    onSuccess: () => {
      toast.success('Inicio de sesión exitoso');
      queryClient.invalidateQueries(['account']);
    },
    onError: (error: Error) => {
      toast.error((error as Error).message);
    },
  })
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await AccountService.logout(),
    onSuccess: () => {
      toast.success('Cierre de sesión exitoso');
      queryClient.invalidateQueries(['account']);
    },
    onError: (error: Error) => {
      toast.error((error as Error).message);
    },
  })
};