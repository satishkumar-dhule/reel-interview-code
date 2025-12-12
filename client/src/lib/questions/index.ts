import algorithms from "./algorithms.json";
import database from "./database.json";
import devops from "./devops.json";
import frontend from "./frontend.json";
import sre from "./sre.json";
import system_design from "./system-design.json";

export const questionsByChannel: Record<string, any[]> = {
  "algorithms": algorithms,
  "database": database,
  "devops": devops,
  "frontend": frontend,
  "sre": sre,
  "system-design": system_design
};

export const allQuestions = Object.values(questionsByChannel).flat();
