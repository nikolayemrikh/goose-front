import { createAccessControl } from 'better-auth/plugins/access';

export const statement = {
  goose: ['tap-increase-counter'],
} as const;

export const ac = createAccessControl(statement);

export const regularPlayer = ac.newRole({
  goose: ['tap-increase-counter'],
});

export const nikita = ac.newRole({
  goose: [],
});
