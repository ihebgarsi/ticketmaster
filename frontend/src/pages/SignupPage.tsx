import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { register as apiRegister } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

type Form = { email: string; password: string; name?: string };

const SignupPage = () => {
  const navigate = useNavigate();
  const mutation = useMutation<any, Error, Form>({
    mutationFn: (data: Form) => apiRegister(data),
    onSuccess: () => navigate("/login"),
  });

  const { register, handleSubmit } = useForm<Form>();

  const onSubmit = (data: Form) => mutation.mutate(data as any);

  return (
    <section>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input {...register("email")} />
        </div>
        <div>
          <label>Name</label>
          <input {...register("name")} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register("password")} />
        </div>
        <button type="submit">
          {mutation.status === "pending" ? "Creating…" : "Sign Up"}
        </button>
      </form>
      {mutation.status === "error" && (
        <p className="error">{(mutation.error as any)?.message}</p>
      )}
    </section>
  );
};

export default SignupPage;
