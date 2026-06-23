import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
        <div>
          <label>Confirm Password</label>
          <input type="password" {...register("confirmPassword")} />
        </div>
        <div>
          <label>Date of birth</label>
          <input type="date" {...register("dateOfBirth")} />
        </div>
        <div>
          <label>Phone</label>
          <input type="number" {...register("phone")} />
        </div>

        <button type="submit">
          {mutation.isPending ? "Creating…" : "Sign Up"}
        </button>
      </form>
      {mutation.isError && (
        <p className="error">{mutation.error?.message}</p>
      )}
    </section>
  );
};

export default SignupPage;
