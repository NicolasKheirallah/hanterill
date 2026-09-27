import routesJson from "./task-routes.json";

/**
 * Task to screen routing for the docs "find the screen for your task" table,
 * plus the task entry points on the docs index. Structure only: the labels
 * live in the message catalog (`tasks.rows.*` and `docs.tasks.*` respectively)
 * so both locales render in their own language. The hygiene gate resolves
 * every href against the docs registry.
 */
export type TaskRoute = {
  /** Key under the label namespace in the message catalog. */
  key: string;
  href: string;
};

/** Rows of the TaskRouter table in common-tasks. Labels: `tasks.rows.*`. */
export const taskRoutes: TaskRoute[] = routesJson.taskRoutes;

/** Task cards on the docs index, in the order a new owner meets them. Labels: `docs.tasks.*`. */
export const docTasks: TaskRoute[] = routesJson.docTasks;
