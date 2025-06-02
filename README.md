# 🚀 Swift Ticket System

**Swift Ticket System** is a modern, full-stack ticketing application built with **Next.js**, **Neon PostgreSQL**, **Prisma ORM**, and **Sentry**. It enables users to create, view, and manage support tickets with **Low**, **Medium**, or **High** priority levels in a fast and efficient way.

---

## 🧭 Features

- 📝 Submit support tickets with priority selection
- 📂 View and manage your submitted tickets
- ✅ Close tickets when resolved
- 🧑‍💼 Authentication support for access control
- 🔎 Logs important events and errors via **Sentry**
- ⚙️ Optimized server actions using React’s `useActionState`
- 🔄 Auto UI updates with `revalidatePath`

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Server Actions, Prisma ORM
- **Database**: Neon (PostgreSQL, serverless)
- **Monitoring**: Sentry

## <a name="quick-start">🤸 Quick Start</a>

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
https://github.com/adityaChauhan2510/Ticket-System.git
cd Ticket-System
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

````env
# Sentry
SENTRY_AUTH_TOKEN=

# JWT_SECRET_KEY
JWT_SECRET=

# NEON_DATABASE_URL
DATABASE_URL=


**Running the Project**

```bash
npm run dev
````

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.
