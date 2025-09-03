import { routes } from '@app/Routes/routes';
import { PageMain } from '@app/components/PageMain';

import { rpc } from '@app/rpc';
import { IGame } from '@app/rpc-types/authenticated/game/types';
import { ArrowBackRounded } from '@mui/icons-material';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { GAME_ID_PARAM } from './constants';
import gooseImg from './goose.png';

const StatusTitle: Record<IGame['status'], string> = {
  'completed': 'Completed',
  'cooldown': 'Cooldown, prepare yourself!',
  'in-progress': 'Tap tap tap!!!',
};
const getGameQueryKey = (id: string) => ['rpc.authenticated.game', id];

const calculateDiff = (timestamp: number) => {
  const currentTime = Date.now();
  const diff = timestamp - currentTime;
  return diff > 0 ? Math.floor(diff / 1000) : 0;
};
const Timer: FC<{ timestamp: number }> = ({ timestamp }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => calculateDiff(timestamp));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft(calculateDiff(timestamp));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timestamp]);
  return secondsLeft;
};

export const GameInner: FC<{
  game: IGame;
  gameUpdatedTs: number;
}> = ({ game, gameUpdatedTs }) => {
  const id = game.id;

  const queryClient = useQueryClient();
  useEffect(() => {
    const currentTime = Date.now();
    const endTime = new Date(game.endAt).getTime();
    if (currentTime >= endTime) return;
    const startUpdateInterval = window.setInterval(() => {
      const currentTime = Date.now();
      const startTime = new Date(game.startAt).getTime();
      if (gameUpdatedTs >= startTime) {
        window.clearInterval(startUpdateInterval);
        return;
      }
      if (currentTime >= startTime) {
        queryClient.refetchQueries({
          queryKey: getGameQueryKey(id),
          type: 'active',
        });
      }
    }, 500);
    const endUpdateInterval = window.setInterval(() => {
      const currentTime = Date.now();
      const endTime = new Date(game.endAt).getTime();
      if (gameUpdatedTs >= endTime) {
        window.clearInterval(startUpdateInterval);
        return;
      }
      if (currentTime >= endTime) {
        queryClient.refetchQueries({
          queryKey: getGameQueryKey(id),
          type: 'active',
        });
      }
    }, 500);

    return () => {
      window.clearInterval(startUpdateInterval);
      window.clearInterval(endUpdateInterval);
    };
  }, [game, id, gameUpdatedTs, queryClient.refetchQueries]);

  const ownScoreQuery = useQuery({
    queryKey: ['rpc.authenticated.ownScore', id],
    queryFn: () => rpc.authenticated.ownScore({ gameId: id }),
    select: (res) => {
      if (res.status === 'unauthorized') throw new Error('Anauthorized');
      return res.data;
    },
  });

  const createTapMutation = useMutation({
    mutationFn: () => rpc.authenticated.createTap({ gameId: id }),
    onSuccess: (res) => {
      if (res.status !== 'authorized') throw new Error('Server said unathorized, but we are authorized');
      const status = res.data.status;
      switch (status) {
        case 'created': {
          ownScoreQuery.refetch();
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

          <Typography>Status: {StatusTitle[game.status]}</Typography>
          {/* @TODO fix enum usage */}
          {game.status === 'cooldown' && (
            <Typography>
              Seconds to start: <Timer timestamp={new Date(game.startAt).getTime()} />. Wait for the goose to appear..
            </Typography>
          )}
          {/* @TODO fix enum usage */}
          {game.status === 'in-progress' && (
            <Typography>
              Seconds to end: <Timer timestamp={new Date(game.endAt).getTime()} />. Tap faster!
            </Typography>
          )}

          <Typography>Score: {ownScoreQuery.data?.score}</Typography>

          <Stack justifyContent="center" alignItems="center">
            <Box
              onClick={() => {
                // @TODO fix enum usage
                if (game.status !== 'in-progress') return;
                createTapMutation.mutate();
              }}
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
    queryKey: getGameQueryKey(id),
    queryFn: () => rpc.authenticated.game({ gameId: id }),
    select: (res) => {
      if (res.status === 'unauthorized') throw new Error('Anauthorized');
      return res.data;
    },
  });
  if (!gameQuery.data) {
    return (
      <PageMain>
        <Stack direction="column" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Stack>
      </PageMain>
    );
  }
  if (gameQuery.data.status === 'not-found') return <Navigate to={routes.root} />;

  return (
    <PageMain>
      <GameInner game={gameQuery.data.game} gameUpdatedTs={gameQuery.dataUpdatedAt} />
    </PageMain>
  );
};
