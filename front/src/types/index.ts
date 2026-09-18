// Canonical type definitions live in their service modules.
// This index re-exports them so views/hooks can import from a single place.
export type { Client, ClientCategory, ClientStage, UpsertClientResult } from '../services/clients';
export type { Task, TaskStatus } from '../services/tasks';
export type { Proposal } from '../services/proposals';
export type { SalesRep } from '../services/salesReps';
export type { Request } from '../services/requests';