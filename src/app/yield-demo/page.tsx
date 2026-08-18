import YieldPanel from "@/components/yield-panel";

// TEMPORARY preview-only page to eyeball the YieldPanel with mock data, no
// login/contract required. Remove before merging feat/yield-ui.
// Context: saving-circles#189 (contracts) / app-stacks#184 (this UI).
export default function YieldDemoPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-xl font-bold">Yield panel — preview stub</h1>
      <p className="text-sm opacity-70">
        Temporary demo of the saving-circle yield UI with mock data (not wired
        to a deployed contract). On a real circle this renders under the deposit
        / claim actions once a member has accrued yield.
      </p>
      <YieldPanel stubAmount={12.3456} />
    </main>
  );
}
