import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { login as apiLogin } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

type Form = { email: string; password: string };

const LoginPage = () => {
  const navigate = useNavigate();
  const mutation = useMutation<any, Error, Form>({
    mutationFn: (data: Form) => apiLogin(data),
    onSuccess: (data) => {
      // store tokens in localStorage for now
      if (data.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/");
    },
  });

  const { register, handleSubmit } = useForm<Form>();
  const onSubmit = (d: Form) => mutation.mutate(d as any);

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
          {mutation.status === "pending" ? "Signing in…" : "Sign In"}
        </button>
      </form>
      {mutation.status === "error" && (
        <p className="error">{(mutation.error as any)?.message}</p>
      )}
    </section>
  );
};

export default LoginPage;
