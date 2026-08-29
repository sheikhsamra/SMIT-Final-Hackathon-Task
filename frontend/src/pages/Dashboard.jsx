import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}! Yeh protected page hai — sirf login ke baad dikhta hai.</p>
      <p>Yahan se apna hackathon feature/task build karna start karein 👇</p>
    </div>
  );
}
