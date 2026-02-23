"use client";

import { useEffect, useMemo, useState } from "react";
import { PartyDto, SettingsDto } from "@/lib/types";

const currency = (n: number) => `₹${n.toFixed(2)}`;

const defaultSummary = { currentWeek: 0, nextWeek: 0, weekPlus2: 0, totalOutstanding: 0 };

export default function HomePage() {
  const [parties, setParties] = useState<PartyDto[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [settings, setSettings] = useState<SettingsDto | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState<PartyDto | null>(null);

  const refresh = async () => {
    const [p, s, cfg] = await Promise.all([
      fetch("/api/parties").then((r) => r.json()),
      fetch("/api/summary").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json())
    ]);
    setParties(p);
    setSummary(s);
    setSettings(cfg);
  };

  useEffect(() => {
    refresh();
  }, []);

  const totalPercent = useMemo(
    () => (settings?.weekPercentages ?? []).reduce((acc, v) => acc + v, 0).toFixed(2),
    [settings]
  );

  const postAction = async (route: string, partyId: string) => {
    await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyId })
    });
    refresh();
  };

  const saveParty = async (payload: { name: string; totalDue: number }) => {
    const isEdit = Boolean(editing);
    await fetch(isEdit ? `/api/parties/${editing?._id}` : "/api/parties", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setShowAdd(false);
    setEditing(null);
    refresh();
  };

  return (
    <main className="container">
      <div className="topbar">
        <div>
          <div className="title">PayTrack</div>
          <div className="muted">Weekly supplier payment manager</div>
        </div>
        <button className="btn-ghost" onClick={() => setShowSettings((v) => !v)}>
          Settings
        </button>
      </div>

      <section className="grid">
        <SummaryCard title="Current Week" value={summary.currentWeek} />
        <SummaryCard title="Next Week" value={summary.nextWeek} />
        <SummaryCard title="Week +2" value={summary.weekPlus2} />
        <SummaryCard title="Outstanding" value={summary.totalOutstanding} />
      </section>

      {parties.map((party) => {
        const visibleWeeks = party.schedule.filter((w) => w.status === "pending").slice(0, 3);
        const currentStatus = party.schedule.find((w) => w.status === "pending")?.status ?? "paid";

        return (
          <article key={party._id} className="party">
            <div className="row">
              <div>
                <strong>{party.name}</strong>
                <div className="muted">Balance: {currency(party.balance)}</div>
              </div>
              <span className={`status ${currentStatus}`}>{currentStatus}</span>
            </div>

            <div className="weeks">
              {[0, 1, 2].map((idx) => (
                <div className="week" key={idx}>
                  <span>{idx === 0 ? "Current" : idx === 1 ? "Next" : "+2"}</span>
                  <strong>{currency(visibleWeeks[idx]?.amount ?? 0)}</strong>
                </div>
              ))}
            </div>

            <div className="actions">
              <button className="btn-primary" onClick={() => postAction("/api/actions/pay", party._id)}>
                Pay
              </button>
              <button className="btn-warning" onClick={() => postAction("/api/actions/skip", party._id)}>
                Skip
              </button>
              <button className="btn-ghost" onClick={() => { setEditing(party); setShowAdd(true); }}>
                Edit
              </button>
              <button
                className="btn-danger"
                onClick={async () => {
                  await fetch(`/api/parties/${party._id}`, { method: "DELETE" });
                  refresh();
                }}
              >
                Delete
              </button>
            </div>
          </article>
        );
      })}

      <button className="fab" onClick={() => { setEditing(null); setShowAdd(true); }} aria-label="Add party">
        +
      </button>

      {showAdd && (
        <PartyForm
          initial={editing ? { name: editing.name, totalDue: editing.totalDue } : undefined}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSave={saveParty}
        />
      )}

      {showSettings && settings && (
        <SettingsSheet settings={settings} totalPercent={totalPercent} onSaved={refresh} onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <div className="amount">{currency(value)}</div>
    </div>
  );
}

function PartyForm({
  initial,
  onSave,
  onClose
}: {
  initial?: { name: string; totalDue: number };
  onSave: (v: { name: string; totalDue: number }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [totalDue, setTotalDue] = useState(initial?.totalDue ?? 0);

  return (
    <section className="form-sheet">
      <h3>{initial ? "Edit Party" : "Add Party"}</h3>
      <label>Party name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ABC Traders" />
      <label>Total due</label>
      <input
        value={totalDue || ""}
        onChange={(e) => setTotalDue(Number(e.target.value))}
        type="number"
        min="0"
        step="0.01"
        placeholder="50000"
      />
      <div className="actions">
        <button className="btn-primary" onClick={() => onSave({ name, totalDue })}>Save</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </section>
  );
}

function SettingsSheet({
  settings,
  totalPercent,
  onSaved,
  onClose
}: {
  settings: SettingsDto;
  totalPercent: string;
  onSaved: () => Promise<void>;
  onClose: () => void;
}) {
  const [preset, setPreset] = useState(settings.preset);
  const [values, setValues] = useState<number[]>(settings.weekPercentages);

  const updatePreset = async (nextPreset: string) => {
    setPreset(nextPreset as SettingsDto["preset"]);
    if (nextPreset !== "custom") {
      const updated = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: nextPreset })
      }).then((r) => r.json());
      setValues(updated.weekPercentages);
      onSaved();
    }
  };

  return (
    <section className="form-sheet" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <h3>Weekly distribution</h3>
      <label>Preset</label>
      <select value={preset} onChange={(e) => updatePreset(e.target.value)}>
        <option value="equal">Equal distribution</option>
        <option value="frontHeavy">Front heavy</option>
        <option value="backHeavy">Back heavy</option>
        <option value="custom">Custom</option>
      </select>
      <p className="muted">Total: {totalPercent}%</p>

      {values.map((value, idx) => (
        <div className="slider-row" key={idx}>
          <label>Week {idx + 1}: {value.toFixed(2)}%</label>
          <input
            disabled={preset !== "custom"}
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={value}
            onChange={(e) => {
              const next = [...values];
              next[idx] = Number(e.target.value);
              setValues(next);
            }}
          />
        </div>
      ))}

      <div className="actions">
        <button
          className="btn-primary"
          onClick={async () => {
            await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ preset: "custom", weekPercentages: values })
            });
            await onSaved();
            onClose();
          }}
        >
          Save Settings
        </button>
        <button className="btn-ghost" onClick={onClose}>Close</button>
      </div>
    </section>
  );
}
