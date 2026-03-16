import { db, type MonthId } from "./db";

export function getMonthId(d = new Date()): MonthId {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}` as MonthId;
}

export function getTodayISO(d = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export async function ensureMonthExists(monthId: MonthId) {
    const existing = await db.months.get(monthId);
    if (existing) return;

    await db.months.add({
        id: monthId,
        income: 0,
        createdAt: Date.now(),
    });

    // enveloppes par défaut (tu modifies comme tu veux)
    await db.envelopes.bulkAdd([
        { monthId, name: "Loyer", plannedAmount: 0, createdAt: Date.now() },
        { monthId, name: "Courses", plannedAmount: 0, createdAt: Date.now() },
        { monthId, name: "Transport", plannedAmount: 0, createdAt: Date.now() },
        { monthId, name: "Loisirs", plannedAmount: 0, createdAt: Date.now() },
        { monthId, name: "Imprévu", plannedAmount: 0, createdAt: Date.now() },
    ]);
}
