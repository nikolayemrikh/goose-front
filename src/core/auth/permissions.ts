import { createAccessControl } from 'better-auth/plugins/access';

export const statement = {
  goose: ['create-game', 'tap-increase-counter'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  goose: ['create-game'],
});

export const regularPlayer = ac.newRole({
  goose: ['tap-increase-counter'],
});

export const nikita = ac.newRole({
  goose: [],
});
