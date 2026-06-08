export function SettingsPage() {
  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="max-w-2xl">
        <h2 className="text-foreground mb-6" style={{ fontSize: "20px", fontWeight: 700 }}>
          Account Settings
        </h2>
        <div className="space-y-4">
          {[
            { label: "Company Name", value: "Southwest Greens Ohio" },
            { label: "Primary Email", value: "admin@southwestgreens.com" },
            { label: "Phone", value: "(614) 555-0100" },
            { label: "Timezone", value: "America/New_York (EST)" },
          ].map((field) => (
            <div
              key={field.label}
              className="bg-white rounded-xl border p-4 flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  {field.label}
                </label>
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 500 }}>
                  {field.value}
                </p>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg border text-foreground hover:bg-muted"
                style={{ fontSize: "12px", borderColor: "var(--border)" }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
