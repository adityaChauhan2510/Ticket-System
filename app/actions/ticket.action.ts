"use server";
import { prisma } from "../db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "../utils/sentry";
import { getCurrentUser } from "../lib/current.user";

export const createTicket = async (
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      logEvent(
        "Unauthorized access attempt to create ticket",
        "ticket",
        {},
        "warning"
      );
      return {
        success: false,
        message: "You must be logged in to create a ticket",
      };
    }

    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    if (!subject || !description || !priority) {
      logEvent(
        "Validation Error: Missing ticket fields",
        "ticket",
        { subject, description, priority },
        "warning"
      );
      return {
        success: false,
        message: "All fields are required",
      };
    }

    //create ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    logEvent(
      `Ticket created successfully : ${ticket.id}`,
      "ticket",
      { ticketId: ticket.id },
      "info"
    );

    revalidatePath("/tickets");

    return {
      success: true,
      message: "Ticket created successfully",
    };
  } catch (error) {
    logEvent(
      "Error occured while creating the ticket",
      "ticket",
      {
        formData: Object.fromEntries(formData.entries()),
      },
      "error",
      error
    );
    return {
      success: false,
      message: "An error occurred while creating the ticket",
    };
  }
};

export const getTickets = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      logEvent("Unauthorized access to ticket list", "ticket", {}, "warning");
      return [];
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logEvent(
      `Fetched ${tickets.length} tickets successfully`,
      "ticket",
      { ticketCount: tickets.length },
      "info"
    );

    return tickets;
  } catch (error) {
    logEvent("Error fetching tickets", "ticket", {}, "error", error);
    return [];
  }
};

export const getTicketById = async (id: string) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!ticket) {
      logEvent(
        `Ticket with ID ${id} not found`,
        "ticket",
        { ticketId: id },
        "warning"
      );
      return null;
    }

    logEvent(
      `Fetched ticket with ID ${id} successfully`,
      "ticket",
      { ticketId: id },
      "info"
    );

    return ticket;
  } catch (error) {
    logEvent(
      "Error fetching ticket details",
      "ticket",
      { ticketId: id },
      "error",
      error
    );
    return null;
  }
};

export const closeTicket = async (
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> => {
  const ticketId = Number(formData.get("ticketId"));
  if (!ticketId) {
    logEvent("Validation Error: Missing ticket ID", "ticket", {}, "warning");
    return {
      success: false,
      message: "Ticket ID is required",
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    logEvent(
      "Unauthorized access attempt to close ticket",
      "ticket",
      {},
      "warning"
    );
    return {
      success: false,
      message: "You must be logged in to close a ticket",
    };
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket || ticket.userId !== user.id) {
    logEvent(
      `Unauthorized attempt to close ticket with ID ${ticketId}`,
      "ticket",
      { ticketId },
      "warning"
    );
    return {
      success: false,
      message: "You are not authorized to close this ticket",
    };
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: "Closed",
    },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);

  return {
    success: true,
    message: "Ticket closed successfully",
  };
};
