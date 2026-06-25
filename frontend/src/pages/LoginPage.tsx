import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

type Form = { email: string; password: string };

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: Form) => login(data.email, data.password),
    onSuccess: () => {
      navigate("/");
    },
  });

  const googleMutation = useMutation({
    mutationFn: ({ token }: { token: string }) => googleLogin(token),
    onSuccess: () => {
      navigate("/");
    },
  });

  const { register, handleSubmit } = useForm<Form>();
  const onSubmit = (d: Form) => mutation.mutate(d);

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to continue your ticket journey.</h1>
        <p>
          Access event availability, manage reservations, and continue through
          checkout from one place.
        </p>
      </div>

      <div className="form-card">
        <form className="form-layout" onSubmit={handleSubmit(onSubmit)}>
          <div className="section-heading compact">
            <div>
              <h2>Login</h2>
              <p>Use your email and password or continue with Google.</p>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register("email")} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" {...register("password")} />
          </div>
          <button type="submit" className="button-primary button-block">
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {(mutation.isError || googleMutation.isError) && (
          <p className="error">{(mutation.error ?? googleMutation.error)?.message}</p>
        )}

        <div className="auth-divider">or continue with</div>
        <div className="social-login">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const token = credentialResponse.credential;
              if (token) {
                googleMutation.mutate({ token });
              }
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </div>

        <p className="form-footnote">
          New here? <Link to="/signup">Create your account</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
