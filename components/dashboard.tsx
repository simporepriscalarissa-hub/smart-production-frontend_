'use client';
import { Sidebar } from "lucide-react";
import React from "react";
import SidebareContent from "./sidebare-content";

function Dashboard() {

    const [isSideBareOpen, setIsSideBareOpen] = React.useState(false);
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 " >
           <aside className="hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">
            <SidebareContent />
           </aside>
        </div>
    )
}

export default Dashboard;