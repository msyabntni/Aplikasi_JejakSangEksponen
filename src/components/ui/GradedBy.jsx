import { Cpu, MonitorSmartphone } from "lucide-react";

/** Label kecil: siapa yang menilai jawaban (backend Python / cadangan browser). */
export function GradedBy({ by, className = "" }) {
  if (!by) return null;
  const python = by === "python";
  const label = python ? "Dinilai oleh server Python" : by === "supabase" ? "Dinilai oleh server (mode akun)" : "Dinilai di browser (server Python tidak terjangkau)";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${python ? "bg-[#dff4f9] text-[#1f5f73]" : "bg-white/80 text-earth"} ${className}`}
      data-graded-by={by}
    >
      {python ? <Cpu size={13} /> : <MonitorSmartphone size={13} />} {label}
    </span>
  );
}
