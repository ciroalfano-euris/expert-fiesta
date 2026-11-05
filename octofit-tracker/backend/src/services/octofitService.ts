import { Types } from 'mongoose';
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
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('Activity userId and teamId must be valid IDs'), { status: 400 });
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }
  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team body must be an object'), { status: 400 });
  }
  const { name, mascot, members } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' || name.trim() === ''
    || typeof mascot !== 'string' || mascot.trim() === ''
    || (members !== undefined && (!Array.isArray(members) || !members.every((member) => typeof member === 'string' && Types.ObjectId.isValid(member))))
  ) {
    throw Object.assign(new Error('Team requires a name, mascot, and valid member IDs'), { status: 400 });
  }
  const memberIds = (members ?? []) as string[];
  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== new Set(memberIds).size) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
    }
  }
  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .map(({ _id, totalPoints }) => ({ teamName: teamNames.get(_id.toString()), totalPoints }))
    .filter((entry): entry is { teamName: string; totalPoints: number } => entry.teamName !== undefined)
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const activityCounts = new Map<string, number>();
  for (const activity of activities) {
    const type = activity.type.trim().toLowerCase();
    activityCounts.set(type, (activityCounts.get(type) ?? 0) + 1);
  }

  const normalizeFocus = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (['run', 'running', 'cycle', 'cycling', 'bike', 'cardio'].includes(normalized)) return 'endurance';
    if (['weightlifting', 'weights', 'resistance'].includes(normalized)) return 'strength';
    return normalized;
  };

  return workouts
    .map((workout) => {
      const focus = normalizeFocus(workout.focus);
      const goalMatch = focus === normalizeFocus(user.fitnessGoal);
      const matchingActivities = [...activityCounts]
        .filter(([type]) => normalizeFocus(type) === focus)
        .sort((a, b) => b[1] - a[1]);
      const activityMatch = matchingActivities[0];
      return {
        ...workout,
        reason: goalMatch
          ? `Matches your ${user.fitnessGoal} goal${activityMatch ? ` and ${activityMatch[0]} activity` : ''}`
          : activityMatch
            ? `Matches your recent ${activityMatch[0]} activity pattern`
            : 'Recommended workout',
        score: (goalMatch ? 1 : 0) + (activityMatch ? activityMatch[1] : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .map(({ score: _score, ...workout }) => workout);
}

export { User };
