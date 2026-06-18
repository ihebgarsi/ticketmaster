import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createEvent } from "../api/events.api";
import { EventInput } from "../types/Event";

type CreateEventFormValues = EventInput;

const CreateEvent = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      date: "",
      venue: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateEventFormValues) => {
    try {
      await createEvent(data);
      navigate("/events");
    } catch (error) {
      console.error("Failed to create event", error);
    }
  };

  return (
    <div className="create-event-page">
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            {...register("slug", { required: "Slug is required" })}
          />
          {errors.slug && <p className="error">{errors.slug.message}</p>}
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            {...register("date", { required: "Date is required" })}
          />
          {errors.date && <p className="error">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="venue">Venue</label>
          <input
            id="venue"
            {...register("venue", { required: "Venue is required" })}
          />
          {errors.venue && <p className="error">{errors.venue.message}</p>}
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" {...register("description")} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
