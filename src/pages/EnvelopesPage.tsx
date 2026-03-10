import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import MonthPicker from "../components/MonthPicker";
import { db, type MonthId } from "../db/db";
import { ensureMonthExists, getMonthId } from "../db/seed";

export default function EnvelopesPage() {
    const params = useParams();
    const monthId = (params.monthId ?? getMonthId()) as MonthId;

    const [name, setName] = useState("");
    const [planned, setPlanned] = useState("");

    useEffect(() => {
        void ensureMonthExists(monthId);
    }, [monthId]);

    const envelopes = useLiveQuery(() => db.envelopes.where("monthId").equals(monthId).sortBy("createdAt"), [monthId]);

    async function addEnvelope() {
        const plannedAmount = Number(planned);
        if (!name.trim() || !Number.isFinite(plannedAmount)) return;

        await db.envelopes.add({
            monthId,
            name: name.trim(),
            plannedAmount,
            createdAt: Date.now()
        });

        setName("");
        setPlanned("");
    }

    async function updatePlanned(id: number, plannedAmount: number) {
        await db.envelopes.update(id, { plannedAmount });
    }

    async function rename(id: number, newName: string) {
        await db.envelopes.update(id, { name: newName });
    }

    async function remove(id: number) {
        const hasTx = await db.transactions.where("envelopeId").equals(id).count();
        if (hasTx > 0) {
            alert("Cette enveloppe a des transactions. Supprime-les d'abord (ou change-les d’enveloppe).");
            return;
        }
        await db.envelopes.delete(id);
    }

    return (
        <div className="container">
            <MonthPicker />

            <div className="card">
                <h2>Ajouter une enveloppe</h2>
                <div className="grid">
                    <label>
                        Nom
                        <input value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                    <label>
                        Budget prévu (€)
                        <input value={planned} onChange={(e) => setPlanned(e.target.value)} />
                    </label>
                </div>
                <div className="actions">
                    <button onClick={() => void addEnvelope()}>Ajouter</button>
                </div>
            </div>

            <div className="card">
                <h2>Enveloppes du mois</h2>
                <div className="table">
                    <div className="row head">
                        <div>Nom</div>
                        <div>Budget prévu</div>
                        <div></div>
                    </div>

                    {(envelopes ?? []).map((e) => (
                        <div className="row" key={e.id}>
                            <div>
                                <input
                                    value={e.name}
                                    onChange={(ev) => void rename(e.id!, ev.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    value={String(e.plannedAmount ?? 0)}
                                    onChange={(ev) => {
                                        const v = Number(ev.target.value);
                                        if (Number.isFinite(v)) void updatePlanned(e.id!, v);
                                    }}
                                />
                            </div>
                            <div className="right">
                                <button className="danger" onClick={() => void remove(e.id!)}>
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
