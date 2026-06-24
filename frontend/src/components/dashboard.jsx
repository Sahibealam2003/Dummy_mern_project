import React from "react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { 
    TrendingUp, 
    Users, 
    CreditCard, 
    Activity, 
    ArrowUpRight, 
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    Tag
} from "lucide-react";

// Mock revenue data
const revenueData = [
    { name: "Jan", revenue: 8000 },
    { name: "Feb", revenue: 9500 },
    { name: "Mar", revenue: 11000 },
    { name: "Apr", revenue: 10200 },
    { name: "May", revenue: 12500 },
    { name: "Jun", revenue: 14200 },
];

// Billing health data (Paid, Pending, Overdue)
const billingData = [
    { name: "Paid Invoices", value: 94.2, color: "#2c7a4a" },
    { name: "Pending Invoices", value: 4.8, color: "#e8622a" },
    { name: "Overdue Invoices", value: 1.0, color: "#e11d48" },
];

export function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Header info */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-[#2c2420]">
                    Performance Dashboard
                </h1>
                <p className="text-xs text-[#8c7e74] mt-1 font-medium">
                    Real-time operational business metrics, billing status, and sales channel data.
                </p>
            </div>

            {/* KPI grid row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Net Revenue KPI */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Net Revenue</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-[#2c2420]">$142,384.50</h3>
                        <p className="text-[10px] text-[#2c7a4a] font-bold flex items-center gap-0.5 mt-1">
                            <TrendingUp className="h-3.5 w-3.5" /> +12.5% vs last month
                        </p>
                    </div>
                </div>

                {/* Subscriptions KPI */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Active Accounts</span>
                        <div className="p-2 rounded-xl bg-orange-50 text-[#e8622a] border border-orange-100">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-[#2c2420]">1,284</h3>
                        <p className="text-[10px] text-[#e8622a] font-bold flex items-center gap-0.5 mt-1">
                            <TrendingUp className="h-3.5 w-3.5" /> +4.2% weekly increase
                        </p>
                    </div>
                </div>

                {/* Billing health rate */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Billing Health</span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <CreditCard className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-[#2c2420]">94.2%</h3>
                        <p className="text-[10px] text-[#8c7e74] font-medium flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Target payout achieved
                        </p>
                    </div>
                </div>

                {/* Performance score */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8c7e74]">Conversion Rate</span>
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-[#2c2420]">3.85%</h3>
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                            <ArrowUpRight className="h-3.5 w-3.5" /> +0.8% checkout optimization
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts & KPI breakdowns row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend chart */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-black text-[#2c2420]">Net Revenue Trend</h3>
                            <p className="text-[10px] text-[#8c7e74] font-medium mt-0.5">Monthly breakdown of net channel collections.</p>
                        </div>
                        <span className="rounded-full bg-[#fdf9f5] border border-[#e8622a]/20 px-3 py-1 text-[10px] font-bold text-[#e8622a]">
                            USD ($)
                        </span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e8622a" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#e8622a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#8c7e74" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#8c7e74" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: "rgba(255,255,255,0.95)", 
                                        borderRadius: 12, 
                                        border: "1px solid #ede8e2",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        fontSize: 11
                                    }} 
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#e8622a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Billing health visual widget */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-[#2c2420] mb-1">Billing Health</h3>
                        <p className="text-[10px] text-[#8c7e74] font-medium">Invoice settlement and resolution efficiency.</p>
                    </div>

                    <div className="h-40 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={billingData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={65}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {billingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-black text-[#2c2420]">94.2%</span>
                            <span className="text-[8px] font-black uppercase text-stone-400 tracking-wider">Paid</span>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        {billingData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
                                <div className="flex items-center gap-1.5 text-[#5a4e46]">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </div>
                                <span className="text-[#2c2420]">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoices Table & Activity Feed Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices Table */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-[#2c2420] mb-1">Recent Invoices</h3>
                        <p className="text-[10px] text-[#8c7e74] font-medium mb-4">Latest checkout invoices raised across storefront.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#f5f3ef] text-[9px] font-black uppercase tracking-wider text-[#8c7e74] bg-[#fafafa]">
                                    <th className="p-3">Invoice</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f5f3ef] text-[11px]">
                                {[
                                    { id: "#INV-001", customer: "John Doe", date: "Jun 22, 2026", amount: "$320.00", status: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                                    { id: "#INV-002", customer: "Jane Smith", date: "Jun 21, 2026", amount: "$120.00", status: "Pending", color: "bg-orange-50 text-orange-700 border-orange-200" },
                                    { id: "#INV-003", customer: "Alex Johnson", date: "Jun 20, 2026", amount: "$850.00", status: "Overdue", color: "bg-rose-50 text-rose-700 border-rose-200" },
                                    { id: "#INV-004", customer: "Emily Davis", date: "Jun 18, 2026", amount: "$45.00", status: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                                ].map((inv) => (
                                    <tr key={inv.id} className="hover:bg-stone-50/50">
                                        <td className="p-3 font-mono font-bold text-[#2c2420]">{inv.id}</td>
                                        <td className="p-3 font-semibold text-[#5a4e46]">{inv.customer}</td>
                                        <td className="p-3 text-[#8c7e74] font-medium">{inv.date}</td>
                                        <td className="p-3 text-right font-extrabold text-[#2c2420]">{inv.amount}</td>
                                        <td className="p-3 text-center">
                                            <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider ${inv.color}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-2xl border border-[#ede8e2] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-[#2c2420] mb-1">Administrative Activity Log</h3>
                        <p className="text-[10px] text-[#8c7e74] font-medium mb-5 font-semibold">Latest configuration logs from admin operations.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "Product Stock Sync Completed", time: "2 mins ago", desc: "Catalog updated by Admin Saif", icon: CheckCircle, color: "text-emerald-500" },
                            { title: "Coupon SUMMER50 Published", time: "1 hour ago", desc: "Promo Special Offer live on frontend", icon: Tag, color: "text-[#e8622a]" },
                            { title: "Payout Processed", time: "3 hours ago", desc: "$4,500.00 sent successfully to merchant bank", icon: CreditCard, color: "text-blue-500" },
                            { title: "Security Alert: Config Changed", time: "1 day ago", desc: "Admin credentials modified for account: qwert", icon: AlertCircle, color: "text-rose-500" },
                        ].map((act, index) => {
                            const Icon = act.icon;
                            return (
                                <div key={index} className="flex gap-3 text-left">
                                    <div className="mt-0.5 shrink-0">
                                        <Icon className={`h-4 w-4 ${act.color}`} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="text-[11px] font-bold text-[#2c2420] truncate">{act.title}</p>
                                            <span className="text-[8px] font-bold text-[#8c7e74] shrink-0">{act.time}</span>
                                        </div>
                                        <p className="text-[9px] text-[#8c7e74] font-medium mt-0.5 truncate">{act.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
