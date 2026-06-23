import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
    <section>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input {...register("email")} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register("password")} />
        </div>
        <button type="submit">
          {mutation.isPending ? "Signing in…" : "Sign In"}
        </button>
      </form>
      {(mutation.isError || googleMutation.isError) && (
        <p className="error">
          {(mutation.error ?? googleMutation.error)?.message}
        </p>
      )}
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
    </section>
  );
};

export default LoginPage;
