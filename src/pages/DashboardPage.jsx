import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="simple-page">
      <p className="section-label">ACCOUNT</p>
      <h2>Welcome, {user.name}</h2>
      <p>Manage your profile, orders, and shopping activity.</p>
      <Link className="primary-button inline-button" to="/catalog">Browse catalog</Link>
    </section>
  );
}

export default DashboardPage;
