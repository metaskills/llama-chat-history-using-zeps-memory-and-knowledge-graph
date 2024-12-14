import { zep } from "../shared/zep.js";
import type { User, Session } from "@getzep/zep-cloud/api";

// Users

let pageNumberU = 1;
let users;
process.stdout.write("Deleting users...");
do {
  try {
    const response = await zep.user.listOrdered({
      pageSize: 10,
      pageNumber: pageNumberU,
    });
    users = response.users;
  } catch (error: any) {
    if (error.statusCode === 404) {
      users = [];
    } else {
      throw error;
    }
  }
  users?.forEach((u: User) => {
    try {
      zep.user.delete(u.userId!);
    } catch {}
    process.stdout.write(".");
  });
  pageNumberU++;
} while (users && users.length > 0);
process.stdout.write("\n");

// Sessions

let pageNumberS = 1;
let sessions;
process.stdout.write("Deleting sessions...");
do {
  try {
    const response = await zep.memory.listSessions({
      pageSize: 10,
      pageNumber: pageNumberS,
    });
    sessions = response.sessions;
  } catch (error: any) {
    if (error.statusCode === 404) {
      sessions = [];
    } else {
      throw error;
    }
  }
  sessions?.forEach((s: Session) => {
    try {
      zep.memory.delete(s.sessionId!);
    } catch {}
    process.stdout.write(".");
  });
  pageNumberS++;
} while (sessions && sessions.length > 0);
process.stdout.write("\n");
