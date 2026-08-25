import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (event) => {
    event.preventDefault();
    signUp(form);
    navigate("/dashboard", { replace: true });
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="section-label">JOIN ANIME STORE</p>
        <h2>Sign up</h2>
        {["name", "email", "password"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : field === "email" ? "email" : "text"}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
            required
          />
        ))}
        <button className="primary-button" type="submit">Create account</button>
        <p>Already registered? <Link to="/signin">Sign in</Link></p>
      </form>
    </section>
  );
}

export default SignUpPage;
