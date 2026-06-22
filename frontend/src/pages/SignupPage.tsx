import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { register as apiRegister } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";

const SignupPage = () => {
  const navigate = useNavigate();
  const mutation = useMutation<any, Error, User>({
    mutationFn: (data: User) => apiRegister(data),
    onSuccess: () => navigate("/login"),
  });

  const { register, handleSubmit } = useForm<User>();

  const onSubmit = (data: User) => mutation.mutate(data as any);

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
