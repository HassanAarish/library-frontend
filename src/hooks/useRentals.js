import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { packages, payments, rentals } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

/** All of the user's rentals (newest first); the library groups them. */
export const useMyRentals = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.myRentals({ limit: 100 }),
    queryFn: () => rentals.mine({ limit: 100 }),
    select: (data) => data?.results ?? [],
    enabled: isAuthenticated,
  });
};

/** Credits available + the user's packages. */
export const useMyPackages = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.myPackages,
    queryFn: packages.mine,
    enabled: isAuthenticated,
  });
};

export const usePlans = () =>
  useQuery({ queryKey: qk.plans, queryFn: packages.plans, staleTime: 10 * 60_000 });

export const usePayment = (paymentId) =>
  useQuery({
    queryKey: qk.payment(paymentId),
    queryFn: () => payments.get(paymentId),
    enabled: Boolean(paymentId),
  });

export const useMyPayments = (params) =>
  useQuery({
    queryKey: qk.myPayments(params),
    queryFn: () => payments.mine(params),
  });

/**
 * Rental actions (cancel / extend / return / start now). Each refreshes the
 * library, credits and that book's availability, and shows the backend's
 * message (e.g. "Booking cancelled. Your package credit has been returned.").
 */
export const useRentalAction = (action) => {
  const queryClient = useQueryClient();
  const run = {
    cancel: rentals.cancel,
    extend: rentals.extend,
    return: rentals.returnEarly,
    startNow: rentals.startNow,
  }[action];

  return useMutation({
    mutationFn: (rental) => run(rental._id),
    onSuccess: ({ message }, rental) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({
        queryKey: qk.availability(rental.bookId?._id ?? rental.bookId),
      });
    },
    onError: (err) => toast.error(err.message),
  });
};
