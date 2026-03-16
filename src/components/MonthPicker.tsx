import {useEffect, useMemo} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useLiveQuery} from "dexie-react-hooks";
import {db, type MonthId} from "../db/db";
import {ensureMonthExists, getMonthId} from "../db/seed";

function monthLabel(monthId: string) {
    const [y, m] = monthId.split("-");
    return `${m}/${y}`;
}

export default function MonthPicker() {
    const params = useParams();
    const navigate = useNavigate();

    const currentMonthId = useMemo(() => getMonthId(), []);
    const monthId = (params.monthId ?? currentMonthId) as MonthId;

    const months = useLiveQuery(async () => {
        return db.months.orderBy("id").reverse().toArray();
    }, []);

    useEffect(() => {
        void ensureMonthExists(monthId);
    }, [monthId]);

    async function createNextMonth() {
        const [yStr, mStr] = monthId.split("-");
        const y = Number(yStr);
        const m = Number(mStr);
        const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
        const nextId = next as MonthId;
        await ensureMonthExists(nextId);
        navigate(`/mois/${nextId}`);
    }

    return (
        <div className="month-picker">
            <div className="month-picker__left">
                <h1>Budget</h1>
                <div className="month-picker__current">{monthLabel(monthId)}</div>
            </div>

            <div className="month-picker__right">
                <select
                    value={monthId}
                    onChange={(e) => navigate(`/mois/${e.target.value as MonthId}`)}
                >
                    {(months ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                            {monthLabel(m.id)}
                        </option>
                    ))}
                </select>

                <button onClick={() => void createNextMonth()}>+ Mois suivant</button>

                <div className="month-picker__links">
                    <Link to={`/mois/${monthId}`}>Dashboard</Link>
                    <Link to={`/mois/${monthId}/enveloppes`}>Enveloppes</Link>
                    <Link to={`/mois/${monthId}/transactions`}>Transactions</Link>
                </div>
            </div>
        </div>
    );
}
