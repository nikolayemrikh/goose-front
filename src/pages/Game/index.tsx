import { routes } from '@app/Routes/routes';
import { PageMain } from '@app/components/PageMain';

import { rpc } from '@app/rpc';
import { IGame } from '@app/rpc-types/authenticated/game/types';
import { ArrowBackRounded } from '@mui/icons-material';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { GAME_ID_PARAM } from './constants';
import gooseImg from './goose.png';

export const GameInner: FC<{
  game: IGame;
}> = ({ game }) => {
  const id = game.id;

  const createTapMutation = useMutation({
    mutationFn: () => rpc.authenticated.createTap({ gameId: id }),
    onSuccess: (res) => {
      if (res.status !== 'authorized') throw new Error('Server said unathorized, but we are authorized');
      const status = res.data.status;
      switch (status) {
        case 'created': {
          //ok
          break;
        }
        case 'not-found': {
          // toast game not found please leave hehe

          break;
        }

        default: {
          // biome-ignore lint/correctness/noUnusedVariables: <explanation>
          const unhandledStatus: never = status;
          // log unhandledStatus to sentry
        }
      }
    },
  });

  return (
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
            <Button variant="outlined" component={Link} to={routes.root} startIcon={<ArrowBackRounded />}>
              Back to games
            </Button>
            <Typography variant="h1">Tap the goose!</Typography>
          </Stack>

          <Stack justifyContent="center" alignItems="center">
            <Box
              onClick={() => createTapMutation.mutate()}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                '&:active': {
                  transform: 'rotate(-20deg)',
                },
              }}
            >
              <img src={gooseImg} width={255} height={366} style={{ userSelect: 'none' }} />
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export const Game: FC = () => {
  const { id } = useParams() as { [GAME_ID_PARAM]: string };

  const gameQuery = useQuery({
    queryKey: ['rpc.authenticated.game', id],
    queryFn: () => rpc.authenticated.game({ gameId: id }),
    placeholderData: keepPreviousData,
  });

  const gameData = gameQuery.data?.status === 'authorized' ? gameQuery.data.data : null;
  if (!gameData)
    return (
      <PageMain>
        <Stack direction="column" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Stack>
      </PageMain>
    );
  if (gameData?.status === 'not-found') return <Navigate to={routes.root} />;

  return (
    <PageMain>
      <GameInner game={gameData.game} />
    </PageMain>
  );
};
