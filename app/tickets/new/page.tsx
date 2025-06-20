import { getCurrentUser } from "@/app/lib/current.user";
import TicketCreationForm from "@/components/TicketCreationForm";
import { redirect } from "next/navigation";

const NewTicketPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <TicketCreationForm />
    </div>
  );
};

export default NewTicketPage;
