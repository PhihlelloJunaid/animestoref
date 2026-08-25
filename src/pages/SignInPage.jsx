import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", role: "customer" });

  const handleSubmit = (event) => {
    event.preventDefault();
    signIn(form);
    const destination = location.state?.from?.pathname || "/dashboard";
    navigate(form.role === "admin" ? "/admin/dashboard" : destination, {
      replace: true,
    });
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="section-label">WELCOME BACK</p>
        <h2>Sign in</h2>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <button className="primary-button" type="submit">Sign in</button>
        <p>New to AnimeStore? <Link to="/signup">Create an account</Link></p>
      </form>
    </section>
  );
}

export default SignInPage;
