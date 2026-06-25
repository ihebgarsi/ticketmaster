import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "../api/events.api";
import { type Event as ApiEvent, type EventInput } from "../types/Event";

type CreateEventFormValues = EventInput;

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate, status } = useMutation<
    ApiEvent,
    Error,
    CreateEventFormValues
  >({
    mutationFn: (data: CreateEventFormValues) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      date: "",
      venue: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateEventFormValues) => {
    mutate(data);
  };

  return (
    <section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Create Event</h1>
          <p>Publish a new event with a cleaner form and stronger visual hierarchy.</p>
        </div>
      </div>

      <div className="form-card">
        <form className="form-layout" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                {...register("slug", { required: "Slug is required" })}
              />
              {errors.slug && <p className="error">{errors.slug.message}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && <p className="error">{errors.date.message}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="venue">Venue</label>
              <input
                id="venue"
                {...register("venue", { required: "Venue is required" })}
              />
              {errors.venue && <p className="error">{errors.venue.message}</p>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows={5} {...register("description")} />
          </div>

          <button type="submit" className="button-primary">
            {status === "pending" ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateEvent;
