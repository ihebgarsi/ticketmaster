import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { SignupForm } from "../types/User";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: SignupForm) =>
      registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
    onSuccess: () => navigate("/"),
  });

  const { register, handleSubmit } = useForm<SignupForm>();

  const onSubmit = (data: SignupForm) => mutation.mutate(data);

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <span className="eyebrow">Create an account</span>
        <h1>Join Ticket Master and get ready before demand spikes.</h1>
        <p>
          Set up your account now so event discovery and future checkout flows
          feel faster when tickets go live.
        </p>
      </div>

      <div className="form-card">
        <form className="form-layout" onSubmit={handleSubmit(onSubmit)}>
          <div className="section-heading compact">
            <div>
              <h2>Sign Up</h2>
              <p>Enter your details to create a new customer account.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" {...register("email")} />
            </div>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" {...register("name")} />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" {...register("password")} />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
            </div>
            <div className="form-field">
              <label htmlFor="dateOfBirth">Date of birth</label>
              <input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" {...register("phone")} />
            </div>
          </div>

          <button type="submit" className="button-primary button-block">
            {mutation.isPending ? "Creating..." : "Sign Up"}
          </button>
        </form>

        {mutation.isError && <p className="error">{mutation.error?.message}</p>}
        <p className="form-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default SignupPage;
