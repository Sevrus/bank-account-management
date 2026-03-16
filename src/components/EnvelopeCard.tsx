import type { Envelope } from "../db/db";

type Props = {
    envelope: Envelope;
    spent: number; // valeur positive (somme des dépenses)
};

export default function EnvelopeCard({ envelope, spent }: Props) {
    const planned = envelope.plannedAmount || 0;
    const remaining = planned - spent;
    const pct = planned > 0 ? Math.min(999, Math.round((spent / planned) * 100)) : 0;
    const isOver = planned > 0 && spent > planned;

    return (
        <div className={`card envelope ${isOver ? "is-over" : ""}`}>
            <div className="envelope__top">
                <div className="envelope__name">{envelope.name}</div>
                <div className="envelope__numbers">
                    <span className="muted">Prévu:</span> {planned.toFixed(2)} €
                </div>
            </div>

            <div className="envelope__mid">
                <div><span className="muted">Dépensé:</span> {spent.toFixed(2)} €</div>
                <div><span className="muted">Reste:</span> {remaining.toFixed(2)} €</div>
            </div>

            <div className="progress">
                <div className="progress__bar" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>

            <div className="envelope__bottom muted">
                {planned > 0 ? `${pct}%` : "Définis un budget pour activer le %"}
            </div>
        </div>
    );
}
