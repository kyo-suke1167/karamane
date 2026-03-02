import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      minNoteId: number | null;
      maxNoteId: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    minNoteId: number | null;
    maxNoteId: number | null;
  }
}
