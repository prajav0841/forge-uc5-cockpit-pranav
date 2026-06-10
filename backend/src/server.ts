import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
});

type KpiDefinition = {
  id: string;
  displayName: string;
  definition: string;
  formula: string;
  sourceSystem: string;
};

const kpis: KpiDefinition[] = [
  {
    id: "ar_aging_by_entity",
    displayName: "AR Aging by Entity",
    definition: "Accounts receivable grouped by aging bucket and legal entity.",
    formula: "Open invoice balance grouped by entity and due-date aging bucket.",
    sourceSystem: "QuickBooks Sandbox",
  },
  {
    id: "bench_utilization",
    displayName: "Bench Utilization",
    definition: "Percentage of available employee capacity not assigned to billable project work.",
    formula: "Bench hours divided by available hours.",
    sourceSystem: "Clockify Sandbox / TimeLive Equivalent",
  },
  {
    id: "dso_by_entity",
    displayName: "DSO by Entity",
    definition: "Days Sales Outstanding by legal entity.",
    formula: "Accounts receivable divided by average daily revenue.",
    sourceSystem: "QuickBooks Sandbox",
  },
  {
    id: "project_margin",
    displayName: "Project Margin",
    definition: "Revenue minus direct project cost, divided by revenue.",
    formula: "(Project revenue - project cost) / project revenue.",
    sourceSystem: "QuickBooks Sandbox / Sales Portal",
  },
];

const queryLog: any[] = [];

function matchQuestionToKpi(question: string): KpiDefinition | null {
  const q = question.toLowerCase();

  if (q.includes("ar") || q.includes("receivable") || q.includes("aging")) {
    return kpis[0];
  }

  if (q.includes("bench") || q.includes("utilization")) {
    return kpis[1];
  }

  if (q.includes("dso")) {
    return kpis[2];
  }

  if (q.includes("margin") || q.includes("project")) {
    return kpis[3];
  }

  return null;
}

app.get("/api/v1/cockpit/health", async () => {
  return {
    status: "UP",
    service: "UC5 Cockpit API",
    owner: "Pranav Rajavel",
  };
});

app.get("/api/v1/cockpit/kpis", async () => {
  return {
    count: kpis.length,
    kpis,
  };
});

app.post("/api/v1/cockpit/queries", async (request, reply) => {
  const schema = z.object({
    question: z.string().min(3),
  });

  const body = schema.parse(request.body);
  const startTime = Date.now();

  const matchedKpi = matchQuestionToKpi(body.question);
  const latencyMs = Date.now() - startTime;

  const logEntry = {
    id: `query_${queryLog.length + 1}`,
    rawQuestion: body.question,
    matchedKpiId: matchedKpi?.id ?? null,
    status: matchedKpi ? "mapped" : "out_of_catalogue",
    latencyMs,
    createdAt: new Date().toISOString(),
  };

  queryLog.push(logEntry);

  if (!matchedKpi) {
    return reply.code(200).send({
      question: body.question,
      status: "out_of_catalogue",
      message: "This question does not match the approved UC5 KPI catalogue yet.",
      suggestedNextStep: "Ask about AR aging, bench utilization, DSO, or project margin.",
      auditLogId: logEntry.id,
      latencyMs,
    });
  }

  return {
    question: body.question,
    status: "mapped",
    matchedKpi: matchedKpi.displayName,
    definition: matchedKpi.definition,
    formula: matchedKpi.formula,
    sourceSystem: matchedKpi.sourceSystem,
    mockResult: {
      period: "May 2026",
      entity: "All Entities",
      value: "$125,000",
      drilldownsAvailable: ["entity", "project", "customer"],
    },
    auditLogId: logEntry.id,
    latencyMs,
  };
});

app.get("/api/v1/cockpit/queries/:id", async (request, reply) => {
  const params = request.params as { id: string };

  const entry = queryLog.find((q) => q.id === params.id);

  if (!entry) {
    return reply.code(404).send({
      error: {
        code: "QUERY_NOT_FOUND",
        message: "No query log entry found with that id.",
      },
    });
  }

  return entry;
});

app.listen({ port: 3000, host: "0.0.0.0" });
