import { useMemo, useState } from "react";
import { db, type Envelope, type MonthId } from "../db/db";
import { getTodayISO } from "../db/seed";


type Props = {
    monthId: MonthId;
    envelopes: Envelope[];
};

export default function TransactionForm({ monthId, envelopes }: Props) {
    const [date, setDate] = useState(getTodayISO());
    const [envelopeId, setEnvelopeId] = useState<number>(0);
    const [amount, setAmount] = useState<string>("");
    const [label, setLabel] = useState("");
    const selectedEnvelopeId = envelopeId !== 0 ? envelopeId : envelopes[0]?.id ?? 0;

    const canSubmit = useMemo(() => {
        const n = Number(amount);
        return Boolean(date) && Number.isFinite(n) && n !== 0 && selectedEnvelopeId > 0;
        }, [date, amount, selectedEnvelopeId]
    )

    async function submit() {
        if (!canSubmit) return;

        const raw = Number(amount);

        if (!Number.isFinite(raw)) return;

        const normalized = -Math.abs(raw);

        await db.transactions.add({
            monthId,
            envelopeId: selectedEnvelopeId,
            date,
            amount: normalized,
            label: label.trim() || undefined,
            createdAt: Date.now(),
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
                    <br />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>

                <label>
                    Enveloppe
                    <br />
                    <select
                        value={selectedEnvelopeId || ""}
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
                    <br />
                    <input
                        inputMode="decimal"
                        value={amount}
                        placeholder="ex: 12.50"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </label>

                <label>
                    Libellé (optionnel)
                    <br />
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
