export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  timestamp: Date;
  fromUserName: string;
  toUserName: string;
}

export interface BankState {
  users: User[];
  transactions: Transaction[];
  currentUser: User | null;
}
