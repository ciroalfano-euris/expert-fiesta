import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (
    typeof input !== 'object'
    || input === null
    || Array.isArray(input)
  ) {
    throw Object.assign(new Error('Activity body must be an object'), { status: 400 });
  }
  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || userId.trim() === ''
    || typeof teamId !== 'string' || teamId.trim() === ''
    || typeof type !== 'string' || type.trim() === ''
    || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1
  ) {
    throw Object.assign(new Error('Activity requires userId, teamId, type, and positive minutes'), { status: 400 });
  }
  throw Object.assign(new Error('Activity validation is not implemented yet'), { status: 501 });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
