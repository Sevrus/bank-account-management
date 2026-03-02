import { Navigate, Route, Routes } from "react-router-dom";
import MonthDashboard from "../pages/MonthDashboard";
import EnvelopesPage from "../pages/EnvelopesPage";
import TransactionsPage from "../pages/TransactionsPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/mois" replace />} />
            <Route path="/mois" element={<MonthDashboard />} />
            <Route path="/mois/:monthId" element={<MonthDashboard />} />
            <Route path="/mois/:monthId/enveloppes" element={<EnvelopesPage />} />
            <Route path="/mois/:monthId/transactions" element={<TransactionsPage />} />
            <Route path="*" element={<Navigate to="/mois" replace />} />
        </Routes>
    );
}
