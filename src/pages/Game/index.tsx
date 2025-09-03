import { routes } from '@app/Routes/routes';
import { PageMain } from '@app/components/PageMain';
import { rpc } from '@app/rpc';
import { Paper, Stack, Typography } from '@mui/material';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAME_ID_PARAM } from './constants';

export const Game: FC = () => {
  const { id } = useParams() as { [GAME_ID_PARAM]: string };
  const navigate = useNavigate();

  const gamesQuery = useQuery({
    queryKey: ['rpc.authenticated.games'],
    queryFn: () => rpc.authenticated.games(),
    placeholderData: keepPreviousData,
  });

  const gamesData = gamesQuery.data;
  const games = gamesData?.status === 'authorized' ? gamesData.data.games : null;

  const createGameMutation = useMutation({
    mutationFn: () => rpc.authenticated.createGame(),
    onSuccess: (res) => {
      if (res.status !== 'authorized') throw new Error('Server said unathorized, but we are authorized');

      navigate([routes.game, res.data.id].join('/'));
    },
  });

  return (
    <PageMain>
      <Stack direction="column" justifyContent="center" gap={4}>
        <Paper sx={{ padding: 4, flexBasis: 500 }} variant="outlined">
          <Stack direction="column" gap={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              gap={2}
              sx={(t) => ({
                [t.breakpoints.down('sm')]: {
                  flexDirection: 'column',
                },
              })}
            >
              <Typography variant="h1">Tap the goose!</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </PageMain>
  );
};
