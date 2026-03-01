import Dexie, {type Table } from "dexie";

export type MonthId = `${number}-${string}`; // ex "2026-03"

export type Month = {
    id: MonthId;          // "YYYY-MM"
    income: number;
    createdAt: number;
};

export type Envelope = {
    id?: number;
    monthId: MonthId;
    name: string;
    plannedAmount: number; // budget prévu
    createdAt: number;
};

export type Transaction = {
    id?: number;
    monthId: MonthId;
    envelopeId: number;     // FK
    date: string;           // "YYYY-MM-DD"
    amount: number;
    label?: string;
    createdAt: number;
};

class BudgetDB extends Dexie {
    months!: Table<Month, string>;
    envelopes!: Table<Envelope, number>;
    transactions!: Table<Transaction, number>;

    constructor() {
        super("budget_db");

        this.version(1).stores({
            months: "id, createdAt",
            envelopes: "++id, monthId, name, createdAt",
            transactions: "++id, monthId, envelopeId, date, createdAt",
        });
    }
}

export const db = new BudgetDB();
