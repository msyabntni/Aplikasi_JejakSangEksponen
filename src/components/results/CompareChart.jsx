"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Table2 } from "lucide-react";

import { INDICATOR_LABEL } from "@/lib/types";

// Dua seri: biru (pretest) & oranye (posttest) — pasangan aman untuk buta warna.
const PRE = "#3f7fb5";
const POST = "#e07a2e";

/** Perbandingan persentase benar per indikator: grafik batang + tampilan tabel. */
export function CompareChart({ pre, post }) {
  const [view, setView] = useState("chart");
  const rows = Object.keys(INDICATOR_LABEL)
    .filter((k) => pre.byIndicator[k] || post.byIndicator[k])
    .map((k) => {
      const a = pre.byIndicator[k] ?? [0, 0];
      const b = post.byIndicator[k] ?? [0, 0];
      return {
        key: k,
        name: INDICATOR_LABEL[k],
        Pretest: a[1] ? Math.round((a[0] / a[1]) * 100) : 0,
        Posttest: b[1] ? Math.round((b[0] / b[1]) * 100) : 0,
        preRaw: `${a[0]}/${a[1]}`,
        postRaw: `${b[0]}/${b[1]}`,
      };
    });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold text-jungle">Persentase benar per indikator materi</h3>
        <div className="flex rounded-full bg-white p-1 print:hidden" role="tablist">
          <button
            role="tab"
            aria-selected={view === "chart"}
            onClick={() => setView("chart")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${view === "chart" ? "bg-jungle text-cream" : "text-jungle"}`}
          >
            <BarChart3 size={14} /> Grafik
          </button>
          <button
            role="tab"
            aria-selected={view === "table"}
            onClick={() => setView("table")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${view === "table" ? "bg-jungle text-cream" : "text-jungle"}`}
          >
            <Table2 size={14} /> Tabel
          </button>
        </div>
      </div>
      {view === "chart" ? (
        <div className="h-[420px] w-full rounded-2xl bg-white p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }} barGap={2} barCategoryGap="22%">
              <CartesianGrid horizontal={false} stroke="#e7e2d3" />
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                unit="%"
                tick={{ fill: "#6b6150", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#2a2418", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(23,63,42,0.06)" }}
                formatter={(v, n, item) => [`${v}% (${n === "Pretest" ? item.payload.preRaw : item.payload.postRaw})`, n]}
                contentStyle={{ borderRadius: 12, border: "1px solid #d9c08f", fontFamily: "var(--font-body)" }}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ color: "#2a2418", fontWeight: 700 }} />
              <Bar dataKey="Pretest" fill={PRE} radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="Posttest" fill={POST} radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="w-full text-left text-jungle">
            <thead className="bg-cream text-sm">
              <tr>
                <th className="px-3 py-2">Indikator</th>
                <th className="px-3 py-2">Pretest</th>
                <th className="px-3 py-2">Posttest</th>
                <th className="px-3 py-2">Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-earth/10">
                  <td className="px-3 py-2 font-semibold">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.Pretest}% ({r.preRaw})
                  </td>
                  <td className="px-3 py-2">
                    {r.Posttest}% ({r.postRaw})
                  </td>
                  <td className="px-3 py-2 font-bold">
                    {r.Posttest - r.Pretest > 0 ? "+" : ""}
                    {r.Posttest - r.Pretest}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
