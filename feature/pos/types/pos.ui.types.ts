export type PosCustomerOption = {
  label: string;
  value: string;
  customerData: {
    remoteId: string;
    fullName: string;
    phone: string | null;
    address: string | null;
  };
};

export type PosMoneyAccountOption = {
  label: string;
  value: string;
};
