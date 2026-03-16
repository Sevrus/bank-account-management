import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import MonthPicker from "../components/MonthPicker";
import TransactionForm from "../components/TransactionForm";
import { db, type MonthId } from "../db/db";
import { ensureMonthExists, getMonthId } from "../db/seed";

export default function TransactionsPage() {
    const params = useParams();
    const monthId = (params.monthId ?? getMonthId()) as MonthId;

    const [q, setQ] = useState("");
    const [envFilter, setEnvFilter] = useState<number | "all">("all");

    useEffect(() => {
        void ensureMonthExists(monthId);
    }, [monthId]);

    const envelopes = useLiveQuery(
        () => db.envelopes.where("monthId").equals(monthId).sortBy("createdAt"),
        [monthId]);

    const txs = useLiveQuery(
        () => db.transactions.where("monthId").equals(monthId).reverse().sortBy("date"),
        [monthId]
    );

    const envelopeNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const e of envelopes ?? []) map.set(e.id!, e.name);
        return map;
    }, [envelopes]);

    const filtered = useMemo(() => {
        const needles = q.trim().toLowerCase();
        return (txs ?? []).filter(t => {
            if (envFilter !== "all" && t.envelopeId !== envFilter) return false;
            if (!needles) return true;
            const label = (t.label ?? "").toLowerCase();
            const env = (envelopeNameById.get(t.envelopeId) ?? "").toLowerCase();
            return label.includes(needles) || env.includes(needles);
        });
    }, [txs, q, envFilter, envelopeNameById]);

    async function removeTx(id: number) {
        await db.transactions.delete(id);
    }

    return (
        <div className="container">
            <MonthPicker />

            <TransactionForm monthId={monthId} envelopes={envelopes ?? []} />

            <div className="card">
                <h2>Transactions</h2>

                <div className="filters">
                    <input
                        placeholder="Recherche (libellé / enveloppe)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <select
                        value={envFilter}
                        onChange={(e) => {
                            const v = e.target.value;
                            setEnvFilter(v === "all" ? "all" : Number(v));
                        }}
                    >
                        <option value="all">Toutes les enveloppes</option>
                        {(envelopes ?? []).map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="table">
                    <div className="row head">
                        <div>Date</div>
                        <div>Enveloppe</div>
                        <div>Libellé</div>
                        <div className="right">Montant</div>
                        <div></div>
                    </div>

                    {filtered.map((t) => (
                        <div className="row" key={t.id}>
                            <div>{t.date}</div>
                            <div>{envelopeNameById.get(t.envelopeId) ?? "—"}</div>
                            <div>{t.label ?? "—"}</div>
                            <div className={`right ${t.amount < 0 ? "danger" : "ok"}`}>
                                {t.amount.toFixed(2)} €
                            </div>
                            <div className="right">
                                <button className="danger" onClick={() => void removeTx(t.id!)}>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
