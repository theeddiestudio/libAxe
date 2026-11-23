import { useState } from "react";
import { useSearchParams } from "react-router";
import { BanknoteIcon, InboxIcon, Undo2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import SearchInput from "../components/SearchInput";
import RequestsTab from "../components/admin/RequestsTab";
import PaymentsTab from "../components/admin/PaymentsTab";

const TABS = [
    { key: "borrow", label: "Borrow requests", short: "Borrow", Icon: InboxIcon },
    { key: "return", label: "Return requests", short: "Return", Icon: Undo2Icon },
    { key: "payments", label: "Payments", short: "Payments", Icon: BanknoteIcon },
];

const Admin = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");

    // the tab lives in the address (/admin?tab=return) so links and notifications can open the right one
    const requested = searchParams.get("tab");
    const tab = TABS.some((t) => t.key === requested) ? requested : "borrow";

    const changeTab = (key) => {
        setSearch("");
        setSearchParams({ tab: key });
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <main className="mx-auto max-w-5xl space-y-4 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm opacity-70">Review requests, hand over books and collect payments.</p>
                </div>

                <div role="tablist" className="tabs tabs-box w-full bg-base-100">
                    {TABS.map(({ key, label, short, Icon }) => (
                        <button
                            key={key}
                            role="tab"
                            className={`tab flex-1 gap-2 ${tab === key ? "tab-active" : ""}`}
                            onClick={() => changeTab(key)}
                        >
                            <Icon className="size-4" />
                            <span className="sm:hidden">{short}</span>
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                <SearchInput value={search} onChange={setSearch} placeholder="Search by username or email..." />

                {tab === "payments"
                    ? <PaymentsTab search={search} />
                    : <RequestsTab key={tab} type={tab} search={search} />
                }
            </main>
        </div>
    );
};

export default Admin;