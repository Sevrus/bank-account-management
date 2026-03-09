import { useMemo, useState } from "react";
import { db, type Envelope, type MonthId } from "../db/db";
import { getTodayISO } from "../db/seed";

type Props = {
    monthId: MonthId;
    envelopes: Envelope[];
};

export default function TransactionForm({ monthId, envelopes }: Props) {
    const [date, setDate] = useState(getTodayISO());
    const [envelopeId, setEnvelopeId] = useState<number>(() => envelopes[0]?.id ?? 0);
    const [amount, setAmount] = useState<string>("");
    const [label, setLabel] = useState("");

    const canSubmit = useMemo(() => {
        const n = Number(amount);
        return Boolean(date) && Number.isFinite(n) && n !== 0 && envelopeId > 0;
        }, [date, amount, envelopeId]
    )

    async function submit() {
        if (!canSubmit) return;

        //Convention: dépense = montant négatif
        const raw = Number(amount);
        const normalized = raw < 0 ? -raw : raw;

        await db.transactions.add({
            monthId,
            envelopeId,
            date,
            amount: normalized,
            label: label.trim() || undefined,
            createdAt: Date.now()
        });

        setAmount("");
        setLabel("");
    }

    return (
        <div className="card">
            <h2>Ajouter une dépense</h2>

            <div className="grid">
                <label>
                    Date
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>

                <label>
                    Enveloppe
                    <select
                        value=""
                        onChange={(e) => setEnvelopeId(Number(e.target.value))}
                    >
                        {envelopes.map((env) => (
                            <option key={env.id} value={env.id}>
                                {env.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Montant (tu tapes “10” → -10€)
                    <input
                        inputMode="decimal"
                        value={amount}
                        placeholder="ex: 12.50"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </label>

                <label>
                    Libellé (optionnel)
                    <input value={label} onChange={(e) => setLabel(e.target.value)} />
                </label>
            </div>

            <div className={"actions"}>
                <button disabled={!canSubmit} onClick={() => void submit()}>
                    Ajouter
                </button>
            </div>
        </div>
    );
}
