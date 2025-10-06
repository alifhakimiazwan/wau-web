import { LogoutButton } from "@/components/auth/logout-button";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="space-y-4">
        <p>Welcome to your dashboard!</p>
        {/* Rest of your dashboard content */}
      </div>
    </div>
  );
}
