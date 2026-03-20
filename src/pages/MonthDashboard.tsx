import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import MonthPicker from "../components/MonthPicker";
import EnvelopeCard from "../components/EnvelopeCard";
import { db, type MonthId } from "../db/db";
import { ensureMonthExists, getMonthId } from "../db/seed";

export default function MonthDashboard() {
    const params = useParams();
    const monthId = (params.monthId ?? getMonthId()) as MonthId;

    useEffect(() => {
        void ensureMonthExists(monthId);
    }, [monthId]);

    const envelopes = useLiveQuery(
        () => db.envelopes.where("monthId").equals(monthId).sortBy("date"),
        [monthId]
    );

    const txs = useLiveQuery(
        () => db.transactions.where("monthId").equals(monthId).sortBy("date"),
        [monthId]
    );

    const spentByEnvelope = useMemo(() => {
        const map = new Map<number, number>();

        for (const t of txs ?? []) {
            const current = map.get(t.envelopeId) ?? 0;

            const value = Math.abs(t.amount);

            map.set(t.envelopeId, current + value);
        }

        return map;
    }, [txs]);

    const totals = useMemo(() =>{
        const planned = (envelopes ?? []).reduce((acc, e) => acc + (e.plannedAmount || 0), 0);
        const spent = (txs ?? []).reduce((acc, t) => (t.amount < 0 ? acc + Math.abs(t.amount) : acc), 0);
        return { planned, spent, remaining: planned - spent };
    }, [envelopes, txs]);

    return (
        <div className="container">
            <MonthPicker />

            <div className="kpis">
                <div className="card">
                    <div className="muted">Total budgeté</div>
                    <div className="kpi">{totals.planned.toFixed(2)} €</div>
                </div>
                <div className="card">
                    <div className="muted">Total dépensé</div>
                    <div className="kpi">{totals.spent.toFixed(2)} €</div>
                </div>
                <div className="card">
                    <div className="muted">Reste</div>
                    <div className={`kpi ${totals.remaining < 0 ? "danger" : ""}`}>
                        {totals.remaining.toFixed(2)} €
                    </div>
                </div>
            </div>

            <div className="grid-cards">
                {(envelopes ?? []).map((env) => (
                    <EnvelopeCard
                        key={env.id}
                        envelope={env}
                        spent={spentByEnvelope.get(env.id!) ?? 0}
                    />
                ))}
            </div>
        </div>
    );
}
